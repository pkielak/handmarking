<script lang="ts">
	import { App, Notification } from 'konsta/svelte';
	import { onMount, setContext } from 'svelte';
	import './layout.css';
	import type { AppState } from '$lib/types/app';
	import * as ocr from 'esearch-ocr';
	import * as ort from 'onnxruntime-web';
	import { loadModels } from '$lib/workers';
	import type { OcrInstance } from '$lib/types/ocr';
	import Settings from '$lib/components/Settings.svelte';

	let { children } = $props();
	let dark = $state(false);
	let showSettings = $state(false);

	// Create shared global state
	let appState = $state<AppState>({
		isLoading: true,
		errorText: '',
		ocrInstance: null,
		capturedImageData: null,
		imagePreviewSrc: '',
		resultText: '',
		cameraStream: null,
		initializationComplete: false
	});

	// Set the global state in context so all pages can access it
	setContext<AppState>('state', appState);

	function toggleDark(isDark: boolean) {
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	let cameraStream: MediaStream | null = null;

	async function initializeCamera() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});

			// Store references to the stream
			cameraStream = stream;
			appState.cameraStream = stream;

			return true;
		} catch (e) {
			console.error('Camera error:', e);
			appState.errorText = 'Error accessing camera, please check camera permissions.';
			return false;
		}
	}

	function cleanupCamera() {
		if (cameraStream) {
			console.log('Cleaning up camera stream...');
			cameraStream.getTracks().forEach((track) => {
				track.stop();
			});
			cameraStream = null;
			appState.cameraStream = null;
		}
	}

	async function initializeModels() {
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
				appState.ocrInstance = (await ocr.init({
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
				return true;
			}
		} catch (err) {
			console.error('Error loading OCR model:', err);
			const errorMessage = err instanceof Error ? err.message : String(err);
			appState.errorText = 'Error loading OCR model: ' + errorMessage;
		}
		return false;
	}

	async function initializeApp() {
		console.log('Starting app initialization...');
		// Initialize camera and models in parallel
		const [cameraSuccess, modelSuccess] = await Promise.all([
			initializeCamera(),
			initializeModels()
		]);

		if (!cameraSuccess || !modelSuccess) {
			console.error('App initialization failed');
			return false;
		}

		return true;
	}

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		dark = document.documentElement.classList.contains('dark') || mediaQuery.matches;

		toggleDark(dark);

		const handleChange = (event: MediaQueryListEvent) => {
			dark = event.matches;
			toggleDark(dark);
		};

		mediaQuery.addEventListener('change', handleChange);

		// Check if settings exist in localStorage
		const settingsExist = localStorage.getItem('kopistaSettings') !== null;
		if (!settingsExist) {
			showSettings = true;
		}

		// Wrap async code in IIFE
		void (async () => {
			// Initialize camera and models
			const success = await initializeApp();

			if (success) {
				appState.isLoading = false;
				appState.initializationComplete = true;
			}
		})();

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
			// Clean up camera when component unmounts
			cleanupCamera();
		};
	});
</script>

<svelte:head></svelte:head>

<App theme="material" {dark}>
	{#if appState.isLoading}
		<div
			class="fixed inset-0 z-10 flex items-center justify-center bg-white/20 dark:bg-gray-900/20"
		>
			<div
				class="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"
			></div>
		</div>
	{/if}

	{#if showSettings}
		<Settings onClose={() => (showSettings = false)} />
	{:else}
		{@render children()}
	{/if}

	<Notification
		title="Error"
		opened={!!appState.errorText}
		text={appState.errorText}
		onClose={() => (appState.errorText = '')}
		button="x"
	></Notification>
</App>
