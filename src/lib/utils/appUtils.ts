import * as ocr from 'esearch-ocr';
import * as ort from 'onnxruntime-web';
import { loadModels } from '$lib/workers';
import type { OcrInstance } from '$lib/types/ocr';
import type { AppState } from '$lib/types/app';

export interface LoadModelsParams {
	det: string;
	rec: string;
	dict: string;
}

export const initialAppState: AppState = {
	isLoading: true,
	errorText: '',
	ocrInstance: null,
	capturedImageData: null,
	imagePreviewSrc: '',
	resultText: '',
	cameraStream: null,
	initializationComplete: false,
	modelsLoading: false,
	modelsLoaded: false
};

let cameraStream: MediaStream | null = null;

export function toggleDarkMode(isDark: boolean): void {
	if (isDark) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

export async function initializeCamera(): Promise<{
	success: boolean;
	stream?: MediaStream;
	error?: string;
}> {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: 'environment' }
		});
		cameraStream = stream;
		return { success: true, stream };
	} catch (e) {
		const errorMessage =
			e instanceof Error ? e.message : 'Error accessing camera, please check camera permissions.';
		return { success: false, error: errorMessage };
	}
}

export function cleanupCamera(appState: AppState): void {
	if (cameraStream) {
		cameraStream.getTracks().forEach((track) => track.stop());
		cameraStream = null;
		appState.cameraStream = null;
	}
}

export async function initializeModels(
	params: LoadModelsParams
): Promise<{ ocrInstance: OcrInstance | null; errorText: string }> {
	let ocrInstance: OcrInstance | null = null;
	let errorText = '';

	try {
		ort.env.wasm.wasmPaths = 'https://unpkg.com/onnxruntime-web@dev/dist/';

		const models = await loadModels({
			det: params.det,
			rec: params.rec,
			dict: params.dict
		});

		if (models.det && models.rec && models.dict) {
			ocrInstance = (await ocr.init({
				det: { input: models.det },
				rec: {
					input: models.rec,
					decodeDic: models.dict,
					optimize: {
						space: false
					}
				},
				ort
			})) as OcrInstance;
		} else {
			errorText = 'One or more models failed to load.';
		}
	} catch (err) {
		errorText = err instanceof Error ? err.message : String(err);
	}

	return { ocrInstance, errorText };
}

export async function initializeApp(appState: AppState): Promise<boolean> {
	// Initialize camera first - required for app
	const cameraResult = await initializeCamera();

	if (!cameraResult.success) {
		appState.errorText = cameraResult.error ?? 'Unknown camera error';
		return false;
	}

	appState.cameraStream = cameraResult.stream ?? null;
	appState.isLoading = false;

	// Start loading models in background
	void loadModelsInBackground(appState);

	return true;
}

async function loadModelsInBackground(appState: AppState): Promise<void> {
	appState.modelsLoading = true;

	try {
		const dictUrl = import.meta.env.VITE_DICT_URL;
		const recUrl = import.meta.env.VITE_REC_URL;
		const detUrl = import.meta.env.VITE_DET_URL;

		const { ocrInstance, errorText } = await initializeModels({
			det: detUrl,
			rec: recUrl,
			dict: dictUrl
		});

		if (ocrInstance) {
			appState.ocrInstance = ocrInstance;
			appState.modelsLoaded = true;

			// Auto-close the notification after 5 seconds
			setTimeout(() => {
				appState.modelsLoaded = false;
			}, 5000);
		} else {
			appState.errorText = errorText || 'Failed to load OCR models.';
		}
	} catch (error) {
		appState.errorText = error instanceof Error ? error.message : String(error);
	} finally {
		appState.modelsLoading = false;
	}
}
