<template>
  <v-card flat class="flat-issue-section">
    <v-card-title class="py-2">
      <span class="subtitle-1">פריטים לטיפול - דירה {{ flatId }}</span>
      <v-spacer />
      <v-btn small color="primary" class="ml-2" @click="openCreateDialog">
        <v-icon small left>mdi-plus</v-icon>
        הוסף פריט
      </v-btn>
      <v-btn icon small :loading="isLoading" @click="loadIssues">
        <v-icon small>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-alert v-if="errorMessage" type="error" dense text class="mx-3">
      {{ errorMessage }}
    </v-alert>

    <v-card-text class="pa-2">
      <div v-if="!isLoading && !issues.length" class="text-center grey--text py-6">
        אין פריטים לטיפול בדירה זו
      </div>

      <v-list v-else two-line dense>
        <v-list-item
          v-for="issue in issues"
          :key="issue._id"
          class="issue-row"
        >
          <v-list-item-content>
            <v-list-item-title>{{ issue.description }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ categoryDescription(issue.categoryCode) }}
              <span class="mx-1">|</span>
              {{ statusDescription(issue.statusCode) }}
              <template v-if="issue.targetDate">
                <span class="mx-1">|</span>
                יעד: {{ formatDate(issue.targetDate) }}
              </template>
            </v-list-item-subtitle>
            <div
              v-if="issue.photos && issue.photos.length"
              class="issue-photo-strip mt-2"
            >
              <v-tooltip
                v-for="(photo, photoIndex) in issue.photos"
                :key="photo.fileId || photoIndex"
                bottom
              >
                <template v-slot:activator="{ on, attrs }">
                  <button
                    type="button"
                    class="issue-photo-button"
                    v-bind="attrs"
                    v-on="on"
                    @click="openFile(photo.fileId)"
                  >
                    <google-drive-thumbnail
                      :file-id="photo.fileId"
                      :alt="photo.name || `תמונה ${photoIndex + 1}`"
                      :width="72"
                      :height="52"
                      :fallback-icon="
                        photo.mediaType === 'video'
                          ? 'mdi-video'
                          : 'mdi-image'
                      "
                    />
                  </button>
                </template>
                <span>{{ photo.name || `תמונה ${photoIndex + 1}` }}</span>
              </v-tooltip>
            </div>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              icon
              small
              :loading="uploadingIssueId === issue._id"
              :disabled="Boolean(uploadingIssueId)"
              @click="openIssueCamera(issue)"
            >
              <v-icon small>mdi-camera</v-icon>
            </v-btn>
            <v-btn icon small @click="openEditDialog(issue)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-dialog v-model="createDialog" persistent max-width="520">
      <v-card style="direction: rtl;">
        <v-card-title class="subtitle-1">
          {{ editingIssueId ? "עריכת פריט" : "פריט חדש לטיפול" }}
          - דירה {{ flatId }}
        </v-card-title>

        <v-card-text>
          <v-alert v-if="createErrorMessage" type="error" dense text>
            {{ createErrorMessage }}
          </v-alert>

          <v-form ref="createForm" v-model="createFormValid">
            <v-select
              v-model="newIssue.categoryCode"
              :items="categoryRows"
              item-text="description"
              item-value="table_code"
              :rules="[requiredRule]"
              label="קטגוריה"
              dense
            />

            <v-textarea
              v-model="newIssue.description"
              :rules="[requiredRule]"
              label="תיאור"
              rows="2"
              auto-grow
              dense
            />

            <v-select
              v-model="newIssue.statusCode"
              :items="statusRows"
              item-text="description"
              item-value="table_code"
              :rules="[requiredRule]"
              label="סטטוס"
              dense
            />

            <v-text-field
              v-model="newIssue.targetDate"
              type="date"
              label="תאריך יעד"
              clearable
              dense
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn
            small
            color="primary"
            :disabled="!createFormValid"
            :loading="isSaving"
            @click="saveIssue"
          >
            שמור
          </v-btn>
          <v-spacer />
          <v-btn small text :disabled="isSaving" @click="closeCreateDialog">
            בטל
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <camera ref="issueCamera" @captured="addIssueMedia" />
    <modal-dialog ref="modalDialog" />
  </v-card>
</template>

<script>
import apiService from "../../services/apiService";
import {
  FLAT_ISSUE_MODEL,
  loadTable,
  viewGDFile,
} from "../../constants/constants";
import Camera from "../../../../camera/frontend";
import { GoogleFileViewerModal as modalDialog } from "../../../../google/frontend";
import SpecificServiceEndPoints from "../../services/specificServiceEndPoints";
import GoogleDriveThumbnail from "../Common/GoogleDriveThumbnail.vue";

