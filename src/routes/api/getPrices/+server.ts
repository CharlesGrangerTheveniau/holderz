// src/routes/api/getPrices.ts

import { getCoinById, type CoinData } from "$lib/ressources/coins";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAfter, subDays, subMonths, subQuarters, subWeeks, subYears } from "date-fns";
import { asDate, today } from "$lib/ressources/utils";

// Interfaces and Types

export interface Price {
   eur: number, 
   usd: number
}

export interface Transaction {
   transaction_type: TransactionType
   coin_id: string,
   purchased_at: Date,
   purchased_in_fiat: boolean,
   fiat_amount: number,
   amount: number
}

export type TransactionType = 'purchase' | 'sell';

export interface WalletMetadata {
   currencies?: CoinGroup[],
   walletHistory: PriceHistory[]
   walletValueExcerpt: YearRangeWalletExcerpt
}

export interface WalletHistoryPoint {
   date: Date,
   walletValue: number
}

export interface WalletHistory {
   eur: WalletHistoryPoint[],
   usd: WalletHistoryPoint[]
}

export interface YearRangeWalletExcerpt {
   today?: Price,
   yesterday?: Price,
   week?: Price,
   month?: Price,
   quarter?: Price,
   halfYear?: Price,
   year?: Price
}

export interface CoinGroup {
   coinData?: CoinData;
   totalAmount: number;
   transactions: Array<Transaction>;
   totalValue?: Price;
   historicalData?: CoinPriceHistory[]  // Price of the coin
}

export interface PriceHistory {
   date: Date,
   walletValue: Price
}

export interface CoinPriceHistory extends PriceHistory {
   price: number,
   walletAmount: number,
}

// API and Data Handling Functions

const cg_url = 'https://api.coingecko.com/api/v3';

/**
 * Load all transactions for a given wallet.
 * 
 * @param {string} walletId 
 * @param {SupabaseClient} supabase 
 * @returns {Promise<Transaction[] | null>}
 */
async function loadTransactions(walletId: string, supabase: SupabaseClient): Promise<Transaction[] | null> {
   const { data: transactions, error: profileError } = await supabase
      .from("transaction")
      .select("*")
      .eq('wallet_id', walletId);
   
   return transactions;
}

/**
 * Evaluate a wallet's total value, transactions, and historical data.
 * 
 * @param {Transaction[]} transactions 
 * @returns {Promise<WalletMetadata | null>}
 */
async function evaluateWallet(transactions: Transaction[]): Promise<WalletMetadata | null> {

   if (transactions && transactions.length > 0) {
      const currencies = Array.from(new Set(transactions.map(t => t.coin_id)));

      let coinGroups: CoinGroup[] = await Promise.all(
         currencies.map(async (c): Promise<CoinGroup> => {
            const coinData = await getCoinById(c);
            const coinTransactions = transactions.filter(t => t.coin_id === c);
            const totalAmount = getTotalAmountForCoin(coinTransactions);
            const totalValue = { 
               eur: totalAmount * coinData!!.currentPrices?.eur,
               usd: totalAmount * coinData!!.currentPrices?.usd,
            };

            return {
               coinData,
               transactions: coinTransactions,
               totalAmount,
               totalValue,
               historicalData: await getHistoricalWalletForCoin(c, coinTransactions),
            };
         })
      );

      const walletHistory = getWalletTotalHistory(coinGroups);
      const walletValueExcerpt = getWalletExcerpt(walletHistory);

      return {
         currencies: coinGroups,
         walletHistory,
         walletValueExcerpt,
      };
   } else {
      console.log('No transactions found.');
      return null;
   }
}

// Helper and Aggregation Functions

/**
 * Get the total amount of a coin from its transactions.
 * 
 * @param {Transaction[]} transactions 
 * @param {Date} [date] Optional cutoff date.
 * @returns {number}
 */
function getTotalAmountForCoin(transactions: Transaction[], date?: Date): number {
   let aggregateAmount = 0;

   transactions.forEach(transaction => {
      const validTransaction = !date || isAfter(asDate(date), asDate(transaction.purchased_at));
      
      if (validTransaction) {
         if (transaction.transaction_type === 'purchase') {
            aggregateAmount += transaction.amount;
         } else {
            aggregateAmount -= transaction.amount;
         }
      }
   });

   return aggregateAmount;
}



/**
 * Create a summary of wallet values based on different time ranges (e.g. today, week, month).
 * 
 * @param {PriceHistory[]} history 
 * @returns {YearRangeWalletExcerpt}
 */
function getWalletExcerpt(history: PriceHistory[]): YearRangeWalletExcerpt {
   const todayNormalized = normalizeDate(today());
   const todayData = history.find(h => normalizeDate(h.date).getTime() === todayNormalized.getTime())?.walletValue ?? history[history.length - 1].walletValue;
   const year = history.find(h => normalizeDate(h.date).getTime() === normalizeDate(subYears(today(), 1)).getTime())?.walletValue ?? history[0].walletValue;

   return {
      today: todayData,
      yesterday: history.find(h => normalizeDate(h.date).getTime() === normalizeDate(subDays(today(), 1)).getTime())?.walletValue,
      week: history.find(h => normalizeDate(h.date).getTime() === normalizeDate(subWeeks(today(), 1)).getTime())?.walletValue,
      month: history.find(h => normalizeDate(h.date).getTime() === normalizeDate(subMonths(today(), 1)).getTime())?.walletValue,
      quarter: history.find(h => normalizeDate(h.date).getTime() === normalizeDate(subQuarters(today(), 1)).getTime())?.walletValue,
      halfYear: history.find(h => normalizeDate(h.date).getTime() === normalizeDate(subQuarters(today(), 2)).getTime())?.walletValue,
      year
   };
}

