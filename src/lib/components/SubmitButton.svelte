<script lang="ts">
	import { Button, Preloader } from 'konsta/svelte';

	interface SettingsActionsProps {
		isLoading: boolean;
		onSave: () => void;
		label: string;
		actionLabel: string;
	}

	let { isLoading, onSave, label, actionLabel }: SettingsActionsProps = $props();
</script>

<Button
	class="mb-2 w-28 self-center bg-white text-indigo-600 hover:bg-gray-100"
	onclick={onSave}
	disabled={isLoading}
>
	{#if isLoading}
		<Preloader class="h-5 w-5" />
		<span class="ml-2">{actionLabel}</span>
	{:else}
		{label}
	{/if}
</Button>
