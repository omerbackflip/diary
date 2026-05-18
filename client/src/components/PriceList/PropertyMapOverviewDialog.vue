<template>
  <v-dialog
    v-model="internalValue"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="1200"
  >
    <v-card>
      <v-card-title class="overview-title">
        <div>{{ dialogTitle }}</div>

        <v-spacer />

        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="legend">
          <div class="legend-item">
            <span class="legend-color sold"></span>
            <span>נמכר</span>
          </div>

          <div class="legend-item">
            <span class="legend-color available"></span>
            <span>פנוי</span>
          </div>
        </div>

        <div v-if="mode === 'parkings'" class="overview-section">
          <div class="overview-section-title">
            חניון - מרתף
          </div>

          <div class="map-wrapper">
            <img
              :src="mapAssets.basement"
              class="map-image"
              draggable="false"
            />

            <div
              v-for="area in parkingAreas"
              :key="area.key"
              :class="['overview-area', area.statusClass]"
              :style="areaStyle(area)"
            >
              {{ area.displayLabel }}
            </div>
          </div>
        </div>

        <div v-else-if="mode === 'warehouses'">
          <div
            v-for="section in warehouseSections"
            :key="section.mapKey"
            class="overview-section"
          >
            <div class="overview-section-title">
              {{ section.title }}
            </div>

            <div class="map-wrapper">
              <img
                :src="mapAssets[section.mapKey]"
                class="map-image"
                draggable="false"
              />

              <div
                v-for="area in section.areas"
                :key="area.key"
                :class="['overview-area', area.statusClass]"
                :style="areaStyle(area)"
              >
                {{ area.displayLabel }}
              </div>
            </div>
          </div>
        </div>

        <v-alert v-else type="warning" text>
          לא נבחרה מפת סקירה
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  mapAssets,
  propertyMapItems,
} from '@/config/propertyMapConfig';

export default {
  name: 'PropertyMapOverviewDialog',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: null, // 'parkings' | 'warehouses'
    },
    priceList: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      mapAssets,
    };
  },

  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    dialogTitle() {
      if (this.mode === 'parkings') {
        return 'סקירת חניות';
      }

      if (this.mode === 'warehouses') {
        return 'סקירת מחסנים';
      }

      return 'סקירת מפה';
    },

    soldItems() {
        return this.priceList.filter(item => item.status === 'נמכר');
    },

    soldParkingIds() {
        return this.soldItems
            .map(item => Number(item.parkingId))
            .filter(id => !Number.isNaN(id));
    },

    soldWarehouseIds() {
        return this.soldItems
            .map(item => Number(item.warehouseId))
            .filter(id => !Number.isNaN(id));
    },

    parkingFlatById() {
        return this.priceList.reduce((acc, item) => {
            const parkingId = Number(item.parkingId);

            if (!Number.isNaN(parkingId)) {
            acc[parkingId] = item.flatId;
            }

            return acc;
        }, {});
    },

    warehouseFlatById() {
        return this.priceList.reduce((acc, item) => {
            const warehouseId = Number(item.warehouseId);

            if (!Number.isNaN(warehouseId)) {
            acc[warehouseId] = item.flatId;
            }

            return acc;
        }, {});
    },

    parkingAreas() {
      return Object.keys(propertyMapItems.parkings).map((id) => {
        const numericId = Number(id);
        const area = propertyMapItems.parkings[id];

        const flatId = this.parkingFlatById[numericId];

        return {
        ...area,
        id: numericId,
        key: `parking-${id}`,
        displayLabel: flatId ? `${numericId} (${flatId})` : `${numericId}`,
        statusClass: this.soldParkingIds.includes(numericId)
            ? 'sold'
            : 'available',
        };


      });
    },

    warehouseSections() {
      const sections = [
        { mapKey: 'basement', title: 'מחסנים - מרתף' },
        { mapKey: 'ground', title: 'מחסנים - קרקע' },
        { mapKey: 'floor', title: 'מחסנים - קומה טיפוסית' },
        { mapKey: 'floor8', title: 'מחסנים - קומה 8' },
      ];

      return sections.map(section => ({
        ...section,
        areas: this.warehouseAreasByMap(section.mapKey),
      }));
    },
  },

  methods: {
    close() {
      this.internalValue = false;
    },

    areaStyle(area) {
      return {
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
      };
    },

    warehouseAreasByMap(mapKey) {
      return Object.keys(propertyMapItems.warehouses)
        .filter(id => propertyMapItems.warehouses[id].mapKey === mapKey)
        .map((id) => {
          const numericId = Number(id);
          const area = propertyMapItems.warehouses[id];

            const flatId = this.warehouseFlatById[numericId];

            return {
            ...area,
            id: numericId,
            key: `warehouse-${id}`,
            displayLabel: flatId ? `${numericId} (${flatId})` : `${numericId}`,
            statusClass: this.soldWarehouseIds.includes(numericId)
                ? 'sold'
                : 'available',
            };
        });
    },
  },
};
</script>

<style scoped>
.overview-title {
  direction: rtl;
  font-weight: bold;
}

.legend {
  display: flex;
  justify-content: flex-end;
  gap: 18px;
  margin-bottom: 12px;
  direction: rtl;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
}

.legend-color {
  width: 18px;
  height: 18px;
  border: 2px solid;
  display: inline-block;
}

.legend-color.sold {
  border-color: red;
  background: rgba(255, 0, 0, 0.28);
}

.legend-color.available {
  border-color: #2e7d32;
  background: rgba(46, 125, 50, 0.28);
}

.overview-section {
  margin-bottom: 28px;
}

.overview-section-title {
  direction: rtl;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.map-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  border: 1px solid #ddd;
  background: #f5f5f5;
}

.map-image {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
}

.overview-area {
  position: absolute;
  border: 3px solid;
  font-size: 12px;
  font-weight: bold;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  overflow: hidden;
}

.overview-area.available {
  border-color: #2e7d32;
  background: rgba(46, 125, 50, 0.28);
}

.overview-area.sold {
  border-color: red;
  background: rgba(255, 0, 0, 0.28);
}
</style>
