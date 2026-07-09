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

    <div class="price-list-layout">
      <aside class="floor-map-panel">
        <div class="floor-map-sticky">
          <div class="floor-map-wrapper">
            <img
              :src="mapAssets[visibleMapKey]"
              class="floor-map-image"
              alt="Floor map"
            />

            <svg
              class="floor-map-overlay"
              viewBox="0 0 4494 3179"
              preserveAspectRatio="xMidYMid meet"
            >
              <polygon
                v-for="polygon in visiblePolygons"
                :key="polygon.key"
                :points="polygon.points"
                :class="flatPolygonClass(polygon)"
              />
            </svg>
          </div>
        </div>
      </aside>

      <div class="price-list-table-panel">
        <v-data-table
          :headers="headers"
          :items="displayedPriceList"
          disable-sort
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
              <tr
                :class="['clickable-row']"
                @click="handleRowClick(item)"
                @mouseenter="setHoveredPriceListItem(item)"
                @mouseover="setHoveredPriceListItem(item)"
                @mousemove="positionFlatChartPreview($event)"
                @mouseleave="clearHoveredPriceListItem(); hideFlatChartPreview()"
              >
                <!-- @mouseenter="scheduleFlatChartPreview(item, $event)"  // preview the chart on hover -->
                <td
                  v-if="isFirstFloorCell(index)"
                  :rowspan="floorRowSpan(index)"
                  class="floor-span-cell"
                >
                  {{ item.floor }}
                </td>
                <td
                  :class="['flat-id-cell', soldTextClass(item)]"
                  @click.stop="openFile(item)"
                >
                  <div class="d-flex justify-center">{{ item.flatId }}</div>
                </td>
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
      </div>
    </div>

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
    <div
      v-if="flatChartPreview.item"
      v-show="flatChartPreview.visible"
      class="flat-chart-preview"
      :style="flatChartPreviewStyle"
    >
      <div class="flat-chart-preview-header">
        <strong>דירה {{ flatChartPreview.item.flatId }}</strong>
        <span>קומה {{ flatChartPreview.item.floor }} | {{ flatChartPreview.item.rooms }} חדרים</span>
      </div>

      <div class="flat-chart-preview-frame">
        <img
          v-if="flatChartPreview.url"
          :src="flatChartPreview.url"
          class="flat-chart-preview-image"
          alt="Flat chart preview"
          title="Flat chart preview"
          @error="handleFlatChartPreviewImageError"
        />
        <div v-else class="flat-chart-preview-empty">
          {{ flatChartPreviewEmptyText }}
        </div>
      </div>

      <div class="flat-chart-preview-footer">
        לחץ על השורה לפתיחה מלאה
      </div>
    </div>
  </v-card>
</template>

