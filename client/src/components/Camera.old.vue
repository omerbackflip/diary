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
  <div class="camera-box">
    <div v-if="isCameraOpen" class="camera-actions">
        <v-icon @click="capture">mdi-camera-iris</v-icon>
        <v-icon color="red" @click="closeCamera">mdi-close</v-icon>
    </div>

    <div v-if="isCameraOpen" class="camera-preview">
      <video ref="video" autoplay playsinline @click="capture"></video>
      <canvas ref="canvas" v-show="false"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: "Camera",

    props: {
    width: { type: Number, default: 480 },
    quality: { type: Number, default: 0.6 },
    preferRearCamera: { type: Boolean, default: true },
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

  methods: {
    async openCamera() {
      try {
        this.isCameraOpen = true;

        const constraints = {
          audio: false,
          video: this.preferRearCamera
            ? { facingMode: { ideal: "environment" } }
            : true,
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.$refs.video.srcObject = this.stream;
      } catch (error) {
        this.isCameraOpen = false;
        this.$emit("camera-error", error);
        window.alert("Cannot open camera: " + error.message);
      }
    },

    closeCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      this.stream = null;

      if (this.$refs.video) {
        this.$refs.video.srcObject = null;
      }

      this.isCameraOpen = false;
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
.camera-box {
  border: 1px dashed #d6d6d6;
  border-radius: 4px;
  padding: 4px;
}

.camera-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  align-items: center;
}

.camera-preview video {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}
</style>