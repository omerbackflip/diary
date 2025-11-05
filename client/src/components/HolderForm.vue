<template>
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
                    <v-select v-model="holder.status" :items="statusList" reverse dense></v-select>
                  </v-col>
                  <v-col class="pb-4" cols="8">
                    <v-text-field v-model="holder.email" dense @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col class="pb-4 pr-0" cols="4">
                    <v-text-field v-model="holder.phone" dense @focus="$event.target.select()"></v-text-field>
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
          <v-col style="align-content: center;">
            <GooglePicker @onViewPicked="viewPicked" :GDParantFolder="holder.GDParantFolder"/>
          </v-col>

          <v-card-actions>
            <v-btn small @click="saveHolder()" :loading="isLoading">
              {{ holder._id ? "שמור" : "שמור חדש" }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn small @click="dialogHolderForm = false">בטל</v-btn>
          </v-card-actions>
        </v-card>
        <modal-dialog ref="modalDialog"/>
      </v-dialog>
</template>

<script>
import { HOLDER_MODEL, loadTable, viewGDFile } from "../constants/constants";
import apiService from "../services/apiService";
import GooglePicker from "./GooglePicker.vue";
import modalDialog from './Common/ViewFileModal.vue';

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
            response = await apiService.updateEntity({_id:this.holder._id}, this.holder, { model: HOLDER_MODEL });
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

      //Background of card
      bck_grnd(item) {
        let classes = item ? "bg-beige" :"";
        return classes;
      },
           
      viewPicked(pickedFileInfo) {
        if (pickedFileInfo.action === window.google.picker.Action.PICKED) {
          const selected = pickedFileInfo.docs && pickedFileInfo.docs[0];
          if (selected && selected.id) {
            this.openFile(selected.id);
          }
        }
      },

      closeHolderForm() {
        this.dialogHolderForm = false;   // סוגר את הדיאלוג המקומי
        this.$emit('close');             // אופציונלי: לאב, אם הוא שולט ב-v-model
      },
      
      async openFile(fileId) {
        await viewGDFile(fileId, this.$refs.modalDialog);
        this.closeHolderForm();
      },
    },

    async mounted(){
      this.statusList = (await loadTable(6)).map((code) => code.description).sort()
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
</style>