<script>
import { PRICELIST_MODEL, HOLDER_MODEL, viewGDFile } from '../../constants/constants';
import apiService from '../../services/apiService';
import excel from 'vue-excel-export';
import Vue from 'vue';
import { GoogleFileViewerModal as modalDialog, googleDriveThumbnailUrl } from '../../../../google/frontend';
import PropertyMapDialog from '@/components/PriceList/PropertyMapDialog.vue';
import PropertyMapOverviewDialog from '@/components/PriceList/PropertyMapOverviewDialog.vue';
import { mapAssets } from '@/config/propertyMapConfig';

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
      flatChartPreview: {
        visible: false,
        item: null,
        url: '',
        loadedFileId: '',
        error: '',
        x: 0,
        y: 0,
        timer: null,
      },
      flatChartThumbnailCache: {},
      hoveredPriceListItem: null,
      mapAssets,
      activeMapKey: 'floor',
      flatPolygons: {
        "floor.buildingA.upperRight": "2905,341 2905,862 2136,869 2132,766 1817,756 1811,576 1627,576 1630,331",
        "floor.buildingA.lowerRight": "2136,862 2901,853 2895,1380 1621,1377 1618,1142 1618,1142 1824,1155 1824,975 2132,972",
        "floor.buildingA.lowerLeft": "1106,866 424,856 427,1416 598,1412 591,1638 1315,1644 1318,1400 1418,1390 1425,965 1100,972",
        "floor.buildingA.upperLeft": "427,335 1624,325 1621,579 1511,576 1518,750 1103,753 1112,862 417,846",
        "floor.buildingB.upperRight": "3291,1676 4005,1680 4005,1927 4159,1937 4159,2461 3506,2465 3506,2362 3304,2358 3310,2181 3136,2178 3127,1934 3291,1927",
        "floor.buildingB.lowerRight": "3500,2465 4159,2468 4163,2996 2966,2996 2962,2738 3085,2751 3072,2568 3516,2574",
        "floor.buildingB.lowerLeft": "1682,2461 2432,2458 2438,2580 2776,2593 2766,2757 2962,2754 2962,2999 1685,2996",
        "floor.buildingB.upperLeft": "1679,1931 3133,1934 3139,2178 3020,2178 3017,2336 2425,2336 2432,2445 1679,2455",
        "ground.buildingA.ground": "1737,589 1743,370 2901,370 2898,1107 2612,1380 2432,1387 2425,1184 2168,1194 2171,917 1891,901 1891,782 1737,775",
        "ground.buildingB.groundRight": "2863,1969 2860,1512 2946,1422 3941,1425 3925,2169 3156,2181 3149,2101 2998,2101 2991,1985",
        "ground.buildingB.groundLeft": "3143,2169 3925,2169 3899,2909 2631,2912 2634,2571 2615,2571 2618,2394 2843,2394 2843,2275 3156,2268",
        "floor8.buildingA.penthouseRight": "1425,0 2737,0 2744,1265 1585,1265 1579,975 1640,975 1650,766 1762,760 1762,666 1766,625 1647,621 1656,296 1425,296",
        "floor8.buildingA.penthouseLeft": "208,6 1421,3 1421,319 1315,325 1309,502 1196,505 1203,718 1325,715 1325,969 1569,969 1585,1272 1058,1268 1051,1561 208,1565",
        "floor8.buildingB.penthouseRight": "3065,1899 3384,1899 3390,1606 4217,1606 4221,3155 2998,3152 2998,2843 3110,2843 3120,2662 3413,2649 3413,2527 3526,2527 3522,2405 3410,2408 3397,2186 3065,2186",
        "floor8.buildingB.penthouseLeft": "1685,1896 3065,1896 3072,2402 2860,2405 2853,2569 2769,2569 2766,2868 3001,2872 3001,3158 1685,3152"
      },
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
      if (term) {
        list = list.filter((item) =>
          Object.values(item).some((value) =>
            value !== null &&
            value !== undefined &&
            value.toString().toLowerCase().includes(term)
          )
        );
      }

      return list.slice().sort((a, b) => {
        const aFlatId = Number(a.flatId);
        const bFlatId = Number(b.flatId);

        if (Number.isNaN(aFlatId) && Number.isNaN(bFlatId)) return 0;
        if (Number.isNaN(aFlatId)) return 1;
        if (Number.isNaN(bFlatId)) return -1;

        return aFlatId - bFlatId;
      });
    },

    flatChartPreviewStyle() {
      return {
        left: `${this.flatChartPreview.x}px`,
        top: `${this.flatChartPreview.y}px`,
      };
    },

    flatChartPreviewEmptyText() {
      return this.flatChartPreview.error || 'אין קובץ תכנית לדירה זו';
    },

    activeFlatMapItem() {
      if (!this.hoveredPriceListItem) return null;
      return this.getFlatMapItem(this.hoveredPriceListItem.flatId);
    },

    visibleMapKey() {
      return this.activeFlatMapItem?.mapKey || 'floor';
    },

    visiblePolygons() {
      return Object.entries(this.flatPolygons)
        .filter(([key, points]) => key.startsWith(`${this.visibleMapKey}.`) && points)
        .map(([key, points]) => {
          const [, buildingKey, positionKey] = key.split('.');

          return {
            key,
            buildingKey,
            positionKey,
            points,
            active:
              this.activeFlatMapItem?.buildingKey === buildingKey &&
              this.activeFlatMapItem?.positionKey === positionKey,
          };
        })
        .sort((a, b) => Number(a.active) - Number(b.active));
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
      this.hideFlatChartPreview();
      await viewGDFile(item.flatChart, this.$refs.modalDialog);
    },

    handleRowClick(item) {
      if (this.$vuetify.breakpoint.smAndDown) return;
      this.openFile(item);
    },

    scheduleFlatChartPreview(item, event) {
      this.clearFlatChartPreviewTimer();
      this.positionFlatChartPreview(event);

      this.flatChartPreview.timer = window.setTimeout(() => {
        this.showFlatChartPreview(item);
      }, 650);
    },

    showFlatChartPreview(item) {
      const fileId = item.flatChart || '';

      this.flatChartPreview.item = item;
      this.flatChartPreview.visible = true;
      this.flatChartPreview.loadedFileId = fileId;
      this.flatChartPreview.error = '';

      if (!fileId) {
        this.flatChartPreview.url = '';
        return;
      }

      if (this.flatChartThumbnailCache[fileId]) {
        this.flatChartPreview.url = this.flatChartThumbnailCache[fileId];
        return;
      }

      const thumbnailUrl = googleDriveThumbnailUrl(fileId, {
        apiBaseUrl: this.googleApiBaseUrl(),
        size: 1000,
      });

      this.$set(this.flatChartThumbnailCache, fileId, thumbnailUrl);
      this.flatChartPreview.url = thumbnailUrl;
    },

    handleFlatChartPreviewImageError() {
      if (this.flatChartPreview.loadedFileId) {
        this.$delete(this.flatChartThumbnailCache, this.flatChartPreview.loadedFileId);
      }

      this.flatChartPreview.url = '';
      this.flatChartPreview.error = 'לא ניתן להציג תצוגה מקדימה';
    },

    googleApiBaseUrl() {
      return process.env.VUE_APP_API_URL
        .replace(/\/$/, '')
        .replace(/\/specific$/, '');
    },

    positionFlatChartPreview(event) {
      const previewWidth = 320;
      const previewHeight = 245;
      const gap = 18;
      const padding = 12;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const preferredX = event.clientX - previewWidth - gap;
      const fallbackX = event.clientX + gap;
      const x = preferredX > padding ? preferredX : fallbackX;
      const y = Math.min(
        Math.max(event.clientY - 70, padding),
        viewportHeight - previewHeight - padding
      );

      this.flatChartPreview.x = Math.min(x, viewportWidth - previewWidth - padding);
      this.flatChartPreview.y = y;
    },

    clearFlatChartPreviewTimer() {
      if (this.flatChartPreview.timer) {
        window.clearTimeout(this.flatChartPreview.timer);
        this.flatChartPreview.timer = null;
      }
    },

    hideFlatChartPreview() {
      this.clearFlatChartPreviewTimer();
      this.flatChartPreview.visible = false;
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

    getFlatMapItem(flatIdValue) {
      const flatId = Number(flatIdValue);

      if (flatId === 1) {
        return { mapKey: 'ground', buildingKey: 'buildingA', positionKey: 'ground' };
      }

      if (flatId >= 2 && flatId <= 29) {
        return {
          mapKey: 'floor',
          buildingKey: 'buildingA',
          positionKey: this.getRegularFlatPosition(flatId, 2),
        };
      }

      if (flatId === 30) {
        return { mapKey: 'floor8', buildingKey: 'buildingA', positionKey: 'penthouseRight' };
      }

      if (flatId === 31) {
        return { mapKey: 'floor8', buildingKey: 'buildingA', positionKey: 'penthouseLeft' };
      }

      if (flatId === 32) {
        return { mapKey: 'ground', buildingKey: 'buildingB', positionKey: 'groundRight' };
      }

      if (flatId === 33) {
        return { mapKey: 'ground', buildingKey: 'buildingB', positionKey: 'groundLeft' };
      }

      if (flatId >= 34 && flatId <= 61) {
        return {
          mapKey: 'floor',
          buildingKey: 'buildingB',
          positionKey: this.getRegularFlatPosition(flatId, 34),
        };
      }

      if (flatId === 62) {
        return { mapKey: 'floor8', buildingKey: 'buildingB', positionKey: 'penthouseRight' };
      }

      if (flatId === 63) {
        return { mapKey: 'floor8', buildingKey: 'buildingB', positionKey: 'penthouseLeft' };
      }

      return null;
    },

    getRegularFlatPosition(flatId, startFlatId) {
      const offset = (flatId - startFlatId) % 4;

      if (offset === 0) return 'upperRight';
      if (offset === 1) return 'lowerRight';
      if (offset === 2) return 'lowerLeft';
      return 'upperLeft';
    },

    setHoveredPriceListItem(item) {
      this.hoveredPriceListItem = item;
    },

    clearHoveredPriceListItem() {
      this.hoveredPriceListItem = null;
    },

    flatPolygonClass(polygon) {
      if (!polygon.active) return 'flat-polygon';

      return [
        'flat-polygon',
        'flat-polygon-active',
        this.isSold(this.hoveredPriceListItem)
          ? 'flat-polygon-sold'
          : 'flat-polygon-available',
      ];
    },
  },

  mounted() {
    this.retrievePriceList();
  },

  beforeDestroy() {
    this.clearFlatChartPreviewTimer();
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

.flat-id-cell {
  cursor: pointer;
}

.clickable-row:hover {
  filter: brightness(95%);
}

.flat-chart-preview {
  position: fixed;
  z-index: 900;
  width: 320px;
  height: 245px;
  direction: rtl;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(25, 118, 210, 0.28);
  border-radius: 8px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
  overflow: hidden;
  pointer-events: none;
}

.flat-chart-preview-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  color: #0d47a1;
  background: #eef6ff;
  border-bottom: 1px solid rgba(25, 118, 210, 0.16);
  font-size: 13px;
  line-height: 1.2;
}

