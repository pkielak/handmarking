import * as ocr from "esearch-ocr";
import * as ort from "onnxruntime-web";
import { cacheModel } from "./utils";

async function main(): Promise<void> {
  const video = document.getElementById("camera") as HTMLVideoElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const captureBtn = document.getElementById("capture") as HTMLButtonElement;
  const inferBtn = document.getElementById("infer") as HTMLButtonElement;
  const resultText = document.getElementById("result") as HTMLTextAreaElement;
  const playbackInfo = document.getElementById(
    "playback-info",
  ) as HTMLParagraphElement;
  const previewImg = document.getElementById("preview") as HTMLImageElement;
  const imagePreview = document.getElementById(
    "image-preview",
  ) as HTMLImageElement;
  const imagePreviewPlaceholder = document.getElementById(
    "image-preview-placeholder",
  ) as HTMLDivElement;
  const saveBtn = document.getElementById("save") as HTMLButtonElement; // Added save button reference

  let capturedImageData: ImageData | null = null;
  let ocrInstance: any | null = null;

  captureBtn.disabled = true;
  inferBtn.disabled = true;
  const originalPlaceholder = resultText.placeholder;
  resultText.placeholder = "Loading OCR model...";

  // camera initialization
  playbackInfo.classList.add("show");
  playbackInfo.textContent = "Initializing camera...";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = stream;
    await video.play();
    playbackInfo.classList.remove("show");
  } catch (err) {
    const permissionsError =
      "Error accessing camera, please check camera permissions.";
    playbackInfo.textContent = permissionsError;
    resultText.placeholder = permissionsError;
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
    resultText.placeholder =
      "Error loading OCR model: " +
      (err instanceof Error ? err.message : String(err));
    return;
  }

  resultText.placeholder = originalPlaceholder;
  captureBtn.disabled = false;

  captureBtn.onclick = (): void => {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      resultText.textContent = "Camera not ready yet, try again.";
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    inferBtn.disabled = false;
    resultText.textContent = "";
    resultText.disabled = true;
    saveBtn.disabled = true;

    // Update preview images with captured frame
    const imageDataUrl = canvas.toDataURL("image/png");
    previewImg.src = imageDataUrl;
    imagePreview.src = imageDataUrl;

    // Hide the placeholder when image is captured
    if (imagePreviewPlaceholder) {
      imagePreviewPlaceholder.style.display = "none";
    }
  };

  inferBtn.onclick = async (): Promise<void> => {
    if (!capturedImageData) {
      resultText.textContent = "Please capture an image first.";
      return;
    }
    if (!ocrInstance) {
      resultText.textContent = "OCR model not initialized.";
      return;
    }
    resultText.textContent = "Running OCR...";
    await new Promise((resolve) => setTimeout(resolve, 0)); // wait for browser repaint

    try {
      const result = await ocrInstance.ocr(capturedImageData);

      if (result?.parragraphs && result.parragraphs.length > 0) {
        resultText.textContent = result.parragraphs
          .map((line: any) => line.text)
          .join("\n");
        resultText.disabled = false;
        saveBtn.disabled = false;
      } else {
        resultText.textContent = "No text detected.";
        resultText.disabled = false;
      }
    } catch (e) {
      console.error("OCR error:", e);
      resultText.textContent =
        "OCR failed: " + (e instanceof Error ? e.message : String(e));
      resultText.disabled = false;
    }
  };

  saveBtn.onclick = async (): Promise<void> => {
    try {
      const text = resultText.textContent;
      if (!text) {
        resultText.textContent = "";
        resultText.placeholder = "No content to save.";
        return;
      }
      // Create a Blob with markdown MIME type
      const blob = new Blob([text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Generate filename with format YYYY_MM_DD_HHMMSS using a single replace invocation
      const now = new Date();
      const filename = `handmarking_${now
        .toISOString()
        .replace(/[-:T.]/g, "")
        .slice(0, 14)}.md`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Save error:", error);
      resultText.textContent = "";
      resultText.placeholder = "Failed to save file.";
    }
  };
}

main().catch(console.error);
