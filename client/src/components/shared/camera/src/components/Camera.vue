<!-- in order to access the camera in the user phone - need to configure this:
https://stackoverflow.com/questions/34878749/in-androids-google-chrome-how-to-set-unsafely-treat-insecure-origin-as-secure#:~:text=This%20can%20be%20done%20from,to%20be%20treated%20as%20secure 

This can be done from chrome://flags/ or about://flags.
Go to about://flags, search for unsafely-treat-insecure-origin-as-secure flag, and enable it. 
You will have to provide the origin which you want to be treated as secure.
Multiple origins can be entered as comma-separated values.
Relaunch your browser after making this change.

Note that the protocol part is also important, and specifying the IP address, or the domain name isn't enough. 
eg. http:// in http://185.28.152.24:8084  . If you are not using port 80, then you may have to specify that too. -->

<template>
  <v-dialog
    v-model="isCameraOpen"
    :max-width="dialogWidth"
    :fullscreen="fullscreen"
    :persistent="persistent"
  >
    <v-card class="camera-card">
      <v-card-actions class="camera-actions">
        <v-spacer></v-spacer>
        <v-btn icon @click="capture">
          <v-icon>mdi-camera-iris</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="closeCamera">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>

      <v-card-text class="camera-preview">
        <video ref="video" autoplay playsinline @click="capture"></video>
        <canvas ref="canvas" v-show="false"></canvas>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "Camera",

  props: {
    width: { type: Number, default: 480 },
    quality: { type: Number, default: 0.6 },
    preferRearCamera: { type: Boolean, default: true },
    dialogWidth: { type: [Number, String], default: 640 },
    fullscreen: { type: Boolean, default: false },
    persistent: { type: Boolean, default: false },
  },

  data() {
    return {
      isCameraOpen: false,
      stream: null,
    };
  },

  beforeDestroy() {
    this.closeCamera();
  },

  watch: {
    isCameraOpen(isOpen) {
      if (!isOpen) {
        this.stopStream();
      }
    },
  },

  methods: {
    async openCamera() {
      try {
        this.isCameraOpen = true;
        await this.$nextTick();

        const constraints = {
          audio: false,
          video: this.preferRearCamera
            ? { facingMode: { ideal: "environment" } }
            : true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!this.isCameraOpen) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        this.stream = stream;
        this.$refs.video.srcObject = this.stream;
      } catch (error) {
        this.closeCamera();
        this.$emit("camera-error", error);
        window.alert("Cannot open camera: " + error.message);
      }
    },

    closeCamera() {
      this.stopStream();
      this.isCameraOpen = false;
    },

    stopStream() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      this.stream = null;

      if (this.$refs.video) {
        this.$refs.video.srcObject = null;
      }
    },

    async toggleCamera() {
      if (this.isCameraOpen) {
        this.closeCamera();
      } else {
        await this.openCamera();
      }
    },

    capture() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;

      if (!video || !canvas || !video.videoWidth) return;

      const ratio = video.videoHeight / video.videoWidth;
      const width = this.width;
      const height = Math.round(width * ratio);

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, width, height);

        const dataUrl = canvas
        .toDataURL("image/jpeg", this.quality)
        .replace("image/jpeg", "image/octet-stream");

      this.$emit("captured", {
        fileContent: dataUrl,
        dataUrl,
        mimeType: "image/jpeg",
        width,
        height,
        source: "camera",
        capturedAt: new Date().toISOString(),
      });

      this.closeCamera();
    },
  },
};
</script>

<style scoped>
.camera-card {
  direction: ltr;
}

.camera-actions {
  display: flex;
  align-items: center;
  padding: 4px 8px;
}

.camera-preview {
  padding: 0 8px 8px;
}

.camera-preview video {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
  background: #000;
}
</style>
