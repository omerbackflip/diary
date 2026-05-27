<template>
  <div class="global-doc-page">
    <v-row justify="center">
      <v-col cols="12" lg="9" md="10" class="pa-3">
        <v-card class="global-doc-card" elevation="4">
          <v-card-title class="global-doc-title">
            <div class="global-doc-title__text">מסמכי פרויקט</div>
            <v-btn
              class="global-doc-send"
              color="primary"
              :disabled="selectedDocuments.length === 0"
              @click="sendSelectedByEmail"
            >
              <v-icon left>mdi-email-send-outline</v-icon>
              שלח נבחרים
            </v-btn>
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
  </div>
</template>



<script>
import { TABLE_MODEL, viewGDFile, shareOnWhatsApp } from '../constants/constants';
import apiService from '../services/apiService';
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
    }
  },

  computed: {

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
}
</style>
