import { PUBLIC_CG_URL } from "$env/static/public";
import { coinIds, fetchBySupportedCurrencies, type CoinData } from "$lib/ressources/coins";


/**
 * Fetch coin data from the external API.
 * 
 * @param {string} coinId 
 * @returns {Promise<any>}
 */
async function getCoinData(coinId: string) {
    const apiUrl = `${PUBLIC_CG_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true'`;
 
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

async function getCoinById(id: string): Promise<CoinData | undefined> {
    const identificators = coinIds.find(c => c.id == id) ?? undefined

    if(identificators) {
        const metadata = await getCoinData(identificators?.id)

        return {
        ...identificators,
        images: metadata.image ?? null,
        currentPrices: fetchBySupportedCurrencies(metadata.market_data.current_price),
        ath: fetchBySupportedCurrencies(metadata.market_data.ath),
        atl: fetchBySupportedCurrencies(metadata.market_data.atl),
        marketCap: fetchBySupportedCurrencies(metadata.market_data.market_cap),
        priceChanges: {
            percentage1d: metadata.market_data.price_change_percentage_24h,
            percentage7d: metadata.market_data.price_change_percentage_7d,
            percentage14d: metadata.market_data.price_change_percentage_14d,
            percentage30d: metadata.market_data.price_change_percentage_30d,
            percentage60d: metadata.market_data.price_change_percentage_60d,
            percentage200d: metadata.market_data.price_change_percentage_200d,
            percentage1y: metadata.market_data.price_change_percentage_1y
        },
        totalSupply: metadata.market_data.total_supply,
        maxSupply: metadata.market_data.max_supply,
        circulatingSupply: metadata.market_data.circulating_supply
        }
    }
}

export const POST = async ({ request }: any) => {
    try {
       // Parse the request body to get the transactions
       const { coinId } = await request.json();
  
       // Call the evaluateWallet function and pass in the transactions
       const response = await getCoinById(coinId);
  
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