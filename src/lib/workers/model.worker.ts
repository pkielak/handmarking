// Simple Web Worker for loading OCR models

// Message types
interface LoadModelsMessage {
	type: 'load';
	urls: {
		det: string;
		rec: string;
		dict: string;
	};
}

interface CacheModelMessage {
	type: 'cache';
	url: string;
	key: string;
}

interface LoadFromCacheMessage {
	type: 'loadFromCache';
	key: string;
}

type WorkerMessage = LoadModelsMessage | CacheModelMessage | LoadFromCacheMessage;

// IndexedDB helper
async function loadFromIndexedDB(key: string): Promise<Blob | null> {
	const dbName = 'ONNXModels';
	const storeName = 'models';

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, 1);

		request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
			const db = (e.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(storeName)) {
				db.createObjectStore(storeName);
			}
		};

		request.onsuccess = (e: Event) => {
			const db = (e.target as IDBOpenDBRequest).result;
			const tx = db.transaction(storeName, 'readonly');
			const store = tx.objectStore(storeName);
			const getReq = store.get(key);

			getReq.onsuccess = () => resolve(getReq.result);
			getReq.onerror = reject;
		};

		request.onerror = () => reject(request.error);
	});
}

async function saveToIndexedDB(key: string, blob: Blob): Promise<void> {
	const dbName = 'ONNXModels';
	const storeName = 'models';

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, 1);

		request.onsuccess = (e: Event) => {
			const db = (e.target as IDBOpenDBRequest).result;
			const tx = db.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const putReq = store.put(blob, key);

			putReq.onsuccess = () => resolve();
			putReq.onerror = reject;
		};

		request.onerror = () => reject(request.error);
	});
}

// Handle messages
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
	const { type } = event.data;

	try {
		if (type === 'load') {
			const { urls } = event.data;

			// Try to load from cache first
			const cachedDet = await loadFromIndexedDB('det');
			const cachedRec = await loadFromIndexedDB('rec');
			const cachedDict = await loadFromIndexedDB('dict');

			// Download if not in cache
			const det = cachedDet
				? await cachedDet.arrayBuffer()
				: await fetch(urls.det)
						.then((r) => r.blob())
						.then(async (blob) => {
							await saveToIndexedDB('det', blob);
							return blob.arrayBuffer();
						});

			const rec = cachedRec
				? await cachedRec.arrayBuffer()
				: await fetch(urls.rec)
						.then((r) => r.blob())
						.then(async (blob) => {
							await saveToIndexedDB('rec', blob);
							return blob.arrayBuffer();
						});

			const dict = cachedDict
				? await cachedDict.text()
				: await fetch(urls.dict)
						.then((r) => r.blob())
						.then(async (blob) => {
							await saveToIndexedDB('dict', blob);
							return blob.text();
						});

			self.postMessage({
				type: 'success',
				data: { det, rec, dict }
			});
		} else if (type === 'cache') {
			const { url, key } = event.data;
			const blob = await fetch(url).then((r) => r.blob());
			await saveToIndexedDB(key, blob);
			self.postMessage({
				type: 'success',
				data: { blob }
			});
		} else if (type === 'loadFromCache') {
			const { key } = event.data;
			const blob = await loadFromIndexedDB(key);
			self.postMessage({
				type: 'success',
				data: { blob }
			});
		}
	} catch (error) {
		self.postMessage({
			type: 'error',
			error: error instanceof Error ? error.message : String(error)
		});
	}
};
