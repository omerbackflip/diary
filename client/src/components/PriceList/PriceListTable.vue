<template>
  <v-card class="price-list-card" elevation="4" >
    <v-card-title class="price-list-title-wrapper">
      <div class="overview-actions">
        <v-btn small color="primary" outlined @click="openOverviewMap('parkings')">חניות</v-btn>
        <v-btn small color="primary" outlined @click="openOverviewMap('warehouses')">מחסנים</v-btn>
      </div>

      <div class="title-center">גדות סקיי - מחירי דירות</div>

      <v-btn-toggle
        v-model="availabilityFilter"
        mandatory
        dense
        class="availability-toggle"
      >
        <v-btn small value="available">למכירה</v-btn>
        <v-btn small value="sold">נמכר</v-btn>
        <v-btn small value="all">הכל</v-btn>
      </v-btn-toggle>
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
          <tr v-if="item.flatId === 32" class="building-separator-row">
            <td :colspan="headers.length" class="building-separator-cell">
              <div class="building-separator-line"></div>
            </td>
          </tr>
          <tr v-if="showFloorDivider(index)" class="floor-divider-row">
            <td :colspan="headers.length" class="floor-divider-cell">
              <div class="floor-divider-line"></div>
            </td>
          </tr>
          <!-- <tr :class="['clickable-row', itemRowBackground(item)]" @click="openFile(item)"> -->
          <tr :class="['clickable-row']" @click="openFile(item)">
            <td
              v-if="isFirstFloorCell(index)"
              :rowspan="floorRowSpan(index)"
              class="floor-span-cell"
            >
              {{ item.floor }}
            </td>
            <td :class="soldTextClass(item)"><div class="d-flex justify-center">{{ item.flatId }}</div></td>
            <td :class="soldTextClass(item)">{{ item.buyerName }}</td>
            <td :class="soldTextClass(item)">{{ item.directions }}</td>
            <td :class="soldTextClass(item)">{{ item.rooms }}</td>
            <td :class="['map-click-cell', soldTextClass(item)]" @click.stop="openPropertyMap(item, 'warehouse')"> {{ item.warehouseId }} - ({{ item.warehouseArea }})</td>
            <td :class="['map-click-cell', soldTextClass(item)]" @click.stop="openPropertyMap(item, 'parking')"> {{ item.parkingId }}</td>
            <td :class="soldTextClass(item)">{{ item.flatArea }}</td>
            <td :class="soldTextClass(item)">{{ item.balconyArea }}</td>
            <td :class="soldTextClass(item)">{{ item.equivalentArea }}</td>
            <td :class="soldTextClass(item)">{{ item.flatPrice.toLocaleString() }}</td>
          </tr>
      </template>

      <template v-slot:no-data>
        <v-alert type="info" text>
          לא נמצאו רשומות עבור טבלת מחירי הדירות.
        </v-alert>
      </template>
    </v-data-table>
    <modal-dialog ref="modalDialog"/>
    <PropertyMapDialog
      v-model="propertyMapDialog"
      :item="selectedPropertyMapItem"
      :mode="selectedPropertyMapMode"
      :warehouseArea="warehouseArea"
      @download-pdf="handlePropertyMapPdf"
    />
    <PropertyMapOverviewDialog
      v-model="propertyMapOverviewDialog"
      :mode="propertyMapOverviewMode"
      :price-list="priceList"
    />
  </v-card>
</template>

<script>
import { PRICELIST_MODEL, HOLDER_MODEL, viewGDFile } from '../../constants/constants';
import apiService from '../../services/apiService';
import excel from 'vue-excel-export';
import Vue from 'vue';
import modalDialog from '../Common/ViewFileModal.vue';
import PropertyMapDialog from '@/components/PriceList/PropertyMapDialog.vue';
import PropertyMapOverviewDialog from '@/components/PriceList/PropertyMapOverviewDialog.vue';


Vue.use(excel);

