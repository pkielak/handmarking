<script lang="ts">
	import { setContext } from 'svelte';
	import CameraView from '../lib/views/CameraView.svelte';
	import ImageProcessingView from '../lib/views/ImageProcessingView.svelte';
	import type { AppState } from '$lib/types/app';

	let state = $state<AppState>({
		resultText: '',
		playbackInfo: '',
		showPlaybackInfo: false,
		capturedImageData: null,
		ocrInstance: null,
		captureDisabled: true,
		inferDisabled: true,
		resultDisabled: true,
		saveDisabled: true,
		previewSrc: 'icons/small.png',
		imagePreviewSrc:
			"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='black' opacity='0.1'/%3E%3C/svg%3E",
		showImagePreviewPlaceholder: true,
		resultPlaceholder: 'Your text from handwritten note will appear here.'
	});

	setContext('state', state);
</script>

<main>
	<CameraView />
	<ImageProcessingView />
</main>
