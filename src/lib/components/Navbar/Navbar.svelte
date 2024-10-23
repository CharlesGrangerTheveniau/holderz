<script lang="ts">
    import { goto } from '$app/navigation';
	import { page } from '$app/stores';
    import { getAvatar } from '$lib';

	import { AppRail, AppRailAnchor, AppRailTile, getDrawerStore, Avatar } from '@skeletonlabs/skeleton';

	// Local
	const drawerStore = getDrawerStore();

    let { supabase, session } = $$props

	// Lifecycle
	const menuNavLinks: Array<{label: string, target: string, icon: string}>= [
        { label: 'Overview', target: "overview", icon: "chart-line"},
        { label: 'Accounts', target: "accounts", icon: "layer-group"},
        { label: 'Transactions', target: "transactions", icon: "arrow-right-arrow-left"}
    ]

    function navigate(target: string) {
        console.log(`going to /wallet/${session?.user.id}/${target}`)
        return goto(`/wallet/${session?.user.id}/${target}`)
    }

    async function signOut() {
        await supabase.auth.signOut()
        goto('/login')
        drawerStore.close()
    }

    $: showlabel = false
    $: listboxShowLabel

    $: listboxShowLabel = showlabel ? '' : 'hidden';

    $: listboxItemActive = (href: string) => ($page.url.pathname?.includes(href) ? 'active' : '');

</script>

{#each menuNavLinks as { target, label, icon }}
    <button class="btn bg-initial w-full flex flex-col nav-button {listboxItemActive(target)}" 
            data-sveltekit-preload-data="hover"
            on:click={() =>  navigate(target) }>

        <i class="fa-solid fa-{icon}"></i>
        <!-- <span class="{listboxShowLabel}">{label}</span> -->
    </button>
{/each}


<style lang="postcss">
    .nav-button {
        border-radius: 0px;

        &:first-child {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
        }

        &:last-child {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        &.active {
            background-color: rgba(255, 255, 255, 0.1); /* Semi-transparent background */
            box-shadow: 0 4px 15px rgba(0, 150, 255, 0.4); /* Soft blue glow */
            color: #fff; /* White text when active */
            border: 1px solid rgba(0, 150, 255, 0.5); /* Optional border with the same glow color */
            transition: background-color 0.3s, box-shadow 0.3s, color 0.3s;
        }

    }

    .nav-button:hover {
        @apply variant-soft-primary text-white

    }
    
</style>