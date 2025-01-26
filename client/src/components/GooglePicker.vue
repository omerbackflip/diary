<template>
  <span style="float: right; padding-right: 10px;">
    <v-btn @click="createPicker" :disabled="!pickerApiLoaded" class="primary" x-small>
      <v-icon small>mdi-plus</v-icon>
    </v-btn>
  </span>
</template>

<script>
export default {
  name: "GooglePicker",
  props: {
    maxItems: {
      type: Number,
      default: 1,
    },
    pickerNo: Number,
    GDParantFolder: String,
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

    createPicker() {
      let apiKey = localStorage.getItem('developerKey');
      let accessToken = localStorage.getItem('googleAccessToken');
      let locale = localStorage.getItem('locale');
      let folderId = this.GDParantFolder; // specific holder folder ID 
      if (this.pickerApiLoaded && accessToken) {

        // const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        const view = new window.google.picker.DocsView()
          .setParent(folderId) // Set the folder ID to open
          .setIncludeFolders(true) // Include subfolders
          // .setSelectFolderEnabled(true); // Allow folder selection
          // .setMode(window.google.picker.DocsViewMode.LIST); // Shows files in a list with details

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
        this.$emit("onFileSelected", data); // Emit the selected file details
      }
    },

  },
  mounted() {
    this.initGooglePicker();
  },
};
</script>