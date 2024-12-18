<template>
  <div class="list row">
    <v-layout style="padding: 0px;">
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="holderList"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0 hebrew custom-headers"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          loader-height="20"
          @click:row="getHolderForEdit"
          item-key="_id"
          :sort-by="['flatId']"
          dense>
          <template v-slot:top>
              <v-toolbar flat>
                <v-col class="pa-0" cols="5">
                  <v-toolbar-title style="background-color: lightgreen;">  תיק דיירים שולם </v-toolbar-title>
                  <!-- <v-img aspect-ratio="5.778" src="@/assets/color-flat.jpg"></v-img> -->
                </v-col>
                <v-spacer></v-spacer>
                <v-col class="pa-0" cols="3">
                  <v-toolbar-title style="text-align-last: center; color: blue;"> סה"כ {{holderList.length.toLocaleString()}} </v-toolbar-title>
                </v-col>
              </v-toolbar>
          </template>
          <template v-slot:item ="{ item, headers }">
          <tr style="border-bottom: hidden;" @click="getHolderForEdit(item)">
            <td :class="`${item.status}`">
              <span>{{item.flatId}}</span>
            </td>
            <td>
              <span>{{item.name}}</span>
            </td>   
            <td>
              <v-checkbox hide-details style="justify-items: center;"></v-checkbox>
            </td>
            <td>
              <v-checkbox hide-details style="justify-items: center;"></v-checkbox>
            </td>
            <td>
              <v-checkbox hide-details style="justify-items: center;"></v-checkbox>
            </td>
            <td>
              <v-checkbox hide-details style="justify-items: center;"></v-checkbox>
            </td>
          </tr>
          <tr>
            <td :colspan="headers.length" @click="getHolderForEdit(item)" style="text-align: right">
              <span>{{item.remark}}</span>
            </td>            
          </tr>
        </template>
        </v-data-table>
      </v-flex>

      <holder-form ref="holderForm"/>

    </v-layout>
  </div>
</template>



<script>
import apiService from "../services/apiService";
import { HOLDER_MODEL, HOLDER_MOBILE_HEADERS, NEW_HOLDER } from "../constants/constants";
import holderForm from "./HolderForm.vue"
import { isMobile } from '../constants/constants';

export default {
	name: "holder-List",
	components: { holderForm },
	data() {
		return {
      isMobile,
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
      let response = await apiService.getMany({
        model: HOLDER_MODEL,
      });
      this.holderList = response.data;
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
    font-size: 1rem;
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
.Fixed {
  background-color: red;
}

.תיק-דיירים {
  background-color: lightgreen;
  }
.Checked {
  background-color: yellow;
}

.v-input--checkbox {
  padding: 0px;
  margin: 0px;
}

/* Rotate only headers with the specific class */
.custom-headers th.rotated-header {
  writing-mode: vertical-rl;
  text-align: center;
  transform: rotate(180deg); /* Optional: Flip the text for proper orientation */
  white-space: nowrap; /* Ensure text doesn't wrap */
  padding: 0px !important;
}

.v-input__slot {
  justify-content: space-around;
}
</style>
