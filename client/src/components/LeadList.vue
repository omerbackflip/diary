<template>
  <div class="list row">
    <v-alert v-if="newLeadsMessage" type="success" dense class="centered-alert">
      {{ newLeadsMessage }}
      <v-btn small text color="primary" @click="refreshAfterSyncMessage"> Refresh </v-btn>
    </v-alert>
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
                  <!-- <export-excel :data="$formatDataForExport(allLeadList)" type="xlsx"> -->
                  <export-excel :data="exportLeads" type="xlsx">
                    <v-btn x-small class="btn btn-danger">
                      <v-icon small>mdi-download</v-icon>
                    </v-btn>
                  </export-excel>
                </v-col>
                <v-col cols="2" md="1" style="text-align-last: center;">
                  <v-btn x-small class="btn btn-danger" @click="callStatistics"><v-icon small>mdi-google-analytics</v-icon></v-btn>
                </v-col>
                <v-col cols="2" md="1" style="text-align-last: center;" v-if="role==='admin'">
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
              <td><span :class="{ 'red--text font-weight-bold': item.isDuplicate }">{{item.phone}}</span></td>
              <td :style="item.status ? {} : { backgroundColor: 'pink' }"><span>{{item.status}}</span></td>
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
      <v-dialog v-model="barChartDialog" max-width="1210px">
        <v-card>
          <v-card-title style="justify-content: center;"><strong> {{ summaryBy }} - חיתוך לפי</strong></v-card-title>
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
                <v-btn-toggle v-model="selectedDays" dense @change="applyDaysRange">
                  <v-btn :value="3" x-small>3-days</v-btn>
                  <v-btn :value="7" x-small>7-days</v-btn>
                  <v-btn :value="14" x-small>14-days</v-btn>
                  <v-btn :value="30" x-small>30-days</v-btn>
                </v-btn-toggle>
              </v-col>

              <v-col cols="6" md="3" class="text-center">
                <v-btn-toggle v-model="summaryBy" dense>
                  <v-btn value="arrivedFrom" x-small>הגיע מ</v-btn>
                  <v-btn value="status" x-small>סטטוס</v-btn>
                  <v-btn value="adName" x-small>מודעה</v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>

            <BarChart :data="summaryLeads" @bar-click="onChartBarClick"/>

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
      adNameFilter: '',
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
      dateRangeText: '',
      selectedDays: null,
      role: 'admin', // or 'viewer'
      syncStatusTimer: null,
      lastSeenSyncVersion: null,
      newLeadsMessage: "",
      filterKey: 0,
    }
  },

  computed: {
    filteredLeads() {
      const today = new Date();
      let from = null;
      let to = null;

      if (this.dateRange.length === 2) {
        from = new Date(this.dateRange[0] + 'T00:00:00');
        to = new Date(this.dateRange[1] + 'T23:59:59');
      } else if (this.selectedDays) {
        from = new Date(today.getTime() - Number(this.selectedDays) * 24 * 60 * 60 * 1000);
        to = today;
      } else {
        from = this.fromDate ? new Date(this.fromDate + 'T00:00:00') : null;
        to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;
      }

      let filtered = this.allLeadList.filter(lead => {
        const createdAt = new Date(lead.createdAt);
        return (!from || createdAt >= from) && (!to || createdAt <= to);
      });

      filtered = filtered.filter(lead => {
        const matchesStatus = !this.statusFilter || (lead.status && lead.status.trim() === this.statusFilter);
        const matchesArrived = !this.arrivedFilter || (lead.arrivedFrom && lead.arrivedFrom.trim() === this.arrivedFilter);
        const matchesInterest = !this.interestFilter || (lead.interested && lead.interested.trim() === this.interestFilter);
        const matchesAdName = !this.adNameFilter || (lead.adName && lead.adName.trim() === this.adNameFilter);
        const matchesSearch = !this.search || [
          lead.name,
          lead.phone,
          lead.status,
          lead.arrivedFrom,
          lead.interested,
          lead.adName,
          lead.trackDate,
          lead.updatedAt,
          lead.createdAt,
          lead.description
        ]
          .filter(Boolean)
          .some(field => String(field).toLowerCase().includes(this.search.toLowerCase()));

        return matchesStatus && matchesArrived && matchesInterest && matchesAdName && matchesSearch;
      });

      return filtered;
    },

    exportLeads() {
      return this.$formatDataForExport(this.allLeadList);
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
      if (this.role === 'viewer') {
        response = await apiService.clientGetEntities(LEAD_MODEL, { arrivedFrom: 'יד1' });
      } else {
        response = await apiService.clientGetEntities(LEAD_MODEL);
      }
      if (response && response.data) {
        this.allLeadList = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        this.isLoading = false;
      }
      // חישוב כמה פעמים כל טלפון מופיע
      const counts = {};
      this.allLeadList.forEach(l => {
        counts[l.phone] = (counts[l.phone] || 0) + 1;
      });
      this.allLeadList = this.allLeadList.map(l => ({
        ...l,
        isDuplicate: counts[l.phone] > 1
      }));
    
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
      this.selectedDays = null
      await this.getStatistics()
      this.barChartDialog = true
    },

    onChartBarClick(label) {
      if (!label) return;
      label = label.trim();
      this.barChartDialog = false;
      this.search = '';
      this.adNameFilter = '';
      this.statusFilter = '';
      this.arrivedFilter = '';

      if (this.summaryBy === 'status') {
        this.statusFilter = label;
      } else if (this.summaryBy === 'arrivedFrom') {
        this.arrivedFilter = label;
      } else if (this.summaryBy === 'adName') {
        this.adNameFilter = label;
      }
    },

    async applyDaysRange(value) {
      this.selectedDays = value;
      this.dateRange = [];
      this.fromDate = null;
      this.toDate = null;
      this.dateRangeText = `Last ${value} days`;
      await this.getStatistics();
    },

    async getStatistics() {
      const summaryMap = {};
      const today = new Date();
      let from = null;
      let to = null;

      if (this.dateRange.length === 2) {
        from = new Date(this.dateRange[0] + 'T00:00:00');
        to = new Date(this.dateRange[1] + 'T23:59:59');
      } else if (this.selectedDays) {
        from = new Date(today.getTime() - Number(this.selectedDays) * 24 * 60 * 60 * 1000);
        to = today;
      } else {
        from = this.fromDate ? new Date(this.fromDate + 'T00:00:00') : null;
        to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;
      }

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

          if (lead.meeting===true) {
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

      this.summaryLeads = Object.entries(summaryMap)
        .map(([source, { count, meetingCount }]) => ({
          source,
          count,
          meetingCount,
        }))
        .filter(summary => summary.source !== 'Unknown');

    },


    applyDateRange() {
      if (this.dateRange.length === 2) {
        this.selectedDays = null;
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
      this.selectedDays = null;
      this.dateRangeText = '';
      this.getStatistics();
    },

    async checkGoogleSheetsSyncStatus() {
      try {
        const res = await specificServiceEndPoints.getGoogleSheetsSyncStatus();

        if (!res.data.success) return;

        const status = res.data.status;

        if (this.lastSeenSyncVersion === null) {
          this.lastSeenSyncVersion = status.version;
          return;
        }

        if (
          status.version !== this.lastSeenSyncVersion &&
          status.lastImportedCount > 0
        ) {
          this.newLeadsMessage = `${status.lastImportedCount} new leads were imported. Click to refresh.`;
        }

        this.lastSeenSyncVersion = status.version;
      } catch (error) {
        console.error("Error checking Google Sheets sync status:", error);
      }
    },

    async refreshAfterSyncMessage() {
      this.newLeadsMessage = "";
      await this.retrieveLeads();
    },

  },

  async mounted() {
    this.role = localStorage.getItem('DiaryAuthenticated'); // 'admin' or 'viewer'

    const [statusTable = [], arrivedTable = [], interestTable = []] = await Promise.all([
      loadTable(9),
      loadTable(5),
      loadTable(2),
    ]);
    this.statusList = statusTable.map((code) => (code.description || '').trim());
    this.arrivedList = arrivedTable.map((code) => (code.description || '').trim());
    this.interestList = interestTable.map((code) => (code.description || '').trim());

    this.retrieveLeads();
    this.$root.$on("addNewLead", async () => {
      this.lead = NEW_LEAD;
      await this.$refs.leadForm.open(this.lead, true);
    });
    
    this.checkGoogleSheetsSyncStatus();
    this.syncStatusTimer = setInterval(() => {
      this.checkGoogleSheetsSyncStatus();
    }, 30000);

  },

  beforeDestroy() {
    if (this.syncStatusTimer) {
      clearInterval(this.syncStatusTimer);
    }
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
.centered-alert {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 90%;
  max-width: 500px;
}
</style>
