<script lang="ts">
    import { onMount } from "svelte";
    import * as ocr from "esearch-ocr";
    import * as ort from "onnxruntime-web";
    import { cacheModel } from "./utils";

    let video: HTMLVideoElement;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let resultText = "";
    let playbackInfo = "";
    let showPlaybackInfo = false;
    let capturedImageData: ImageData | null = null;
    let ocrInstance: any | null = null;
    let captureDisabled = true;
    let inferDisabled = true;
    let resultDisabled = true;
    let saveDisabled = true;
    let previewSrc = "icons/small.png";
    let imagePreviewSrc =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='black' opacity='0.1'/%3E%3C/svg%3E";
    let showImagePreviewPlaceholder = true;
    let resultPlaceholder = "Your text from handwritten note will appear here.";

    onMount(async () => {
        await main();
    });

    async function main(): Promise<void> {
        ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        // camera initialization
        showPlaybackInfo = true;
        playbackInfo = "Initializing camera...";
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            video.srcObject = stream;
            await video.play();
            showPlaybackInfo = false;
        } catch (err) {
            const permissionsError =
                "Error accessing camera, please check camera permissions.";
            playbackInfo = permissionsError;
            resultPlaceholder = permissionsError;
            return;
        }

        try {
            ort.env.wasm.wasmPaths =
                "https://unpkg.com/onnxruntime-web@dev/dist/";

            // Get environment variables with fallback to default URLs
            const dictUrl = import.meta.env.VITE_DICT_URL;
            const recUrl = import.meta.env.VITE_REC_URL;
            const detUrl = import.meta.env.VITE_DET_URL;

            const dictContent = await (
                await cacheModel(dictUrl, "dict")
            )?.text();
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
            resultPlaceholder =
                "Error loading OCR model: " +
                (err instanceof Error ? err.message : String(err));
            return;
        }

        resultPlaceholder = "Your text from handwritten note will appear here.";
        captureDisabled = false;
    }

    function capture(): void {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            resultText = "Camera not ready yet, try again.";
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        inferDisabled = false;
        resultText = "";
        resultDisabled = true;
        saveDisabled = true;

        // Update preview images with captured frame
        const imageDataUrl = canvas.toDataURL("image/png");
        previewSrc = imageDataUrl;
        imagePreviewSrc = imageDataUrl;

        // Hide the placeholder when image is captured
        showImagePreviewPlaceholder = false;
    }

    async function infer(): Promise<void> {
        if (!capturedImageData) {
            resultText = "Please capture an image first.";
            return;
        }
        if (!ocrInstance) {
            resultText = "OCR model not initialized.";
            return;
        }
        resultText = "Running OCR...";
        await new Promise((resolve) => setTimeout(resolve, 0)); // wait for browser repaint

        try {
            const result = await ocrInstance.ocr(capturedImageData);

            if (result?.parragraphs && result.parragraphs.length > 0) {
                resultText = result.parragraphs
                    .map((line: any) => line.text)
                    .join("\n");
                resultDisabled = false;
                saveDisabled = false;
            } else {
                resultText = "No text detected.";
                resultDisabled = false;
            }
        } catch (e) {
            console.error("OCR error:", e);
            resultText =
                "OCR failed: " + (e instanceof Error ? e.message : String(e));
            resultDisabled = false;
        }
    }

    async function save(): Promise<void> {
        try {
            if (!resultText) {
                resultText = "";
                resultPlaceholder = "No content to save.";
                return;
            }
            // Create a Blob with markdown MIME type
            const blob = new Blob([resultText], { type: "text/markdown" });
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
            resultText = "";
            resultPlaceholder = "Failed to save file.";
        }
    }
</script>

<section id="camera-wrapper" class="camera-wrapper">
    <video
        bind:this={video}
        class="camera"
        width="480"
        height="640"
        autoplay
        muted
        playsinline
    ></video>
    <button
        id="capture"
        class="capture"
        on:click={capture}
        disabled={captureDisabled}
        aria-label="capture button"
    ></button>
    {#if showPlaybackInfo}
        <p id="playback-info" class="playback-info show">{playbackInfo}</p>
    {:else}
        <p id="playback-info" class="playback-info"></p>
    {/if}
    <a href="#image-process">
        <img
            id="preview"
            class="preview"
            src={previewSrc}
            alt="Preview of camera capture"
        />
    </a>
</section>
<canvas bind:this={canvas} style="display: none"></canvas>
<section id="image-process" class="image-process">
    <nav>
        <header>
            <a class="back" href="#capture" aria-label="back">く</a>
            <img
                src="icons/small.png"
                alt="Camera shape with MD letters inside"
            />
            <h1 class="navbar-header">Handmarking</h1>
        </header>
    </nav>

    <div class="image-preview-wrapper">
        <img
            id="image-preview"
            class="image-preview"
            src={imagePreviewSrc}
            alt="Preview of camera capture"
        />
        {#if showImagePreviewPlaceholder}
            <div
                id="image-preview-placeholder"
                class="image-preview-placeholder"
            >
                <img
                    src="icons/small.png"
                    alt="camera shape with letters MD inside"
                />
                <span>Preview of your captured image will appear here</span>
            </div>
        {/if}
    </div>

    <textarea
        id="result"
        class="result"
        rows="5"
        bind:value={resultText}
        placeholder={resultPlaceholder}
        disabled={resultDisabled}
    ></textarea>
    <footer>
        <button
            id="infer"
            class="infer"
            on:click={infer}
            disabled={inferDisabled}
        >
            🤖 Process Image
        </button>
        <button id="save" class="save" on:click={save} disabled={saveDisabled}>
            💾 Save to MD
        </button>
    </footer>
</section>
