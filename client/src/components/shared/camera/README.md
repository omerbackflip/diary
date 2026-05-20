# vue2-camera-module

Reusable Vue 2 camera capture component.

The camera opens in its own Vuetify dialog, so parent apps do not need to wrap
it in their own modal content.

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
  mimeType: "image/jpeg",
  width: 480,
  height: 360,
  source: "camera",
  capturedAt: "2026-05-19T..."
}
```

The parent app is responsible for saving the image.
