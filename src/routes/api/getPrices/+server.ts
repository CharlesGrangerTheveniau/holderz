// src/routes/api/getPrices.ts

import { getCoinById, SUPPORTED_CURRENCIES, type CoinData } from "$lib/ressources/coins";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAfter } from "date-fns";
import { asDate } from "$lib/ressources/utils";
import type { Wallet } from "$lib/types/data-types";

export type TransactionType =
   | 'purchase'
   | 'sell'

export interface Transaction {
   transaction_type: TransactionType
   coin_id: string,
   purchased_at: Date,
   purchased_in_fiat: boolean,
   fiat_amount: number,
   amount: number
}

export interface Price {
   eur: number, 
   usd: number
}

export async function loadTransactions(walletId: string, supabase: SupabaseClient): Promise<Transaction[] | null> {
   const { data: transactions, error: profileError } = await supabase
      .from("transaction")
      .select("*")
      .eq('wallet_id', walletId)

   return transactions
}

const cg_url = 'https://api.coingecko.com/api/v3';

export interface WalletMetadata {
   currencies?: CoinGroup[],
   totalWalletValue?: Price
}

export interface WalletData {
   info: Wallet,
   data: WalletMetadata | null
}

export async function evaluateWallet(walletId: string, supabase: SupabaseClient): Promise<WalletMetadata | null> {
   // Load wallet transactions
   const transactions = await loadTransactions(walletId, supabase);

   if (transactions && transactions.length > 0) {
      const currencies = Array.from(new Set(transactions.map(t => t.coin_id)))

      let coinGroups: CoinGroup[] = await Promise.all (
         currencies.map(async (c): Promise<CoinGroup> => {
            const coinData = await getCoinById(c)
            const coinTransactions = transactions.filter(t => t.coin_id === c)
            const totalAmount = getTotalAmountForCoin(coinTransactions)
            const totalValue = { 
               eur: totalAmount * coinData!!.currentPrices?.eur,
               usd: totalAmount * coinData!!.currentPrices?.usd ,
            }

            return {
               coinData,
               transactions: coinTransactions,
               totalAmount,
               totalValue,
               historicalData: await getHistoricalWalletForCoin(c, coinTransactions)
            }
         })
      )

      const totalWalletValue = await getWalletTotal(coinGroups)


      return {
         currencies: coinGroups,
         totalWalletValue
      }

   } else {
      console.log('No transactions found.');
      return null
   }
}

// Refactor the CoinGroup interface to include currentPrice
export interface CoinGroup {
   coinData?: CoinData;
   totalAmount: number;
   transactions: Array<Transaction>;
   totalValue?: Price;
   historicalData?: any  // Price of the coin
}

export function getTotalAmountForCoin(transactions: Transaction[], date?: string | Date): number {
   let aggregateAmount = 0;

   transactions.map(transaction => {
      // Convert date if provided, else just proceed
      const validTransaction = !date || isAfter(asDate(date), asDate(transaction.purchased_at));

      if (validTransaction) {
         if(transaction.transaction_type === 'purchase') {
            aggregateAmount += transaction.amount
         } else {
            aggregateAmount -= transaction.amount
         }
      } // No change if the transaction is after the specified date
   });

   return aggregateAmount
}

export async function getWalletTotal(coinGroups: CoinGroup[]) {
   const totalValue = {
      eur: 0,
      usd: 0
   };
   coinGroups.forEach( cg => {
      totalValue.eur += cg.totalValue?.eur || 0;
      totalValue.usd += cg.totalValue?.usd || 0;
   })
   return totalValue
}


export interface PriceHistory {
   prices: Array<[number, number]>;  // Array of tuples with [timestamp, price]
}

export interface HistoricalPrices {
   eur: PriceHistory;
   usd: PriceHistory;
}

export async function getHistoricalWalletForCoin(coinId: string, transactions: Transaction[]) {

   
   const historicalPrices: HistoricalPrices = {
      eur: { prices: await getHistoricalDataForCoin(coinId, 'eur') },
      usd: { prices: await getHistoricalDataForCoin(coinId, 'usd') }
   }

   for (const currency in historicalPrices) {
      let currencyobject = historicalPrices[currency as keyof HistoricalPrices] as any
      const pricesWithDates = currencyobject.prices.map(([timestamp, price]: any) => {
         const date = new Date(timestamp)
         const walletAmountAtDate = getTotalAmountForCoin(transactions, date)
         return {
           date, 
           price,
           walletAmount: walletAmountAtDate,
           walletValue: walletAmountAtDate * price
         };
       });

      historicalPrices[currency as keyof HistoricalPrices] = pricesWithDates
   }
   return historicalPrices
}
   
export async function getHistoricalDataForCoin(coinId: string, currency: string) {
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
      //console.log(data);
      return data.prices;
   } catch (error) {
      console.error('Error fetching prices:', error);
      return {};
   }
}
// Fetch current prices for the given coin IDs
export async function getCurrentPrices(coinIds: string[]) {
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
      //console.log(data);
      return data;
   } catch (error) {
      console.error('Error fetching prices:', error);
      return {};
   }
}

export async function getCoinData(coinId: string) {
   const apiUrl = `${cg_url}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true'`

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
      //console.log(data);
      return data;
   } catch (error) {
      console.error('Error fetching prices:', error);
      return {};
   }
}

