# inktomd

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

## Model

This project uses the [paddleocr-onnx](https://huggingface.co/monkt/paddleocr-onnx) model from Hugging Face for OCR processing.
