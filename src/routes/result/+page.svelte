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

<Page id="result-page">
	<Navbar title="Handmarking" subtitle="Result">
		{#snippet left()}
			<NavbarBackLink text="Back" onClick={() => goto(resolve('/process' as '/'))} />
		{/snippet}
	</Navbar>

	<textarea
		id="result"
		class="result"
		rows="5"
		bind:value={state.resultText}
		placeholder="Your text from handwritten note will appear here."
		disabled={!state.resultText}
	></textarea>
	<footer>
		<button id="save" class="save" on:click={save} disabled={!state.resultText}>
			💾 Save to MD
		</button>
	</footer>
</Page>
