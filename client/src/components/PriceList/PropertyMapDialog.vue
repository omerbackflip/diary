<template>
  <v-dialog
    v-model="internalValue"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="1100"
  >
    <v-card v-if="item">
      <v-card-title class="property-map-title">
        <div>
          מפת חניה ומחסן — דירה {{ item.flatId }}
          <div class="property-map-subtitle">
            קומה {{ item.floor }} |
            חניה {{ parkingSummary }} |
            מחסן {{ warehouseSummary }}
          </div>
        </div>

        <v-spacer />

        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text >
        <div v-if="selectedSection">
          <!-- <div class="map-toolbar">
            <v-btn small outlined @click="viewMode = 'fullMap'">
              מפה מלאה
            </v-btn>

            <v-btn small outlined @click="viewMode = 'autoZoom'">
              התמקדות
            </v-btn>
          </div> -->

          <div class="map-scroll">
            <div
              class="map-wrapper"
              :class="{ 'auto-zoom': viewMode === 'autoZoom' }"
              :style="wrapperStyle(selectedSection)"
            >
              <img
                :src="mapAssets[selectedSection.mapKey]"
                class="map-image"
              />

              <div
                class="highlight-area"
                :class="highlightClass"
                :style="areaStyle(selectedSection.area)"
              >
                <!-- <span>{{ selectedSection.area.label }}</span> -->
              </div>
            </div>
          </div>
        </div>

        <v-alert v-else type="warning" text>
          לא נמצאה מפה עבור הפריט שנבחר
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  mapAssets,
  propertyMapItems,
  mapSettings,
} from '@/config/propertyMapConfig';

export default {
  name: 'PropertyMapDialog',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: null,
    },
    mode: {
      type: String,
      default: null, // 'parking' | 'warehouse'
    },
    warehouseArea: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      mapAssets,
      tab: 0,
      viewMode: mapSettings.initialViewMode || 'autoZoom',
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

    selectedSection() {
      if (!this.item || !this.mode) return null;

      if (this.mode === 'parking') {
        const parking = propertyMapItems.parkings[this.item.parkingId];

        if (!parking) return null;

        return {
          key: 'parking',
          title: 'חניה',
          mapKey: 'basement',
          area: {
            ...parking,
            key: `parking-${this.item.parkingId}`,
            type: 'parking',
          },
        };
      }

      if (this.mode === 'warehouse') {
        const warehouse = propertyMapItems.warehouses[this.item.warehouseId];

        if (!warehouse) return null;

        return {
          key: 'warehouse',
          title: 'מחסן',
          mapKey: warehouse.mapKey,
          area: {
            ...warehouse,
            key: `warehouse-${this.item.warehouseId}`,
            type: 'warehouse',
          },
        };
      }

      return null;
    },

    parkingSummary() {
        if (!this.item || !this.item.parkingId) {
            return 'אין';
        }

        const parking = propertyMapItems.parkings[this.item.parkingId];

        if (!parking) {
            return `${this.item.parkingId} - לא נמצאו קואורדינטות`;
        }

        return this.item.parkingId;
    },

    warehouseSummary() {
        if (!this.item || !this.item.warehouseId) {
            return 'אין';
        }

        const warehouse = propertyMapItems.warehouses[this.item.warehouseId];
        if (!warehouse) {
            return `${this.item.warehouseId} - לא נמצאו קואורדינטות`;
        }

        return `${this.item.warehouseId} (${this.warehouseArea} מ"ר)`;
    },

    highlightClass() {
      const status = (this.item?.status || '').toLowerCase();

      if (
        status.includes('sold') ||
        status.includes('נמכר')
      ) {
        return 'highlight-sold';
      }

      return 'highlight-available';
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

    wrapperStyle(section) {
      if (this.viewMode !== 'autoZoom') {
        return {};
      }

      const area = section.area;

      if (!area) {
        return {};
      }

      const centerX = area.x + area.width / 2;
      const centerY = area.y + area.height / 2;

      return {
        transformOrigin: `${centerX}% ${centerY}%`,
      };
    },

    printMap() {
      window.print();
    },

    downloadPdf() {
      // Temporary placeholder.
      // Later we connect this to your existing PDF submodule.
      this.$emit('download-pdf', this.item);
    },
  },
};
</script>

<style scoped>
.property-map-title {
  direction: rtl;
}

.property-map-subtitle {
  font-size: 14px;
  font-weight: normal;
  color: #666;
  margin-top: 4px;
}

.map-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  direction: rtl;
}

.map-scroll {
  width: 100%;
  height: calc(90vh - 180px);
  overflow: auto;
  background: #f5f5f5;
}

.map-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  transition: transform 0.25s ease;
}

.map-wrapper.auto-zoom {
  transform: scale(1.8);
}

.map-image {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
}

.highlight-area {
  position: absolute;
  border: 2px solid;
  font-weight: bold;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.highlight-area span {
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 5px;
  border-radius: 4px;
}

.highlight-area.highlight-sold {
  border: 4px solid #d32f2f;
  background: rgba(211, 47, 47, 0.28);
}

.highlight-area.highlight-available {
  border: 4px solid #2e7d32;
  background: rgba(46, 125, 50, 0.28);
}

@media print {
  .v-dialog__content {
    position: static !important;
  }

  .map-toolbar,
  .v-tabs {
    display: none !important;
  }

  .map-scroll {
    height: auto;
    overflow: visible;
  }

  .map-wrapper {
    transform: none !important;
    min-width: unset;
  }

}
</style>