<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, LightSwitch, Avatar, filter, BlueNight } from '@skeletonlabs/skeleton';

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
	import { storePopup } from '@skeletonlabs/skeleton';
    import { goto, invalidateAll } from '$app/navigation';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	export let data;

    let { supabase, session } = data
    $: ({ supabase, session } = data)

	console.log(session?.user)

	function getAvatar() {
		let avatar_src;
		let identities = session?.user.identities
		if(identities) {
			identities.forEach(i => {
				if (i.provider == 'google') {
					avatar_src = i.identity_data?.avatar_url
				}
			})
		}
		return avatar_src
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
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex flex-row gap-5">
					<a class="btn-icon btn-icon-md text-white bg-gradient-to-br variant-gradient-primary-secondary"
					href="/"
					rel="noreferrer">H</a>
					{#if session !== null } 
						<a class="btn btn-sm text-white bg-gradient-to-br variant-gradient-primary-secondary rounded-lg w-36"
						href="/wallet/{session.user.id}"
						rel="noreferrer">My wallet</a>
					{/if}
				</div>
				
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#if session == null }
					<button class="btn btn-sm variant-ghost-primary" on:click={() => goto("/login")}>Login</button>
				{:else}
					<button class="btn-icon btn-icon-md">
						<Avatar src="{getAvatar()}" width="w-full" rounded="rounded-full" action={filter} actionParams="#BlueNight"/>
					</button>
					
					<button class="btn btn-sm variant-ghost-secondary" on:click={ async () => { await supabase.auth.signOut() } }>Logout</button>
				{/if}
				<LightSwitch />
			
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
