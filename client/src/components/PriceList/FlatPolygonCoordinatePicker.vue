<template>
  <v-card>
    <v-card-title>Flat Polygon Coordinate Picker</v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="mapKey"
            :items="mapKeys"
            label="Map"
          />

          <v-select
            v-model="buildingKey"
            :items="buildingKeys"
            label="Building"
          />

          <v-select
            v-model="positionKey"
            :items="positionKeys"
            label="Position"
          />

          <v-btn small color="primary" class="mr-2" @click="savePolygon">
            Save Polygon
          </v-btn>

          <v-btn small outlined class="mr-2" @click="undoPoint">
            Undo Point
          </v-btn>

          <v-btn small outlined color="error" @click="clearPoints">
            Clear
          </v-btn>

          <v-btn block color="primary" class="mt-4" @click="copyOutput">
            Copy Output
          </v-btn>

          <h4 class="mt-4">Current Points</h4>
          <pre class="output">{{ currentPointsOutput }}</pre>

          <h4 class="mt-4">Full Output</h4>
          <pre class="output">{{ output }}</pre>
        </v-col>

        <v-col cols="12" md="9">
          <div class="map-wrapper">
            <img
              ref="mapImage"
              :src="mapAssets[mapKey]"
              class="map-image"
              draggable="false"
              @click="addPoint"
            />

            <svg
              class="map-overlay"
              :viewBox="viewBox"
              preserveAspectRatio="xMidYMid meet"
            >
              <polygon
                v-if="currentPolygonPoints"
                :points="currentPolygonPoints"
                class="draft-polygon"
              />

              <polyline
                v-if="currentPolygonPoints"
                :points="currentPolygonPoints"
                class="draft-line"
              />

              <circle
                v-for="(point, index) in points"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="14"
                class="point-marker"
              />

              <polygon
                v-for="polygon in savedPolygonList"
                :key="polygon.key"
                :points="polygon.points"
                class="saved-polygon"
              />
            </svg>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapAssets } from '@/config/propertyMapConfig';

export default {
  name: 'FlatPolygonCoordinatePicker',

  data() {
    return {
      mapAssets,
      mapKey: 'floor',
      mapKeys: ['floor', 'ground', 'floor8'],
      buildingKey: 'buildingA',
      buildingKeys: ['buildingA', 'buildingB'],
      positionKey: 'upperRight',
      positionKeys: [
        'upperRight',
        'lowerRight',
        'lowerLeft',
        'upperLeft',
        'ground',
        'groundRight',
        'groundLeft',
        'penthouseRight',
        'penthouseLeft',
      ],
      points: [],
      savedPolygons: {},
      mapSizes: {
        floor: { width: 4494, height: 3179 },
        ground: { width: 4494, height: 3179 },
        floor8: { width: 4494, height: 3179 },
      },
    };
  },

  computed: {
    viewBox() {
      const size = this.mapSizes[this.mapKey];
      return `0 0 ${size.width} ${size.height}`;
    },

    currentKey() {
      return `${this.mapKey}.${this.buildingKey}.${this.positionKey}`;
    },

    currentPolygonPoints() {
      return this.points.map(point => `${point.x},${point.y}`).join(' ');
    },

    currentPointsOutput() {
      return this.currentPolygonPoints;
    },

    savedPolygonList() {
      return Object.entries(this.savedPolygons).map(([key, points]) => ({
        key,
        points,
      }));
    },

    output() {
      return JSON.stringify(this.savedPolygons, null, 2);
    },
  },

  methods: {
    addPoint(event) {
      const rect = this.$refs.mapImage.getBoundingClientRect();
      const size = this.mapSizes[this.mapKey];

      const x = Math.round(((event.clientX - rect.left) / rect.width) * size.width);
      const y = Math.round(((event.clientY - rect.top) / rect.height) * size.height);

      this.points.push({ x, y });
    },

    undoPoint() {
      this.points.pop();
    },

    clearPoints() {
      this.points = [];
    },

    savePolygon() {
      if (this.points.length < 3) return;

      this.$set(this.savedPolygons, this.currentKey, this.currentPolygonPoints);
      this.clearPoints();
    },

    async copyOutput() {
      await navigator.clipboard.writeText(this.output);
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

.map-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.draft-polygon {
  fill: rgba(25, 118, 210, 0.22);
  stroke: #1976d2;
  stroke-width: 10;
}

.draft-line {
  fill: none;
  stroke: #1976d2;
  stroke-width: 8;
}

.saved-polygon {
  fill: rgba(255, 152, 0, 0.18);
  stroke: #fb8c00;
  stroke-width: 8;
}

.point-marker {
  fill: #d32f2f;
  stroke: #fff;
  stroke-width: 5;
}

.output {
  max-height: 260px;
  overflow: auto;
  direction: ltr;
  text-align: left;
  font-size: 12px;
  background: #f5f5f5;
  padding: 8px;
}
</style>