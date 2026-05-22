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
        <v-btn-toggle v-model="captureMode" mandatory dense>
          <v-btn value="image" :disabled="isRecording">
            <v-icon>mdi-camera</v-icon>
          </v-btn>
          <v-btn value="video" :disabled="isRecording">
            <v-icon>mdi-video</v-icon>
          </v-btn>
        </v-btn-toggle>
        <v-select
          v-model="selectedSize"
          :items="currentSizeOptions"
          item-text="label"
          item-value="value"
          dense
          hide-details
          class="camera-size-select"
          :disabled="isRecording"
        ></v-select>
        <v-select
          v-if="captureMode === 'video' && recordAudio"
          v-model="selectedAudioDeviceId"
          :items="audioInputOptions"
          item-text="label"
          item-value="value"
          dense
          hide-details
          prepend-inner-icon="mdi-microphone"
          class="camera-mic-select"
          :disabled="isRecording"
          @focus="loadAudioInputDevices(true)"
          @click="loadAudioInputDevices(true)"
        ></v-select>
        <v-spacer></v-spacer>
        <v-btn icon :color="isRecording ? 'red' : undefined" @click="capture">
          <v-icon>{{ actionIcon }}</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="closeCamera">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>

      <v-card-text class="camera-preview">
        <video ref="video" autoplay playsinline muted @click="captureFromPreview"></video>
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
    recordAudio: { type: Boolean, default: true },
  },

  data() {
    return {
      isCameraOpen: false,
      stream: null,
      audioStream: null,
      captureMode: "image",
      audioContext: null,
      audioSource: null,
      audioProcessor: null,
      audioSilentGain: null,
      recordedAudioSamples: [],
      audioSampleRate: 0,
      audioInputDevices: [],
      selectedAudioDeviceId: "",
      frameRecorderTimer: null,
      recordedFrames: [],
      isRecording: false,
      isStoppingRecording: false,
      selectedSize: "small",
      imageSizeOptions: [
        { label: "Small", value: "small", width: 480, quality: 0.6 },
        { label: "Medium", value: "medium", width: 720, quality: 0.7 },
        { label: "Large", value: "large", width: 1080, quality: 0.8 },
      ],
      videoSizeOptions: [
        { label: "Very small", value: "small", width: 320, height: 240, frameRate: 8, quality: 0.45 },
        { label: "Small", value: "medium", width: 480, height: 360, frameRate: 10, quality: 0.5 },
        { label: "Medium", value: "large", width: 640, height: 480, frameRate: 12, quality: 0.55 },
      ],
    };
  },

  computed: {
    actionIcon() {
      if (this.captureMode === "image") return "mdi-camera-iris";
      return this.isRecording ? "mdi-stop" : "mdi-record-rec";
    },
    currentSizeOptions() {
      return this.captureMode === "video" ? this.videoSizeOptions : this.imageSizeOptions;
    },
    selectedSizeOption() {
      return this.currentSizeOptions.find(option => option.value === this.selectedSize) || this.currentSizeOptions[0];
    },
    audioInputOptions() {
      const options = [{ label: "Default mic", value: "" }];
      const seenDeviceIds = new Set([""]);

      this.audioInputDevices.forEach((device, index) => {
        if (!device.deviceId || seenDeviceIds.has(device.deviceId)) return;

        seenDeviceIds.add(device.deviceId);
        options.push({
          label: device.label || `Microphone ${index + 1}`,
          value: device.deviceId,
        });
      });

      return options;
    },
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
    async captureMode() {
      this.selectedSize = "small";
      if (this.isCameraOpen && this.stream && !this.isRecording) {
        this.stopStream();
        await this.openCamera();
      }
    },
    async selectedSize() {
      if (this.isCameraOpen && this.stream && !this.isRecording) {
        this.stopStream();
        await this.openCamera();
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
          video: this.getVideoConstraints(),
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!this.isCameraOpen) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        this.stream = stream;
        this.$refs.video.srcObject = this.stream;
        if (this.captureMode === "video") {
          await this.loadAudioInputDevices(true);
        }
      } catch (error) {
        this.closeCamera();
        this.$emit("camera-error", error);
        window.alert("Cannot open camera: " + error.message);
      }
    },

    closeCamera() {
      if (this.isRecording) {
        this.cancelRecording();
      }

      this.stopStream();
      this.isCameraOpen = false;
    },

    stopStream() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
      }

      this.stream = null;
      this.audioStream = null;
      this.audioContext = null;
      this.audioSource = null;
      this.audioProcessor = null;
      this.audioSilentGain = null;
      this.recordedAudioSamples = [];
      this.audioSampleRate = 0;
      this.stopFrameRecorderTimer();
      this.recordedFrames = [];
      this.isRecording = false;
      this.isStoppingRecording = false;

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
      if (this.captureMode === "video") {
        this.toggleRecording();
        return;
      }

      this.captureImage();
    },

    captureFromPreview() {
      if (this.captureMode === "image") {
        this.captureImage();
      }
    },

    captureImage() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;

      if (!video || !canvas || !video.videoWidth) return;

      const ratio = video.videoHeight / video.videoWidth;
      const width = this.selectedSizeOption.width || this.width;
      const height = Math.round(width * ratio);

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas
        .toDataURL("image/jpeg", this.selectedSizeOption.quality || this.quality)
        .replace("image/jpeg", "image/octet-stream");

      this.$emit("captured", {
        fileContent: dataUrl,
        dataUrl,
        mediaType: "image",
        mimeType: "image/jpeg",
        width,
        height,
        source: "camera",
        capturedAt: new Date().toISOString(),
      });

      this.closeCamera();
    },

    toggleRecording() {
      if (this.isStoppingRecording) {
        return;
      }

      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },

    async startRecording() {
      if (!this.stream) {
        window.alert("Video recording is not available until the camera is open.");
        return;
      }

      this.recordedFrames = [];
      this.recordedAudioSamples = [];
      this.isRecording = true;
      this.isStoppingRecording = false;
      await this.startAudioRecording();
      if (!this.isRecording) return;
      this.captureVideoFrame();
      this.frameRecorderTimer = window.setInterval(
        this.captureVideoFrame,
        Math.round(1000 / this.selectedSizeOption.frameRate)
      );
    },

    async stopRecording() {
      if (!this.isRecording) return;

      this.isStoppingRecording = true;
      this.stopFrameRecorderTimer();
      const audioData = await this.stopAudioRecording();
      if (audioData && audioData.audioMissing) {
        this.recordedFrames = [];
        this.recordedAudioSamples = [];
        this.isRecording = false;
        this.isStoppingRecording = false;
        return;
      }

      this.emitRecordedVideo(audioData);
    },

    cancelRecording() {
      this.stopFrameRecorderTimer();
      this.cancelAudioRecording();
      this.recordedFrames = [];
      this.isRecording = false;
      this.isStoppingRecording = false;
    },

    stopFrameRecorderTimer() {
      if (this.frameRecorderTimer) {
        window.clearInterval(this.frameRecorderTimer);
        this.frameRecorderTimer = null;
      }
    },

    async startAudioRecording() {
      if (!this.recordAudio) {
        return;
      }

      try {
        this.audioStream = await navigator.mediaDevices.getUserMedia(this.getAudioConstraints());
        await this.loadAudioInputDevices();
        const audioTracks = this.audioStream.getAudioTracks();
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!audioTracks.length || !AudioContext) {
          return;
        }

        this.audioContext = new AudioContext();
        this.audioSampleRate = this.audioContext.sampleRate;
        this.recordedAudioSamples = [];
        audioTracks.forEach(track => {
          track.enabled = true;
        });
        this.audioSource = this.audioContext.createMediaStreamSource(this.audioStream);
        this.audioProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
        this.audioSilentGain = this.audioContext.createGain();
        this.audioSilentGain.gain.value = 0.00001;

        this.audioProcessor.onaudioprocess = event => {
          const input = event.inputBuffer.getChannelData(0);
          this.recordedAudioSamples.push(new Float32Array(input));
        };

        this.audioSource.connect(this.audioProcessor);
        this.audioProcessor.connect(this.audioSilentGain);
        this.audioSilentGain.connect(this.audioContext.destination);

        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }
      } catch (error) {
        console.warn("Camera audio recorder could not start.", error);
        this.cancelAudioRecording();
      }
    },

    async stopAudioRecording() {
      if (!this.audioContext || !this.recordedAudioSamples.length) {
        this.cancelAudioRecording();
        return null;
      }

      const samples = this.recordedAudioSamples.slice();
      const sampleRate = this.audioSampleRate || this.audioContext.sampleRate || 48000;
      this.disconnectAudioRecorder();

      const audioStats = this.getAudioStats(samples);
      const wavBlob = this.encodeWavBlob(samples, sampleRate, audioStats);

      if (!wavBlob.size) return null;
      if (!audioStats.hasSignal) {
        window.alert("No microphone signal was detected. Please choose another microphone in the camera dialog or check the browser/system input device.");
        return { audioMissing: true };
      }

      return {
        audioContent: await this.readBlobAsDataUrl(wavBlob),
        audioMimeType: "audio/wav",
      };
    },

    cancelAudioRecording() {
      this.disconnectAudioRecorder();
      this.recordedAudioSamples = [];
    },

    disconnectAudioRecorder() {
      if (this.audioProcessor) {
        this.audioProcessor.onaudioprocess = null;
        this.audioProcessor.disconnect();
      }

      if (this.audioSource) {
        this.audioSource.disconnect();
      }

      if (this.audioSilentGain) {
        this.audioSilentGain.disconnect();
      }

      if (this.audioContext && this.audioContext.state !== "closed") {
        this.audioContext.close();
      }
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
      }

      this.audioContext = null;
      this.audioSource = null;
      this.audioProcessor = null;
      this.audioSilentGain = null;
      this.audioStream = null;
    },

    encodeWavBlob(sampleChunks, sampleRate, audioStats = null) {
      const samples = this.mergeAudioSamples(sampleChunks);
      const gain = audioStats && audioStats.gain ? audioStats.gain : 1;
      const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
      const view = new DataView(wavBuffer);

      this.writeAscii(view, 0, "RIFF");
      view.setUint32(4, 36 + samples.length * 2, true);
      this.writeAscii(view, 8, "WAVE");
      this.writeAscii(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      this.writeAscii(view, 36, "data");
      view.setUint32(40, samples.length * 2, true);

      let offset = 44;
      for (let i = 0; i < samples.length; i += 1) {
        const sample = Math.max(-1, Math.min(1, samples[i] * gain));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }

      return new Blob([view], { type: "audio/wav" });
    },

    getAudioStats(sampleChunks) {
      let peak = 0;

      sampleChunks.forEach(chunk => {
        for (let i = 0; i < chunk.length; i += 1) {
          const value = chunk[i];
          const abs = Math.abs(value);
          if (abs > peak) peak = abs;
        }
      });

      const gain = peak > 0 ? Math.min(20, 0.9 / peak) : 1;

      return {
        hasSignal: peak > 0,
        gain: Number(gain.toFixed(2)),
      };
    },

    mergeAudioSamples(sampleChunks) {
      const length = sampleChunks.reduce((total, chunk) => total + chunk.length, 0);
      const samples = new Float32Array(length);
      let offset = 0;

      sampleChunks.forEach(chunk => {
        samples.set(chunk, offset);
        offset += chunk.length;
      });

      return samples;
    },

    writeAscii(view, offset, value) {
      for (let i = 0; i < value.length; i += 1) {
        view.setUint8(offset + i, value.charCodeAt(i));
      }
    },

    captureVideoFrame() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;

      if (!video || !canvas || !video.videoWidth) {
        return;
      }

      const width = this.selectedSizeOption.width;
      const height = this.selectedSizeOption.height;

      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(video, 0, 0, width, height);

      this.recordedFrames.push(
        canvas.toDataURL("image/jpeg", this.selectedSizeOption.quality)
      );
    },

    emitRecordedVideo(audioData = null) {
      this.isRecording = false;
      this.isStoppingRecording = false;

      if (!this.recordedFrames.length) {
        window.alert("No video frames were recorded. Please try again.");
        return;
      }

      this.$emit("captured", {
        fileContent: "camera-frame-sequence",
        mediaType: "video",
        encoding: "jpeg-frames",
        mimeType: "application/vnd.camera.frames+json",
        frames: this.recordedFrames.slice(),
        frameRate: this.selectedSizeOption.frameRate,
        audioContent: audioData && audioData.audioContent,
        audioMimeType: audioData && audioData.audioMimeType,
        width: this.selectedSizeOption.width,
        height: this.selectedSizeOption.height,
        source: "camera",
        capturedAt: new Date().toISOString(),
      });

      this.closeCamera();
    },

    readBlobAsDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("Cannot read recorded audio"));
        reader.readAsDataURL(blob);
      });
    },

    getVideoConstraints() {
      const constraints = this.preferRearCamera
        ? { facingMode: { ideal: "environment" } }
        : {};

      if (this.captureMode === "video") {
        constraints.width = { ideal: this.selectedSizeOption.width };
        constraints.height = { ideal: this.selectedSizeOption.height };
      }

      return constraints;
    },

    getAudioConstraints() {
      if (!this.selectedAudioDeviceId) {
        return { audio: true, video: false };
      }

      return {
        audio: {
          deviceId: { exact: this.selectedAudioDeviceId },
        },
        video: false,
      };
    },

    async loadAudioInputDevices(ensurePermission = false) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return;
      }

      let permissionStream = null;

      try {
        let devices = await navigator.mediaDevices.enumerateDevices();
        let audioInputs = devices.filter(device => device.kind === "audioinput");
        const missingLabels = audioInputs.length === 0 || audioInputs.every(device => !device.label);

        if (ensurePermission && this.recordAudio && missingLabels && navigator.mediaDevices.getUserMedia) {
          try {
            permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            devices = await navigator.mediaDevices.enumerateDevices();
            audioInputs = devices.filter(device => device.kind === "audioinput");
          } catch (error) {
            console.warn("Camera microphone permission was not available.", error);
          }
        }

        this.audioInputDevices = audioInputs;

        if (this.selectedAudioDeviceId && !audioInputs.some(device => device.deviceId === this.selectedAudioDeviceId)) {
          this.selectedAudioDeviceId = "";
        }
      } catch (error) {
        console.warn("Camera audio input devices could not be loaded.", error);
      } finally {
        if (permissionStream) {
          permissionStream.getTracks().forEach(track => track.stop());
        }
      }
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
  gap: 8px;
  padding: 4px 8px;
}

.camera-size-select {
  max-width: 130px;
}

.camera-mic-select {
  max-width: 210px;
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

@media (max-width: 600px) {
  .camera-actions {
    flex-wrap: wrap;
  }

  .camera-size-select {
    max-width: 120px;
  }

  .camera-mic-select {
    flex: 1 1 180px;
    max-width: none;
  }
}
</style>
