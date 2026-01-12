// See https://svelte.dev/docs/kit/types#app.d.ts

declare module 'esearch-ocr' {
	export interface InitOptions {
		ort: typeof import('onnxruntime-web');
		det: {
			input: string | ArrayBufferLike | Uint8Array;
			ratio?: number;
			on?: (r: unknown) => void;
		};
		rec: {
			input: string | ArrayBufferLike | Uint8Array;
			decodeDic: string;
			imgh?: number;
			on?: (index: number, result: { text: string; mean: number }, total: number) => void;
			optimize?: { space?: boolean };
		};
		docCls?: { input: string | ArrayBufferLike | Uint8Array };
		// Add analyzeLayout as needed
		dev?: boolean;
	}

	export interface OcrResult {
		src: resultType[];
		columns: Array<{
			src: resultType[];
			outerBox: BoxType;
			parragraphs: Array<{ src: resultType[]; parse: resultType[0] }>;
		}>;
		parragraphs: resultType[];
		readingDir: {
			inline: 'lr' | 'rl' | 'tb' | 'bt';
			block: 'lr' | 'rl' | 'tb' | 'bt';
		};
		angle: { reading: { inline: number; block: number }; angle: number };
	}

	export type resultType = {
		text: string;
		mean: number;
		box: number[][];
		style: { bg: number[]; text: number[] };
	};
export type BoxType = number[][]; // Coordinates: [[x1,y1],[x2,y2],...]

	export function init(options: InitOptions): Promise<OcrInstance>;

	export interface OcrInstance {
		ocr(image: ImageData | HTMLImageElement | HTMLCanvasElement | string): Promise<OcrResult>;
		det(image: ImageData | HTMLImageElement | HTMLCanvasElement | string): Promise<number[][]>;
		rec(image: ImageData | HTMLImageElement | HTMLCanvasElement | string): Promise<
			Array<{
				text: string;
				mean: number;
				box: number[][];
				style: { bg: number[]; text: number[] };
			}>
		>;
	}

	const defaultExport: OcrInstance;
	export default defaultExport;
}
