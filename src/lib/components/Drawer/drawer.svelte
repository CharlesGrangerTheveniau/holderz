<script lang="ts">
	import { getDrawerStore, Drawer } from '@skeletonlabs/skeleton';
	import Sidebar from '../Sidebar/Sidebar.svelte';

	const drawerStore = getDrawerStore();

	$: classesDrawer = $drawerStore.id === 'doc-sidenav' ? 'lg:hidden' : '';
</script>

<Drawer class={classesDrawer}>
	<Sidebar embedded={true} session={$drawerStore.meta.session} supabase={$drawerStore.meta.supabase}/>
</Drawer>