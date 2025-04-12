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
          <v-toolbar flat class="mt-5 mb-3" >
          <v-row no-gutters style="justify-content: stretch;">
            <v-col cols="4" md="2">
              <v-toolbar-title> סה"כ - {{leadsList.length.toLocaleString()}} </v-toolbar-title>
            </v-col>
            <v-col cols="4" md="2">
              <v-text-field v-model="search" label="Search" clearable></v-text-field>
            </v-col>
            <v-col v-if="!isMobile()" style="text-align-last: center;" cols="2" md="1">
              <export-excel
              :data="leadsList"
              type="xlsx">
              <v-btn x-small class="btn btn-danger">
                <v-icon small>mdi-download</v-icon>
              </v-btn>
              </export-excel>
            </v-col>
            <v-col  style="text-align-last: center;" cols="2" md="1">
              <v-btn x-small @click="getNewLeads" class="btn btn-danger"> excel
                <v-icon small>mdi-refresh</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="4" md="2">
              <v-combobox v-model="statusFilter" :items="statusList" label="סטטוס" reverse :allow-overflow="false" dense clearable></v-combobox>
            </v-col>
            <v-col cols="4" md="2" class="px-3">
              <v-combobox v-model="arrivedFilter" :items="arrivedList" label="הגיע אלינו מ..." reverse :allow-overflow="false" dense clearable></v-combobox>
            </v-col>
            <v-col cols="4" md="2">
              <v-combobox v-model="interestFilter" :items="interestList" label="מעונין ב..." reverse :allow-overflow="false" dense clearable></v-combobox>
            </v-col>
          </v-row>
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
              <span>{{item.status}}</span>
            </td>
            <td>
              <span>{{item.arrivedFrom}}</span>
            </td>
            <td>
              <span>{{item.interested}}</span>
            </td>
            <td>
              <span>{{item.trackDate | formatDate}}</span>
            </td>
            <td>
              <span>{{item.updatedAt | formatDate}}</span>
            </td>
            <td>
              <span>{{item.createdAt | formatDate}}</span>
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
import specificServiceEndPoints from "../services/specificServiceEndPoints";
import { LEAD_MODEL, LEADS_HEADERS, NEW_LEAD, loadTable } from "../constants/constants";
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
      statusFilter: '',
      arrivedFilter: '',
      interestFilter: '',
      statusList: [],
      arrivedList: [],
      interestList: [],
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

		async retrieveLeads(filter) {
			this.isLoading = true;
      let response

      switch (filter) {
        case 'status' :
          response = await apiService.getMany({model: LEAD_MODEL, status: this.statusFilter }) 
          break;
        case 'arrived' :
          response = await apiService.getMany({model: LEAD_MODEL, arrivedFrom: this.arrivedFilter }) 
          break;
        case 'interest' :
          response = await apiService.getMany({model: LEAD_MODEL, interested: this.interestFilter }) 
          break;
        default :
          response = await apiService.getMany({model: LEAD_MODEL}) 
      }
      // this.statusFilter 
      //   ? response = await apiService.getMany({model: LEAD_MODEL, status: this.statusFilter }) 
      //   : response = await apiService.getMany({model: LEAD_MODEL}) 
        
			if (response && response.data) {
        this.leadsList = response.data.sort(function (a, b) {
          // sort by updatedAt in descending order
          const updatedAtA = new Date(a.updatedAt);
          const updatedAtB = new Date(b.updatedAt);
          return updatedAtB - updatedAtA;
        });
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

    async getNewLeads() {
      let msg = await specificServiceEndPoints.syncGoogleSheets();
      window.alert(msg.data.message)
      this.retrieveLeads();
    }
	},

	async mounted() {
    this.statusList = (await loadTable(9)).map((code) => code.description)
    this.arrivedList = (await loadTable(5)).map((code) => code.description)
    this.interestList = (await loadTable(2)).map((code) => code.description)
    this.retrieveLeads();
    this.$root.$on("addNewLead", async () => {
      this.lead = NEW_LEAD;
      await this.$refs.leadForm.open(this.lead, true);
		});
	},
	
  watch: {
    statusFilter(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.retrieveLeads('status');
      }
    },
    
    arrivedFilter(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.retrieveLeads('arrived');
      }
    },
    
    interestFilter(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.retrieveLeads('interest');
      }
    }
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
