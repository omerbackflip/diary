<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  name: 'BarChart',
  props: {
    data: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      default: 'bar' // or 'pie'
    }
  },

  data() {
    return {
      chartInstance: null
    };
  },

  watch: {
    data: {
      deep: true,
      immediate: true,
      handler() {
        this.renderChart();
      }
    },
    type() {
      this.renderChart(); // Re-render when chart type changes
    }
  },

  methods: {
    renderChart() {
      const ctx = this.$refs.chart;

      // Destroy existing chart if any
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const labels = this.data.map(item => item.source);
      const counts = this.data.map(item => item.count);

      this.chartInstance = new Chart(ctx, {
        type: this.type,
        data: {
          labels,
          datasets: [{
            label: 'Leads by Source',
            data: counts,
            backgroundColor: this.generateColors(counts.length)
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

    },

    generateColors(count) {
      const baseColors = [
        '#1976D2', '#E53935', '#43A047', '#FB8C00',
        '#8E24AA', '#00ACC1', '#FDD835', '#6D4C41'
      ];
      const colors = [];
      for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
      }
      return colors;
    }

  },

  mounted() {
    this.getStatistics(); // Loads full data (no filters)
  }

};
</script>

<style scoped>
div {
  height: 400px;
}
</style>