export default {
  name: 'PriceListTable',
  components: {modalDialog, PropertyMapDialog, PropertyMapOverviewDialog},
  data() {
    return {
      priceList: [],
      search: '',
      headers: [
        { text: 'קומה', value: 'floor', class: 'light-blue', groupable: false },
        { text: 'מס דירה', value: 'flatId', class: 'light-blue', groupable: false },
        { text: 'שם קונה', value: 'buyerName', class: 'light-blue', groupable: false },
        { text: 'כיוון אוויר', value: 'directions', class: 'light-blue', groupable: false },
        { text: 'חדרים', value: 'rooms', class: 'light-blue', groupable: false },
        { text: 'מחסן (גודל)', value: 'warehouseId', sortable: false, class: 'light-blue', groupable: false },
        { text: 'חניה', value: 'parkingId', sortable: false, class: 'light-blue', groupable: false },
        { text: 'שטח דירה', value: 'flatArea', sortable: false, class: 'light-blue', groupable: false },
        { text: 'שטח מרפסת', value: 'balconyArea', sortable: false, class: 'light-blue', groupable: false },
        { text: 'שטח אקוו', value: 'equivalentArea', sortable: false, class: 'light-blue', groupable: false },
        { text: 'מחיר דירה', value: 'flatPrice', sortable: false, class: 'light-blue', groupable: false },
      ],
      isLoading: false,
      propertyMapDialog: false,
      selectedPropertyMapItem: null,
      selectedPropertyMapMode: null,
      warehouseArea: null,
      propertyMapOverviewDialog: false,
      propertyMapOverviewMode: null,
      availabilityFilter: 'all',
    };
  },

  computed: {
    displayedPriceList() {
      const term = this.search ? this.search.toString().trim().toLowerCase() : '';
      let list = this.priceList;
      if (this.availabilityFilter === 'available') {
        list = list.filter(item => item.status !== 'נמכר');
      }
      if (this.availabilityFilter === 'sold') {
        list = list.filter(item => item.status === 'נמכר');
      }
      if (!term) return list;
      return list.filter((item) =>
        Object.values(item).some((value) =>
          value !== null &&
          value !== undefined &&
          value.toString().toLowerCase().includes(term)
        )
      );
    },
  },

  methods: {
    retrievePriceList() {
      this.isLoading = true;

      Promise.all([
        apiService.clientGetEntities(PRICELIST_MODEL),
        apiService.clientGetEntities(HOLDER_MODEL),
      ])
        .then(([priceListResponse, holderResponse]) => {
          const holdersByFlatId = (holderResponse.data || []).reduce((acc, holder) => {
            acc[holder.flatId] = holder;
            return acc;
          }, {});

          this.priceList = (priceListResponse.data || []).map((priceListItem) => ({
            ...priceListItem,
            buyerName: holdersByFlatId[priceListItem.flatId]?.name || "",
          }));

          // console.log('Price list retrieved:', this.priceList);  // if you put outside of promise, it will be empty because of async nature of JS
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

    // itemRowBackground(item) {
    //   return item.status === '' ? 'bg-green' : '';
    // },

    async openFile(item) {
      await viewGDFile(item.flatChart, this.$refs.modalDialog);
    },

    openPropertyMap(item, mode) {
      this.selectedPropertyMapItem = item;
      this.selectedPropertyMapMode = mode;
      this.warehouseArea = item.warehouseArea;
      this.propertyMapDialog = true;
    },

    openOverviewMap(mode) {
      this.propertyMapOverviewMode = mode;
      this.propertyMapOverviewDialog = true;
    },

    handlePropertyMapPdf(item) {
      console.log('PDF export will be connected to existing PDF submodule', item);
    },

    isSold(item) {
      return item.status === 'נמכר';
    },

    soldTextClass(item) {
      return this.isSold(item) ? 'sold-text' : 'available-text';
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
  /* background-color: #1976d2; */
  background-color: black;
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

::v-deep .bg-green td {
  background-color: #d9f6d9 !important;
}

.floor-span-cell {
  /* background-color: #e3f2fd !important; */
  font-weight: bold;    
  font-size: 20px !important;
  text-align-last: center;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  filter: brightness(95%);
}

::v-deep .map-click-cell {
  /* color: #1976d2; */
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}

::v-deep .map-click-cell:hover {
  background-color: lightblue;
}

.overview-actions {
  display: flex;
  gap: 8px;
  direction: rtl;
}

.sold-text {
  color: #9e9e9e !important;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
  opacity: 0.60;
}

.available-text {
  color: #1976d2;
  font-weight: bold;    
}

.availability-toggle {
  margin-right: 8px;
}
.price-list-title-wrapper {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
}

.overview-actions {
  display: flex;
  gap: 8px;
}

.title-center {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}

/* Mobile */
@media (max-width: 600px) {
  .price-list-title-wrapper {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "left right"
      "title title";
    row-gap: 12px;
    column-gap: 8px;
  }

  .overview-actions {
    grid-area: left;
    justify-content: flex-start;
  }

  .availability-toggle {
    grid-area: right;
    justify-self: end;
  }

  .title-center {
    grid-area: title;
    font-size: 20px;
    width: 100%;
  }
}
</style>