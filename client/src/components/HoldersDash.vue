<template>
  <div class="list row hebrew">
    <v-layout style="padding: 5px;">
      <v-row class="ma-0" style="place-content: space-around ;">
        <v-col cols="12" md="3" class="pa-0">
          <v-card elevation="3" class="mb-3">
            <v-toolbar color="white" flat >
              <v-toolbar-title class="red--text">בניין צפוני</v-toolbar-title>
              <v-spacer></v-spacer>
              <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 2px; margin-left: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <v-avatar size="10" tile color="blue"></v-avatar>
                  <span style="font-size: 12px; color: blue;">תיק דיירים</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <v-avatar size="10" tile color="red"></v-avatar>
                  <span style="font-size: 12px; color: blue;">תוכניות</span>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 2px; margin-left: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <v-avatar size="10" tile color="green"></v-avatar>
                  <span style="font-size: 12px; color: blue;">הצעת מחיר</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <v-avatar size="10" tile color="yellow"></v-avatar>
                  <span style="font-size: 12px; color: blue;">שולם</span>
                </div>
              </div>
            </v-toolbar>
            <v-container fluid>
              <v-row>
                <v-col v-for="i in Array.from({ length: 2 }, (_, index) => 2 - index)" :key="i" cols="6" 
                       class="px-0 py-1" :class="holderList[i+28] && holderList[i+28].payedFile ? 'bck-green' : ''">
                  <v-sheet rounded outlined elevation="1" class="mx-0 boxsize100" @click="getHolderForEdit(holderList[i+28])">
                    <v-row class="my-1 mx-5 cntr" :class="getStatus(i+28)"><span>{{i+29}}</span></v-row>
                    <v-row class="ma-0 desc-oflow">{{holderList[i+28] ? holderList[i+28].name : ''}}</v-row>
                  </v-sheet>
                </v-col>
              </v-row>
              <v-row>
                <v-col v-for="i in Array.from({ length: 28 }, (_, index) => 28 - index)" :key="i" cols="3" 
                       class="px-0 py-1 j-center" :class="holderList[i] && holderList[i].payedFile ? '' : ''">
                  <v-sheet rounded outlined elevation="1" class="mx-0 boxsize50" @click="getHolderForEdit(holderList[i])">
                    <v-row class="my-1 mx-0 cntr" :class="getStatus(i)">
                      <span class="pa-0" style="display: flex; align-items: center; justify-content: space-evenly;">
                        {{ i + 1 }}
                        <!-- Avatars in 2x2 grid -->
                        <div v-if="holderList[i].name" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-left: 8px;">
                          <v-avatar size="10" tile 
                            :style="{border: '1px solid blue', backgroundColor: holderList[i] && holderList[i].payedFile ? 'blue' : 'transparent'}">
                          </v-avatar>
                          <v-avatar size="10" tile 
                            :style="{border: '1px solid blue', backgroundColor: holderList[i] && holderList[i].sendPlans ? 'red' : 'transparent'}">
                          </v-avatar>
                          <v-avatar size="10" tile 
                            :style="{border: '1px solid blue', backgroundColor: holderList[i] && holderList[i].gotOffer ? 'green' : 'transparent'}">
                          </v-avatar>
                          <v-avatar size="10" tile 
                            :style="{border: '1px solid blue', backgroundColor: holderList[i] && holderList[i].payedOffer ? 'yellow' : 'transparent'}">
                          </v-avatar>
                        </div>
                      </span>
                    </v-row>
                    <v-row class="ma-0 desc-oflow">{{holderList[i] ? holderList[i].name : ''}}</v-row>
                  </v-sheet>
                </v-col>
              </v-row>
              <v-row>
                <v-col v-for="i in Array.from({ length: 1 }, (_, index) => 1 - index)" :key="i" cols="6"
                       class="px-0 py-1" :class="holderList[i-1] && holderList[i-1].payedFile ? 'bck-green' : ''">
                  <v-sheet rounded outlined elevation="1" class="mx-0 boxsize100" @click="getHolderForEdit(holderList[i-1])">
                    <v-row class="my-1 mx-5 cntr" :class="getStatus(i-1)"><span>{{i}}</span></v-row>
                    <v-row class="ma-0 desc-oflow">{{holderList[i-1] ? holderList[i-1].name : ''}}</v-row>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" class="pa-0">
          <v-card elevation="3" class="mb-3">
            <v-toolbar color="white" flat >
              <v-toolbar-title class="red--text">בניין דרומי</v-toolbar-title>
              <v-spacer></v-spacer>
              <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 2px; margin-left: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <v-avatar size="10" tile color="blue"></v-avatar>
                  <span style="font-size: 12px; color: blue;">תיק דיירים</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <v-avatar size="10" tile color="red"></v-avatar>
                  <span style="font-size: 12px; color: blue;">תוכניות</span>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 2px; margin-left: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <v-avatar size="10" tile color="green"></v-avatar>
                  <span style="font-size: 12px; color: blue;">הצעת מחיר</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <v-avatar size="10" tile color="yellow"></v-avatar>
                  <span style="font-size: 12px; color: blue;">שולם</span>
                </div>
              </div>
            </v-toolbar>
            <v-container fluid>
              <v-row>
                <v-col v-for="i in Array.from({ length: 2 }, (_, index) => 2 - index)" :key="i" cols="6" 
                       class="px-0 py-1" :class="holderList[i+60] && holderList[i+60].payedFile ? 'bck-green' : ''">
                  <v-sheet rounded outlined elevation="1" class="mx-0 boxsize100" @click="getHolderForEdit(holderList[i+60])">
                    <v-row class="my-1 mx-5 cntr" :class="getStatus(i+60)"><span>{{i+61}}</span></v-row>
                    <v-row class="ma-0 desc-oflow">{{holderList[i+60] ? holderList[i+60].name : ''}}</v-row>
                  </v-sheet>
                </v-col>
              </v-row>
              <v-row>
                <v-col v-for="i in Array.from({ length: 28 }, (_, index) => 28 - index)" :key="i" cols="3" 
                        class="px-0 py-1 j-center" :class="holderList[i+32] && holderList[i+32].payedFile ? '' : ''">
                  <v-sheet rounded outlined elevation="1" class="mx-0 boxsize50" @click="getHolderForEdit(holderList[i+32])">
                    <v-row class="my-1 mx-0 cntr" :class="getStatus(i+32)">
                      <span class="pa-0" style="display: flex; align-items: center; justify-content: space-evenly;">
                        {{ i + 33 }}
                        <!-- Avatars in 2x2 grid -->
                        <div v-if="holderList[i+32].name" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-left: 8px;">
                          <v-avatar size="10" tile 
                            :style="{border: '1px solid blue', backgroundColor: holderList[i+32] && holderList[i+32].payedFile ? 'blue' : 'transparent'}">
                          </v-avatar>
                          <v-avatar size="10" tile 
                            :style="{border: '1px solid blue', backgroundColor: holderList[i+32] && holderList[i+32].sendPlans ? 'red' : 'transparent'}">
                          </v-avatar>
                          <v-avatar size="10" tile 
                            :style="{border: '1px solid blue', backgroundColor: holderList[i+32] && holderList[i+32].gotOffer ? 'green' : 'transparent'}">
                          </v-avatar>
                          <v-avatar size="10" tile 
                            :style="{border: '1px solid blue', backgroundColor: holderList[i+32] && holderList[i+32].payedOffer ? 'yellow' : 'transparent'}">
                          </v-avatar>
                        </div>
                      </span>
                    </v-row>
                    <v-row class="ma-0 desc-oflow">{{holderList[i+32] ? holderList[i+32].name : ''}}</v-row>
                  </v-sheet>
                </v-col>
              </v-row>
              <v-row>
                <v-col v-for="i in Array.from({ length: 2 }, (_, index) => 2 - index)" :key="i" cols="6" 
                       class="px-0 py-1" :class="holderList[i+30] && holderList[i+30].payedFile ? 'bck-green' : ''">
                  <v-sheet rounded outlined elevation="1" class="mx-0 boxsize100" @click="getHolderForEdit(holderList[i+30])">
                    <v-row class="my-1 mx-5 cntr" :class="getStatus(i+30)"><span>{{i+31}}</span></v-row>
                    <v-row class="ma-0 desc-oflow">{{holderList[i+30] ? holderList[i+30].name : ''}}</v-row>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>

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
	name: "holders-dash",
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
      this.holderList = response.data.sort((a, b) => {
        const getLastTwoDigits = (id) => { return id.substring(4, 6) };
        const aLastTwo = getLastTwoDigits(a.flatId);
        const bLastTwo = getLastTwoDigits(b.flatId);
        return aLastTwo - bLastTwo; // Sort ascending by last two digits
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

    getStatus (i) {
      switch (this.holderList[i] && this.holderList[i].status) {
        // case 'אושר לביצוע' :
        //   return 'bck-green'
        case 'טיפול דחוף' :
          return 'bck-red'
        default :
          return ''
      }
    }
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
.bck-red {
  background-color: red;
}

.bck-green {
  background-color: lightgreen;
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

.desc-oflow {
  overflow: hidden;
  white-space:nowrap;
  /* text-overflow:ellipsis;
  width:150px;
  display:inline-block; */
  font-size: smaller;
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
</style>
