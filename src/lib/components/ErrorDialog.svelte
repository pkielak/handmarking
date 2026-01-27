<script lang="ts">
	// @ts-nocheck
	import { Dialog, DialogButton } from 'konsta/svelte';
	import Confetti from 'svelte-confetti';

	interface SettingsProps {
		opened: boolean;
		onClose: () => void;
	}

	let { opened, onClose }: SettingsProps = $props();
</script>

<Dialog class="w-full max-w-3xl" {opened} onBackdropClick={onClose}>
	<!-- eslint-disable-next-line -->
	{#snippet title()}
		Jak to jest być skrybą, dobrze?
	{/snippet}
	<div class="relative flex aspect-video w-full max-w-3xl flex-col gap-2">
		<iframe
			class="aspect-video w-full"
			width="720"
			height="405"
			src="https://www.youtube-nocookie.com/embed/aiHW6BSm_p0?si=8jC8iNNox_KG55tr"
			title="YouTube video player"
			frameborder="0"
			allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>
		<p class="m-0 p-0">
			This video is embedded from YouTube. Click play to load and share data with Google.
		</p>
	</div>
	{#snippet buttons()}
		<DialogButton onclick={onClose}>Close</DialogButton>
	{/snippet}
</Dialog>
{#if opened}
	<div
		class="pointer-events-none fixed top-0 left-0 flex h-screen w-screen justify-center overflow-hidden"
	>
		<Confetti
			x={[-5, 5]}
			y={[0, 0.1]}
			delay={[500, 2000]}
			infinite
			duration="5000"
			amount="200"
			fallDistance="100vh"
		/>
	</div>
{/if}
