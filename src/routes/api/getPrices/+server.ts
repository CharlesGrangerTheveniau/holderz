// src/routes/api/getPrices.ts



const cg_url = 'https://api.coingecko.com/api/v3';


export const GET = async ({url}: any) => {

   console.log('get called')

   const ids = url.searchParams.get('ids') || 'bitcoin';
   const currencies = url.searchParams.get('currencies') || 'eur';
   const precision = url.searchParams.get('precision') || 2;

   const apiUrl = `${cg_url}/simple/price?ids=${ids}&vs_currencies=${currencies}&precision=${precision}`;


   const options = {
      method: 'GET',
      headers: {
         accept: 'application/json',
         'x-cg-demo-api-key': import.meta.env.VITE_CG_API_KEY
      }
   };

   const response = await fetch(apiUrl, options);
   const data = await response.json();

   return new Response(JSON.stringify({ message: 'Data received successfully', data }), {
      status: 200,
      headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
      }
   });
}
