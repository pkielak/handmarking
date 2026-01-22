<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { AppState } from '$lib/types/app';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Page } from 'konsta/svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	const appState = getContext<AppState>('state');

	onMount(() => {
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	});

	// Use effect to react to camera stream becoming available
	$effect(() => {
		if (!appState.initializationComplete) {
			return;
		}

		if (!appState.cameraStream) {
			return;
		}

		// Use the camera stream from global state
		video.srcObject = appState.cameraStream;

		// Wrap video playback in async IIFE
		void (async () => {
			try {
				await video.play();
			} catch (e) {
				console.error('Error playing video:', e);
				appState.errorText =
					'Error playing camera stream: ' + (e instanceof Error ? e.message : String(e));
			}
		})();
	});

	function capture(): void {
		if (video.videoWidth === 0 || video.videoHeight === 0) {
			appState.errorText = 'Camera not ready yet, try again.';
			return;
		}
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		appState.capturedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		appState.resultText = '';

		// Update preview images with captured frame
		const imageDataUrl = canvas.toDataURL('image/png');
		appState.imagePreviewSrc = imageDataUrl;
	}

	function process(): void {
		goto(resolve('/process'));
	}
</script>

<Page id="camera-wrapper">
	<Navbar transparent={true} title="" showSettings={true} />
	<video class="h-full w-full" bind:this={video} width="480" height="640" autoplay muted playsinline
	></video>
	<button
		id="capture"
		class="absolute bottom-12 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-red-600"
		onclick={capture}
		disabled={appState.isLoading}
		aria-label="capture button"
	></button>
	{#if appState.imagePreviewSrc}
		<button
			class="absolute right-8 bottom-12 h-12 w-12 rounded-full border border-gray-400"
			onclick={process}
			aria-label="Go to image processing"
		>
			<img
				id="preview"
				class="h-full w-full rounded-full object-cover object-center"
				src={appState.imagePreviewSrc}
				alt="Preview of camera capture"
			/>
		</button>
	{/if}
	<canvas bind:this={canvas} style="display: none"></canvas>
</Page>
