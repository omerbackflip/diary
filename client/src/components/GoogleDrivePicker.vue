<template>
  <span>
    <v-icon v-if="fileUrl" @click="openFile" medium>mdi-link</v-icon>
    <v-icon @click="openDrivePicker" :disabled="!pickerApiLoaded" small>mdi-file</v-icon>
  </span>
</template>

<script>
export default {
  name: "GoogleDrivePicker",
  props: {
    maxItems: {
      type: Number,
      default: 1,
    },
    fileUrl: String,
    pickerNo: Number
  },
  data() {
    return {
      pickerApiLoaded: false,
    };
  },
  methods: {
    // Load the Google API script once
    loadGoogleApi() {
      if (typeof window.gapiLoaded == 'undefined') {
        window.gapiLoaded = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://apis.google.com/js/api.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      return window.gapiLoaded;
    },

    // Initialize Google Picker
    async initGooglePicker() {
      await this.loadGoogleApi();

      window.gapi.load("picker", { callback: this.onPickerApiLoad });
    },

    onPickerApiLoad() {
      this.pickerApiLoaded = true;
    },

    openFile(){
      window.open(this.fileUrl);
    },

    openDrivePicker(){
      this.createPicker();
    },

    createPicker() {
      let apiKey = localStorage.getItem('developerKey');
      let accessToken = localStorage.getItem('googleAccessToken');
      let locale = localStorage.getItem('locale');
      
      if (this.pickerApiLoaded && accessToken) {

        const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        const picker = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(accessToken)
          .setDeveloperKey(apiKey)
          .setCallback(this.onFileSelected)
          .setLocale(locale)
          .setMaxItems(this.maxItems)
          .build();
        picker.setVisible(true);
      }else{
        alert("Please connect your google account.");
      }
    },

    onFileSelected(data) {
      if (data.action === window.google.picker.Action.PICKED) {

        this.$emit("onFileSelected", data, this.pickerNo); // Emit the selected file details
      }
    },
  },
  mounted() {
    this.initGooglePicker();
  },
};
</script>