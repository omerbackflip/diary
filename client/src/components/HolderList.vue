<template>
  <div class="list row hebrew">
    <v-layout style="padding: 5px;">
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="holderList"
          :search="search"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="mt-0 hebrew custom-headers"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          loader-height="20"
          @click:row="getHolderForEdit"
          item-key="_id"
          :sort-by="['flatId']"
          dense>
          <template v-slot:top>
              <v-toolbar flat style="height: 26px;">
                <!-- <v-col class="pa-0" cols="5">
                  <v-toolbar-title>  תיק דיירים  </v-toolbar-title>
                </v-col> -->
              <v-text-field v-model="search" label="הקלד מילת חיפוש"></v-text-field>
                <!-- <v-col class="pa-0" cols="3"> -->
                  <!-- <v-toolbar-title style="text-align-last: center; color: blue;"> סה"כ {{holderList.length.toLocaleString()}} </v-toolbar-title> -->
                <!-- </v-col> -->
              </v-toolbar>
          </template>
          <template v-slot:item ="{ item, headers }">
            <tr style="border-bottom: hidden;" @click="getHolderForEdit(item)">
              <td style="text-align-last: center;">
                <span>{{item.flatId.substr(4, 2)}}</span>
              </td>
              <td>
                <span>{{item.name}}</span>
              </td>
              <td>
                <span>{{item.status}}</span>
              </td>
              <td>
                <span>{{ item.mitbach }}</span>
              </td>
              <td>
                <span>{{ item.senitar }}</span>
              </td>
              <td>
                <v-checkbox v-model="item.payedFile" hide-details color="green" readonly></v-checkbox>
              </td>
              <td>
                <v-checkbox v-model="item.gotOffer" hide-details color="green" readonly></v-checkbox>
              </td>
              <td>
                <v-checkbox v-model="item.payedOffer" hide-details color="green" readonly></v-checkbox>
              </td>
            </tr>
            <tr>
              <td :colspan="headers.length" @click="getHolderForEdit(item)" style="text-align: center">
                <span>{{item.remark}}</span>
              </td>            
            </tr>
          </template>
          <template v-slot:footer>
            <div style="width: 100%; place-items: center;; padding: 12px; border-top: 1px solid #ddd; 
                  background-color: #f9f9f9; font-size: 14px; font-weight: 600; color: #555;">
              <div style="margin-bottom: 5px;">
                סיכום מטבחים:
                <span v-for="(count, i) in totalMitbachSummary" :key="i" style="margin: 0 8px;">
                  {{ count }}
                </span>
              </div>
              <div>
                סיכום סניטרים:
                <span v-for="(count, i) in totalSenitarSummary" :key="i" style="margin: 0 8px;">
                  {{ count }}
                </span>
              </div>
            </div>
          </template>

        </v-data-table>
      </v-flex>

      <holder-form ref="holderForm"/>
      <billForm :showBill="showBill" :holder="holder"/>
    </v-layout>
  </div>
</template>



<script>
import apiService from "../services/apiService";
import { HOLDER_MODEL, HOLDER_MOBILE_HEADERS, NEW_HOLDER, sendWhatsapp } from "../constants/constants";
import holderForm from "./HolderForm.vue"
import { isMobile } from '../constants/constants';
import billForm from './BillForm.vue';

