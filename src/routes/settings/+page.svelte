<script lang="ts">
	import { Page } from 'konsta/svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { afterNavigate } from '$app/navigation';

	let previousUrl = '/';

	afterNavigate(({ from }) => {
		if (from) {
			// Get the base path from the environment or use default
			const basePath = import.meta.env.VITE_BASE_PATH || '/kopista';
			// Construct the full URL with base path
			previousUrl = from.url.pathname.replace(basePath, '');
			console.log(basePath, previousUrl);
		}
	});
</script>

<Page id="settings-page">
	<Navbar title="Settings" showSettings={false} backLink={previousUrl} />
	<div class="p-4">
		<h1 class="mb-6 text-2xl font-bold">Settings</h1>
		<p>Settings page content will be added here.</p>
	</div>
</Page>
