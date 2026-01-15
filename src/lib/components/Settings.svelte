<script lang="ts">
	import { onMount } from 'svelte';
	import { Block, Button, List, ListInput, Page, Preloader } from 'konsta/svelte';

	interface Settings {
		fileType: 'md' | 'txt';
		saveDirectory: string;
		directoryHandle: FileSystemDirectoryHandle | null;
	}

	interface SettingsProps {
		onClose?: () => void;
	}

	let { onClose }: SettingsProps = $props();

	// Default settings
	const DEFAULT_SETTINGS: Settings = {
		fileType: 'md',
		saveDirectory: '',
		directoryHandle: null
	};

	// Component state
	let settings = $state<Settings>({ ...DEFAULT_SETTINGS });
	let isLoading = $state(false);
	let error = $state('');

	// Load settings from localStorage
	function loadSettings(): void {
		try {
			const savedSettings = localStorage.getItem('kopistaSettings');
			if (savedSettings) {
				const parsed = JSON.parse(savedSettings);
				// Validate the parsed settings
				if (parsed && typeof parsed === 'object') {
					settings = {
						fileType:
							parsed.fileType === 'md' || parsed.fileType === 'txt'
								? parsed.fileType
								: DEFAULT_SETTINGS.fileType,
						saveDirectory: parsed.saveDirectory || DEFAULT_SETTINGS.saveDirectory,
						directoryHandle: null // Directory handle must be obtained via showDirectoryPicker
					};
				}
			}
		} catch (e) {
			console.error('Error loading settings:', e);
			settings = { ...DEFAULT_SETTINGS };
		}
	}

	// Save settings to localStorage
	function saveSettings(): void {
		isLoading = true;
		error = '';

		try {
			// Save to localStorage (we can't serialize the directory handle, so we just save the name)
			localStorage.setItem(
				'kopistaSettings',
				JSON.stringify({
					fileType: settings.fileType,
					saveDirectory: settings.saveDirectory
				})
			);

			// Notify parent component that settings were saved
			if (onClose) {
				onClose();
			}
		} catch (e) {
			console.error('Error saving settings:', e);
			error = 'Failed to save settings. Please try again.';
			isLoading = false;
		}
	}

	// Initialize component
	onMount(() => {
		loadSettings();
	});
</script>

<Page>
	<div class="flex h-svh w-full flex-col justify-center bg-indigo-600 align-middle">
		<Block strong class="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-sm">
			<div class="px-2 pt-2">
				<h1 class="my-2 text-center text-5xl text-white">Kopista</h1>
				<p class="my-0 mb-2 text-center">Your local note copyist.</p>
			</div>
			<List class="my-0 px-2">
				<p class="my-0 mb-2">How and where do you want to save your texts?</p>
				<ListInput
					class="-mx-4 mb-2 py-0"
					inputClass="mx-0"
					label="File Type"
					type="select"
					dropdown
					value={settings.fileType}
					placeholder="Select file type"
					onchange={(e) => {
						settings.fileType = (e.target as HTMLInputElement).value as 'md' | 'txt';
					}}
				>
					<option value="md">md</option>
					<option value="txt">txt</option>
				</ListInput>

				<button
					class="relative flex min-h-14 w-full cursor-pointer flex-col items-start justify-center rounded-t bg-md-light-surface-variant px-4 text-md-light-on-surface dark:bg-md-dark-surface-variant dark:text-md-dark-on-surface"
					placeholder=""
					value={settings.saveDirectory}
					onchange={(e) => {
						settings.saveDirectory = (e.target as HTMLInputElement).value;
					}}
					onclick={async () => {
						try {
							const directoryHandle = await window.showDirectoryPicker({
								mode: 'readwrite'
							});

							// Store the directory handle and name
							settings.directoryHandle = directoryHandle;
							settings.saveDirectory = directoryHandle.name;
						} catch (err) {
							console.error('Directory selection cancelled or error:', err);
							// Don't show error for user cancellation
							if (err.name !== 'AbortError') {
								error = 'Failed to select directory. Please try again.';
							}
						}
					}}
				>
					<span
						class="text-xs text-md-light-on-surface-variant dark:text-md-dark-on-surface-variant"
						>Save Directory</span
					>
					<span id="directory" class="mx-0 block h-6 text-base"
						>{settings.saveDirectory || 'Downloads'}</span
					>
					<span
						class="pointer-events-none absolute start-0 bottom-0 h-px w-full origin-bottom border-b border-md-light-on-surface dark:border-md-dark-on-surface"
					></span>
				</button>
			</List>
			<Button
				class="mb-2 w-28 self-center  bg-white text-indigo-600 hover:bg-gray-100"
				onclick={saveSettings}
				disabled={isLoading}
			>
				{#if isLoading}
					<Preloader class="h-5 w-5" />
					<span class="ml-2">Saving...</span>
				{:else}
					Apply
				{/if}
			</Button>
		</Block>
		{#if error}
			<div class="mb-4 rounded bg-red-500 p-3 text-center text-white">
				{error}
			</div>
		{/if}
	</div>
</Page>

<style>
	h1 {
		font-family: 'Uncial Antiqua', 'sans-serif';
	}
</style>
