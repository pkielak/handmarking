<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import * as ocr from 'esearch-ocr';
	import * as ort from 'onnxruntime-web';
	import { cacheModel } from '../utils';
	import type { AppState } from '$lib/types/app';
	import type { OcrInstance } from '$lib/types/ocr';

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	const state = getContext<AppState>('state');

	onMount(async () => {
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

		// camera initialization
		state.showPlaybackInfo = true;
		state.playbackInfo = 'Initializing camera...';
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			video.srcObject = stream;
			await video.play();
			state.showPlaybackInfo = false;
		} catch (e) {
			console.error('Camera error:', e);
			const permissionsError = 'Error accessing camera, please check camera permissions.';
			state.playbackInfo = permissionsError;
			state.resultPlaceholder = permissionsError;
			return;
		}

		try {
			ort.env.wasm.wasmPaths = 'https://unpkg.com/onnxruntime-web@dev/dist/';

			// Get environment variables with fallback to default URLs
			const dictUrl = import.meta.env.VITE_DICT_URL;
			const recUrl = import.meta.env.VITE_REC_URL;
			const detUrl = import.meta.env.VITE_DET_URL;

			const dictContent = await (await cacheModel(dictUrl, 'dict'))?.text();
			const rec = await (await cacheModel(recUrl, 'rec'))?.arrayBuffer();
			const det = await (await cacheModel(detUrl, 'det'))?.arrayBuffer();

			if (dictContent && rec && det) {
				state.ocrInstance = (await ocr.init({
					det: { input: det },
					rec: {
						input: rec,
						decodeDic: dictContent,
						optimize: {
							space: false
						}
					},
					ort
				})) as OcrInstance;
			}
		} catch (err) {
			console.error('Error loading OCR model:', err);
			const errorMessage = err instanceof Error ? err.message : String(err);
			state.resultPlaceholder = 'Error loading OCR model: ' + errorMessage;
			return;
		}

		state.resultPlaceholder = 'Your text from handwritten note will appear here.';
		state.captureDisabled = false;
	});

	function capture(): void {
		if (video.videoWidth === 0 || video.videoHeight === 0) {
			state.resultText = 'Camera not ready yet, try again.';
			return;
		}
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		state.capturedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		state.inferDisabled = false;
		state.resultText = '';
		state.resultDisabled = true;
		state.saveDisabled = true;

		// Update preview images with captured frame
		const imageDataUrl = canvas.toDataURL('image/png');
		state.previewSrc = imageDataUrl;
		state.imagePreviewSrc = imageDataUrl;

		// Hide the placeholder when image is captured
		state.showImagePreviewPlaceholder = false;
	}
</script>

<section id="camera-wrapper" class="camera-wrapper">
	<video bind:this={video} class="camera" width="480" height="640" autoplay muted playsinline
	></video>
	<button
		id="capture"
		class="capture"
		on:click={capture}
		disabled={state.captureDisabled}
		aria-label="capture button"
	></button>
	{#if state.showPlaybackInfo}
		<p id="playback-info" class="playback-info show">{state.playbackInfo}</p>
	{:else}
		<p id="playback-info" class="playback-info"></p>
	{/if}
	<a href="#image-process">
		<img id="preview" class="preview" src={state.previewSrc} alt="Preview of camera capture" />
	</a>
</section>
<canvas bind:this={canvas} style="display: none"></canvas>
