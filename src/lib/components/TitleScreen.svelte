<script lang="ts">
	import { Block, Page } from 'konsta/svelte';
	import TitleHeader from './TitleHeader.svelte';
	import SettingsForm from './SettingsForm.svelte';

	interface SettingsProps {
		onClose?: () => void;
	}

	let { onClose }: SettingsProps = $props();

	function handleSettingsSave() {
		if (onClose) {
			onClose();
		}
	}
</script>

<Page>
	<div class="flex h-svh w-full flex-col justify-center bg-indigo-600 align-middle">
		<Block strong class="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-sm">
			<TitleHeader />
			<p class="my-0 mb-2">How and where do you want to save your texts?</p>
			<SettingsForm onSave={handleSettingsSave} />
		</Block>
	</div>
</Page>
