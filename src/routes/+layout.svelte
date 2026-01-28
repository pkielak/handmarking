<script lang="ts">
	import { App, Notification } from 'konsta/svelte';
	import { onMount, setContext } from 'svelte';
	import './layout.css';
	import type { AppState } from '$lib/types/app';
	import TitleScreen from '$lib/components/TitleScreen.svelte';
	import {
		toggleDarkMode,
		initializeApp,
		cleanupCamera,
		initialAppState
	} from '$lib/utils/appUtils';

	let { children } = $props();
	let dark = $state(false);
	let showSettings = $state(false);

	// Create shared global state
	let appState = $state<AppState>(initialAppState);

	// Set the global state in context so all pages can access it
	setContext<AppState>('state', appState);

	function toggleDark(isDark: boolean) {
		toggleDarkMode(isDark);
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
			const success = await initializeApp(appState);

			if (success) {
				appState.isLoading = false;
				appState.initializationComplete = true;
			}
		})();

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
			// Clean up camera when component unmounts
			cleanupCamera(appState);
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
		<TitleScreen onClose={() => (showSettings = false)} />
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

	<Notification
		title="Loading Models"
		opened={appState.modelsLoading && !appState.modelsLoaded}
		text="OCR models are loading in the background. You can use the app while this completes."
	></Notification>

	<Notification
		title="Models Ready"
		opened={appState.modelsLoaded && !appState.modelsLoading}
		text="OCR models are ready!"
	></Notification>
</App>
