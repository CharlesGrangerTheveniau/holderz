<script lang="ts">
    import { goto } from '$app/navigation';

	export let data;

	let { supabase, session } = data
	$: ({ supabase, session } = data)

	console.log(session?.user)

	if (session) {
		goto(`/wallet/${session?.user.id}`)
	}
	
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<figure>
			<section class="img-bg"/>
			<div class="heading ">
				<h1 class="font-bold text-5xl">Welcome to Holderz.</h1>
				<h4 class="py-8">1 account, no keys, easy access.</h4>
				<a class="btn variant-filled" href="/login">Create an account or sign in</a>
			</div>
		</figure>
	</div>
</div>

<style lang="postcss">
	figure {
		@apply flex relative flex-col justify-center items-center;
	}
	figure svg,
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation: pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}
</style>
