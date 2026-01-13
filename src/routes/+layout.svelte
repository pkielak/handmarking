<script lang="ts">
	import { App, Button, Preloader, Toast } from 'konsta/svelte';
	import { onMount, setContext } from 'svelte';
	import './layout.css';
	import type { AppState } from '$lib/types/app';

	let { children } = $props();
	let dark = $state(false);

	// Create shared global state
	let globalState = $state<AppState>({
		isLoading: true,
		errorText: '',
		ocrInstance: null,
		capturedImageData: null,
		imagePreviewSrc: '',
		resultText: ''
	});

	// Set the global state in context so all pages can access it
	setContext<AppState>('state', globalState);

	function toggleDark(isDark: boolean) {
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
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

		return () => mediaQuery.removeEventListener('change', handleChange);
	});
</script>

<svelte:head></svelte:head>

<App theme="material" {dark}>
	{#if globalState.isLoading}
		<Preloader class="absolute top-1/2 left-1/2 z-10 h-16 w-16 -translate-1/2" />
	{/if}
	<Toast position="center" opened={!!globalState.errorText}>
		{#snippet button()}
			<Button clear inline small rounded onClick={() => (globalState.errorText = '')}>Close</Button>
		{/snippet}
		<div class="shrink">{globalState.errorText}</div>
	</Toast>
	{@render children()}
</App>
