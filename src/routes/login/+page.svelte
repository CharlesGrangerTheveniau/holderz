<script lang="ts">
    export let data;
    import { Auth } from '@supabase/auth-ui-svelte';
    import { ThemeSupa } from '@supabase/auth-ui-shared';
	import { goto } from '$app/navigation';

    let { supabase, session } = data
    $: ({ supabase, session } = data)

    console.log(supabase)
    console.log(session)

    $: if(session) {
        goto("/")
    }
</script>

<div class="hero min-h-screen flex justify-center items-center">
    <div class="hero-content w-[800px]">
        <div class="flex flex-col justify-center items-center">
            <p>Create an account or login below!</p>
            <!-- Supabase Auth Ui -->
             <Auth supabaseClient = {supabase}
                   theme="light"
                   appearance= {{
                        theme: ThemeSupa,
                        style: {
                            input: "width: 400px;"
                        }
                   }}
                   providers = {["google"]} />
        </div>
    </div>
</div>