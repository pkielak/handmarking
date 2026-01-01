import * as ocr from "esearch-ocr";
import * as ort from "onnxruntime-web";

async function main(): Promise<void> {
  const video = document.getElementById("camera") as HTMLVideoElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const captureBtn = document.getElementById("capture") as HTMLButtonElement;
  const inferBtn = document.getElementById("infer") as HTMLButtonElement;
  const resultDiv = document.getElementById("result") as HTMLDivElement;

  let capturedImageData: ImageData | null = null;
  let ocrInstance: any = null;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error("Error accessing camera:", err);
    resultDiv.textContent =
      "Error accessing camera: " +
      (err instanceof Error ? err.message : String(err));
    return;
  }

  captureBtn.disabled = true;
  inferBtn.disabled = true;
  resultDiv.textContent = "Loading OCR model...";

  async function fetchTextFile(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.text();
  }

  try {
    ort.env.wasm.wasmPaths =
      "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/";

    const dictContent = await fetchTextFile("/models/dict.txt");
    ocrInstance = await ocr.init({
      det: { input: "/models/det.onnx" },
      rec: {
        input: "/models/rec.onnx",
        decodeDic: dictContent,
        optimize: {
          space: false,
        },
      },
      ort,
    });
  } catch (err) {
    console.error("Error loading OCR model:", err);
    resultDiv.textContent =
      "Error loading OCR model: " +
      (err instanceof Error ? err.message : String(err));
    return;
  }

  resultDiv.textContent = "";
  captureBtn.disabled = false;

  captureBtn.onclick = (): void => {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      resultDiv.textContent = "Camera not ready yet, try again.";
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    inferBtn.disabled = false;
    resultDiv.textContent = "";
  };

  inferBtn.onclick = async (): Promise<void> => {
    if (!capturedImageData) {
      resultDiv.textContent = "Please capture an image first.";
      return;
    }
    if (!ocrInstance) {
      resultDiv.textContent = "OCR model not initialized.";
      return;
    }
    resultDiv.textContent = "Running OCR...";
    try {
      const result = await ocrInstance.ocr(capturedImageData);

      if (result?.parragraphs && result.parragraphs.length > 0) {
        resultDiv.textContent = result.parragraphs
          .map((line: any) => line.text)
          .join("\n");
      } else {
        resultDiv.textContent = "No text detected.";
      }
    } catch (e) {
      console.error("OCR error:", e);
      resultDiv.textContent =
        "OCR failed: " + (e instanceof Error ? e.message : String(e));
    }
  };
}

main().catch(console.error);
