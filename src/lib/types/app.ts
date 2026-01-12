import type { CanvasImageData, OcrInstance } from '$lib/types/ocr';

export type AppState = {
	resultText: string;
	playbackInfo: string;
	showPlaybackInfo: boolean;
	capturedImageData: CanvasImageData | null;
	ocrInstance: OcrInstance | null;
	captureDisabled: boolean;
	inferDisabled: boolean;
	resultDisabled: boolean;
	saveDisabled: boolean;
	previewSrc: string;
	imagePreviewSrc: string;
	showImagePreviewPlaceholder: boolean;
	resultPlaceholder: string;
};
