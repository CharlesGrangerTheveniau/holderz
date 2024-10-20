
<script lang="ts">
	import { page } from "$app/stores";
    import { ConicGradient, type ConicStop } from "@skeletonlabs/skeleton";
    import { getExchanges, getPrice } from "./+server.js";


    const conicStops: ConicStop[] = [
        { color: 'transparent', start: 0, end: 1 },
        { color: 'rgb(var(--color-surface-500))', start: 99, end: 100 }
    ];


    export let data;
    let { supabase, session, origin } = data
    $: ({ supabase, session, origin } = data)

    $: userId = $page.params.userId;

    let wallet: any
    

    page.subscribe( async () => {
       
        const { data: walletData, error: profileError } = await supabase
            .from("wallet")
            .select("description, email, id, user_id")
            .eq('email', session?.user.email)
            .eq('user_id', session?.user.id)

        
        if (walletData && walletData.length > 0) {
            console.log("wallet found")
            wallet = walletData[0]
        } else {
            console.log("NO PROFILE")
        }

    })
    
</script>

<div class="hero min-h-screen flex justify-center items-center">
    {#if wallet} 
        <div class="hero-content">
            <div class="max-w-2xl text-center">
                <h1 class="text-white font-bold text-4xl">{wallet.email}'s Page'</h1>
                <p class="py-3 max-w-md mx-auto">{wallet.description}</p>
                <button class="btn btn-primary" on:click={ () => getPrice({ origin, ids: ['bitcoin'], precision: 1, currencies: ['eur']})}>Get prices</button>
                <button class="btn btn-primary" on:click={ () => getExchanges( origin )}>Get exchanges</button>
            </div>
        </div>
    {:else}
        <ConicGradient stops={conicStops} spin></ConicGradient>
    {/if}
</div>

<style lang="postcss">
	
</style>
