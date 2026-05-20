<template>
  <span>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          @click="openPicker"
          :disabled="isLoading || disabled"
          :loading="isLoading"
          class="primary google-picker-button"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>
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
    icon: {
      type: String,
      default: "mdi-folder-google-drive",
    },
    tooltip: {
      type: String,
      default: "Open Google Drive folder",
    },
    disabled: {
      type: Boolean,
      default: false,
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

<style scoped>
.google-picker-button {
  margin-left: 6px;
  min-width: 42px !important;
  padding: 0 12px !important;
}
</style>
