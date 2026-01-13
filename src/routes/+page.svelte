<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import * as ocr from 'esearch-ocr';
	import * as ort from 'onnxruntime-web';
	import { loadModels } from '$lib/workers';
	import type { AppState } from '$lib/types/app';
	import type { OcrInstance } from '$lib/types/ocr';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Page } from 'konsta/svelte';

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	const state = getContext<AppState>('state');

	onMount(async () => {
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

		// camera initialization
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			video.srcObject = stream;
			state.isLoading = false;
			await video.play();
		} catch (e) {
			console.error('Camera error:', e);
			state.errorText = 'Error accessing camera, please check camera permissions.';
			return;
		}

		try {
			ort.env.wasm.wasmPaths = 'https://unpkg.com/onnxruntime-web@dev/dist/';

			// Get environment variables with fallback to default URLs
			const dictUrl = import.meta.env.VITE_DICT_URL;
			const recUrl = import.meta.env.VITE_REC_URL;
			const detUrl = import.meta.env.VITE_DET_URL;

			// Load models using the worker
			const models = await loadModels({
				det: detUrl,
				rec: recUrl,
				dict: dictUrl
			});

			if (models.det && models.rec && models.dict) {
				state.ocrInstance = (await ocr.init({
					det: { input: models.det },
					rec: {
						input: models.rec,
						decodeDic: models.dict,
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
			state.errorText = 'Error loading OCR model: ' + errorMessage;
			return;
		}
	});

	function capture(): void {
		if (video.videoWidth === 0 || video.videoHeight === 0) {
			state.errorText = 'Camera not ready yet, try again.';
			return;
		}
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		state.capturedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		state.resultText = '';

		// Update preview images with captured frame
		const imageDataUrl = canvas.toDataURL('image/png');
		state.imagePreviewSrc = imageDataUrl;
	}
</script>

<Page id="camera-wrapper">
	<video class="h-full w-full" bind:this={video} width="480" height="640" autoplay muted playsinline
	></video>
	<button
		id="capture"
		class="absolute bottom-15 left-1/2 h-15 w-15 -translate-x-1/2 rounded-full bg-red-600"
		on:click={capture}
		disabled={state.isLoading}
		aria-label="capture button"
	></button>
	<button
		class="absolute right-15 bottom-15 h-15 w-15 rounded-full border border-gray-400"
		on:click={() => goto(resolve('/process' as '/'))}
		aria-label="Go to image processing"
	>
		<img
			id="preview"
			class="h-full w-full rounded-full object-cover object-center"
			src={state.imagePreviewSrc || 'icons/small.png'}
			alt="Preview of camera capture"
		/>
	</button>
	<canvas bind:this={canvas} style="display: none"></canvas>
</Page>
