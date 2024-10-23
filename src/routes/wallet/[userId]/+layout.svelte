<script>

    import Navbar from "$lib/components/Navbar/Navbar.svelte";

</script>
<div class="content h-full flex flex-col items-center justify-start">
    <div class="nav-bar bg-surface-400 flex flex-row border-surface-500/30 variant-glass-surface">
        <Navbar/>
    </div>
    <slot/>
</div>


<style>
    .nav-bar {
        margin-top: 30px;
        position: relative;
        top: 0;
        border-radius: 5px;
    }
</style>