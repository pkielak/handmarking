<script lang="ts">
	interface SaveDirectorySelectorProps {
		saveDirectory: string;
		onDirectoryChange: (
			directoryHandle: FileSystemDirectoryHandle | null,
			directoryName: string
		) => void;
		onError: (error: string) => void;
	}

	let { saveDirectory, onDirectoryChange, onError }: SaveDirectorySelectorProps = $props();
</script>

<button
	class="relative flex min-h-14 w-full cursor-pointer flex-col items-start justify-center rounded-t bg-md-light-surface-variant px-4 text-md-light-on-surface dark:bg-md-dark-surface-variant dark:text-md-dark-on-surface"
	placeholder=""
	value={saveDirectory}
	onchange={(e) => {
		onDirectoryChange(null, (e.target as HTMLInputElement).value);
	}}
	onclick={async () => {
		try {
			if (window?.showDirectoryPicker) {
				const directoryHandle = await window.showDirectoryPicker({
					mode: 'readwrite'
				});

				// Store the directory handle and name
				onDirectoryChange(directoryHandle, directoryHandle.name);
			}
		} catch (error) {
			console.error('Directory selection cancelled or error:', error);
			// Don't show error for user cancellation
			if (error instanceof Error && error.name === 'AbortError') {
				onError('Failed to select directory. Please try again.');
			}
		}
	}}
>
	<span class="text-xs text-md-light-on-surface-variant dark:text-md-dark-on-surface-variant"
		>Save Directory</span
	>
	<span id="directory" class="mx-0 block h-6 text-base">{saveDirectory || 'Downloads'}</span>
	<span
		class="pointer-events-none absolute start-0 bottom-0 h-px w-full origin-bottom border-b border-md-light-on-surface dark:border-md-dark-on-surface"
	></span>
</button>
