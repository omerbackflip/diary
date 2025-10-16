<template>
      <!-- Add New/Update row dialogDiaryForm -->
      <v-dialog v-model="dialogDiaryForm" width="500">
        <v-row v-if="isDisplayMedia" style="background-color: beige; margin-left: 0px;">
          <v-col cols="4" v-for="(pic,i) in diary.pics" :key="i">
            <img class="media-files" v-bind:src="getMediaPath(pic)" />
            <span class="remove-btn" @click="removeImg(pic)"><strong>Remove</strong></span>
          </v-col>
        </v-row>

        <v-card style="direction: rtl;" :class="bck_grnd(diary._id)">
          <v-card-title>
            <v-icon v-if="getTotalMediaCount()>0" @click="toggleMedia()">{{`mdi-numeric-${getTotalMediaCount() > 10 ? 10 : getTotalMediaCount()}`+"-box-multiple-outline"}}</v-icon>
            <span class="mdi mdi-camera" @click="callCamera()"></span>

            <!--  Date  -->
            <v-col cols="5" style="padding-bottom: 0px;">
              <v-dialog ref="dateDialog" v-model="dateModal" :return-value.sync="diary.date" persistent width="290px">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="diary.date" readonly v-bind="attrs" v-on="on" hide-details 
                                style="padding-top: 0px; margin-top: -4px;">
                  </v-text-field> {{displayDay}}
                </template>
                <v-date-picker v-model="diary.date" scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                  <v-btn text color="primary" @click="$refs.dateDialog.save(diary.date)"> OK </v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>

            <!-- <v-btn small v-show="diary._id" @click="copyToNew"> Copy </v-btn> -->
          </v-card-title>

          <v-card-text>
            <v-container>
              
              <!-- <v-row v-if="isUploadMedia"> -->
                <camera ref="camera" @new-media-added="addMediaItems" style="border-block: none;"></camera>
              <!-- </v-row> -->

              <v-form ref="form">
                <v-row>
                  <v-col cols="3">
                    <v-text-field v-model="diary.poalim" label="פועלים" dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.traktor" label="טרקטור" required dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.shufel" label="שופל" dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.bagger" label="באגר" dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.manof" label="מנוף" dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.manitu" label="פסולת" dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.agoran" label="עגורן" dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.pipe" label="משאבה" dense></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="diary.yetzikot" label="יציקות" auto-grow rows="1" dense></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="diary.homarim" label="חומרים" auto-grow rows="1" dense></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="diary.shonot" label="שונות" auto-grow rows="1" dense></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="diary.description" label="תאור יום" auto-grow rows="1" dense></v-textarea>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="saveDiary()" :loading="isLoading">
              {{ diary._id ? "Save" : "Save New" }}
            </v-btn>
            <v-btn small v-show="!invoiceID" class="mx-3" @click="clearForm"> Clear </v-btn>
            <v-spacer></v-spacer>
            <v-icon color="red" @click="deleteOne(diary._id, diary.description)">mdi-delete</v-icon>
            <v-icon color="red" @click="dialogDiaryForm = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script>
import { DIARY_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import SpecificServiceEndPoints from "../services/specificServiceEndPoints";
import Vue from "vue";
import Camera from "./Camera.vue";
import moment from "moment";
Vue.filter("formatDate", function (value) {
	if (value) {
    moment.locale('he')
		//return return moment(value).format('MM/DD/YYYY hh:mm')
		return moment(value).format("DD/MM/YYYY");
	}
});
export default {
  components: { Camera },
    name: "diary-form",
    data() {
      return {
        dialogDiaryForm: false,
        resolve: null,      // What is this for ?
        isLoading: false,
        isNewDiary: false,
        isUploadMedia: true,
        isDisplayMedia: false,
        message: '',
        dateModal : false,
        invoiceID: 0,
        diary: [],
        newPicsList: [],
      };
    },

    methods: {
      open(diary, isNewDiary) {
        this.isNewDiary = isNewDiary;
        this.diary = diary 
        if(diary.medias && diary.medias.length > 0){
          var mediaCounter = -1;
          diary.medias = diary.medias.map((media) => {
            mediaCounter++;
            return {filename: media.filename, id: mediaCounter, source: 'disk'};
          });
        }
        this.isDisplayMedia = false
        this.diary.date = moment(this.diary.date).format('YYYY-MM-DD');
        this.dialogDiaryForm = true;
        return new Promise((resolve) => {
          this.resolve = resolve;
        });
      },

      copyToNew() {
        this.isNewDiary = true
        this.diary._id = null
      },

      // saveDiary: async function () {
      async saveDiary() {
        try {
          this.isLoading = true
          let response = ''
          // this.diary.medias = this.newPicsList.map((newPic) => {
          //     return {fileContent: newPic.fileContent};
          // });

          if (this.isNewDiary)  {
            response = await apiService.create(this.diary, {model: DIARY_MODEL});
          } else {
            response = await apiService.updateEntity({_id:this.diary._id}, this.diary, { model: DIARY_MODEL });
          } 
          if (response) {
            this.dialogDiaryForm = false;
            this.newPicsList = [];
            this.isLoading =  false;
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

      async deleteOne(id, description) {
        if (window.confirm(`Are you sure you want to delete this item ? ` + description)) {
          const response = await apiService.deleteOne({model: DIARY_MODEL,id});
          if (response) {
            this.dialogDiaryForm = false;
          }
        }
      },

      clearForm() {
        this.$refs.form.reset();
      },

      //Background of card
      bck_grnd(item) {
        let classes = item ? "bg-beige" :"";
        return classes;
      },
      callCamera(){
        //this.isUploadMedia = this.isUploadMedia == true ? false : true;
        this.$refs.camera.toggleCamera();
      },
      toggleMedia(){
        this.isDisplayMedia = !this.isDisplayMedia;
      },
      async addMediaItems(media){
        let picName = await SpecificServiceEndPoints.savePic(media);
        this.diary.pics.push(picName.data)
        this.isDisplayMedia = true;
      },
      getMediaPath(filename){
        return 'media_files/' + filename;
      },
      getTotalMediaCount(){
        return this.diary.pics !== undefined ? this.diary.pics.length : 0
      },
      async removeImg(item) {
        this.diary.pics = this.diary.pics.filter((item1) => {
          return item1 != item
        })
        let fileName = [item]
        let response = await SpecificServiceEndPoints.deletePic(fileName) // remove pic from media-files
        console.log("response", response)
      },
    },

    async mounted(){
    },

    computed : {
      displayDay: function () {
        return moment(this.diary.date).format('dddd')
      }
    }
};
</script>

<style scoped>

.field-margin{
	margin: 12px;
}
.col {
  padding-top: 0px;
  padding-bottom: 20px;
}
.v-card__title {
  align-items: center;
  justify-content: space-evenly;
  padding: 0% !important;
}
.v-text-field >>> input { /* use deep selectors when <style scoped> in Vue */
  text-align-last: center;
  color: blue;
}
.v-text-field >>> textarea {
  color: blue;
}
.bg-beige {
  background-color: beige !important;
}
.media-files{
  width: 150px;
}
.remove-btn {
  /* display: none; */
  color: red;
  cursor: pointer;
}
</style>