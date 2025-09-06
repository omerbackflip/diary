<template>
  <div class="list row">
    <v-layout style="padding: 0px">
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="filteredLeads"
          :search="''"
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
                <v-col cols="4" md="1">
                  <v-toolbar-title>({{ filteredLeads.length.toLocaleString() }}) {{ allLeadList.length.toLocaleString() }} </v-toolbar-title>
                </v-col>
                <v-col cols="4" md="2">
                  <v-text-field v-model="search" label="Search" clearable hide-details ></v-text-field>
                </v-col>
                <v-col cols="2" md="1" v-if="!isMobile()" style="text-align-last: center;">
                  <export-excel :data="allLeadList" type="xlsx">
                    <v-btn x-small class="btn btn-danger">
                      <v-icon small>mdi-download</v-icon>
                    </v-btn>
                  </export-excel>
                </v-col>
                <v-col cols="2" md="1" style="text-align-last: center;">
                  <v-btn x-small class="btn btn-danger" @click="callStatistics"><v-icon small>mdi-google-analytics</v-icon></v-btn>
                </v-col>
                <v-col cols="2" md="1" style="text-align-last: center;">
                  <v-btn x-small @click="getNewLeads" class="btn btn-danger"> Leads <v-icon small>mdi-refresh</v-icon></v-btn>
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

          <template v-slot:item="{ item, headers }">
            <tr style="border-bottom: hidden; vertical-align: text-top;" @click="getLeadForEdit(item)">
              <td><span>{{item.name}}</span></td>
              <td><span>{{item.phone}}</span></td>
              <td><span>{{item.status}}</span></td>
              <td><span>{{item.adName}}</span></td>
              <td><span>{{item.arrivedFrom}}</span></td>
              <td><span>{{item.interested}}</span></td>
              <td><span>{{item.trackDate | formatDate}}</span></td>
              <td><span>{{item.updatedAt | formatDate}}</span></td>
              <td><span>{{item.createdAt | formatDate}}</span></td>
              <td><v-checkbox :input-value="item.meeting" hide-details dense class="ma-0 pa-0" disabled></v-checkbox></td>
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
      <v-dialog v-model="barChartDialog" max-width="600px">
        <v-card>
          <v-card-title style="justify-content: center;"><strong>חיתוך לפי {{ summaryBy==='status' ? 'סטטוס' : 'מקור הגעה' }}</strong></v-card-title>
          <v-card-text>
            <v-row class="mb-4" style="justify-content: space-evenly;" align="center" no-gutters>
              <v-col cols="6" md="6">
                <v-menu
                  ref="rangeMenu"
                  v-model="rangeMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateRangeText"
                      label="בחר טווח תאריכים"
                      prepend-icon="mdi-calendar"
                      readonly
                      clearable
                      @click:clear="clearDateRange"
                      v-bind="attrs"
                      v-on="on"
                      dense
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dateRange"
                    range
                    @change="applyDateRange"
                    no-title
                    scrollable
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="6" md="3" class="text-center">
                <v-btn-toggle v-model="summaryBy" dense>
                  <v-btn value="arrivedFrom" x-small>הגיע מ</v-btn>
                  <v-btn value="status" x-small>סטטוס</v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>

            <BarChart :data="summaryLeads"/>

          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text color="primary" @click="barChartDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import apiService from "../services/apiService";
import specificServiceEndPoints from "../services/specificServiceEndPoints";
import { LEAD_MODEL, LEADS_HEADERS, LEADS_SUMMARY_HEADERS, NEW_LEAD, loadTable } from "../constants/constants";
import leadForm from "./LeadForm.vue"
import { isMobile } from '../constants/constants';
import BarChart from '@/components/Common/BarChart.vue';
import excel from "vue-excel-export";
Vue.use(excel);

Vue.filter("formatDate", function (value) {
  if (value) {
    return moment(value).format("DD/MM/YY");
  }
});

