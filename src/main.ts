import * as ocr from "esearch-ocr";
import * as ort from "onnxruntime-web";
import { cacheModel } from "./utils";

async function main(): Promise<void> {
  const video = document.getElementById("camera") as HTMLVideoElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const captureBtn = document.getElementById("capture") as HTMLButtonElement;
  const inferBtn = document.getElementById("infer") as HTMLButtonElement;
  const resultDiv = document.getElementById("result") as HTMLDivElement;
  const playbackInfo = document.getElementById(
    "playback-info",
  ) as HTMLParagraphElement;

  let capturedImageData: ImageData | null = null;
  let ocrInstance: any | null = null;

  captureBtn.disabled = true;
  inferBtn.disabled = true;
  resultDiv.textContent = "Loading OCR model...";

  // camera initialization
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    const permissionsError =
      "Error accessing camera, please check camera permissions.";
    playbackInfo.classList.add("show");
    playbackInfo.textContent = permissionsError;
    resultDiv.textContent = permissionsError;
    return;
  }

  try {
    ort.env.wasm.wasmPaths = "https://unpkg.com/onnxruntime-web@dev/dist/";

    // Get environment variables with fallback to default URLs
    const dictUrl = import.meta.env.VITE_DICT_URL;
    const recUrl = import.meta.env.VITE_REC_URL;
    const detUrl = import.meta.env.VITE_DET_URL;

    const dictContent = await (await cacheModel(dictUrl, "dict"))?.text();
    const rec = await (await cacheModel(recUrl, "rec"))?.arrayBuffer();
    const det = await (await cacheModel(detUrl, "det"))?.arrayBuffer();

    if (dictContent && rec && det) {
      ocrInstance = await ocr.init({
        det: { input: det },
        rec: {
          input: rec,
          decodeDic: dictContent,
          optimize: {
            space: false,
          },
        },
        ort,
      });
    }
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
    await new Promise((resolve) => setTimeout(resolve, 0)); // wait for browser repaint

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
