<template>
      <!-- Add New/Update row dialogDiaryForm -->
      <v-dialog v-model="dialogDiaryForm" >
        <v-card style="direction: rtl;">
          <v-card-title>
            <span class="text-h7">{{ diary._id ? "עדכון" : "חדש" }}</span>
            <v-spacer></v-spacer>
            <v-col cols="5">
              <v-dialog ref="dateDialog" v-model="dateModal" :return-value.sync="diary.date" persistent width="290px">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="diary.date" label="תאריך" readonly v-bind="attrs" v-on="on">
                  </v-text-field>
                </template>
                <v-date-picker v-model="diary.date" scrollable>
                <!-- <v-date-picker v-model="diary.date" scrollable> -->
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                  <v-btn text color="primary" @click="$refs.dateDialog.save(diary.date)"> OK </v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>
            <v-btn small v-show="diary._id" @click="copyToNew"> Copy </v-btn>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form">
                <v-row>
                  <v-col cols="3">
                    <v-text-field v-model="diary.director" label="מנהל" required dense></v-text-field>
                  </v-col>
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
                    <v-text-field v-model="diary.bagger" label="באגר" required dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.manof" label="מנוף" dense></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="diary.agoran" label="עגורן" required dense></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="diary.yetzikot" label="יציקות" dense></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="diary.homarim" label="חומרים" dense></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="diary.shonot" label="שונות" dense></v-text-field>
                  </v-col>
                  <v-col cols="12" class="no-padding hebrew">
                    <v-textarea v-model="diary.description" label="תאור יום" auto-grow rows="2" dense></v-textarea>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="saveDiary()" :loading="isLoading">
              {{ diary._id ? "Update" : "Save New" }}
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
import Vue from "vue";
import moment from "moment";
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
    name: "diary-form",
    data() {
      return {
        dialogDiaryForm: false,
        resolve: null,      // What is this for ?
        isLoading: false,
        isNewDiary: false,
        message: '',
        options: {
          color: "grey lighten-3",
          width: 500,
          zIndex: 200,
        },
        dateModal : false,
        invoiceID: 0,

        diary: [],
      };
    },

    methods: {
      open(diary, isNewDiary) {
        this.isNewDiary = isNewDiary;
        this.diary = diary 
        this.diary.date = moment(this.diary.date).format('YYYY-MM-DD');
        this.dialogDiaryForm = true;
        return new Promise((resolve) => {
          this.resolve = resolve;
        });
      },

      copyToNew() {
        this.isNewDiary = true
        this.diary._id = null
        this.diary.published = false
      },

      // saveDiary: async function () {
      async saveDiary() {
        try {
          this.isLoading = true
          let response = ''
          if (this.isNewDiary)  {
            response = await apiService.create(this.diary, {model: DIARY_MODEL});
          } else {
            response = await apiService.update(this.diary._id, this.diary, { model: DIARY_MODEL });
          } 
          if (response) {
            this.dialogDiaryForm = false;
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

    },

    async mounted(){

    }
};
</script>

<style scoped>

.field-margin{
	margin: 12px;
}

.padding-date{
  padding-left: 0px !important ;
  padding-right: 0px !important ;
}

.v-input--checkbox {
  margin-top: 0px !important;
}
.payments-wrapper{
    border: 3px solid #85a7ff;
    margin-left: 5px !important;
    margin-right: 5px !important;
}
.hebrew {
  direction: rtl;
  text-align-last: right;
}
.col {
  padding-top: 0px;
  padding-bottom: 20px;
}
.input {
  color: blue;
}
</style>