export default {
	name: "holder-List",
	components: { holderForm, billForm },
	data() {
		return {
      isMobile,
      sendWhatsapp,
			holderList: [],
			dialog: false,
			search: "",
			headers: [],
			holder: [],
			msg: "",
			isLoading: true,
			itemToEdit: "",
      dateModal : false,
      selected: [],
      showBill: false,
		};
	},

	methods: {
		getHeaders() {
			if (this.isMobile()) {
				return HOLDER_MOBILE_HEADERS;
			} else {
				return HOLDER_MOBILE_HEADERS;
			}
		},

    async retrieveHolders() {
      this.isLoading = true;
      const response = await apiService.getMany({
        model: HOLDER_MODEL,
      });
      this.holderList = response.data
        .filter(item => item.name)
        .map(item => {
          const totals = {};
          (item.documents || []).forEach(doc => {
            const type = doc.docType;
            const amount = doc.amount || 0;
            if (!totals[`total${type}`]) {
              totals[`total${type}`] = 0;
            }
            totals[`total${type}`] += amount;
          });
          return {...item,...totals};
        });
      this.isLoading = false;
    },

    // get holder data before call to holderForm for edit
		async getHolderForEdit(item) {
			if (item._id) {
        this.holder = item
        await this.$refs.holderForm.open(this.holder, false);
        this.retrieveHolders();
			}
		},
	},

	async mounted() {
		this.retrieveHolders();
    this.$root.$on("addNewHolder", async () => {
      this.holder = NEW_HOLDER;
      await this.$refs.holderForm.open(this.holder, true);
		});

	},
	
  watch: {

	},

  computed: {
    totalMitbachSummary() {
      const summary = {};
      let total = 0;
      this.holderList.forEach(item => {
        if (item.mitbach) {
          total++;
          summary[item.mitbach] = (summary[item.mitbach] || 0) + 1;
        }
      });
      return { total, summary };
    },
    
    totalSenitarSummary() {
      const summary = {};
      let total = 0;
      this.holderList.forEach(item => {
        if (item.senitar) {
          total++;
          summary[item.senitar] = (summary[item.senitar] || 0) + 1;
        }
      });
      return { total, summary };
    }
  }

};
</script>

<style >
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
  cursor: pointer;
}

.mobile-headers {
  font-size: 11px !important;
}

td {
  /* font-size: 13px !important; */
  padding: 0px !important;
}

.expantion-button {
  padding-left: 22px !important;
}

.font-size-mobile {
  font-size: 8px !important;
  padding: 1px 3px 1px 3px !important;
}

.mobile-search {
  margin-top: 5px !important;
  margin-bottom: -30px;
}

.mt-4 {
  margin-top: 15px !important;
}

.table-margin {
  margin-top: 0px;
}

.margin-card {
  /* margin: -25px; */
  padding-top: 20px !important;
}

.v-card__text{
  padding-bottom: 0px !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
}

th > i {
  display: none !important;
}

.d-grid {
  display: grid;
}

.amount-width {
  width: 100% !important;
  padding-right: 10px;
}
.description-width {
  width: 100% !important;
  /* text-align: -webkit-right; */
  direction: rtl;
}

.text-start > .v-data-table__expand-icon {
  width: 100% !important;
}

.table-margin-web{
	margin-top: 9px;
}

.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    color: rgba(0, 0, 0, 0.6);
    white-space: nowrap;
}
.v-data-table__wrapper {
  margin-top: 20px !important;
}

.date-text{
  font-size: 12px !important;
}

.input-container input {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    font-size: 12px;
    border: 1px solid #5d5d5d;
    border-radius: 7px;
    padding: 8px 14px 8px 14px;
    margin-top: 12px;
}

.hdr-styles{
	background: red !important;
	color: white !important;
}

.v-dialog{
    max-width: 600px;
    margin-top: 10px;
    margin-bottom: 10px;
    max-height: 70%;
}
.v-toolbar__title {
    /* font-siz e: 1rem; */
    direction: rtl;
    white-space: pre-wrap;
    text-align: right;
}
.sreach-width {
  width: 4rem;
  margin-top: 1.5rem !important;
}
.no-padding {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  text-align-last: end;
}
.hebrew {
  direction: rtl;
  text-align-last: right;
}

.v-input--checkbox {
  padding: 0px;
  margin: 0px;
}

/* Rotate only headers with the specific class */
.custom-headers th.rotated-header {
  writing-mode: vertical-rl;
  text-align-last: center;
  transform: rotate(180deg); /* Optional: Flip the text for proper orientation */
  white-space: nowrap; /* Ensure text doesn't wrap */
  padding: 0px !important;
}

.v-input__slot {
  justify-content: space-around;
}

.desc-oflow {
  overflow: hidden;
  white-space:nowrap;
  /* text-overflow:ellipsis;
  width:150px;
  display:inline-block;
  font-size: smaller; */
  color: blue;
  place-content: center;
}

.cntr{
  text-align-last: center;
}

.boxsize50 {
  height: 50px;
  width: 85px;
}
.boxsize100 {
  height: 50px;
  width: 165px;
  justify-self: center;
}
.j-center {
  justify-items: center;
}
.green-icon {
  background-color: lightgreen;
  color: white !important; /* Optional: Change icon color for better visibility */
  border-radius: 100%; /* Optional: Makes the background circular */
  padding: 0px; /* Optional: Adds spacing around the icon */
}
</style>
