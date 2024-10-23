<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, LightSwitch, Avatar, filter, BlueNight, initializeStores } from '@skeletonlabs/skeleton';
	

	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';

	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
    import { getAvatar } from '$lib';
    import Drawer from '$lib/components/Drawer/drawer.svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();

	export let data;

    let { supabase, session } = data
    $: ({ supabase, session } = data)

	const drawerStore = getDrawerStore();
	function drawerOpen(): void {
		const s: DrawerSettings = { id: 'doc-sidenav', meta: { session, supabase} };
		drawerStore.open(s);
	}

	supabase.auth.onAuthStateChange(async (event, session) => {

		if (event === "SIGNED_IN") {
			invalidateAll()
		}

		if (event === "SIGNED_OUT") {
			await goto("/login");
			invalidateAll()
		}
	})

	function matchPathWhitelist(pageUrlPath: string): boolean {
		// If homepage route
		if (pageUrlPath === '/') return true;
		if (pageUrlPath.includes('login')) return true
		// If any blog route
		return false;
	}


	$: slotSidebarLeft = matchPathWhitelist($page.url.pathname) ? 'w-0' : 'bg-surface-50-900-token lg:w-auto';
</script>

<Drawer/>
<!-- App Shell -->
<AppShell {slotSidebarLeft}>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex flex-row gap-5">
					{#if session !== null}
						<button on:click={drawerOpen} class="btn-icon btn-icon-md lg:!hidden">
							<i class="fa-solid fa-bars text-xl"></i>
						</button>
					{/if}
					<button on:click={() => goto("/")} class="btn-icon btn-icon-sm text-white bg-gradient-to-br variant-gradient-primary-secondary">
						H
					</button>
				</div>
				
			</svelte:fragment>
			
			<svelte:fragment slot="trail">
				{#if session == null }
					<button class="btn btn-sm variant-ghost-primary" on:click={() => goto("/login")}>Login</button>
				{:else}
					<button class="btn-icon btn-icon-sm" on:click={() => goto("/wallet/{session.user.id}/overview")}>
						<Avatar src="{getAvatar(session)}" width="w-full" rounded="rounded-full" action={filter} actionParams="#BlueNight"/>
					</button>
					
					<!-- <button class="btn btn-sm variant-ghost-secondary" on:click={ async () => { await supabase.auth.signOut() } }>Logout</button> -->
				{/if}
				<LightSwitch />
			
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<Sidebar session={session} supabase={supabase} class="hidden lg:grid lg:w-[360px] overflow-hidden" />
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
