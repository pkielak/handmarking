<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Block, Page } from 'konsta/svelte';
	import TitleHeader from './TitleHeader.svelte';
	import FileTypeSelector from './FileTypeSelector.svelte';
	import SaveDirectorySelector from './SaveDirectorySelector.svelte';
	import SubmitButton from './SubmitButton.svelte';
	import type { AppState } from '$lib/types/app';

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

	// Save settings to localStorage
	function saveSettings(): void {
		isLoading = true;

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
			appState.errorText = 'Failed to save settings. Please try again.';
			isLoading = false;
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

	// Initialize component
	onMount(() => {
		loadSettings();
	});
</script>

<Page>
	<div class="flex h-svh w-full flex-col justify-center bg-indigo-600 align-middle">
		<Block strong class="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-sm">
			<TitleHeader />
			<FileTypeSelector fileType={settings.fileType} onFileTypeChange={handleFileTypeChange} />
			<SaveDirectorySelector
				saveDirectory={settings.saveDirectory}
				onDirectoryChange={handleDirectoryChange}
				onError={handleError}
			/>
			<SubmitButton {isLoading} onSave={saveSettings} label="Apply" actionLabel="Saving..." />
		</Block>
	</div>
</Page>
