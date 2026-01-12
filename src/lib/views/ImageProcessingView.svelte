<script lang="ts">
	import type { AppState } from '$lib/types/app';
	import { getContext } from 'svelte';

	// Access state from context
	let state = getContext<AppState>('state');

	async function infer(): Promise<void> {
		if (!state.capturedImageData) {
			state.resultText = 'Please capture an image first.';
			return;
		}
		if (!state.ocrInstance) {
			state.resultText = 'OCR model not initialized.';
			return;
		}
		state.resultPlaceholder = 'Running OCR...';
		await new Promise((resolve) => setTimeout(resolve, 0)); // wait for browser repaint

		try {
			if (!state.capturedImageData) {
				state.resultText = 'Please capture an image first.';
				return;
			}

			const result = await state.ocrInstance.ocr(state.capturedImageData);

			if (result?.parragraphs && result.parragraphs.length > 0) {
				state.resultText = result.parragraphs.map((line: { text: string }) => line.text).join('\n');
				state.resultDisabled = false;
				state.saveDisabled = false;
			} else {
				state.resultPlaceholder = 'No text detected.';
				state.resultDisabled = false;
			}
		} catch (e) {
			console.error('OCR error:', e);
			const errorMessage = e instanceof Error ? e.message : String(e);
			state.resultText = 'OCR failed: ' + errorMessage;
			state.resultDisabled = false;
		}
	}

	async function save(): Promise<void> {
		try {
			if (!state.resultText) {
				state.resultText = '';
				state.resultPlaceholder = 'No content to save.';
				return;
			}
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
			state.resultText = '';
			state.resultPlaceholder = 'Failed to save file.';
		}
	}
</script>

<section id="image-process" class="image-process">
	<nav>
		<header>
			<a class="back" href="#capture" aria-label="back">く</a>
			<img src="icons/small.png" alt="Camera shape with MD letters inside" />
			<h1 class="navbar-header">Handmarking</h1>
		</header>
	</nav>

	<div class="image-preview-wrapper">
		<img
			id="image-preview"
			class="image-preview"
			src={state.imagePreviewSrc}
			alt="Preview of camera capture"
		/>
		{#if state.showImagePreviewPlaceholder}
			<div id="image-preview-placeholder" class="image-preview-placeholder">
				<img src="icons/small.png" alt="camera shape with letters MD inside" />
				<span>Preview of your captured image will appear here</span>
			</div>
		{/if}
	</div>

	<textarea
		id="result"
		class="result"
		rows="5"
		bind:value={state.resultText}
		placeholder={state.resultPlaceholder}
		disabled={state.resultDisabled}
	></textarea>
	<footer>
		<button id="infer" class="infer" on:click={infer} disabled={state.inferDisabled}>
			🤖 Process Image
		</button>
		<button id="save" class="save" on:click={save} disabled={state.saveDisabled}>
			💾 Save to MD
		</button>
	</footer>
</section>
