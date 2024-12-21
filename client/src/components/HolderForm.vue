<template>
      <!-- Add New/Update row dialogHolderForm -->
      <v-dialog v-model="dialogHolderForm" width="500">
        <v-card style="direction: rtl;" :class="bck_grnd(holder._id)">
          <v-card-text style="padding: 0px;">
            <v-container>
              <v-form ref="form">
                <v-row>
                  <v-col cols="3">
                    <v-text-field v-model="holder.flatId" dense @focus="$event.target.select()" :disabled="!isNewHolder"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="holder.name" dense @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="5">
                    <v-text-field v-model="holder.phone" dense @focus="$event.target.select()" 
                                  append-icon="mdi-whatsapp" @click:append="sendWhatsapp(holder.phone)" style="font-size: small;"></v-text-field>
                  </v-col>
                  <v-col cols="12" class="combo">
                    <v-checkbox v-model="holder.payedFile" label="תיק דיירים" class="small-checkbox" hide-details></v-checkbox>
                  </v-col>                  
                  <v-col cols="8">
                    <v-text-field v-model="holder.email" label="אימייל" dense @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                      <v-combobox v-model="holder.status" :items="statusList" reverse dense/>
                  </v-col>
                  <v-col cols="3" class="combo">
                    <v-checkbox hide-details label="בניה"></v-checkbox>
                  </v-col>
                  <v-col cols="3" class="combo">
                    <v-checkbox hide-details label="חשמל"></v-checkbox>
                  </v-col>
                  <v-col cols="3" class="combo">
                    <v-checkbox hide-details label="מטבח"></v-checkbox>
                  </v-col>
                  <v-col cols="3" class="combo">
                    <v-checkbox hide-details label="סניטרים"></v-checkbox>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="holder.remark" label="עדכון אחרון..." auto-grow rows="1" @focus="$event.target.select()" dense></v-textarea>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <div class="payments-wrapper">
            <div>
              <v-row>
                <v-col>
                <v-subheader>מסמכים</v-subheader>
              </v-col>
                <v-col style="align-content: center;">
                  <v-btn @click="addDocumentRow" class="primary" x-small><v-icon small >mdi-plus</v-icon></v-btn>
              </v-col>
            </v-row>
            </div>
            <v-container style="padding: 3px;">
                <div v-for="(doc, i) in holder.documents" :key="i" class="text-fields-row">
                  <v-row style="padding-bottom: 15px;">
                    <v-col cols="10">
                      <v-textarea v-model="doc.description" auto-grow rows="1" hide-details @focus="$event.target.select()"
                                  ></v-textarea>
                    </v-col>
                    <v-col cols="2" style="padding-right: 0px; align-content: center;">
                      <v-icon small>mdi-file</v-icon>
                      <v-icon @click="removeDocumentRec(i)" small>mdi-delete</v-icon>
                    </v-col>
                    <!-- <v-divider></v-divider> -->
                  </v-row>
                </div>                    
            </v-container>
          </div>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="saveHolder()" :loading="isLoading">
              {{ holder._id ? "Save" : "Save New" }}
            </v-btn>
            <v-btn small v-show="!invoiceID" class="mx-3" @click="clearForm"> Clear </v-btn>
            <v-spacer></v-spacer>
            <v-icon color="red" @click="deleteOne(holder._id, holder.flatId)">mdi-delete</v-icon>
            <v-icon color="red" @click="dialogHolderForm = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script>
import { HOLDER_MODEL, loadTable, sendWhatsapp } from "../constants/constants";
import apiService from "../services/apiService";
import Vue from "vue";
import moment from "moment";
Vue.filter("formatDate", function (value) {
	if (value) {
    moment.locale('he')
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
    name: "holder-form",
    data() {
      return {
        sendWhatsapp,
        dialogHolderForm: false,
        resolve: null,      // What is this for ?
        isLoading: false,
        isNewHolder: false,
        isUploadMedia: true,
        isDisplayMedia: false,
        message: '',
        dateModal : false,
        invoiceID: 0,
        holder: [],
        newPicsList: [],
        statusList: [],
      };
    },

    methods: {
      open(holder, isNewHolder) {
        this.isNewHolder = isNewHolder;
        this.holder = holder 
        this.dialogHolderForm = true;
        return new Promise((resolve) => {
          this.resolve = resolve;
        });
      },

      // saveHolder: async function () {
      async saveHolder() {
        try {
          this.isLoading = true
          let response = ''
          if (this.isNewHolder)  {
            response = await apiService.create(this.holder, {model: HOLDER_MODEL});
          } else {
            response = await apiService.update(this.holder._id, this.holder, { model: HOLDER_MODEL });
            console.log(this.holder)
          } 
          if (response) {
            this.dialogHolderForm = false;
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
          const response = await apiService.deleteOne({model: HOLDER_MODEL,id});
          if (response) {
            this.dialogHolderForm = false;
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
      addDocumentRow() {
        this.holder.documents.push({ docType: "", description: "", fname: "" });
      },
      removeDocumentRec(index) {
        if (window.confirm("אשר מחיקת מסמך")) {
          this.holder.documents.splice(index, 1);
        }
      },
    },

    async mounted(){
      this.statusList = (await loadTable(6)).map((code) => code.description)
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
.v-text-field{input 
  {
    text-align-last: right;
    color: blue;
  }
}
/* .v-text-field{textarea  
  {
    color: blue;
  }
} */
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
.payments-wrapper{
    border: 3px solid #85a7ff;
    margin-left: 5px !important;
    margin-right: 5px !important;
}
.checkbox-with-top-label {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center-align the label and checkbox */
}

.checkbox-label {
  margin-bottom: 8px; /* Add spacing between label and checkbox */
  font-size: 14px;
  text-align: center;
}
.combo {
  padding: 0px;
}
</style>