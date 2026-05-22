# vue2-camera-module

Compatibility entrypoint for the reusable Vue 2 camera capture component.
The module source now lives under the root `camera/` folder so frontend and
backend camera behavior can later be exported together as a submodule.

The camera opens in its own Vuetify dialog, so parent apps do not need to wrap
it in their own modal content.

The dialog supports still-image and same-window video capture. Video is emitted
as JPEG frames and should be converted to MP4 by the camera backend before
saving or uploading.

## Usage

```js
import Camera from "@/components/shared/camera";

export default {
  components: { Camera }
};
```

```vue
<v-icon @click="$refs.camera.toggleCamera()">mdi-camera</v-icon>

<Camera
  ref="camera"
  :width="480"
  :quality="0.6"
  :dialog-width="640"
  @captured="addMediaItems"
  @camera-error="handleCameraError"
/>
```

## Captured Event

The component emits:

```js
{
  fileContent: "data:image/octet-stream;base64,...",
  dataUrl: "data:image/octet-stream;base64,...",
  mediaType: "image",
  mimeType: "image/jpeg",
  width: 480,
  height: 360,
  source: "camera",
  capturedAt: "2026-05-19T..."
}
```

For video captures the same event is emitted with:

```js
{
  fileContent: "camera-frame-sequence",
  mediaType: "video",
  encoding: "jpeg-frames",
  mimeType: "application/vnd.camera.frames+json",
  frames: ["data:image/jpeg;base64,..."],
  frameRate: 8,
  audioContent: "data:audio/wav;base64,...",
  audioMimeType: "audio/wav",
  source: "camera",
  capturedAt: "2026-05-19T..."
}
```

The parent app is responsible for saving the media.
