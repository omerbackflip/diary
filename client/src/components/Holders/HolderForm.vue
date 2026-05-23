<template>
  <v-dialog v-model="dialogHolderForm" width="600">
    <v-card style="direction: rtl;" :class="bck_grnd(holder._id)">
      <v-card-text style="padding: 0px;">
        <v-container>
          <!-- <v-row v-if="holderPics && holderPics.length" class="mx-0 pa-2" style="background-color: beige;">
            <v-col cols="4" v-for="(pic, i) in holderPics" :key="pic.fileId || i">
              <img v-if="isLocalPic(pic)" class="media-files" :src="getMediaPath(pic)" />
              <div v-else class="drive-pic" @click="openFile(pic.fileId)">
                <v-icon color="primary">mdi-image</v-icon>
                <div class="caption">{{ pic.name || 'Picture' }}</div>
              </div>
              <span class="remove-btn" @click="removeImg(pic)">Remove</span>
            </v-col>
          </v-row> -->
          <v-form ref="form">
            <v-row>
              <v-col cols="3">
                <v-text-field v-model="holder.flatId" dense @focus="$event.target.select()" :disabled="!isNewHolder"></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field v-model="holder.name" dense @focus="$event.target.select()"></v-text-field>
              </v-col>
              <v-col cols="5">
                <v-select v-model="holder.status" :items="statusList" label="סטטוס" reverse dense></v-select>
              </v-col>
              <v-col class="pb-4" cols="8">
                <v-text-field v-model="holder.email" dense @focus="$event.target.select()"></v-text-field>
              </v-col>
              <v-col class="pb-4 pr-0" cols="4">
                <v-text-field v-model="holder.phone" dense @focus="$event.target.select()"></v-text-field>
              </v-col>
              <v-row class="mx-0">
                <v-col cols="3">
                  <v-checkbox v-model="holder.payedFile" label="ריצוף" hide-details></v-checkbox>
                </v-col>  
                <v-col cols="3">
                  <v-checkbox v-model="holder.sendPlans" label="מרפסת" hide-details></v-checkbox>
                </v-col>
                <v-col cols="3">
                  <v-checkbox v-model="holder.gotOffer" label="רטובים"></v-checkbox>
                </v-col>
                <v-col cols="3">
                  <v-checkbox v-model="holder.payedOffer" label="חיפוי"></v-checkbox>
                </v-col>
              </v-row>   
              <v-row class="mx-0">
                <v-col cols="6">
                  <v-select v-model="holder.mitbach" :items="mitbachList" dense hide-details label="מטבח" clearable></v-select>
                </v-col>
                <v-col cols="6">
                  <v-select v-model="holder.senitar" :items="senitarList" dense hide-details label="סניטרים" clearable></v-select>
                </v-col>
                <v-col cols="6">
                </v-col>
                <v-col cols="6">
                  <div class="d-flex justify-space-between w-100">
                    <div v-if="holder.totalCompany" class="text-right">
                      <span> ביצועים: {{ holder.totalCompany.toLocaleString() || '' }}</span>
                    </div>
                    <div v-if="holder.totalCustomer" class="text-left">
                      <span> לקוח: {{ holder.totalCustomer.toLocaleString() || '' }}</span>
                    </div>
                  </div>
                </v-col>
              </v-row>
              <v-col cols="12" class="pa-3">
                <v-textarea v-model="holder.remark" :label="holder.remark ? '' : 'עדכון אחרון...'" auto-grow rows="1" @focus="$event.target.select()" dense></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-row class="holder-media-actions mx-0" align="center" justify="center">
        <v-col cols="auto" class="pa-1">
          <GooglePicker
            @picked="onFilePicked"
            :folderId="holder.GDParantFolder"
            tooltip="Open holder folder"
          />
        </v-col>
        <v-col cols="auto" class="pa-1">
          <GooglePicker
            @picked="onFilePicked"
            :folderId="holderPicFolderId"
            :disabled="!holderPicFolderId"
            icon="mdi-image-multiple"
            tooltip="Open holder pictures folder"
          />
        </v-col>
        <v-col cols="auto" class="pa-1">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="primary holder-action-button"
                :loading="isUploadingPic"
                :disabled="isUploadingPic"
                v-bind="attrs"
                v-on="on"
                @click="callCamera"
              >
                <v-icon>mdi-camera</v-icon>
              </v-btn>
            </template>
            <span>Open camera</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-col class="d-flex justify-center">
        <v-text-field v-model="holder.GDParantFolder" dense @focus="$event.target.select()" class="text-center" style="max-width: 300px;"></v-text-field>
      </v-col>
      <v-card-actions class="justify-center">
        <v-btn small @click="saveHolder()" :loading="isLoading">{{ holder._id ? "שמור" : "שמור חדש" }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn small @click="cancelHolderForm">בטל</v-btn>
      </v-card-actions>
    </v-card>
    <camera ref="camera" @captured="addMediaItems" />
    <modal-dialog ref="modalDialog"/>
  </v-dialog>
</template>

<script>
import { HOLDER_MODEL, loadTable, viewGDFile } from "../../constants/constants";
import apiService from "../../services/apiService";
import GooglePicker from "../GooglePicker.vue";
import modalDialog from '../Common/ViewFileModal.vue';
import Camera from "../../../../../camera/frontend";
import SpecificServiceEndPoints from "../../services/specificServiceEndPoints";

export default {
    name: "holder-form",
    components: {GooglePicker,modalDialog, Camera},
    data() {
      return {
        dialogHolderForm: false,
        resolve: null,      // What is this for ?
        isLoading: false,
        isNewHolder: false,
        message: '',
        pickerDocIndex: false,
        holder: [],
        holderPics: [],
        holderPicFolderId: "",
        statusList: [],
        mitbachList: ['סמל-סטנדט','סמל-שדרוג','אביבי-סטנדט','אביבי-שדרוג','זיכוי'],
        senitarList: ['חרש','סטודיו'],
        paymentsBy: ['Company','Customer'],
        docTypeDialog: false,
        selectedDocType: '',
        selectedDocIndex: null,
        removedPicsThisSession: [],
        isUploadingPic: false,
        isLoadingPics: false,
      };
    },

    methods: {
      open(holder, isNewHolder) {
        this.isNewHolder = isNewHolder;

        this.holder = {
          ...holder,
        };
        delete this.holder.pics;

        this.removedPicsThisSession = [];
        this.holderPics = [];
        this.holderPicFolderId = "";

        this.dialogHolderForm = true;
        this.loadHolderPics();

        return new Promise((resolve) => {
          this.resolve = resolve;
        });
      },

      async saveHolder() {
        try {
          this.isLoading = true
          let response = ''
          if (this.isNewHolder)  {
            response = await apiService.create(this.holder, {model: HOLDER_MODEL});
          } else {
            response = await apiService.updateEntity({_id:this.holder._id}, this.holder, { model: HOLDER_MODEL });
          } 
          if (response) {
            this.dialogHolderForm = false;
            this.isLoading = false;
            this.removedPicsThisSession = [];
            this.resolve(true);
          }
        } catch (error) {
          this.msg = JSON.stringify(error.message);
          setTimeout(() => {
            this.msg = "";
          }, 3000);
          console.log(error);
          this.isLoading = false
        }
      },

      //Background of card
      bck_grnd(item) {
        let classes = item ? "bg-beige" :"";
        return classes;
      },
           
      onFilePicked(file) {
        if (!file) return;
        this.openFile(file.fileId);
      },

      closeHolderForm() {
        this.dialogHolderForm = false;   // סוגר את הדיאלוג המקומי
        this.$emit('close');             // אופציונלי: לאב, אם הוא שולט ב-v-model
      },
      
      async openFile(fileId) {
        await viewGDFile(fileId, this.$refs.modalDialog);
        this.closeHolderForm();
      },

      callCamera() {
        this.$refs.camera.toggleCamera();
      },

      async addMediaItems(media) {
        try {
          this.isUploadingPic = true;

          if (!this.holder.GDParantFolder) {
            window.alert("Missing holder Google Drive folder.");
            return;
          }

          const mediaName = this.askForMediaName(media);
          if (!mediaName) return;

          const response = await SpecificServiceEndPoints.uploadHolderPic({
            ...media,
            name: mediaName,
            parentFolderId: this.holder.GDParantFolder,
          });

          this.holderPics.unshift(response.data.pic);
          this.holderPicFolderId = response.data.pic.folderId || this.holderPicFolderId;
        } catch (error) {
          console.error("Error uploading holder media:", error);
          const responseData = error.response && error.response.data;
          const message = this.isUploadTooLargeError(error)
            ? "The media file is too large. Choose a smaller size or record a shorter video."
            : responseData && responseData.message
            ? `${responseData.message}${responseData.step ? " (step: " + responseData.step + ")" : ""}`
            : error.message;
          window.alert("Error uploading media: " + message);
        } finally {
          this.isUploadingPic = false;
        }
      },

      isUploadTooLargeError(error) {
        return Boolean(
          (error.response && error.response.status === 413) ||
          (error.message && error.message.indexOf("413") !== -1)
        );
      },

      async loadHolderPics() {
        try {
          this.isLoadingPics = true;

          if (!this.holder.GDParantFolder) {
            this.holderPics = [];
            this.holderPicFolderId = "";
            return;
          }

          const response = await SpecificServiceEndPoints.listHolderPics({
            parentFolderId: this.holder.GDParantFolder,
          });

          this.holderPics = response.data.pics || [];
          this.holderPicFolderId = response.data.folderId || "";
        } catch (error) {
          console.log("Error loading holder pics:", error);
          this.holderPics = [];
          this.holderPicFolderId = "";
        } finally {
          this.isLoadingPics = false;
        }
      },

      askForMediaName(media) {
        const defaultType = media && media.mediaType === "video" ? "video" : "pic";
        const defaultName = `holder-${this.holder.flatId || defaultType}-${new Date().toISOString().slice(0, 10)}`;
        const name = window.prompt("Media name", defaultName);

        if (name === null) return null;

        const trimmedName = name.trim();
        if (!trimmedName) {
          window.alert("Media name is required.");
          return null;
        }

        return trimmedName;
      },

      normalizePic(pic) {
        if (typeof pic === "string") {
          return {
            name: pic,
            legacyLocalFilename: pic,
          };
        }

        return pic;
      },

      getMediaPath(pic) {
        const filename = typeof pic === "string" ? pic : pic && pic.legacyLocalFilename;
        return "media_files/" + filename;
      },

      isLocalPic(pic) {
        return typeof pic === "string" || Boolean(pic && pic.legacyLocalFilename);
      },

      getPicKey(pic) {
        return typeof pic === "string" ? pic : (pic && (pic.fileId || pic.legacyLocalFilename));
      },

      removeImg(item) {
        if (!window.confirm("Delete this picture from Google Drive?")) return;

        SpecificServiceEndPoints.deleteHolderPic([item])
          .then(() => {
            this.holderPics = this.holderPics.filter(pic => this.getPicKey(pic) !== this.getPicKey(item));
          })
          .catch((error) => {
            console.log("Error deleting holder pic:", error);
            window.alert("Error deleting picture.");
          });
      },

      async cancelHolderForm() {
        this.dialogHolderForm = false;
        this.removedPicsThisSession = [];
        this.holderPics = [];
        this.holderPicFolderId = "";
      }
    },

    async mounted(){
      this.statusList = ((await loadTable(6)) || [])
        .map((code) => (code.description || '').trim())
        .filter(Boolean)
        .sort()
    },

    computed : {
    }
};
</script>

<style scoped>

.field-margin{
	margin: 12px;
}
.col {
  padding-top: 0px;
  padding-bottom: 0px;
}
.v-card__title {
  align-items: center;
  justify-content: space-evenly;
  padding: 0% !important;
}
.v-text-field >>> input { /* use deep selectors when <style scoped> in Vue */
  text-align-last: right;
  color: blue;
}
.v-text-field >>> textarea {
  color: blue;
}
.bg-beige {
  background-color: beige !important;
}
.centered-input input {
  text-align: center !important;
}

.holder-media-actions {
  padding-top: 8px;
}

.holder-action-button {
  min-width: 42px !important;
  padding: 0 12px !important;
}

.media-files {
  width: 150px;
}

.remove-btn {
  color: red;
  cursor: pointer;
  display: block;
}

.drive-pic {
  cursor: pointer;
  text-align: center;
  color: blue;
}

.drive-pic .caption {
  font-size: 11px;
  word-break: break-word;
}
</style>