export default {
  name: "lead-list",
  components: { leadForm, BarChart },
  data() {
    return {
      isMobile,
      allLeadList: [],
      barChartDialog: false,
      search: "",
      headers: [],
      lead: [],
      msg: "",
      isLoading: true,
      statusFilter: '',
      arrivedFilter: '',
      interestFilter: '',
      statusList: [],
      arrivedList: [],
      interestList: [],
      summaryLeads: [],
      totalCount: 0,
      summaryBy: 'arrivedFrom',
      fromDate: null,
      toDate: null,
      chartType: 'bar', // 'pie'
      dateRange: [],
      rangeMenu: false,
      dateRangeText: ''
    }
  },

  computed: {
    filteredLeads() {
      return this.allLeadList.filter(lead => {
        const matchesStatus = !this.statusFilter || lead.status === this.statusFilter;
        const matchesArrived = !this.arrivedFilter || lead.arrivedFrom === this.arrivedFilter;
        const matchesInterest = !this.interestFilter || lead.interested === this.interestFilter;
        const matchesSearch = !this.search || [
          lead.name,
          lead.phone,
          lead.status,
          lead.arrivedFrom,
          lead.interested,
          lead.trackDate,
          lead.updatedAt,
          lead.createdAt,
          lead.description
        ]
          .filter(Boolean)
          .some(field => String(field).toLowerCase().includes(this.search.toLowerCase()));

        return matchesStatus && matchesArrived && matchesInterest && matchesSearch;
      });
    }
  },

  methods: {
    getHeaders() {
      return LEADS_HEADERS;
    },

    getSummaryHeaders() {
      return LEADS_SUMMARY_HEADERS
    },

    async retrieveLeads() {
      this.isLoading = true;
      let response;
      let role = localStorage.getItem('DiaryAuthenticated'); // 'admin' or 'viewer'
      console.log('User role:', role);
      if (role === 'viewer') {
        response = await apiService.getMany({ model: LEAD_MODEL,  arrivedFrom: 'יד1' });
      } else {
        response = await apiService.getMany({ model: LEAD_MODEL });
      }
      // response = await apiService.getMany({model: LEAD_MODEL}); // old - get all leads
      if (response && response.data) {
        this.allLeadList = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        this.isLoading = false;
      }
    },

    async getLeadForEdit(item) {
      if (item._id) {
        this.lead = item
        await this.$refs.leadForm.open(this.lead, false);
        this.retrieveLeads();
      }
    },

    async getNewLeads() {
      let msg = await specificServiceEndPoints.syncGoogleSheets();
      window.alert(msg.data.message);
      this.retrieveLeads();
    },

    async callStatistics () {
      this.fromDate = null
      this.toDate = null
      await this.getStatistics()
      this.barChartDialog = true
    },

    async getStatistics() {
      const summaryMap = {};
      const from = this.fromDate ? new Date(this.fromDate + 'T00:00:00') : null;
      const to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;

      this.allLeadList.forEach((lead) => {
        const createdAt = new Date(lead.createdAt);
        if (
          (!from || createdAt >= from) &&
          (!to || createdAt <= to)
        ) {
          const key = lead[this.summaryBy] || 'Unknown';

          if (!summaryMap[key]) {
            summaryMap[key] = { count: 0, meetingCount: 0 };
          }

          summaryMap[key].count += 1;

          if (this.summaryBy === 'arrivedFrom' && lead.meeting===true) {
            summaryMap[key].meetingCount += 1;
          }
        }
      });

      this.summaryLeads = Object.entries(summaryMap).map(([source, { count, meetingCount }]) => {
        const summary = { source, count };
        summary.meetingCount = meetingCount;
        return summary;
      });

      this.totalCount = this.summaryLeads.reduce((sum, lead) => sum + lead.count, 0);
    },


    applyDateRange() {
      if (this.dateRange.length === 2) {
        this.fromDate = this.dateRange[0];
        this.toDate = this.dateRange[1];
        this.dateRangeText = `${this.fromDate} to ${this.toDate}`;
        this.getStatistics();
      }
      this.rangeMenu = false;
    },

    clearDateRange() {
      this.dateRange = [];
      this.fromDate = null;
      this.toDate = null;
      this.dateRangeText = '';
      this.getStatistics();
    },

  },

  async mounted() {
    this.statusList = (await loadTable(9)).map((code) => code.description);
    this.arrivedList = (await loadTable(5)).map((code) => code.description);
    this.interestList = (await loadTable(2)).map((code) => code.description);
    this.retrieveLeads();
    this.getStatistics(); // trigger on load with full list
    this.$root.$on("addNewLead", async () => {
      this.lead = NEW_LEAD;
      await this.$refs.leadForm.open(this.lead, true);
    });
  },

  watch: {
    fromDate() {
    this.getStatistics();
    },
    toDate() {
      this.getStatistics();
    },
    summaryBy() { // NEW
      this.getStatistics();
    }
  }
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
.centered{
  justify-content: space-evenly !important;
}
</style>
