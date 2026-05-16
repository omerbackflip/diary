<template>
  <v-card>
    <v-card-title>
      Coordinate Picker
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="mapKey"
            :items="mapKeys"
            label="Map"
          />

          <v-select
            v-model="type"
            :items="types"
            label="Type"
          />

          <v-combobox
            v-model="currentId"
            :items="availableIds"
            label="Current ID"
            type="number"
          />

          <v-btn color="primary" @click="copyOutput">
            Copy Output
          </v-btn>

          <h4>Updated Item Only</h4>
          <pre class="output">{{ updatedItemOutput }}</pre>

          <h4 class="mt-4">Full Output</h4>
          <pre class="output">{{ output }}</pre>
        </v-col>

        <v-col cols="12" md="9">
          <div
            ref="mapWrapper"
            class="map-wrapper"
            @mousedown="startDraw"
            @mousemove="moveDraw"
            @mouseup="finishDraw"
          >
            <img
              ref="mapImage"
              :src="mapAssets[mapKey]"
              class="map-image"
              draggable="false"
            />

            <div
              v-if="draft"
              class="draft-area"
              :style="areaStyle(draft)"
            />

            <div
              v-if="currentExistingArea"
              class="existing-area"
              :style="areaStyle(currentExistingArea)"
            >
              {{ currentExistingArea.label }}
            </div>

            <div
              v-for="area in savedAreas"
              :key="area.id"
              class="saved-area"
              :style="areaStyle(area)"
            >
              {{ area.label }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapAssets, propertyMapItems } from '@/config/propertyMapConfig';

export default {
  name: 'MapCoordinatePicker',

  data() {
    return {
      mapAssets,
      mapKey: 'basement',
      mapKeys: ['basement', 'ground', 'floor', 'floor8'],
      type: 'parking',
      types: ['parking', 'warehouse'],
      currentId: null,
      isDrawing: false,
      startPoint: null,
      draft: null,
      savedAreas: [],
    };
  },

  computed: {
    output() {
      const obj = {};
      this.savedAreas.forEach(area => {
        obj[area.id] = {
          label: area.label,
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
        };
      });
      return JSON.stringify(obj, null, 2);
    },

    availableIds() {
      if (this.type === 'parking') {
        return Object.keys(propertyMapItems.parkings).map(Number);
      }
      return Object.keys(propertyMapItems.warehouses).map(Number);
    },

    currentExistingArea() {
      if (!this.currentId) return null;
      const source =
        this.type === 'parking'
          ? propertyMapItems.parkings
          : propertyMapItems.warehouses;

      return source[this.currentId] || null;
    },

    updatedItemOutput() {
      if (!this.savedAreas.length) return '';

      const area = this.savedAreas[this.savedAreas.length - 1];

      const base =
        this.type === 'parking'
          ? propertyMapItems.parkings[area.id] || {}
          : propertyMapItems.warehouses[area.id] || {};

      const updated = {
        ...base,
        label: this.type === 'parking' ? `חניה ${area.id}` : `מחסן ${area.id}`,
        ...(this.type === 'warehouse' ? { area: base.area || 0, mapKey: this.mapKey } : {}),
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
      };

      return `${area.id}: ${JSON.stringify(updated, null, 2)},`;
    },
  },

  methods: {
    getPoint(event) {
      const rect = this.$refs.mapImage.getBoundingClientRect();

      return {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
    },

    startDraw(event) {
      if (!this.currentId) return;

      this.isDrawing = true;
      this.startPoint = this.getPoint(event);
      this.draft = null;
    },

    moveDraw(event) {
      if (!this.isDrawing || !this.startPoint) return;
      const current = this.getPoint(event);
      const x = Math.min(this.startPoint.x, current.x);
      const y = Math.min(this.startPoint.y, current.y);
      const width = Math.abs(current.x - this.startPoint.x);
      const height = Math.abs(current.y - this.startPoint.y);
      this.draft = {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        width: Number(width.toFixed(2)),
        height: Number(height.toFixed(2)),
      };
    },

    finishDraw() {
      if (!this.draft || !this.currentId) return;
      const id = Number(this.currentId);
      this.savedAreas = this.savedAreas.filter(area => area.id !== id);
      this.savedAreas.push({
        id,
        label: this.type === 'parking' ? `חניה ${id}` : `מחסן ${id}`,
        ...this.draft,
      });
      this.currentId = id + 1;
      this.isDrawing = false;
      this.startPoint = null;
      this.draft = null;
    },

    areaStyle(area) {
      return {
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
      };
    },

    async copyOutput() {
      await navigator.clipboard.writeText(this.output);
    },

    syncMapFromExistingItem() {
      const area = this.currentExistingArea;

      if (!area) return;

      if (this.type === 'parking') {
        this.mapKey = 'basement';
        return;
      }

      this.mapKey = area.mapKey || 'basement';
    },
  },

  watch: {
    currentId() {
      this.syncMapFromExistingItem();
    },
    type() {
      this.syncMapFromExistingItem();
    },
  },
};
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  border: 1px solid #ccc;
  overflow: hidden;
  user-select: none;
}

.map-image {
  display: block;
  width: 100%;
}

.draft-area,
.saved-area {
  position: absolute;
  border: 2px solid #1976d2;
  background: rgba(25, 118, 210, 0.25);
  color: #000;
  font-weight: bold;
  font-size: 13px;
  text-align: center;
  pointer-events: none;
}

.saved-area {
  background: rgba(255, 152, 0, 0.28);
  border-color: #fb8c00;
}

.existing-area {
  position: absolute;
  border: 3px dashed #000;
  background: rgba(255, 255, 255, 0.25);
  color: #000;
  font-weight: bold;
  font-size: 13px;
  text-align: center;
  pointer-events: none;
}
</style>