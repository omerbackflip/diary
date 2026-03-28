<template>
  <span>
    <v-btn
      @click="openPickerForView"
      :disabled="!pickerApiLoaded || isLoading"
      class="primary"
      style="margin-left:6px"
    >
      <v-icon>mdi-folder-google-drive</v-icon>
    </v-btn>
  </span>
</template>

<script>
import specificServiceEndPoints from "../services/specificServiceEndPoints";

export default {
  name: "GooglePicker",
  props: {
    maxItems: {
      type: Number,
      default: 1,
    },
    GDParantFolder: String,
  },
  data() {
    return {
      pickerApiLoaded: false,
      isLoading: false,
    };
  },
  methods: {
    loadGoogleApi() {
      if (typeof window.gapiLoaded === "undefined") {
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

    async initGooglePicker() {
      await this.loadGoogleApi();
      window.gapi.load("picker", { callback: this.onPickerApiLoad });
    },

    onPickerApiLoad() {
      this.pickerApiLoaded = true;
    },

    async openPickerForView() {
      try {
        if (!this.pickerApiLoaded) {
          return;
        }

        this.isLoading = true;

        const [pickerTokenResponse, googleStatusResponse] = await Promise.all([
          specificServiceEndPoints.getPickerToken(),
          specificServiceEndPoints.getGoogleConnectionStatus()
        ]);

        const pickerToken = pickerTokenResponse.data || {};
        const googleStatus = googleStatusResponse.data || {};

        if (!pickerToken.connected) {
          alert("Please connect your Google account first.");
          if (pickerToken.authUrl) {
            window.location.href = pickerToken.authUrl;
          } else if (googleStatus.authUrl) {
            window.location.href = googleStatus.authUrl;
          }
          return;
        }

        const apiKey = googleStatus.developerKey;
        const accessToken = pickerToken.access_token;
        const locale = googleStatus.locale || "en";
        const folderId = this.GDParantFolder;

        if (!apiKey) {
          alert("Google Picker developer key is missing.");
          return;
        }

        if (!accessToken) {
          alert("Google access token is missing.");
          return;
        }

        const view = new window.google.picker.DocsView()
          .setParent(folderId)
          .setIncludeFolders(true);

        const picker = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(accessToken)
          .setDeveloperKey(apiKey)
          .setCallback(this.onViewPicked)
          .setLocale(locale)
          .setMaxItems(this.maxItems)
          .build();

        picker.setVisible(true);
      } catch (error) {
        console.log("Error opening Google Picker:", error);
        alert("Error opening Google Picker.");
      } finally {
        this.isLoading = false;
      }
    },

    onViewPicked(data) {
      if (data.action === window.google.picker.Action.PICKED) {
        this.$emit("onViewPicked", data);
      }
    },
  },

  mounted() {
    this.initGooglePicker();
  }
};
</script>