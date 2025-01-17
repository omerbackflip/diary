<template>
      <!-- Add New/Update row dialogHolderForm -->
      <v-dialog v-model="dialogHolderForm" width="500">
        <v-card style="direction: rtl;" :class="bck_grnd(holder._id)">
          <v-card-text style="padding: 0px;">
            <v-container>
              <v-form ref="form">
                <v-row>
                  <v-col cols="3" class="pb-4">
                    <v-text-field v-model="holder.flatId" dense @focus="$event.target.select()" :disabled="!isNewHolder"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="holder.name" dense @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="5">
                      <v-select v-model="holder.status" :items="statusList" reverse dense></v-select>
                  </v-col>
                  <!-- <v-col cols="4">
                    <v-text-field v-model="holder.GDParantFolder" dense @focus="$event.target.select()"></v-text-field>
                  </v-col> -->
                  <v-row>
                    <v-col cols="3">
                      <v-checkbox v-model="holder.payedFile" label="ת.דייר" hide-details></v-checkbox>
                    </v-col>  
                    <!-- <v-col cols="3">
                      <v-checkbox v-model="holder.sendPlans" label="תוכניות" hide-details></v-checkbox>
                    </v-col> -->
                    <v-col cols="3">
                      <v-checkbox v-model="holder.gotOffer" label="ה.מחיר" hide-details></v-checkbox>
                    </v-col>
                    <v-col cols="3">
                      <v-checkbox v-model="holder.payedOffer" label="שולם" hide-details></v-checkbox>
                    </v-col>
                  </v-row>   
                  <v-row>
                    <v-col cols="3">
                      <v-checkbox v-model="holder.bniya" label="בניה"></v-checkbox>
                    </v-col>  
                    <v-col cols="3">
                      <v-checkbox v-model="holder.hashmal" label="חשמל"></v-checkbox>
                    </v-col>
                    <v-col cols="3">
                      <v-checkbox v-model="holder.mitbach" label="מטבח"></v-checkbox>
                    </v-col>
                    <v-col cols="3">
                      <v-checkbox v-model="holder.senitar" label="סניטר"></v-checkbox>
                    </v-col>
                  </v-row>             
                  <!-- <v-col cols="8">
                    <v-text-field v-model="holder.email" dense @focus="$event.target.select()"></v-text-field>
                  </v-col> -->
                  <v-col cols="12">
                    <v-textarea v-model="holder.remark" :label="holder.remark ? '' : 'עדכון אחרון...'" auto-grow rows="1" @focus="$event.target.select()" dense></v-textarea>
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
                  <v-btn @click="addDocumentRow" class="primary" x-small><v-icon small>mdi-plus</v-icon></v-btn>
              </v-col>
            </v-row>
            </div>
            <v-container style="padding: 3px;">
                <div v-for="(doc, i) in holder.documents" :key="i" class="text-fields-row">
                  <v-row style="justify-content: space-around;">
                    <v-col cols="10">
                      <v-textarea v-model="doc.description" auto-grow rows="1" @focus="$event.target.select()" 
                                  :messages="doc.fname"></v-textarea>
                    </v-col>
                    <v-col cols="12" style="text-align: -webkit-left;" class="pb-4">
                      <GooglePicker :GDFileId="doc.fid" :pickerNo="i" @onFileSelected="setDocument" :GDParantFolder="holder.GDParantFolder"/>
                      <v-icon @click="removeDocumentRec(i)" small>mdi-delete</v-icon>
                    </v-col>
                  </v-row>
                  <v-divider v-if="i < holder.documents.length - 1" class="strong-divider"></v-divider>
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
//import GooglePicker from "google-drive-picker";
import GooglePicker from "./GooglePicker.vue";

Vue.filter("formatDate", function (value) {
	if (value) {
    moment.locale('he')
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
    name: "holder-form",
    components: {
      GooglePicker,
    },
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
        pickerDocIndex: false,
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
            // console.log(this.holder)
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
        this.holder.documents.push({ docType: "", description: "", fname: "", fid: "", url: ""});
      },
      removeDocumentRec(index) {
        if (window.confirm("אשר מחיקת מסמך")) {
          this.holder.documents.splice(index, 1);
        }
      },
      setDocument(data, pickerNo) {
        //console.log('setDocument',data);
        if (data.action === window.google.picker.Action.PICKED) {
          let selectedFile = data.docs[0];
          
          // console.log('Picked File:', data);
          // console.log('Picked File:', selectedFile);

          this.holder.documents[pickerNo]['fid'] = selectedFile.id;
          this.holder.documents[pickerNo]['docType'] = selectedFile.type;
          this.holder.documents[pickerNo]['fname'] = selectedFile.name;
          this.holder.documents[pickerNo]['url'] = selectedFile.url;
          this.holder.documents[pickerNo]['description'] = selectedFile.description != "" ? selectedFile.description : selectedFile.name;
        }
      },

      openPicker() {
        this.$emit('GooglePicker', {GDFileId:"doc.fid" , pickerNo:"i" , onFileSelected:"setDocument" , GDParantFolder:"holder.GDParantFolder"})
      }
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
.media-files{
  width: 150px;
}
.payments-wrapper{
    border: 2px solid #85a7ff;
    margin-left: 5px !important;
    margin-right: 5px !important;
}

.small-checkbox {
  font-size: 12px; /* Smaller label */
  transform: scale(0.75); /* Shrinks the checkbox */
}
.strong-divider {
  border-top-width: 5px;
  border-top-color: blue;
}
</style>