.flat-chart-preview-header span {
  color: #546e7a;
  font-size: 12px;
  white-space: nowrap;
}

.flat-chart-preview-frame {
  position: relative;
  height: 178px;
  background: #eceff1;
  overflow: hidden;
}

.flat-chart-preview-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
  pointer-events: none;
}

.flat-chart-preview-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.flat-chart-preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #607d8b;
  font-size: 13px;
}

.flat-chart-preview-footer {
  padding: 7px 10px;
  color: #455a64;
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 12px;
  text-align: center;
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

.price-list-layout {
  display: grid;
  grid-template-columns: minmax(300px, 38%) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  direction: ltr;
  padding: 0 12px 12px;
}

.price-list-table-panel {
  min-width: 0;
  direction: rtl;
}

.floor-map-panel {
  min-width: 0;
}

.floor-map-sticky {
  position: sticky;
  top: 84px;
}

.floor-map-wrapper {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 110px);
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #f5f5f5;
  overflow: hidden;
}

.floor-map-image {
  display: block;
  width: 100%;
  height: auto;
}

.floor-map-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.flat-polygon {
  fill: rgba(25, 118, 210, 0.06);
  stroke: rgba(25, 118, 210, 0.28);
  stroke-width: 8;
  transition: fill 0.15s ease, stroke 0.15s ease;
}

.flat-polygon-active {
  stroke-width: 14;
}

.flat-polygon-available {
  fill: rgba(46, 125, 50, 0.34);
  stroke: #2e7d32;
}

.flat-polygon-sold {
  fill: rgba(211, 47, 47, 0.28);
  stroke: #d32f2f;
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

  .price-list-layout {
    display: block;
    direction: rtl;
    padding: 0 10px 10px;
  }

  .floor-map-panel {
    width: 100%;
    margin-bottom: 12px;
  }

  .floor-map-sticky {
    position: static;
  }

  .floor-map-wrapper {
    max-height: none;
    overflow: hidden;
  }

  .price-list-table-panel {
    width: 100%;
    min-width: 0;
    direction: rtl;
  }
}
</style>
