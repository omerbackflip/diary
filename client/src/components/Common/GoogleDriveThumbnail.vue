<template>
  <div class="google-drive-thumbnail" :style="thumbnailStyle">
    <img
      v-if="thumbnailUrl && !hasError"
      :src="thumbnailUrl"
      :alt="alt"
      class="google-drive-thumbnail__image"
      @error="hasError = true"
    />
    <v-icon v-else color="blue-grey lighten-1" :size="iconSize">
      {{ fallbackIcon }}
    </v-icon>
  </div>
</template>

<script>
import { googleDriveThumbnailUrl } from '../../../../google/frontend';

export default {
  name: 'GoogleDriveThumbnail',
  props: {
    fileId: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: 'Google Drive thumbnail',
    },
    size: {
      type: Number,
      default: 360,
    },
    width: {
      type: Number,
      default: 72,
    },
    height: {
      type: Number,
      default: 52,
    },
    fallbackIcon: {
      type: String,
      default: 'mdi-file-document-outline',
    },
  },
  data() {
    return {
      hasError: false,
    };
  },
  computed: {
    thumbnailUrl() {
      if (!this.fileId) return '';

      return googleDriveThumbnailUrl(this.fileId, {
        apiBaseUrl: this.googleApiBaseUrl(),
        size: this.size,
      });
    },

    thumbnailStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
      };
    },

    iconSize() {
      return Math.min(this.width, this.height) - 14;
    },
  },
  watch: {
    fileId() {
      this.hasError = false;
    },
  },
  methods: {
    googleApiBaseUrl() {
      return process.env.VUE_APP_API_URL
        .replace(/\/$/, '')
        .replace(/\/specific$/, '');
    },
  },
};
</script>

<style scoped>
.google-drive-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f4f7fa;
  border: 1px solid rgba(25, 118, 210, 0.18);
  border-radius: 6px;
}

.google-drive-thumbnail__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #fff;
}
</style>
