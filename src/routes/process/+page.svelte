<script lang="ts">
	import type { AppState } from '$lib/types/app';
	import { Dialog, DialogButton, Navbar, NavbarBackLink, Page } from 'konsta/svelte';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// Access state from context
	let appState = getContext<AppState>('state');
	let dialogOpened = $state(false);

	async function infer(): Promise<void> {
		appState.isLoading = true;
		await new Promise((resolve) => setTimeout(resolve, 0)); // wait for browser repaint

		try {
			const result = await appState.ocrInstance?.ocr(appState.capturedImageData as ImageData);

			if (result?.parragraphs && result.parragraphs.length > 0) {
				appState.resultText = result.parragraphs
					.map((line: { text: string }) => line.text)
					.join('\n');
				// Navigate to result page after successful OCR
				goto(resolve('/result'));
			} else {
				dialogOpened = true;
			}
		} catch (e) {
			console.error('OCR error:', e);
			const errorMessage = e instanceof Error ? e.message : String(e);
			appState.errorText = 'OCR failed: ' + errorMessage;
		}
		appState.isLoading = false;
	}
</script>

<Page id="image-process">
	<Navbar title="Process" class="z-20 opacity-75">
		{#snippet left()}
			<NavbarBackLink text="Back" onClick={() => goto(resolve('/'))} />
		{/snippet}
	</Navbar>

	<div class="absolute top-0 left-0 flex h-svh w-svw items-center justify-center">
		{#if !!appState.imagePreviewSrc}
			<div>
				<img
					id="image-preview"
					class="h-full w-full object-cover object-center"
					src={appState.imagePreviewSrc}
					alt="Preview of camera capture"
				/>
			</div>
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

		{#if appState.capturedImageData && appState.ocrInstance}
			<button
				id="infer"
				class="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-lg bg-indigo-600 px-4 py-2"
				onclick={infer}
			>
				Process Image
			</button>
		{/if}
	</div>
	<Dialog opened={dialogOpened} onBackdropClick={() => (dialogOpened = false)}>
		<p>No text detected.</p>
		<br />
		<p>Try again or take another picture.</p>
		{#snippet buttons()}
			<DialogButton strong onclick={() => (dialogOpened = false)}>Ok</DialogButton>
		{/snippet}
	</Dialog>
</Page>
