// Simple utility for using the model worker
// Follows SvelteKit best practices

export async function loadModels(urls: {
    det: string;
    rec: string;
    dict: string;
}): Promise<{
    det: ArrayBuffer;
    rec: ArrayBuffer;
    dict: string;
}> {
    const worker = new Worker(new URL('./model.worker.ts', import.meta.url));

    return new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
            if (event.data.type === 'success') {
                resolve(event.data.data);
            } else if (event.data.type === 'error') {
                reject(new Error(event.data.error));
            }
        };

        worker.onerror = (error) => {
            reject(error);
        };

        worker.postMessage({
            type: 'load',
            urls
        });
    });
}
