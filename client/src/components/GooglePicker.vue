<template>
  <span>
    <v-btn
      @click="openPicker"
      :disabled="isLoading"
      class="primary"
      style="margin-left:6px"
    >
      <v-icon>mdi-folder-google-drive</v-icon>
    </v-btn>
  </span>
</template>

<script>
import { pickGoogleDriveFile } from "../../../google/frontend";

export default {
  name: "GooglePicker",
  props: {
    maxItems: {
      type: Number,
      default: 1,
    },
    folderId: {
      type: String,
      default: null,
    },
    includeFolders: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isLoading: false,
    };
  },
  methods: {
    async openPicker() {
      try {
        this.isLoading = true;

        const result = await pickGoogleDriveFile({
          folderId: this.folderId,
          multiselect: this.maxItems > 1,
          includeFolders: this.includeFolders,
        });

        if (!result) return;

        this.$emit("picked", result);
      } catch (error) {
        console.log("Error opening Google Picker:", error);
        alert("Error opening Google Picker.");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>