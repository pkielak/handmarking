// Type definitions for OCR functionality
// This file complements the types defined in app.d.ts for esearch-ocr

import type { OcrResult, resultType } from 'esearch-ocr';

// ImageData type from HTML Canvas API
export type CanvasImageData = ImageData;

// Detection result type (more specific than unknown)
export type DetectionResult = number[][]; // Box coordinates [[x1,y1],[x2,y2],...]

// Recognition result type (more specific than unknown)
export type RecognitionResult = Array<{
	text: string;
	mean: number;
	box: number[][];
	style: {
		bg: number[];
		text: number[];
	};
}>;

// OCR Instance type - using the exported interface from esearch-ocr
export type { OcrInstance } from 'esearch-ocr';

// Model loading types
export type ModelType = 'det' | 'rec' | 'dict';

// Error types for better error handling
export class OcrError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'OcrError';
	}
}

export class CameraError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CameraError';
	}
}

export class SaveError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SaveError';
	}
}

// Utility types for working with OCR results
export interface OcrTextLine {
	text: string;
	confidence: number;
}

export interface OcrProcessingState {
	isProcessing: boolean;
	progress: number;
	error: string | null;
}

// Helper functions for OCR results
export function extractTextFromOcrResult(result: OcrResult): string {
	if (!result?.parragraphs || result.parragraphs.length === 0) {
		return '';
	}
	return result.parragraphs.map((line: resultType) => line.text).join('\n');
}

export function getAverageConfidence(result: OcrResult): number {
	if (!result?.parragraphs || result.parragraphs.length === 0) {
		return 0;
	}
	const total = result.parragraphs.reduce((sum, line: resultType) => sum + line.mean, 0);
	return total / result.parragraphs.length;
}
