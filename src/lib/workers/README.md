# Web Worker Implementation

This directory contains the Web Worker implementation for loading and caching OCR models in the Handmarking application.

## Overview

The Web Worker implementation offloads the model loading and caching operations from the main thread to a background worker, improving application responsiveness and user experience.

## Files

### `model-loader.worker.ts`

The main Web Worker script that handles:
- Downloading OCR models from remote URLs
- Caching models in IndexedDB
- Loading models from cache when available
- Communication with the main thread via message passing

### `model-loader.ts`

A wrapper class that provides a convenient interface for using the Web Worker from the main application. This class handles:
- Creating and managing the worker instance
- Message passing between the main thread and worker
- Error handling and cleanup
- Providing a clean API for loading models

## Usage

### Basic Usage

```typescript
import modelLoader from './workers/model-loader';

// Load all OCR models
const models = await modelLoader.loadModels({
    det: 'https://example.com/det.onnx',
    rec: 'https://example.com/rec.onnx',
    dict: 'https://example.com/dict.txt'
});

// Use the loaded models
const ocrInstance = await ocr.init({
    det: { input: models.det },
    rec: { 
        input: models.rec,
        decodeDic: models.dict
    },
    ort
});
```

### Caching Individual Models

```typescript
// Cache a single model
const blob = await modelLoader.cacheModel(
    'https://example.com/model.onnx',
    'model-key'
);

// Load from cache
const cachedBlob = await modelLoader.loadFromCache('model-key');
```

## Benefits

1. **Non-blocking UI**: Model loading happens in the background, keeping the UI responsive
2. **Efficient caching**: Models are cached in IndexedDB for faster subsequent loads
3. **Error handling**: Robust error handling and recovery mechanisms
4. **Clean API**: Simple, promise-based interface for the main application
5. **Type safety**: Full TypeScript support with proper type definitions

## Implementation Details

### Message Passing

The worker uses a message-based communication protocol:

**Request Types:**
- `load`: Load all three OCR models (det, rec, dict)
- `cache`: Cache a single model at a specific URL with a given key
- `loadFromCache`: Load a previously cached model by key

**Response Types:**
- `success`: Operation completed successfully with data
- `error`: Operation failed with an error message

### IndexedDB Storage

Models are stored in an IndexedDB database named `ONNXModels` with a store named `models`. Each model is stored with a unique key:
- `det`: Detection model
- `rec`: Recognition model
- `dict`: Dictionary file

### Error Handling

The implementation includes comprehensive error handling:
- Network errors during model download
- IndexedDB errors during caching
- Worker communication errors
- Type validation errors

## Migration Guide

If you're migrating from the old implementation (using `utils.ts`):

**Before:**
```typescript
import { cacheModel } from '../utils';

const dictContent = await (await cacheModel(dictUrl, 'dict'))?.text();
const rec = await (await cacheModel(recUrl, 'rec'))?.arrayBuffer();
const det = await (await cacheModel(detUrl, 'det'))?.arrayBuffer();
```

**After:**
```typescript
import modelLoader from '../workers/model-loader';

const models = await modelLoader.loadModels({
    det: detUrl,
    rec: recUrl,
    dict: dictUrl
});

// Access models as:
// models.det (ArrayBuffer)
// models.rec (ArrayBuffer)
// models.dict (string)
```

## Best Practices

1. **Always check for errors**: Wrap worker calls in try-catch blocks
2. **Show loading indicators**: Use the worker's async nature to show progress to users
3. **Handle cache misses**: Be prepared for models not being in cache on first load
4. **Clean up**: Call `modelLoader.terminate()` when the application unmounts
5. **Test offline scenarios**: Ensure your app handles cases where models fail to download

## Troubleshooting

### Worker not loading

Make sure:
- Web Workers are supported in your target browsers
- The worker script is properly bundled by Vite
- The base path is correctly configured in `vite.config.ts`

### Models not caching

Check:
- IndexedDB is available in the browser
- No browser extensions are blocking IndexedDB access
- The database name and store name match in both worker and main thread

### Performance issues

If you experience performance problems:
- Ensure models are properly cached after first load
- Check network latency for model downloads
- Monitor memory usage with large models

## Future Enhancements

Potential improvements for future versions:
- Progress reporting during model download
- Model versioning and update checks
- Compression for cached models
- Multiple cache strategies (e.g., LRU)
- Background model updates
