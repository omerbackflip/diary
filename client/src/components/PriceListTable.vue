<template>
  <v-card class="price-list-card" elevation="4" >
    <v-card-title class="headline font-weight-bold justify-end">
      טבלת מחירי דירות
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="displayedPriceList"
      disable-pagination
      hide-default-footer
      fixed-header
      height="80vh"
      dense
      mobile-breakpoint="0"
      class="elevation-2 price-list-table"
      :loading="isLoading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:item="{ item, index }">
          <tr v-if="item.flatId === 34" class="building-separator-row">
            <td :colspan="headers.length" class="building-separator-cell">
              <div class="building-separator-line"></div>
            </td>
          </tr>
          <tr v-if="showFloorDivider(index)" class="floor-divider-row">
            <td :colspan="headers.length" class="floor-divider-cell">
              <div class="floor-divider-line"></div>
            </td>
          </tr>
          <tr :class="itemRowBackground(item)">
            <td
              v-if="isFirstFloorCell(index)"
              :rowspan="floorRowSpan(index)"
              class="floor-span-cell"
            >
              {{ item.floor }}
            </td>
            <td><div class="d-flex justify-center">{{ item.flatId }}</div></td>
            <td>{{ item.directions }}</td>
            <td>{{ item.rooms }}</td>
            <td>{{ item.warehouseId }}</td>
            <td>{{ item.warehouseArea }}</td>
            <td>{{ item.parkingId }}</td>
            <td>{{ item.flatArea }}</td>
            <td>{{ item.balconyArea }}</td>
            <td>{{ item.eqvivalentArea }}</td>
            <td>{{ item.flatPrice.toLocaleString() }}</td>
          </tr>
      </template>

      <template v-slot:no-data>
        <v-alert type="info" text>
          לא נמצאו רשומות עבור טבלת מחירי הדירות.
        </v-alert>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { PRICELIST_MODEL } from '../constants/constants';
import apiService from '../services/apiService';
import excel from 'vue-excel-export';
import Vue from 'vue';

Vue.use(excel);

export default {
  name: 'PriceListTable',
  data() {
    return {
      priceList: [],
      search: '',
      headers: [
        { text: 'קומה', value: 'floor', class: 'light-blue', groupable: false },
        { text: 'מס דירה', value: 'flatId', class: 'light-blue', groupable: false },
        { text: 'כיוון אוויר', value: 'directions', class: 'light-blue', groupable: false },
        { text: 'חדרים', value: 'rooms', class: 'light-blue', groupable: false },
        { text: 'מחסן ', value: 'warehouseId', sortable: false, class: 'light-blue', groupable: false },
        { text: 'גודל מחסן', value: 'warehouseArea', sortable: false, class: 'light-blue', groupable: false },
        { text: 'חניה', value: 'parkingId', sortable: false, class: 'light-blue', groupable: false },
        { text: 'שטח דירה', value: 'flatArea', sortable: false, class: 'light-blue', groupable: false },
        { text: 'שטח מרפסת', value: 'balconyArea', sortable: false, class: 'light-blue', groupable: false },
        { text: 'שטח אקוו', value: 'eqvivalentArea', sortable: false, class: 'light-blue', groupable: false },
        { text: 'מחיר דירה', value: 'flatPrice', sortable: false, class: 'light-blue', groupable: false },
        // { text: 'סטטוס', value: 'status', sortable: false, class: 'light-blue', groupable: false },
      ],
      isLoading: false,
    };
  },
  computed: {
    displayedPriceList() {
      const term = this.search ? this.search.toString().trim().toLowerCase() : '';
      if (!term) return this.priceList;
      return this.priceList.filter((item) =>
        Object.values(item).some((value) =>
          value !== null && value !== undefined && value.toString().toLowerCase().includes(term)
        )
      );
    },
  },
  methods: {
    retrievePriceList() {
      this.isLoading = true;
      apiService
        .clientGetEntities(PRICELIST_MODEL)
        .then((response) => {
          this.priceList = response.data || [];
          this.isLoading = false;
        })
        .catch((e) => {
          console.error(e);
          this.isLoading = false;
        });
    },
    showFloorDivider(index) {
      if (index === 0) return false;
      const currentFloor = this.displayedPriceList[index]?.floor;
      const previousFloor = this.displayedPriceList[index - 1]?.floor;
      return currentFloor !== previousFloor;
    },
    isFirstFloorCell(index) {
      if (index === 0) return true;
      return this.displayedPriceList[index]?.floor !== this.displayedPriceList[index - 1]?.floor;
    },
    floorRowSpan(index) {
      const currentFloor = this.displayedPriceList[index]?.floor;
      if (currentFloor === undefined) return 1;
      let span = 1;
      for (let i = index + 1; i < this.displayedPriceList.length; i += 1) {
        if (this.displayedPriceList[i]?.floor === currentFloor) {
          span += 1;
        } else {
          break;
        }
      }
      return span;
    },
    itemRowBackground(item) {
      return item.status === 'נמכר' ? 'bg-green' : '';
    },
  },
  mounted() {
    this.retrievePriceList();
  },
};
</script>

<style scoped>
.price-list-card {
  min-height: 93vh;
}

.price-list-table {
  border-radius: 12px;
  overflow: hidden;
  direction: rtl;
  text-align-last: right;
}

.v-data-table__progress {
  border-top-color: #1976d2 !important;
}

.price-list-table table {
  border-collapse: collapse;
}

.price-list-table ::v-deep th {
  font-size: 18px !important;
  font-weight: bold;
}

.floor-divider-row {
  height: 2px;
}

.floor-divider-row td {
  padding: 0 !important;
  min-height: 2px !important;
  height: 2px !important;
  line-height: 0 !important;
  font-size: 0 !important;
  background: transparent;
  border: none !important;
}

.floor-divider-cell {
  padding: 0 !important;
}

.floor-divider-line {
  width: 100%;
  height: 2px;
  background-color: #1976d2;
  margin: 0;
}

.building-separator-row {
  height: 4px;
}

.building-separator-row td {
  padding: 0 !important;
  min-height: 4px !important;
  height: 4px !important;
  line-height: 0 !important;
  font-size: 0 !important;
  background: transparent;
  border: none !important;
}

.building-separator-cell {
  padding: 0 !important;
}

.building-separator-line {
  width: 100%;
  height: 4px;
  background-color: #000;
  margin: 0;
}

.bg-green {
  background-color: #d9f6d9 !important;
}

.floor-span-cell {
  background-color: #e3f2fd !important;
  font-weight: bold;    
  font-size: 20px !important;
  text-align-last: center;
}
</style>