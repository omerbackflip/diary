<template>
  <span>
    <v-icon v-if="GDFileId" @click="clickToView(GDFileId)" medium>mdi-eye-outline</v-icon>
    <v-icon @click="openDrivePicker" :disabled="!pickerApiLoaded" small>mdi-file</v-icon>
    <modal-dialog ref="modalDialog"/>
  </span>
</template>

<script>
import modalDialog from './Common/ViewFileModal.vue';
export default {
  name: "GooglePicker",
  components:{ modalDialog },
  props: {
    maxItems: {
      type: Number,
      default: 1,
    },
    GDFileId: String,
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

    openDrivePicker(){
      this.createPicker();
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
          
    async clickToView(GDFileId) {
        var fileview = `https://docs.google.com/file/d/${GDFileId}/preview?usp=drivesdk`
        await this.$refs.modalDialog.open(fileview);
        // this.filelink = fileview;    
        // this.iframeSrc = fileview;
        // this.isModalOpen = true;    
      },
  },
  mounted() {
    this.initGooglePicker();
  },
};
</script>