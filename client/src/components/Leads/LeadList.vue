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
          :items-per-page="50"
          :footer-props="{
            'items-per-page-options': [50, 100, -1],
            'items-per-page-text': '',
          }"
          fixed-header
          mobile-breakpoint="0"
          :height="tableHeight"
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
                <v-col cols="4" md="1">
                  <v-text-field v-model="search" label="Search" clearable hide-details ></v-text-field>
                </v-col>
                <v-col cols="2" md="1" v-if="!isMobile()" style="text-align-last: center;">
                  <export-excel :data="exportLeads" type="xlsx">
                    <v-btn x-small class="btn btn-danger">
                      <v-icon small>mdi-download</v-icon>
                    </v-btn>
                  </export-excel>
                </v-col>
                <v-col cols="2" md="1" style="text-align-last: center;">
                  <v-btn x-small class="btn btn-danger" @click="callStatistics"><v-icon small>mdi-google-analytics</v-icon></v-btn>
                </v-col>
                <v-col cols="2" md="1" v-if="!isMobile()" style="text-align-last: center;">
                  <v-btn x-small class="btn btn-danger" @click="openPhoneReport">
                    <v-icon small>mdi-phone-alert</v-icon>
                  </v-btn>
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
              <td :class="{ 'eli-highlight': item.description && item.description.trim().startsWith('אלי:') }"><span>{{item.name}}</span></td>
              <td><span :class="{ 'red--text font-weight-bold': item.isDuplicate }">{{item.phone}}</span></td>
              <td :style="item.status ? {} : { backgroundColor: 'pink' }"><span>{{item.status}}</span></td>
              <td><span>{{item.adName}}</span></td>
              <td><span>{{item.arrivedFrom}}</span></td>
              <td><span>{{item.interested}}</span></td>
              <td><span :class="{ 'red--text font-weight-bold': isPastTrackDate(item.trackDate) }">{{item.trackDate | formatDate}}</span></td>
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
      <v-dialog v-model="phoneReportDialog" max-width="1100px">
        <v-card>
          <v-card-title class="phone-report-title">
            <strong>Lead Phone Report</strong>
            <v-spacer />
            <v-btn
              small
              text
              color="primary"
              @click="selectAllSafePhoneReportItems"
              :disabled="phoneReportLoading || phoneReport.fixableCount === 0"
            >
              Select safe
            </v-btn>
            <v-btn
              small
              color="primary"
              @click="fixSelectedLeadPhones"
              :disabled="selectedPhoneReportItems.length === 0 || phoneReportLoading || phoneReportFixing"
              :loading="phoneReportFixing"
            >
              Fix selected ({{ selectedPhoneReportItems.length }})
            </v-btn>
            <v-btn icon @click="openPhoneReport" :loading="phoneReportLoading">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon @click="phoneReportDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row dense class="mb-3 phone-report-summary">
              <v-col cols="6" md="3">Total: {{ phoneReport.total }}</v-col>
              <v-col cols="6" md="3">Problems: {{ phoneReport.invalidCount }}</v-col>
              <v-col cols="6" md="3">Safe suggestions: {{ phoneReport.fixableCount }}</v-col>
              <v-col cols="6" md="3">Review needed: {{ phoneReport.reviewCount }}</v-col>
            </v-row>
            <v-row dense class="mb-2">
              <v-col cols="12" md="4">
                <v-select
                  v-model="phoneReportStatusFilter"
                  :items="phoneReportStatusOptions"
                  label="Status"
                  dense
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" md="8" class="phone-report-filter-count">
                Showing {{ filteredPhoneReportItems.length }} of {{ phoneReport.items.length }}
              </v-col>
            </v-row>
            <v-data-table
              :headers="phoneReportHeaders"
              :items="filteredPhoneReportItems"
              :items-per-page="25"
              :loading="phoneReportLoading"
              mobile-breakpoint="0"
              disable-pagination
              hide-default-footer 
              dense
              fixed-header
              height="520"
              item-key="_id"
              @click:row="openLeadFromPhoneReport"
            >
              <template v-slot:item.selected="{ item }">
                <v-checkbox
                  :input-value="isPhoneReportItemSelected(item)"
                  :disabled="!item.fixable || phoneReportFixing"
                  hide-details
                  dense
                  class="ma-0 pa-0"
                  @click.stop
                  @change="togglePhoneReportItem(item, $event)"
                ></v-checkbox>
              </template>
              <template v-slot:item.problems="{ item }">
                <v-chip
                  v-for="problem in item.problems"
                  :key="problem"
                  x-small
                  class="ma-1"
                  color="warning"
                  text-color="black"
                >
                  {{ problem }}
                </v-chip>
              </template>
              <template v-slot:item.fixable="{ item }">
                <v-chip v-if="item.fixable" x-small color="success" text-color="white">
                  safe suggestion
                </v-chip>
                <v-chip v-else x-small color="error" text-color="white">
                  review needed
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import apiService from "../../services/apiService";
import specificServiceEndPoints from "../../services/specificServiceEndPoints";
import { LEAD_MODEL, LEADS_HEADERS, LEADS_SUMMARY_HEADERS, NEW_LEAD, loadTable, isMobile } from "../../constants/constants";
import leadForm from "./LeadForm.vue"
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
      phoneReportDialog: false,
      phoneReportLoading: false,
      phoneReportFixing: false,
      selectedPhoneReportIds: [],
      phoneReport: {
        total: 0,
        invalidCount: 0,
        fixableCount: 0,
        reviewCount: 0,
        items: [],
      },
      phoneReportStatusFilter: 'all',
      phoneReportStatusOptions: [
        { text: "All", value: "all" },
        { text: "Safe suggestions", value: "safe" },
        { text: "Review needed", value: "review" },
      ],
      phoneReportHeaders: [
        { text: "Fix", value: "selected", align: "center", sortable: false, width: "6%" },
        { text: "Name", value: "name", align: "right", width: "16%" },
        { text: "Current phone", value: "phone", align: "right", width: "14%" },
        { text: "Suggested phone", value: "suggestedPhone", align: "right", width: "14%" },
        { text: "Problems", value: "problems", align: "right", sortable: false, width: "36%" },
        { text: "Status", value: "fixable", align: "right", sortable: false, width: "20%" },
      ],
    }
  },

  computed: {
    tableHeight() {
      const compactLayout = this.isMobile() || this.$vuetify.breakpoint.xsOnly;
      return compactLayout ? 'max(260px, calc(100vh - 200px))' : 'max(320px, calc(100vh - 240px))';
    },

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
    },

    filteredPhoneReportItems() {
      if (this.phoneReportStatusFilter === 'safe') {
        return this.phoneReport.items.filter((item) => item.fixable);
      }

      if (this.phoneReportStatusFilter === 'review') {
        return this.phoneReport.items.filter((item) => !item.fixable);
      }

      return this.phoneReport.items;
    },

    selectedPhoneReportItems() {
      const selectedIds = new Set(this.selectedPhoneReportIds);
      return this.phoneReport.items.filter((item) => selectedIds.has(item._id) && item.fixable);
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
        // this sort place the leads with empty status at the top, and then sort by updatedAt descending
        this.allLeadList = response.data.sort((a, b) => {
          const aEmpty = !a.status || !String(a.status).trim();
          const bEmpty = !b.status || !String(b.status).trim();
          if (aEmpty && !bEmpty) return -1;
          if (!aEmpty && bEmpty) return 1;
          const ad = new Date(a.updatedAt).getTime() || 0;
          const bd = new Date(b.updatedAt).getTime() || 0;
          return bd - ad;
        });
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

    isPastTrackDate(date) {
      if (!date) return false;
      try {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);
        d.setHours(0,0,0,0);
        return d < today;
      } catch (e) {
        return false;
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

    async openPhoneReport() {
      this.phoneReportDialog = true;
      this.phoneReportLoading = true;
      try {
        const response = await specificServiceEndPoints.getLeadPhoneReport();
        this.phoneReport = {
          total: response.data.total || 0,
          invalidCount: response.data.invalidCount || 0,
          fixableCount: response.data.fixableCount || 0,
          reviewCount: response.data.reviewCount || 0,
          items: response.data.items || [],
        };
        this.selectedPhoneReportIds = this.selectedPhoneReportIds.filter((id) =>
          this.phoneReport.items.some((item) => item._id === id && item.fixable)
        );
      } catch (error) {
        console.error("Error loading lead phone report:", error);
        window.alert("Error loading lead phone report");
      } finally {
        this.phoneReportLoading = false;
      }
    },

    async openLeadFromPhoneReport(reportItem) {
      const lead = this.allLeadList.find((item) => item._id === reportItem._id);
      if (!lead) return;

      await this.getLeadForEdit(lead);
    },

    isPhoneReportItemSelected(item) {
      return this.selectedPhoneReportIds.includes(item._id);
    },

    togglePhoneReportItem(item, checked) {
      if (!item.fixable) return;

      if (checked && !this.selectedPhoneReportIds.includes(item._id)) {
        this.selectedPhoneReportIds = [...this.selectedPhoneReportIds, item._id];
      } else if (!checked) {
        this.selectedPhoneReportIds = this.selectedPhoneReportIds.filter((id) => id !== item._id);
      }
    },

    selectAllSafePhoneReportItems() {
      this.selectedPhoneReportIds = this.phoneReport.items
        .filter((item) => item.fixable)
        .map((item) => item._id);
    },

    async fixSelectedLeadPhones() {
      const items = this.selectedPhoneReportItems.map((item) => ({
        _id: item._id,
        suggestedPhone: item.suggestedPhone,
      }));

      if (!items.length) return;

      const confirmed = window.confirm(`Fix ${items.length} selected phone numbers? updatedAt will stay unchanged.`);
      if (!confirmed) return;

      this.phoneReportFixing = true;
      try {
        const response = await specificServiceEndPoints.fixLeadPhones(items);
        const skippedCount = response.data.skipped ? response.data.skipped.length : 0;
        window.alert(`${response.data.fixedCount || 0} phone numbers fixed. ${skippedCount} skipped.`);
        this.selectedPhoneReportIds = [];
        await this.retrieveLeads();
        await this.openPhoneReport();
      } catch (error) {
        console.error("Error fixing lead phones:", error);
        window.alert("Error fixing lead phones");
      } finally {
        this.phoneReportFixing = false;
      }
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

.eli-highlight {
  background-color: #dff0d8;
}

.phone-report-filter-count {
  align-self: center;
  color: rgba(0, 0, 0, 0.6);
  font-size: 13px;
}

@media (max-width: 600px) {
  .hebrew ::v-deep .v-data-footer {
    flex-wrap: nowrap;
    font-size: 11px;
    min-height: 48px;
    padding: 0 2px;
  }

  .hebrew ::v-deep .v-data-footer__select {
    margin: 0 4px;
  }

  .hebrew ::v-deep .v-data-footer__select .v-select {
    margin: 0 0 0 4px;
  }

  .hebrew ::v-deep .v-data-footer__pagination {
    margin: 0 4px;
  }

  .hebrew ::v-deep .v-data-footer__icons-before,
  .hebrew ::v-deep .v-data-footer__icons-after {
    margin: 0;
  }
}
</style>
