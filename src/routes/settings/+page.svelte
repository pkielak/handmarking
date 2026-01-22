<script lang="ts">
	import { BlockTitle, List, Page } from 'konsta/svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import SettingsForm from '$lib/components/SettingsForm.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';

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

	function handleSettingsSave() {
		// Navigate back after saving
		goto(resolve(previousUrl as '/'));
	}
</script>

<Page id="settings-page">
	<Navbar title="Settings" showSettings={false} backLink={previousUrl} />
	<BlockTitle class="mb-2">File</BlockTitle>
	<List inset strong class="p-4">
		<SettingsForm onSave={handleSettingsSave} />
	</List>
</Page>
