<script lang="ts">
	import type { AppState } from '$lib/types/app';
	import { Navbar, NavbarBackLink, Page } from 'konsta/svelte';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// Access state from context
	let state = getContext<AppState>('state');

	async function save(): Promise<void> {
		try {
			// Create a Blob with markdown MIME type
			const blob = new Blob([state.resultText], { type: 'text/markdown' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			// Generate filename with format YYYY_MM_DD_HHMMSS using a single replace invocation
			const now = new Date();
			const filename = `handmarking_${now
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
		} catch (error) {
			console.error('Save error:', error);
			state.errorText = 'Failed to save file.';
		}
	}
</script>

<Page id="result-page" class="align-center flex max-h-screen min-h-screen flex-col overflow-y-auto">
	<Navbar title="Handmarking" subtitle="Result">
		{#snippet left()}
			<NavbarBackLink text="Back" onClick={() => goto(resolve('/process' as '/'))} />
		{/snippet}
	</Navbar>

	<div class="flex h-full w-full flex-1 flex-col px-4 pb-8">
		<div class="my-8 grid h-full">
			<textarea
				id="result"
				bind:value={state.resultText}
				class="resize-none"
				placeholder="Your text from handwritten note will appear here."
				disabled={!state.resultText}
			></textarea>
		</div>

		<button
			id="infer"
			class="mx-auto mb-7 w-auto rounded-lg bg-indigo-600 px-6 py-2.5"
			on:click={save}
			disabled={!state.resultText}
		>
			Save file
		</button>
	</div>
</Page>