/**
 * Get the historical wallet value across multiple coins.
 * 
 * @param {CoinGroup[]} coinGroups 
 * @returns {PriceHistory[]}
 */
function getWalletTotalHistory(coinGroups: CoinGroup[]): PriceHistory[] {
   const dates = coinGroups
      .sort((a, b) => asDate(a.historicalData!![0].date).getTime() - asDate(b.historicalData!![0]!!.date).getTime())[0]
      .historicalData!!
      .map((data: CoinPriceHistory) => data.date);

   let dateData: PriceHistory[] = [];

   dates.forEach((date: Date) => {
      let totalEur = 0;
      let totalUsd = 0;

      coinGroups.forEach((coinGroup) => {
         const dataForDate = coinGroup.historicalData?.find((data: CoinPriceHistory) => 
            data.date === date
         );

         if (dataForDate) {
            totalEur += dataForDate.walletValue.eur;
            totalUsd += dataForDate.walletValue.usd;
         }
      });

      dateData.push({ 
         date, 
         walletValue: {
            eur: totalEur,
            usd: totalUsd
         }
      });
   });

   return dateData;
}

/**
 * Fetch historical wallet data for each coin.
 * 
 * @param {string[]} coinsIds 
 * @param {Transaction[]} transactions 
 */
async function getHistoricalWallet(coinsIds: string[], transactions: Transaction[]) {
   // Implementation here
}

/**
 * Fetch historical wallet data for a specific coin.
 * 
 * @param {string} coinId 
 * @param {Transaction[]} transactions 
 * @returns {Promise<CoinPriceHistory[]>}
 */
async function getHistoricalWalletForCoin(coinId: string, transactions: Transaction[]): Promise<CoinPriceHistory[]> {
   const historicalPrices = {
      eur: await getHistoricalDataForCoin(coinId, 'eur'),
      usd: await getHistoricalDataForCoin(coinId, 'usd')
   };

   const combinedHistory: CoinPriceHistory[] = historicalPrices.eur.map(([eurTimestamp, eurPrice]: [number, number], index: number) => {
      const usdData = historicalPrices.usd[index];

      let date = new Date(eurTimestamp);
      date.setHours(0, 0, 0); 
      const walletAmountAtDate = getTotalAmountForCoin(transactions, date);

      return {
         date,
         price: {
            eur: eurPrice,
            usd: usdData[1]
         },
         walletAmount: walletAmountAtDate,
         walletValue: {
            eur: walletAmountAtDate * eurPrice,
            usd: walletAmountAtDate * usdData[1]
         }
      };
   });

   return combinedHistory;
}

// External API Calls

/**
 * Fetch historical price data for a specific coin and currency.
 * 
 * @param {string} coinId 
 * @param {string} currency 
 * @returns {Promise<[number, number][]>}
 */
async function getHistoricalDataForCoin(coinId: string, currency: string) {
   const apiUrl = `${cg_url}/coins/${coinId}/market_chart?&vs_currency=${currency}&days=365&precision=full`;

   const options = {
      method: 'GET',
      headers: {
         Accept: 'application/json',
         'x-cg-demo-api-key': import.meta.env.VITE_CG_API_KEY
      }
   };

   try {
      const response = await fetch(apiUrl, options);
      const data = await response.json();
      return data.prices;
   } catch (error) {
      console.error('Error fetching prices:', error);
      return [];
   }
}

/**
 * Fetch current prices for the given coin IDs.
 * 
 * @param {string[]} coinIds 
 * @returns {Promise<any>}
 */
async function getCurrentPrices(coinIds: string[]) {
   const apiUrl = `${cg_url}/simple/price?ids=${coinIds.join(',')}&vs_currencies=eur,usd&precision=full`;

   const options = {
      method: 'GET',
      headers: {
         Accept: 'application/json',
         'x-cg-demo-api-key': import.meta.env.VITE_CG_API_KEY
      }
   };

   try {
      const response = await fetch(apiUrl, options);
      const data = await response.json();
      return data;
   } catch (error) {
      console.error('Error fetching prices:', error);
      return {};
   }
}

/**
 * Fetch coin data from the external API.
 * 
 * @param {string} coinId 
 * @returns {Promise<any>}
 */
async function getCoinData(coinId: string) {
   const apiUrl = `${cg_url}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true'`;

   const options = {
      method: 'GET',
      headers: {
         Accept: 'application/json',
         'x-cg-demo-api-key': import.meta.env.VITE_CG_API_KEY
      }
   };

   try {
      const response = await fetch(apiUrl, options);
      const data = await response.json();
      return data;
   } catch (error) {
      console.error('Error fetching prices:', error);
      return {};
   }
}

// Utility Functions

/**
 * Normalize the date to midnight (00:00:00).
 * 
 * @param {Date} date 
 * @returns {Date}
 */
function normalizeDate(date: Date): Date {
   return new Date(date.setHours(0, 0, 0, 0));
}

interface WalletRequest {
   walletId: string, 
   transactions: Transaction[]
}

export const POST = async ({ request }: any) => {
   try {
      // Parse the request body to get the transactions
      const { transactions } = await request.json();
 
      // Call the evaluateWallet function and pass in the transactions
      const response = await evaluateWallet(transactions);
 
      if (response) {
         return new Response(
            JSON.stringify({ message: "Data received successfully", data: response }),
            {
               status: 200,
               headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
               }
            }
         );
      } else {
         return new Response(
            JSON.stringify({ message: "No data found" }),
            {
               status: 404,
               headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
               }
            }
         );
      }
   } catch (error: any) {
      return new Response(
         JSON.stringify({ message: "Error processing request", error: error.message }),
         {
            status: 500,
            headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            }
         }
      );
   }
};