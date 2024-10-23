<script lang="ts">
	import { getDrawerStore, Drawer } from '@skeletonlabs/skeleton';
	import Sidebar from '../Sidebar/Sidebar.svelte';

	const drawerStore = getDrawerStore();

	$: classesDrawer = $drawerStore.id === 'profile'
</script>

<Drawer>
	{#if ($drawerStore.id === 'settings')}
		<div>This is a profile drawer</div>
	{:else}
		<Sidebar embedded={true} session={$drawerStore.meta.session} supabase={$drawerStore.meta.supabase}/>
	{/if}
</Drawer>