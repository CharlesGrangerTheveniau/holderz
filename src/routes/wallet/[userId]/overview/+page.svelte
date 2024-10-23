<script lang="ts">
    import { page } from '$app/stores';
    import { ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
    import { evaluateWallet, loadTransactions, type WalletData } from '../../../api/getPrices/+server.js';
    import type { Wallet } from '$lib/types/data-types.js';

    export let data;
    let { supabase, session } = data
    $: ({ supabase, session } = data)

    console.log(data.session?.user.id)

    let loaded = false;
    let walletInfo: any;
    let metadata: any
    
    page.subscribe( async () => {
       
       const { data: walletData, error: profileError } = await supabase
           .from("wallet")
           .select("*")
           .eq('email', session?.user.email)
           .eq('user_id', session?.user.id)

       
       if (walletData && walletData.length > 0) {
           console.log("wallet found")
           walletInfo = walletData[0]

           metadata = await evaluateWallet(walletInfo.id, supabase)
           //metadata = null

           console.log(metadata)

           if (walletInfo && metadata) {
            loaded = true
           }
           
       } else {
           console.log("NO PROFILE")
       }

   })

    const conicStops: ConicStop[] = [
        { color: 'transparent', start: 0, end: 1 },
        { color: 'rgb(var(--color-surface-500))', start: 99, end: 100 }
    ];

</script>

{#if loaded}
    <div class="h-screen flex justify-center items-start sm: p-6 md:p-12 xl:p-24">
        <div class="grid grid-cols-10 grid-rows-10 gap-4">
            <div class="b-card p-4 col-span-10 lg:col-span-7 row-span-2 border-surface-500/30 rounded-md">
                <header class="doc-shell-header gap-8">
                    <section class="space-y-4 mb-4">
                        <span class="badge variant-soft translate-y-1">Overview</span>
                        <h1>Welcome {walletInfo.first_name} 👋</h1>
                        <h3 class="text-xl">Here's how your portfolio is looking right now!</h3>
                    </section>
                    <section class="flex flex-wrap gap-2">

                            <button class="chip variant-soft-primary hover:variant-filled-primary">
                                <i class="fa-brands fa-github text-[16px]"></i>
                                <span>Refresh</span>
                            </button>
                            <button class="chip variant-soft-secondary hover:variant-filled-secondary">
                                <i class="fa-brands fa-github text-[16px]"></i>
                                <span>Add new</span>
                                <i class="fa-brands fa-github text-[16px]"></i>
                            </button>
                        
                    </section>
                </header>
            </div>
            <div class="b-card p-4 col-span-10 lg:col-span-3 row-span-2 variant-glass-surface border-surface-500/30 rounded-md content-center p-10 text-center">
                <span>Your portfolio value is</span>
                <span>{metadata.totalWalletValue.eur}</span>
            </div>
            <div class="b-card p-4 col-span-10 row-span-4 variant-glass-surface border-surface-500/30 rounded-md">Chart</div>
            <div class="b-card p-4 col-span-10 row-span-1 variant-glass-surface border-surface-500/30 rounded-md">Filters</div>
            <div class="b-card p-4 col-span-10 lg:col-span-6 row-span-2 variant-glass-surface border-surface-500/30 rounded-md">Latest transactions</div>
            <div class="b-card p-4 col-span-10 lg:col-span-4 row-span-2 variant-glass-surface border-surface-500/30 rounded-md">Actions</div>
            
        </div>
        
        <!-- <header class="doc-shell-header gap-8">
            <section class="space-y-4 mb-4">
                <span class="badge variant-soft translate-y-1">Overview</span>
                <h1>Welcome {walletInfo.first_name} 👋</h1>
                <h3 class="text-xl">Here's how your portfolio is looking right now!</h3>
            </section>
            
            
            <section class="flex flex-wrap gap-2">
                
                    <button class="chip variant-soft-primary hover:variant-filled-primary">
                        <i class="fa-brands fa-github text-[16px]"></i>
                        <span>Refresh</span>
                    </button>
                    <button class="chip variant-soft-secondary hover:variant-filled-secondary">
                        <i class="fa-brands fa-github text-[16px]"></i>
                        <span>Add new</span>
                        <i class="fa-brands fa-github text-[16px]"></i>
                    </button>
                
            </section>
        </header> -->
    
    </div>
{:else }
    <div class="flex justify-center items-center w-full h-full">
        <ConicGradient stops={conicStops} spin>Loading data</ConicGradient>
    </div>
{/if}

<style lang="postcss">
    .container {
        @apply mx-20 my-36;
        width: 100%;  /* Ensure the container takes 100% of the parent */
        max-width: 100%;
    }

    .doc-shell-header {
        @apply w-full

        h1 {
            font-size: 80px
        }
    }
</style>
