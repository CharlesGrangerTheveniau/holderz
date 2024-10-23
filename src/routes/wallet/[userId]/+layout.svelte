<script>

    import Navbar from "$lib/components/Navbar/Navbar.svelte";

</script>
<div class="content sm:p-8 md:p-16 xl:p-32 h-full flex flex-col items-center justify-start gap-12">
    <div class="nav-bar">
        <Navbar/>
    </div>
    
    <slot/>
</div>


<style lang="postcss">
    .nav-bar {
        position: relative;
        top: 0;
        border-radius: 5px;
        width: 100%;
    }
</style>