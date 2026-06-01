<template>
  <div class="global-doc-page">
    <v-row justify="center">
      <v-col cols="12" lg="9" md="10" class="pa-3">
        <v-card class="global-doc-card" elevation="4">
          <v-card-title class="global-doc-title">
            <div class="global-doc-title__text">מסמכי פרויקט</div>
            <div class="global-doc-title__actions">
              <v-btn
                class="global-doc-send"
                color="green darken-1"
                dark
                :disabled="selectedDocuments.length === 0"
                @click="openWhatsAppSharePack"
              >
                <v-icon left>mdi-whatsapp</v-icon>
                הכן לוואטסאפ
              </v-btn>
              <v-btn
                class="global-doc-send"
                color="primary"
                :disabled="selectedDocuments.length === 0"
                @click="sendSelectedByEmail"
              >
                <v-icon left>mdi-email-send-outline</v-icon>
                שלח נבחרים
              </v-btn>
            </div>
          </v-card-title>

          <v-data-table
            v-model="selectedDocuments"
            :headers="headers"
            :items="documentList"
            item-key="_id"
            show-select
            disable-pagination
            hide-default-footer
            fixed-header
            height="72vh"
            dense
            mobile-breakpoint="0"
            class="global-doc-table"
            :loading="isLoading"
            loading-text="Loading... Please wait"
          >
            <template v-slot:[`item.thumbnail`]="{ item }">
              <button class="thumbnail-button" type="button" @click="openFile(item)">
                <GoogleDriveThumbnail
                  :file-id="item.GDFileId"
                  :alt="item.description"
                  :width="76"
                  :height="54"
                />
              </button>
            </template>

            <template v-slot:[`item.description`]="{ item }">
              <div v-if="itemToEdit === item._id">
                <v-text-field
                  v-model="item.description"
                  :id="`itemEdit-${item._id}`"
                  dense
                  hide-details
                />
              </div>
              <button v-else class="document-name" type="button" @click="openFile(item)">
                {{ item.description }}
              </button>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <div class="document-actions">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small v-bind="attrs" v-on="on" @click="openFile(item)">
                      <v-icon small>mdi-open-in-new</v-icon>
                    </v-btn>
                  </template>
                  <span>פתח מסמך</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small color="green darken-1" v-bind="attrs" v-on="on" @click="sendFile(item)">
                      <v-icon small>mdi-whatsapp</v-icon>
                    </v-btn>
                  </template>
                  <span>שלח ב-WhatsApp</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small color="primary" v-bind="attrs" v-on="on" @click="sendFileByEmail(item)">
                      <v-icon small>mdi-email-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>שלח במייל</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small color="red darken-1" v-bind="attrs" v-on="on" @click="deleteOne(item._id)">
                      <v-icon small>mdi-delete-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>מחק</span>
                </v-tooltip>
              </div>
            </template>

            <template v-slot:no-data>
              <v-alert type="info" text>
                לא נמצאו מסמכים.
              </v-alert>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <modal-dialog ref="modalDialog"/>

    <v-dialog v-model="sharePackDialog" max-width="760px">
      <v-card class="share-pack-dialog">
        <v-card-title class="share-pack-title">
          <span>חבילת שיתוף לוואטסאפ</span>
          <v-btn icon @click="sharePackDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-alert v-if="sharePackError" type="error" dense text>
            {{ sharePackError }}
          </v-alert>

          <div class="share-pack-section-title">טקסט שיצורף לשיתוף</div>
          <v-textarea
            v-model="sharePackText"
            outlined
            auto-grow
            rows="5"
            hide-details
            class="share-pack-textarea"
          ></v-textarea>

          <div class="share-pack-section-title">קבצים מצורפים</div>
          <v-progress-linear
            v-if="sharePackLoading"
            indeterminate
            color="primary"
            class="mb-3"
          ></v-progress-linear>

          <div class="share-pack-files">
            <div
              v-for="item in sharePackItems"
              :key="item._id"
              class="share-pack-file"
            >
              <GoogleDriveThumbnail
                :file-id="item.GDFileId"
                :alt="item.description"
                :width="92"
                :height="66"
              />
              <div class="share-pack-file__details">
                <div class="share-pack-file__name">{{ item.description }}</div>
                <div class="share-pack-file__status">
                  {{ sharePackFileStatus(item) }}
                </div>
                <div v-if="sharePackFiles[item._id]" class="share-pack-file__prepared-name">
                  {{ sharePackFiles[item._id].name }}
                </div>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="share-pack-actions">
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            dark
            :disabled="!sharePackReady || !canNativeShareFiles"
            @click="shareFilesToWhatsApp"
          >
            <v-icon left>mdi-share-variant</v-icon>
            שתף קבצים
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>



