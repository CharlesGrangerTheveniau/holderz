<script lang="ts">
    import { goto } from '$app/navigation';
	import { page } from '$app/stores';
    import { getAvatar } from '$lib';

	import { AppRail, AppRailAnchor, AppRailTile, getDrawerStore, Avatar } from '@skeletonlabs/skeleton';

	// Local
	const drawerStore = getDrawerStore();

    let { supabase, session } = $$props

	// Lifecycle
	const menuNavLinks: Array<{label: string, target: string}>= [
        { label: 'Overview', target: "overview"},
        { label: 'Accounts', target: "accounts"},
        { label: 'Transactions', target: "transactions"}
    ]

    function navigate(target: string) {
        drawerStore.close()
        return goto(`/wallet/${session?.user.id}/${target}`)
    }

    async function signOut() {
        await supabase.auth.signOut()
        goto('/login')
        drawerStore.close()
    }

	// Reactive
	$: listboxItemActive = (href: string) => ($page.url.pathname?.includes(href) ? 'bg-primary-active-token nav-button' : 'nav-button');
</script>

<div class="content-between h-full variant-glass-surface border-r border-surface-500/30 {$$props.class ?? ''}">
	<!-- App Rail -->
	
	<!-- Nav Links -->
	<section class="p-4 pb-20 overflow-y-auto flex flex-col justify-start mx-4 my-4">
		{#each menuNavLinks as { target, label }}
            <button class="{listboxItemActive(target)} btn bg-initial w-full" data-sveltekit-preload-data="hover" on:keypress on:click={() => navigate(target) }>
                <span class="flex align-start">{@html label}</span>
            </button>
        {/each}
        <hr class="!my-6 opacity-50" />
	</section>
    <section class="p-4 overflow-y-auto flex flex-col justify-start mx-4 my-4">
        
	</section>
    <section class="p-4 overflow-y-auto flex flex-col justify-start mx-4 my-4 space-y-4">
        <hr class="!my-6 opacity-50" />
		<button class="btn variant-soft-primary justify-start w-full max-h-10" data-sveltekit-preload-data="hover" on:keypress on:click={ async () => { await supabase.auth.signOut() } }>
            <Avatar src="{getAvatar(session)}" width="w-8" rounded="rounded-full"/>
            <span class="flex align-start text-white">My profile</span>
        </button>
		<button class="btn variant-soft-secondary justify-start w-full" data-sveltekit-preload-data="hover" on:keypress on:click={ async () => { await signOut() } }>
            <span class="flex align-start text-white">Sign off</span>
        </button>
	</section>
</div>

<style lang="postcss">
    .nav-button {
        display: flex;
        justify-content: flex-start;
    }
    .nav-button:hover {
        @apply variant-soft-primary text-white
    }
    
</style>