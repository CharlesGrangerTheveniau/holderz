import { VITE_CG_API_KEY } from "$env/static/private";

const cg_url = 'https://api.coingecko.com/api/v3';

export const GET = async ({request}: any) => {

   const url = `${cg_url}/exchanges`;

   const options = {
      method: 'GET',
      headers: {
         accept: 'application/json',
         'x-cg-demo-api-key': import.meta.env.VITE_CG_API_KEY
      }
   };

   const response = await fetch(url, options);
   const data = await response.json();
   return new Response(JSON.stringify({ message: 'Data received successfully', data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
}

