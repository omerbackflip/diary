<template>
  <div class="list row">
    <v-layout style="padding: 0px">
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="leadsList"
          :search="search"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0 hebrew"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          loader-height="20"
          @click:row="getLeadForEdit"
          item-key="_id"
          dense>
        <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> סה"כ - {{leadsList.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search"></v-text-field>
              <v-col v-show="!isMobile()" style="text-align-last: center;">
                <export-excel
                :data="leadsList"
                type="xlsx">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
                </export-excel>
              </v-col>
            </v-toolbar>
        </template>
        <template v-slot:item ="{ item, headers }">
          <tr style="border-bottom: hidden; vertical-align: text-top;" @click="getLeadForEdit(item)">
            <td>
              <span>{{item.name}}</span>
            </td>
            <td>
              <span>{{item.phone}}</span>
            </td>   
            <td>
              <span>{{item.last_update | formatDate}}</span>
            </td>
          </tr>
          <tr style="border-bottom-width: thick;">
            <td :colspan="headers.length" @click="getLeadForEdit(item)" style="text-align: right">
              <span>{{item.description}}</span>
            </td>            
          </tr>
        </template>
        </v-data-table>
      </v-flex>

      <lead-form ref="leadForm"/>

    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import apiService from "../services/apiService";
// import SpecificServiceEndPoints from "../services/specificServiceEndPoints";
import { LEAD_MODEL, LEADS_HEADERS, NEW_LEAD } from "../constants/constants";
import leadForm from "./LeadForm.vue"
import { isMobile } from '../constants/constants';
import excel from "vue-excel-export";
Vue.use(excel);

Vue.filter("formatDate", function (value) {
	if (value) {
    // moment.locale('he')
		return moment(String(value)).format("DD/MM/YY");
	}
});

export default {
	name: "lead-list",
	components: { leadForm },
	data() {
		return {
      isMobile,
			leadsList: [],
			dialog: false,
			search: "",
			headers: [],
			lead: [],
			msg: "",
			isLoading: true,
			itemToEdit: "",
      dateModal : false,
    }
	},

	methods: {
		getHeaders() {
			if (this.isMobile()) {
				return LEADS_HEADERS;
			} else {
				return LEADS_HEADERS;
			}
		},

		async retrieveLeads() {
			this.isLoading = true;
      let response = await apiService.getMany({
        model: LEAD_MODEL,
      });
			if (response && response.data) {
				this.leadsList = response.data.sort(function(a, b) {
            var c = new Date(a.last_update);
            var d = new Date(b.last_update);
          return d-c;
        });
        this.leadsList.map((item) => {
          item.last_update = moment(new Date(item.last_update)).format('YYYY-MM-DD')
        })
        this.isLoading = false;
			}
		},

    // get lead data before call to leadForm for edit
		async getLeadForEdit(item) {
			if (item._id) {
        this.lead = item
        await this.$refs.leadForm.open(this.lead, false);
        this.retrieveLeads();
			}
		},

	},

	async mounted() {
		this.retrieveLeads();
    this.$root.$on("addNewLead", async () => {
      this.lead = NEW_LEAD;
      this.lead.last_update = moment(new Date()).format('YYYY-MM-DD')
      await this.$refs.leadForm.open(this.lead, true);
		});
	},
	
  watch: {

	},
};
</script>

<style scoped>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
  cursor: pointer;
}

.mobile-headers {
  font-size: 11px !important;
}

.mobile-items > td {
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

.summary {
  background-color: aqua;
  color: blue;
  justify-content: center;
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

input[type="date"]::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
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
    text-align: center;
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
</style>
