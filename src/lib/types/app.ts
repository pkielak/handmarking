import type { CanvasImageData, OcrInstance } from '$lib/types/ocr';

export type AppState = {
	isLoading: boolean;
	errorText: string;
	ocrInstance: OcrInstance | null;
	capturedImageData: CanvasImageData | null;
	imagePreviewSrc: string;
	resultText: string;
};
