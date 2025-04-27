<template>
      <!-- Add New/Update row dialogHolderForm -->
      <v-dialog v-model="dialogHolderForm" width="600">
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
                    <v-text-field v-model="holder.phone" dense @focus="$event.target.select()"></v-text-field>
                    <!-- <v-select v-model="holder.status" :items="statusList" reverse dense></v-select> -->
                  </v-col>
                  <v-col class="pb-4">
                    <v-text-field v-model="holder.email" dense @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-row class="mx-0">
                    <v-col cols="4">
                      <v-checkbox v-model="holder.payedFile" label="ת.דייר" hide-details></v-checkbox>
                    </v-col>  
                    <v-col cols="4">
                      <v-checkbox v-model="holder.gotOffer" label="ה.מחיר" hide-details></v-checkbox>
                    </v-col>
                    <v-col cols="4">
                      <v-checkbox v-model="holder.payedOffer" label="שולם"></v-checkbox>
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
          <div class="payments-wrapper">
            <div>
              <v-row class="mx-0">
                <v-col style="align-content: center;">
                  <GooglePicker @onFileSelected="setDocument" :GDParantFolder="holder.GDParantFolder"/>
                </v-col>
              </v-row>
            </div>
            <v-container style="padding: 3px;">
              <div v-for="(doc, i) in holder.documents" :key="i" class="text-fields-row">
                <v-row class="mx-0 mt-0" align="center">
                  <v-col cols="7">
                    <v-textarea v-model="doc.description" @focus="$event.target.select()" :messages="doc.fname"
                      auto-grow rows="1"/>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-if="doc.docType === 'Company' || doc.docType === 'Customer'"
                      :value="doc.amount ? doc.amount.toLocaleString() : ''"
                      :messages="['payed by ' + doc.docType]" type="text"
                      @input="val => doc.amount = Number(val.replace(/,/g, ''))"
                    />
                  </v-col>
                  <v-col cols="2" class="d-flex justify-end align-center">
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on" @click="handleDocType(i)" medium>
                          mdi-keyboard-caps
                        </v-icon>
                      </template>
                      <span>{{ doc.docType }}</span>
                    </v-tooltip>
                    <v-icon @click="openFile(doc.fid)" class="mr-2" medium>mdi-eye-outline</v-icon>
                    <v-icon @click="removeDocumentRec(i)" medium>mdi-delete</v-icon>
                  </v-col>
                </v-row>
                <v-divider
                  v-if="i < holder.documents.length - 1"
                  class="strong-divider"
                ></v-divider>
              </div>
            </v-container>
          </div>

          <v-dialog v-model="docTypeDialog" max-width="400">
            <v-card style="direction: rtl;">
              <v-card-title>בחר סוג מסמך</v-card-title>
              <v-card-text>
                <v-radio-group v-model="selectedDocType">
                  <v-radio v-for="(docType, index) in paymentsBy"
                    :key="index"
                    :label="docType"
                    :value="docType"></v-radio>
                </v-radio-group>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="docTypeDialog = false">בטל</v-btn>
                <v-btn color="primary" @click="updateDocType(selectedDocType)" :disabled="!selectedDocType">המשך</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>


          <v-card-actions>
            <v-btn small @click="saveHolder()" :loading="isLoading">
              {{ holder._id ? "שמור" : "שמור חדש" }}
            </v-btn>
            <v-spacer></v-spacer>
            <!-- <v-icon color="red" @click="deleteOne(holder._id, holder.flatId)">mdi-delete</v-icon> -->
            <v-btn small @click="dialogHolderForm = false">בטל</v-btn>
          </v-card-actions>
        </v-card>
        <modal-dialog ref="modalDialog"/>
      </v-dialog>
</template>

<script>
import { HOLDER_MODEL, loadTable, viewGDFile } from "../constants/constants";
import apiService from "../services/apiService";
import Vue from "vue";
import moment from "moment";
import GooglePicker from "./GooglePicker.vue";
import modalDialog from './Common/ViewFileModal.vue';

Vue.filter("formatDate", function (value) {
	if (value) {
    moment.locale('he')
		return moment(value).format("DD/MM/YYYY");
	}
});
export default {
    name: "holder-form",
    components: {GooglePicker,modalDialog},
    data() {
      return {
        dialogHolderForm: false,
        resolve: null,      // What is this for ?
        isLoading: false,
        isNewHolder: false,
        message: '',
        pickerDocIndex: false,
        holder: [],
        statusList: [],
        mitbachList: ['סמל-סטנדט','סמל-שדרוג','אביבי-סטנדט','אביבי-שדרוג','זיכוי'],
        senitarList: ['חרש','סטודיו'],
        paymentsBy: ['Company','Customer'],
        docTypeDialog: false,
        selectedDocType: '',
        selectedDocIndex: null,
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

      async saveHolder() {
        try {
          this.isLoading = true
          let response = ''
          if (this.isNewHolder)  {
            response = await apiService.create(this.holder, {model: HOLDER_MODEL});
          } else {
            response = await apiService.update(this.holder._id, this.holder, { model: HOLDER_MODEL });
          } 
          if (response) {
            this.dialogHolderForm = false;
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
      setDocument(pickedFileInfo) {
        if (pickedFileInfo.action === window.google.picker.Action.PICKED) {
          let selectedFile = pickedFileInfo.docs[0];
          this.holder.documents.push({ 
            docType: selectedFile.type, // get the type of the file
            description: selectedFile.name, 
            fname: selectedFile.name, 
            fid: selectedFile.id, 
            url: selectedFile.url
          });
        }
      },

      async openFile(fileId) {
        await viewGDFile(fileId, this.$refs.modalDialog);
      },

      updateDocType(selectedDocType) {
        if (this.selectedDocIndex !== null) {
          this.holder.documents[this.selectedDocIndex].docType = selectedDocType;
        }
        this.docTypeDialog = false;
        this.selectedDocIndex = null; // Optional: clear after use
      },


      handleDocType(i) {
        this.selectedDocIndex = i;
        this.selectedDocType = this.holder.documents[i].docType;
        this.docTypeDialog = true;
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
    padding-bottom: 10px;
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