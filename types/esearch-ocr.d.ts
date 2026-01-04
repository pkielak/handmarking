declare module "esearch-ocr" {
  export interface InitOptions {
    ort: any; // typeof import("onnxruntime-web")
    det: {
      input: string | ArrayBufferLike | Uint8Array;
      ratio?: number;
      on?: (r: any) => void;
    };
    rec: {
      input: string | ArrayBufferLike | Uint8Array;
      decodeDic: string;
      imgh?: number;
      on?: (
        index: number,
        result: { text: string; mean: number },
        total: number,
      ) => void;
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
      inline: "lr" | "rl" | "tb" | "bt";
      block: "lr" | "rl" | "tb" | "bt";
    };
    angle: { reading: { inline: number; block: number }; angle: number };
  }

  type resultType = {
    text: string;
    mean: number;
    box: number[][];
    style: { bg: number[]; text: number[] };
  }[];
  type BoxType = number[][]; // Coordinates: [[x1,y1],[x2,y2],...]

  export function init(options: InitOptions): Promise<any>; // Returns OCR instance
  // Functions on instance: ocr(image: string | HTMLImageElement | ...): Promise<OcrResult>
  // det(image): Promise<any>, rec(...)

  const defaultExport: any; // Await init first
  export default defaultExport;
}