<script>
import { TABLE_MODEL, viewGDFile, shareOnWhatsApp } from '../constants/constants';
import apiService from '../services/apiService';
import http from '../http-common';
import { GoogleFileViewerModal as modalDialog } from '../../../google/frontend';
import GoogleDriveThumbnail from './Common/GoogleDriveThumbnail.vue';


export default {
  name: "GlobalDocForm",
  components: {modalDialog, GoogleDriveThumbnail},
  data() {
    return {
      documentList: [],
      selectedDocuments: [],
      headers:[
        { text: "", value: "thumbnail", sortable: false, class: 'light-blue', groupable: false, width: "96px" },
        { text: "שם המסמך", value: "description", class: 'light-blue', groupable: false },
        { text: "פעולה", value: "actions", sortable: false, class: 'light-blue', groupable: false, width: "180px" },
      ],
      isLoading: false,
      sharePackDialog: false,
      sharePackItems: [],
      sharePackFiles: {},
      sharePackLoading: false,
      sharePackError: '',
      sharePackText: '',
      itemToEdit: "",
      tblFields: {
        table_id:         "",
        table_code:       "",
        GDFileId:       "",
        description:"",
      },
    };
  },

  methods: {
    retrieveDocs() {
      this.isLoading = true;
      let table_id = 8;
      apiService.clientGetEntities(TABLE_MODEL, {table_id})
        .then((response) => {
          this.documentList = response.data.sort((a, b) => a.table_code - b.table_code);
          this.selectedDocuments = [];
          this.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
          this.isLoading = false;
        });
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        apiService.deleteOne({model: TABLE_MODEL ,id})
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    refreshList() {
      this.retrieveDocs();
    },

    editOne(id) {
      this.$router.push({ name: "table-details", params: { id: id } });
    },

    updateOne(item) {
      apiService.updateEntity({_id:item._id}, item, {model: TABLE_MODEL})
        .then(response => {
          console.log(response.data);
          this.message = 'The updateOne() updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
        this.itemToEdit = '';
    },

    setEdit(item) {
      this.itemToEdit = item._id;
      setTimeout( () => {
        document.getElementById(`itemEdit-${item._id}`).focus()
      }, 1 );
    },

    async openFile(item) {
      await viewGDFile(item.GDFileId, this.$refs.modalDialog);
    },

    async sendFile(item) {
      const msg = 'שלום מגדות סקיי, מצורף המסמך:'
      await shareOnWhatsApp(item.GDFileId, msg);
    },

    async sendFileByEmail(item) {
      this.sendDocumentsByEmail([item]);
    },

    async sendSelectedByEmail() {
      this.sendDocumentsByEmail(this.selectedDocuments);
    },

    openWhatsAppSharePack() {
      const documents = this.selectedDocuments.filter(item => item && item.GDFileId);
      if (!documents.length) return;

      this.sharePackItems = documents;
      this.sharePackFiles = {};
      this.sharePackError = '';
      this.sharePackText = this.defaultSharePackText(documents);
      this.sharePackDialog = true;
      this.prepareSharePackFiles();
    },

    async prepareSharePackFiles() {
      this.sharePackLoading = true;
      this.sharePackError = '';

      try {
        const files = {};

        for (const [index, item] of this.sharePackItems.entries()) {
          const response = await http.get(`google/file/${item.GDFileId}/content`, {
            responseType: 'blob',
          });
          const mimeType = response.data.type || 'application/octet-stream';
          files[item._id] = new File(
            [response.data],
            this.fileNameForShare(mimeType, index),
            { type: mimeType }
          );
        }

        this.sharePackFiles = files;
      } catch (error) {
        console.error('Failed to prepare WhatsApp share pack', error);
        this.sharePackError = 'לא ניתן להכין את הקבצים לשיתוף.';
      } finally {
        this.sharePackLoading = false;
      }
    },

    async shareFilesToWhatsApp() {
      try {
        const files = this.sharePackPreparedFiles;
        if (!files.length || !this.canNativeShareFiles) return;

        await navigator.share({
          text: this.sharePackText,
          files,
        });
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        console.error('Failed to share files', error);
        this.sharePackError = 'השיתוף לא הצליח. יש לפתוח את הדף ממכשיר או דפדפן שתומך בשיתוף קבצים.';
      }
    },

    sharePackFileStatus(item) {
      if (this.sharePackFiles[item._id]) return 'מוכן לשיתוף כקובץ';
      if (this.sharePackLoading) return 'מכין קובץ...';
      return 'לא מוכן';
    },

    sendDocumentsByEmail(items) {
      try {
        const documents = items.filter(item => item && item.GDFileId);
        if (!documents.length) return;

        const subject = encodeURIComponent('מסמכי פרויקט - גדות סקיי');
        const list = documents
          .map((item) => `• ${item.description || 'מסמך'}\n  ${this.googleDriveViewLink(item.GDFileId)}`)
          .join('\n\n');
        const body = encodeURIComponent(`בהמשך לשיחה מצורף הקבצים\n\n${list}`);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      } catch (err) {
        console.error('Failed to send email', err);
      }
    },

    googleDriveViewLink(fileId) {
      return `https://drive.google.com/file/d/${fileId}/view`;
    },

    fileNameForShare(mimeType, index = 0) {
      const extension = this.extensionForMimeType(mimeType);
      return `document-${index + 1}${extension || '.bin'}`;
    },

    extensionForMimeType(mimeType) {
      const extensions = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
      };

      return extensions[mimeType] || '';
    },

    defaultSharePackText(items) {
      const list = items
        .map(item => `• ${item.description || 'מסמך'}`)
        .join('\n');

      return `בהמשך לשיחה מצורפים הקבצים:\n\n${list}`;
    }
  },

  computed: {
    sharePackPreparedFiles() {
      return this.sharePackItems
        .map(item => this.sharePackFiles[item._id])
        .filter(Boolean);
    },

    sharePackReady() {
      return this.sharePackItems.length > 0 &&
        this.sharePackPreparedFiles.length === this.sharePackItems.length;
    },

    canNativeShareFiles() {
      if (!this.sharePackReady || !navigator.share) return false;
      if (!navigator.canShare) return true;

      return navigator.canShare({
        files: this.sharePackPreparedFiles,
      });
    },
  },

  mounted() {
    this.retrieveDocs();
  },
};



</script>

<style scoped>
.global-doc-page {
  direction: rtl;
  min-height: 93vh;
}

.global-doc-card {
  min-height: 86vh;
}

.global-doc-title {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
}

.global-doc-title__text {
  text-align: right;
  font-size: 24px;
  font-weight: bold;
  color: #0d47a1;
}

.global-doc-send {
  justify-self: end;
  white-space: nowrap;
}

.global-doc-title__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.global-doc-table {
  border-radius: 8px;
  overflow: hidden;
  direction: rtl;
  text-align-last: right;
}

.global-doc-table ::v-deep th {
  font-size: 16px !important;
  font-weight: bold;
  background-color: #03a9f4 !important;
  color: #fff !important;
}

.global-doc-table ::v-deep th .v-simple-checkbox {
  color: #fff !important;
}

.global-doc-table ::v-deep tbody tr:hover {
  background: #f2f7fc !important;
}

.thumbnail-button,
.document-name {
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: right;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.document-name {
  color: #1565c0;
  font-weight: 600;
}

.document-name:hover {
  text-decoration: underline;
}

.document-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
}

.share-pack-dialog {
  direction: rtl;
}

.share-pack-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #0d47a1;
  font-weight: bold;
}

.share-pack-section-title {
  margin: 16px 0 8px;
  color: #37474f;
  font-weight: bold;
  text-align: right;
}

.share-pack-textarea ::v-deep textarea {
  line-height: 1.7;
}

.share-pack-files {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.share-pack-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f7fafc;
  border: 1px solid rgba(25, 118, 210, 0.14);
  border-radius: 8px;
}

.share-pack-file__details {
  min-width: 0;
  text-align: right;
}

.share-pack-file__name {
  overflow: hidden;
  color: #1565c0;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-pack-file__status {
  margin-top: 4px;
  color: #607d8b;
  font-size: 12px;
}

.share-pack-file__prepared-name {
  direction: rtl;
  margin-top: 3px;
  overflow: hidden;
  color: #455a64;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-pack-actions {
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 700px) {
  .global-doc-title {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .global-doc-title__text {
    font-size: 20px;
  }

  .global-doc-title__actions {
    gap: 6px;
  }

  .global-doc-title__actions .v-btn {
    min-width: 42px !important;
    padding: 0 10px !important;
  }

  .global-doc-title__actions .v-btn .v-icon {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .global-doc-title__actions .v-btn {
    font-size: 0;
  }

  .global-doc-title__actions .v-btn .v-icon {
    font-size: 20px;
  }
}
</style>
