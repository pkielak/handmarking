<script lang="ts">
	import { ListInput } from 'konsta/svelte';
	import type { AppState } from '$lib/types/app';
	import { getContext } from 'svelte';

	interface Settings {
		fileType: 'md' | 'txt';
		saveDirectory: string;
		directoryHandle: FileSystemDirectoryHandle | null;
	}

	interface SettingsFormProps {
		onSave: (settings: Settings) => void;
		isLoading?: boolean;
	}

	let { onSave, isLoading = false }: SettingsFormProps = $props();

	// Default settings
	const DEFAULT_SETTINGS: Settings = {
		fileType: 'md',
		saveDirectory: '',
		directoryHandle: null
	};

	// Component state
	let settings = $state<Settings>({ ...DEFAULT_SETTINGS });
	const appState = getContext<AppState>('state');

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

	// Handle file type change
	function handleFileTypeChange(fileType: 'md' | 'txt'): void {
		settings.fileType = fileType;
	}

	// Handle directory change
	function handleDirectoryChange(
		directoryHandle: FileSystemDirectoryHandle | null,
		directoryName: string
	): void {
		settings.directoryHandle = directoryHandle;
		settings.saveDirectory = directoryName;
	}

	// Handle error
	function handleError(errorMessage: string): void {
		appState.errorText = errorMessage;
	}

	// Save settings
	function saveSettings(): void {
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
			if (onSave) {
				onSave(settings);
			}
		} catch (e) {
			console.error('Error saving settings:', e);
			appState.errorText = 'Failed to save settings. Please try again.';
		}
	}

	// Initialize component
	import { onMount } from 'svelte';
	onMount(() => {
		loadSettings();
	});
</script>

<ListInput
	class="-mx-4 mb-2 py-0"
	inputClass="mx-0"
	label="File Type"
	type="select"
	dropdown
	value={settings.fileType}
	placeholder="Select file type"
	onchange={(e) => {
		const newFileType = (e.target as HTMLInputElement).value as 'md' | 'txt';
		handleFileTypeChange(newFileType);
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
		handleDirectoryChange(null, (e.target as HTMLInputElement).value);
	}}
	onclick={async () => {
		try {
			if (window?.showDirectoryPicker) {
				const directoryHandle = await window.showDirectoryPicker({
					mode: 'readwrite'
				});

				// Store the directory handle and name
				handleDirectoryChange(directoryHandle, directoryHandle.name);
			}
		} catch (error) {
			console.error('Directory selection cancelled or error:', error);
			// Don't show error for user cancellation
			if (error instanceof Error && error.name === 'AbortError') {
				handleError('Failed to select directory. Please try again.');
			}
		}
	}}
>
	<span class="text-xs text-md-light-on-surface-variant dark:text-md-dark-on-surface-variant"
		>Save Directory</span
	>
	<span id="directory" class="mx-0 block h-6 text-base"
		>{settings.saveDirectory || 'Downloads'}</span
	>
	<span
		class="pointer-events-none absolute start-0 bottom-0 h-px w-full origin-bottom border-b border-md-light-on-surface dark:border-md-dark-on-surface"
	></span>
</button>

<button
	class="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white"
	onclick={saveSettings}
	disabled={isLoading}
>
	{isLoading ? 'Saving...' : 'Save'}
</button>
