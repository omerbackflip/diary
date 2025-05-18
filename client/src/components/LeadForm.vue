<template>
      <v-dialog v-model="dialogLeadForm" width="500">
        <v-card style="direction: rtl;" :class="bck_grnd(lead._id)">
          <v-card-title>
            <!--  Date  -->
            <!-- <v-col cols="5" style="padding-bottom: 0px;">
              <v-dialog ref="dateDialog" v-model="dateModal" :return-value.sync="lead.last_update" persistent width="290px">
                <v-date-picker v-model="lead.last_update" scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                  <v-btn text color="primary" @click="$refs.dateDialog.save(lead.last_update)"> OK </v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col> -->

            <!-- <v-btn small v-show="lead._id" @click="copyToNew"> Copy </v-btn> -->
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-form ref="form">
                <v-row>
                  <v-col cols="4">
                    <v-text-field v-model="lead.name" label="שם" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="lead.adName" label="מודעה" disabled></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="lead.phone" label="טלפון" @focus="$event.target.select()"
                                  append-icon="mdi-whatsapp" @click:append="sendWhatsapp(lead.phone)" style="font-size: small;"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-combobox v-model="lead.arrivedFrom" :items="arrivedList" label="הגיע אלינו מ.." reverse :allow-overflow="false" dense></v-combobox>
                  </v-col>
                  <v-col cols="4">
                    <v-combobox v-model="lead.status" :items="statusList" label="סטטוס" reverse :allow-overflow="false" dense></v-combobox>
                  </v-col>
                  <v-col cols="4">
                    <v-combobox v-model="lead.interested" :items="interestedList" label="מעוניין ב.." reverse :allow-overflow="false" dense></v-combobox>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="lead.email" label="Email" @focus="$event.target.select()" dense></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="lead.description" label="תאור" auto-grow rows="1" @focus="$event.target.select()" dense></v-textarea>
                  </v-col>
                  <v-col cols="8">
                    <v-textarea v-model="lead.trackRemark" label="הערת מעקב" auto-grow rows="1" @focus="$event.target.select()" dense></v-textarea>
                  </v-col>
                  <!--  Date  -->
                  <v-col cols="4" style="padding-bottom: 0px;">
                    <v-dialog ref="dateDialog" v-model="dateModal" :return-value.sync="lead.trackDate" persistent width="290px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="lead.trackDate" readonly v-bind="attrs" v-on="on"
                                      style="padding-top: 0px;" label="ת. מעקב" clearable @click:clear="clearDate">
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="lead.trackDate" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                        <v-btn text color="primary" @click="$refs.dateDialog.save(lead.trackDate)"> OK </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="saveDiary()" :loading="isLoading">
              {{ lead._id ? "Save" : "Save New" }}
            </v-btn>
            <v-btn small v-show="!invoiceID" class="mx-3" @click="clearForm"> Clear </v-btn>
            <v-spacer></v-spacer>
            <v-icon color="red" @click="deleteOne(lead._id, lead.description)">mdi-delete</v-icon>
            <v-icon color="red" @click="dialogLeadForm = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script>
import { LEAD_MODEL, sendWhatsapp, loadTable } from "../constants/constants";
import apiService from "../services/apiService";
import Vue from "vue";
import moment from "moment";
Vue.filter("formatDate", function (value) {
	if (value) {
    moment.locale('he')
		//return moment(value).format('MM/DD/YYYY hh:mm')
		return moment(value).format("DD/MM/YYYY");
	}
});
export default {
    name: "lead-form",
    data() {
      return {
        sendWhatsapp,
        dialogLeadForm: false,
        resolve: null,      // What is this for ?
        isLoading: false,
        isNewLead: false,
        isUploadMedia: true,
        isDisplayMedia: false,
        message: '',
        dateModal : false,
        invoiceID: 0,
        lead: [],
        newPicsList: [],
        statusList: [],
        arrivedList: [],
        interestedList: [],
      };
    },

    methods: {
      open(lead, isNewLead) {
        this.isNewLead = isNewLead;
        this.lead = lead 
        this.lead.last_update = moment(this.lead.last_update).format('YYYY-MM-DD');
        this.lead.trackDate = this.lead.trackDate ? moment(this.lead.trackDate).format('YYYY-MM-DD') : null;
        this.dialogLeadForm = true;
        return new Promise((resolve) => {
          this.resolve = resolve;
        });
      },

      copyToNew() {
        this.isNewLead = true
        this.lead._id = null
      },

      // saveDiary: async function () {
      async saveDiary() {
        try {
          this.isLoading = true
          let response = ''
          // this.lead.medias = this.newPicsList.map((newPic) => {
          //     return {fileContent: newPic.fileContent};
          // });

          if (this.isNewLead)  {
            response = await apiService.create(this.lead, {model: LEAD_MODEL});
          } else {
            response = await apiService.update(this.lead._id, this.lead, { model: LEAD_MODEL });
          } 
          if (response) {
            this.dialogLeadForm = false;
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
          const response = await apiService.deleteOne({model: LEAD_MODEL,id});
          if (response) {
            this.dialogLeadForm = false;
          }
        }
      },

      clearForm() {
        this.$refs.form.reset();
      },

      clearDate() {
        this.lead.trackDate = null;
        this.lead.trackRemark = null;
      },

      //Background of card
      bck_grnd(item) {
        let classes = item ? "bg-beige" :"";
        return classes;
      },

    },

    async mounted(){
      this.interestedList = (await loadTable(2)).map((code) => code.description)
      this.statusList = (await loadTable(9)).map((code) => code.description)
      this.arrivedList = (await loadTable(5)).map((code) => code.description)
    },

    computed : {
      displayDay: function () {
        return moment(this.lead.last_update).format('dddd')
      }
    }
};
</script>

<style scoped>

.field-margin{
	margin: 12px;
}

/* .hebrew {
  direction: rtl;
  text-align-last: right;
} */
.col {
  padding-top: 0px;
  padding-bottom: 20px;
}
.v-card__title {
  align-items: center;
  justify-content: space-evenly;
  padding: 0% !important;
}
.v-text-field >>> input {/* use deep selectors when <style scoped> in Vue */
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