# Camera module

Reusable camera capture module for Diary-style apps.

## Ownership

- `frontend/` owns the Vue camera dialog, still capture, frame-based video
  recording controls, size presets, microphone selection, and the `captured`
  event payload.
- `backend/` owns camera media normalization: data URL decoding, MIME detection,
  and conversion of camera video payloads into real MP4.
- App backends own only app-specific storage decisions, such as saving to the
  local Diary media folder or uploading to a holder Google Drive `pics` folder.

## Backend contract

```js
const { normalizeCapturedMedia } = require('../camera/backend');

const media = await normalizeCapturedMedia({
  fileContent,
  mimeType,
  mediaType,
});

// media = { buffer, mimeType, mediaType, extension }
```

Videos are converted to H.264 MP4 with a browser-compatible pixel format. The
default video path uses JPEG frames instead of browser WebM blobs because some
browser/runtime combinations emit headerless WebM fragments. Audio is recorded
as a separate WAV payload when available, then muxed into the MP4 as AAC by the
backend.
Images keep the existing small JPEG default unless the frontend caller chooses
a larger preset.
