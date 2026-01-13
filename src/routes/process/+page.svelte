<script lang="ts">
	import type { AppState } from '$lib/types/app';
	import { Navbar, NavbarBackLink, Page } from 'konsta/svelte';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// Access state from context
	let state = getContext<AppState>('state');

	async function infer(): Promise<void> {
		state.isLoading = true;
		await new Promise((resolve) => setTimeout(resolve, 0)); // wait for browser repaint

		try {
			const result = await state.ocrInstance?.ocr(state.capturedImageData as ImageData);

			if (result?.parragraphs && result.parragraphs.length > 0) {
				state.resultText = result.parragraphs.map((line: { text: string }) => line.text).join('\n');
				// Navigate to result page after successful OCR
				goto(resolve('/result' as '/'));
			} else {
				state.errorText = 'No text detected.';
			}
		} catch (e) {
			console.error('OCR error:', e);
			const errorMessage = e instanceof Error ? e.message : String(e);
			state.errorText = 'OCR failed: ' + errorMessage;
		}
		state.isLoading = false;
	}
</script>

<Page id="image-process">
	<Navbar title="Handmarking" subtitle="Process" class="opacity-75">
		{#snippet left()}
			<NavbarBackLink text="Back" onClick={() => goto(resolve('/'))} />
		{/snippet}
	</Navbar>

	<div class="absolute top-0 left-0 flex h-svh w-svw items-center justify-center">
		{#if !!state.imagePreviewSrc}
			<img
				id="image-preview"
				class="h-full w-full object-cover object-center"
				src={state.imagePreviewSrc}
				alt="Preview of camera capture"
			/>
		{:else}
			<div id="image-preview-placeholder" class="flex flex-col items-center justify-center">
				<img
					class="h-full w-full object-cover object-center"
					src="icons/small.png"
					alt="camera shape with letters MD inside"
				/>
				<span class="text-center">Preview of your captured image will appear here</span>
			</div>
		{/if}

		<button
			id="infer"
			class="absolute bottom-15 left-1/2 -translate-x-1/2 rounded-lg bg-indigo-600 px-4 py-2"
			on:click={infer}
			disabled={!state.capturedImageData && !state.ocrInstance}
		>
			Process Image
		</button>
	</div>
</Page>
