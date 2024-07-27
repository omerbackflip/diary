<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="diaryList"
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
          @click:row="getDiaryForEdit"
          item-key="_id"
          dense>
        <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> {{header}} {{diaryList.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <!-- <v-text-field v-model="search" label="Search" class="mx-4 sreach-width" clearable></v-text-field> -->
              <v-spacer></v-spacer>
              <v-col style="text-align-last: center;">
                <export-excel
                :data="diaryList"
                type="xlsx"
                name="all-diary"
                title="All Diary"
                footer="This is footer">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
                </export-excel>
              </v-col>
          </v-toolbar>
        </template>
        <!-- <template v-slot:[`item.date`]="{ item }">
          <span style="margin-left: 0.5rem"> {{ item.date | formatDate }}</span>
        </template> -->

        <template v-slot:item ="{ item, headers }">
          <tr style="border-bottom: hidden; vertical-align: text-top;" @click="getDiaryForEdit(item)">
            <td>
              <span style="margin-left: 0.5rem"> {{ item.date | formatDate }}</span>
            </td>
            <td>
              <span>{{item.poalim}}</span>
            </td>
            <td>
              <span>{{item.traktor}}</span>
            </td>   
            <td>
              <span>{{item.shufel}}</span>
            </td> 
            <td>
              <span>{{item.pipe}}</span>
            </td>
            <td>
              <span>{{item.bagger}}</span>
            </td>   
            <td>
              <span>{{item.manof}}</span>
            </td>  
            <td>
              <span>{{item.manitu}}</span>
            </td>
            <td>
              <span>{{item.agoran}}</span>
            </td>   
            <td>
              <span>{{item.yetzikot}}</span>
            </td>  
            <td>
              <span>{{item.homarim}}</span>
            </td>
            <td>
              <span>{{item.shonot}}</span>
            </td>
          </tr>
          <tr>
            <td :colspan="headers.length" @click="getDiaryForEdit(item)">
              <span>{{item.description}}</span>
            </td>            
          </tr>
        </template>

        </v-data-table>
      </v-flex>

      <diary-form ref="diaryForm"/>

    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import apiService from "../services/apiService";
// import SpecificServiceEndPoints from "../services/specificServiceEndPoints";
import { DIARY_MODEL, DIARY_WEB_HEADERS, NEW_DIARY } from "../constants/constants";
import diaryForm from "./DiaryForm.vue"
import { isMobile } from '../constants/constants';
import excel from "vue-excel-export";
Vue.use(excel);

Vue.filter("formatDate", function (value) {
	if (value) {
    moment.locale('he')
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YY dddd");
	}
});

export default {
	name: "diaryList",
	components: { diaryForm },
	data() {
		return {
      isMobile,
			diaryList: [],
			dialog: false,
			search: "",
			headers: [],
			diary: [],
			msg: "",
			isLoading: true,
			itemToEdit: "",
      dateModal : false,
      selected: [],
      header: '',
		};
	},

          /* eslint-disable */
	methods: {
		getHeaders() {
			if (this.isMobile()) {
				return DIARY_WEB_HEADERS;
			} else {
				return DIARY_WEB_HEADERS;
			}
		},

		async retrieveDairies() {
			this.isLoading = true;
      let response = await apiService.getMany({
            model: DIARY_MODEL,
          });
			if (response && response.data) {
				this.diaryList = response.data;
				this.isLoading = false;
			}
		},

		refreshList() {
			this.retrieveDairies();
		},

    // get diary data before call to diaryForm for edit
		async getDiaryForEdit(item) {
			if (item._id) {
        this.diary = item
			  await this.$refs.diaryForm.open(this.diary, false);
		    this.retrieveDairies();
			}
		},

    expandAll: function () {
       let expandObject = {}
       for(const ddd of this.diary) {
         expandObject[ddd._id] = true
       }
       this.$refs.datatable.expanded = expandObject
     }

	},

	async mounted() {
		this.retrieveDairies();
    this.$root.$on("addNewDiary", async () => {
			// this.dialog = true;
      this.diary = NEW_DIARY;
      this.diary.date = moment(new Date()).format('YYYY-MM-DD')
      await this.$refs.diaryForm.open(this.diary, true);
		});

	},
	
  watch: {

	},
};
</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
  cursor: pointer;
}

/* .bg-green {
  background-color: lightgreen !important;
} */

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
  cursor: pointer;
  text-decoration: underline;
  color: blue;
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
