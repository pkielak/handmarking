<script lang="ts">
	import type { AppState } from '$lib/types/app';
	import { Dialog, DialogButton, Navbar, NavbarBackLink, Page } from 'konsta/svelte';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { generateFilename, saveFile } from '$lib/utils/fileUtils';

	// Access state from context
	let appState = getContext<AppState>('state');
	let dialogOpened = $state(false);
	let filename = $state('');

	async function save(): Promise<void> {
		try {
			// Get settings to determine file type
			const savedSettings = localStorage.getItem('kopistaSettings');
			const fileExtension = savedSettings ? JSON.parse(savedSettings).fileType : 'md';

			// Generate filename
			filename = generateFilename(fileExtension);

			// Save the file
			const result = await saveFile({
				content: appState.resultText,
				filename,
				fileExtension
			});

			if (result.success) {
				dialogOpened = true;
			} else {
				appState.errorText = 'Failed to save file.';
			}
		} catch (error) {
			console.error('Save error:', error);
			appState.errorText = 'Failed to save file.';
		}
	}

	function resetAndNew(): void {
		appState.capturedImageData = null;
		appState.imagePreviewSrc = '';
		appState.resultText = '';
		dialogOpened = false;
		goto(resolve('/'));
	}
</script>

<Page id="result-page" class="align-center flex max-h-screen min-h-screen flex-col overflow-y-auto">
	<Navbar title="Result" class="z-20">
		{#snippet left()}
			<NavbarBackLink text="Back" onClick={() => goto(resolve('/process' as '/'))} />
		{/snippet}
	</Navbar>

	<div class="flex h-full w-full flex-1 flex-col px-4 pb-7">
		<div class="my-8 grid h-full">
			<textarea
				id="result"
				bind:value={appState.resultText}
				class="resize-none"
				placeholder="Your text from handwritten note will appear here."
				disabled={!appState.resultText && !appState.imagePreviewSrc}
			></textarea>
		</div>
		{#if appState.resultText && appState.imagePreviewSrc}
			<button
				id="infer"
				class="mx-auto mb-6 w-auto rounded-lg bg-indigo-600 px-6 py-2.5"
				onclick={save}
			>
				Save file
			</button>
		{/if}
	</div>
	<Dialog opened={dialogOpened} onBackdropClick={() => (dialogOpened = false)}>
		<p>Text saved as {filename}</p>
		<br />
		<p>Would you create another one or edit existing?</p>
		{#snippet buttons()}
			<DialogButton onclick={() => (dialogOpened = false)}>Edit</DialogButton>
			<DialogButton strong onclick={resetAndNew}>New</DialogButton>
		{/snippet}
	</Dialog>
</Page>