export default {
  name: "flat-issue-section",

  components: { Camera, modalDialog, GoogleDriveThumbnail },

  props: {
    flatId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      issues: [],
      statusRows: [],
      categoryRows: [],
      isLoading: false,
      isSaving: false,
      uploadingIssueId: null,
      selectedIssueForMedia: null,
      errorMessage: "",
      createErrorMessage: "",
      createDialog: false,
      createFormValid: false,
      editingIssueId: null,
      newIssue: {
        categoryCode: null,
        description: "",
        statusCode: 1,
        targetDate: null,
      },
      requiredRule: value =>
        (value !== null &&
          typeof value !== "undefined" &&
          String(value).trim() !== "") ||
        "שדה חובה",
    };
  },

  watch: {
    flatId: {
      immediate: true,
      handler() {
        this.loadIssues();
      },
    },
  },

  methods: {
    async loadIssues() {
      if (this.flatId === null || typeof this.flatId === "undefined") {
        this.issues = [];
        return;
      }

      try {
        this.isLoading = true;
        this.errorMessage = "";

        const [issueResponse, statusRows, categoryRows] = await Promise.all([
          apiService.clientGetEntities(FLAT_ISSUE_MODEL, {
            flatId: this.flatId,
            _sort: JSON.stringify({ createdAt: -1 }),
          }),
          loadTable(20),
          loadTable(21),
        ]);

        this.issues = issueResponse.data || [];
        this.statusRows = statusRows || [];
        this.categoryRows = categoryRows || [];
      } catch (error) {
        console.error("Error loading FlatIssues:", error);
        this.issues = [];
        this.errorMessage = "טעינת הפריטים לטיפול נכשלה";
      } finally {
        this.isLoading = false;
      }
    },

    openCreateDialog() {
      this.editingIssueId = null;
      this.newIssue = {
        categoryCode: null,
        description: "",
        statusCode: 1,
        targetDate: null,
      };
      this.createErrorMessage = "";
      this.createDialog = true;

      this.$nextTick(() => {
        if (this.$refs.createForm) {
          this.$refs.createForm.resetValidation();
        }
      });
    },

    openEditDialog(issue) {
      this.editingIssueId = issue._id;
      this.newIssue = {
        categoryCode: Number(issue.categoryCode),
        description: issue.description || "",
        statusCode: Number(issue.statusCode),
        targetDate: issue.targetDate
          ? String(issue.targetDate).slice(0, 10)
          : null,
      };
      this.createErrorMessage = "";
      this.createDialog = true;

      this.$nextTick(() => {
        if (this.$refs.createForm) {
          this.$refs.createForm.resetValidation();
        }
      });
    },

    closeCreateDialog() {
      this.createDialog = false;
      this.createErrorMessage = "";
      this.editingIssueId = null;
    },

    async saveIssue() {
      if (!this.$refs.createForm || !this.$refs.createForm.validate()) {
        return;
      }

      try {
        this.isSaving = true;
        this.createErrorMessage = "";

        const issueData = {
          description: this.newIssue.description.trim(),
          categoryCode: Number(this.newIssue.categoryCode),
          statusCode: Number(this.newIssue.statusCode),
          targetDate: this.newIssue.targetDate || null,
        };

        if (this.editingIssueId) {
          await apiService.updateEntity(
            { _id: this.editingIssueId },
            issueData,
            {
              model: FLAT_ISSUE_MODEL,
              runValidators: true,
            }
          );
        } else {
          await apiService.create(
            {
              flatId: this.flatId,
              ...issueData,
            },
            { model: FLAT_ISSUE_MODEL }
          );
        }

        this.createDialog = false;
        this.editingIssueId = null;
        await this.loadIssues();
      } catch (error) {
        console.error("Error saving FlatIssue:", error);
        const responseMessage =
          error.response &&
          error.response.data &&
          error.response.data.message;
        this.createErrorMessage =
          responseMessage || "שמירת הפריט לטיפול נכשלה";
      } finally {
        this.isSaving = false;
      }
    },

    openIssueCamera(issue) {
      this.selectedIssueForMedia = issue;
      this.$refs.issueCamera.toggleCamera();
    },

    async addIssueMedia(media) {
      if (!this.selectedIssueForMedia || !this.selectedIssueForMedia._id) {
        return;
      }

      try {
        const issue = this.selectedIssueForMedia;
        this.uploadingIssueId = issue._id;
        const mediaName = this.askForMediaName(media);

        if (!mediaName) {
          return;
        }

        await SpecificServiceEndPoints.uploadFlatIssuePic({
          ...media,
          issueId: issue._id,
          name: mediaName,
        });

        await this.loadIssues();
      } catch (error) {
        console.error("Error uploading FlatIssue media:", error);
        const responseData = error.response && error.response.data;
        const message =
          responseData && responseData.message
            ? `${responseData.message}${responseData.step ? " (step: " + responseData.step + ")" : ""}`
            : error.message;
        window.alert("Error uploading media: " + message);
      } finally {
        this.uploadingIssueId = null;
        this.selectedIssueForMedia = null;
      }
    },

    askForMediaName(media) {
      const defaultType =
        media && media.mediaType === "video" ? "v" : "p";
      const defaultName = `${defaultType}-${this.formatMediaTimestamp(
        new Date()
      )}`;
      const name = window.prompt("Media name", defaultName);

      if (name === null) {
        return null;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        window.alert("Media name is required.");
        return null;
      }

      return trimmedName;
    },

    formatMediaTimestamp(value) {
      const pad = number => String(number).padStart(2, "0");
      const year = String(value.getFullYear()).slice(-2);
      const month = pad(value.getMonth() + 1);
      const day = pad(value.getDate());
      const hours = pad(value.getHours());
      const minutes = pad(value.getMinutes());
      const seconds = pad(value.getSeconds());

      return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    },

    async openFile(fileId) {
      if (!fileId) {
        return;
      }

      await viewGDFile(fileId, this.$refs.modalDialog);
    },

    lookupDescription(rows, code) {
      const row = rows.find(
        item => Number(item.table_code) === Number(code)
      );
      return row ? row.description : `קוד לא מוגדר (${code})`;
    },

    statusDescription(code) {
      return this.lookupDescription(this.statusRows, code);
    },

    categoryDescription(code) {
      return this.lookupDescription(this.categoryRows, code);
    },

    formatDate(value) {
      return value ? String(value).slice(0, 10) : "";
    },
  },
};
</script>

<style scoped>
.flat-issue-section {
  background-color: transparent !important;
  direction: rtl;
  min-height: 280px;
}

.issue-row {
  border-bottom: 1px solid #eeeeee;
}

.issue-photo-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.issue-photo-button {
  padding: 0;
  background: transparent;
  border: 0;
  cursor: pointer;
}
</style>
