import type { CanvasImageData, OcrInstance } from '$lib/types/ocr';

export type AppState = {
	isLoading: boolean;
	errorText: string;
	ocrInstance: OcrInstance | null;
	capturedImageData: CanvasImageData | null;
	imagePreviewSrc: string;
	resultText: string;
	cameraStream: MediaStream | null;
	initializationComplete: boolean;
	modelsLoading: boolean;
	modelsLoaded: boolean;
};
