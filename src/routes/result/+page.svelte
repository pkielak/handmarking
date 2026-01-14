<script lang="ts">
	import type { AppState } from '$lib/types/app';
	import { Dialog, DialogButton, Navbar, NavbarBackLink, Page } from 'konsta/svelte';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// Access state from context
	let appState = getContext<AppState>('state');
	let dialogOpened = $state(false);
	let filename = $state('');

	async function save(): Promise<void> {
		try {
			// Create a Blob with markdown MIME type
			const blob = new Blob([appState.resultText], { type: 'text/markdown' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			// Generate filename with format YYYY_MM_DD_HHMMSS using a single replace invocation
			const now = new Date();
			filename = `handmarking_${now
				.toISOString()
				.replace(/[-:T.]/g, '')
				.slice(0, 14)}.md`;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, 1000);
			dialogOpened = true;
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
	<Navbar title="Result">
		{#snippet left()}
			<NavbarBackLink text="Back" onClick={() => goto(resolve('/process' as '/'))} />
		{/snippet}
	</Navbar>

	<div class="flex h-full w-full flex-1 flex-col px-4 pb-8">
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
				class="mx-auto mb-7 w-auto rounded-lg bg-indigo-600 px-6 py-2.5"
				onclick={save}
			>
				Save file
			</button>
		{/if}
	</div>
	<Dialog opened={dialogOpened} onBackdropClick={() => (dialogOpened = false)}>
		Text saved as {filename} Would you create another one or edit existing?
		{#snippet buttons()}
			<DialogButton onclick={() => (dialogOpened = false)}>Edit</DialogButton>
			<DialogButton strong onclick={resetAndNew}>New</DialogButton>
		{/snippet}
	</Dialog>
</Page>
