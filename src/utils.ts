async function loadFromIndexedDB(key: string): Promise<Blob | null> {
  const dbName = "ONNXModels";
  const storeName = "models";
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (e: Event) => {
      const db = e.target?.result;
      if (db) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = (e: Event) => {
      const db = e.target?.result;
      if (db) {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const getReq = store.get(key);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = reject;
        tx.onerror = reject;
      } else {
        reject(new Error("Database not available"));
      }
    };
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(key: string, blob: Blob): Promise<IDBValidKey> {
  const dbName = "ONNXModels";
  const storeName = "models";
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = (e: Event) => {
      const db = e.target?.result;
      if (db) {
        const tx = db.transaction(storeName, "readwrite");
        tx.onerror = () => reject(tx.error);
        const store = tx.objectStore(storeName);
        const putReq = store.put(blob, key);
        putReq.onsuccess = () => {
          tx.oncomplete = () => resolve(putReq.result);
        };
        putReq.onerror = () => reject(putReq.error);
      } else {
        reject(new Error("Database not available"));
      }
    };
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = e.target?.result;
      if (db && !db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
}

export async function cacheModel(
  url: string,
  key: string,
): Promise<Blob | null> {
  let blob = await loadFromIndexedDB(key);
  if (!blob) {
    blob = await fetch(url).then((r) => r.blob());
    blob && (await saveToIndexedDB(key, blob));
  }
  return blob;
}
