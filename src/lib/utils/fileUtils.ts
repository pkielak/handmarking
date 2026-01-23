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

export async function saveFile(
	options: SaveFileOptions
): Promise<{ success: boolean; filename: string }> {
	try {
		const { content, filename, fileExtension } = options;

		// Create a Blob with appropriate MIME type
		const mimeType = fileExtension === 'md' ? 'text/markdown' : 'text/plain';
		const blob = new Blob([content], { type: mimeType });

		// Fallback to traditional download method
		sdownloadFile(blob, filename);
		return { success: true, filename };
	} catch (error) {
		console.error('Save error:', error);
		return { success: false, filename: '' };
	}
}
