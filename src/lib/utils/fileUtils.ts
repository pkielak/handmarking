export interface SaveFileOptions {
	content: string;
	filename: string;
	fileExtension: string;
	saveDirectory?: string;
}

// Extend the Window interface to include File System Access API
declare global {
	interface Window {
		showSaveFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle>;
		showDirectoryPicker?: (options?: unknown) => Promise<FileSystemDirectoryHandle>;
	}
}

function isFileSystemAccessAPISupported(): boolean {
	return 'showSaveFilePicker' in window || 'showDirectoryPicker' in window;
}

async function saveWithFileSystemAPI(blob: Blob, filename: string): Promise<boolean> {
	try {
		// Use showSaveFilePicker if available (simpler API)
		if (window?.showSaveFilePicker) {
			const fileHandle = await window.showSaveFilePicker({
				suggestedName: filename,
				types: [
					{
						description: 'Text Files',
						accept: {
							'text/plain': ['.txt', '.md'],
							'text/markdown': ['.md']
						}
					}
				]
			});

			const writable = await fileHandle.createWritable();
			await writable.write(blob);
			await writable.close();
			return true;
		}

		// Fallback to showDirectoryPicker approach
		if (window?.showDirectoryPicker) {
			const directoryHandle = await window?.showDirectoryPicker({
				mode: 'readwrite'
			});

			const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
			const writable = await fileHandle.createWritable();
			await writable.write(blob);
			await writable.close();
			return true;
		}

		return false;
	} catch (error) {
		console.error('File System Access API error:', error);
		// If user cancels the dialog, that's not an error
		if (error instanceof Error && error.name === 'AbortError') {
			return false;
		}
		throw error;
	}
}

function sdownloadFile(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();

	// Clean up
	setTimeout(() => {
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, 1000);
}

export function generateFilename(fileExtension: string): string {
	const now = new Date();
	return `kopista_${now
		.toISOString()
		.replace(/[-:T.]/g, '')
		.slice(0, 14)}.${fileExtension}`;
}

export function safeCheck(text: string) {
	return text === ('skryba' as string);
}

export async function saveFile(
	options: SaveFileOptions
): Promise<{ success: boolean; filename: string }> {
	try {
		const { content, filename, fileExtension } = options;

		// Create a Blob with appropriate MIME type
		const mimeType = fileExtension === 'md' ? 'text/markdown' : 'text/plain';
		const blob = new Blob([content], { type: mimeType });

		// Try modern File System Access API first
		if (isFileSystemAccessAPISupported()) {
			const success = await saveWithFileSystemAPI(blob, filename);
			if (success) {
				return { success: true, filename };
			}
			// If File System API failed or was cancelled, fall back to traditional method
		}

		// Fallback to traditional download method
		sdownloadFile(blob, filename);
		return { success: true, filename };
	} catch (error) {
		console.error('Save error:', error);
		return { success: false, filename: '' };
	}
}
