<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { AppState } from '$lib/types/app';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Page } from 'konsta/svelte';

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	const state = getContext<AppState>('state');

	onMount(() => {
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	});

	// Use effect to react to camera stream becoming available
	$effect(() => {
		if (!state.initializationComplete) {
			return;
		}

		if (!state.cameraStream) {
			return;
		}

		// Use the camera stream from global state
		video.srcObject = state.cameraStream;

		// Wrap video playback in async IIFE
		void (async () => {
			try {
				await video.play();
			} catch (e) {
				console.error('Error playing video:', e);
				state.errorText =
					'Error playing camera stream: ' + (e instanceof Error ? e.message : String(e));
			}
		})();
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
