# Kopista

Handwriting to markdown converter

A web application that converts handwritten notes to markdown format using OCR technology.

## Features

- Convert handwritten text to markdown
- Real-time preview
- Simple and intuitive interface

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Installation

1. Clone this repository
2. Install dependencies
3. Run the development server

```bash
npm install
npm run dev
```

## Usage

Open your browser to `http://localhost:5173` and start converting your handwritten notes to markdown.

## Dependencies

- [esearch-ocr](https://www.npmjs.com/package/esearch-ocr): OCR library
- [onnxruntime-web](https://www.npmjs.com/package/onnxruntime-web): ONNX runtime for web
- [Vite](https://vitejs.dev/): Build tool
- [vite-plugin-worker](https://www.npmjs.com/package/vite-plugin-worker): Web Worker plugin for Vite

## Model

This project uses the [paddleocr-onnx](https://huggingface.co/monkt/paddleocr-onnx) model from Hugging Face for OCR processing.

## Architecture

### Web Worker Implementation

The application uses a Web Worker to load and cache OCR models in the background, keeping the main thread responsive. This implementation follows SvelteKit best practices for service workers.

**Key Components:**

1. **`src/lib/workers/model-loader.worker.ts`**: The Web Worker that handles model downloading and caching
2. **`src/lib/workers/model-loader.ts`**: Wrapper class for easy integration with the main application
3. **`src/lib/workers/README.md`**: Detailed documentation of the worker implementation

**Benefits:**

- Non-blocking UI during model initialization
- Efficient caching using IndexedDB
- Clean separation of concerns
- Type-safe API
- Comprehensive error handling

**Usage:**

```typescript
import modelLoader from '$lib/workers/model-loader';

// Load all OCR models
const models = await modelLoader.loadModels({
	det: import.meta.env.VITE_DET_URL,
	rec: import.meta.env.VITE_REC_URL,
	dict: import.meta.env.VITE_DICT_URL
});

// Initialize OCR with loaded models
const ocrInstance = await ocr.init({
	det: { input: models.det },
	rec: { input: models.rec, decodeDic: models.dict },
	ort
});
```

For more details, see the [worker documentation](src/lib/workers/README.md).

## Built With

This project is built with [SvelteKit](https://kit.svelte.dev/), a modern web framework for building fast, production-ready applications.
