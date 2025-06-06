<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels); // optional cleanup
Chart.plugins.register(ChartDataLabels);   // register globally

export default {
  name: 'BarChart',
  props: {
    data: {type: Array, required: true},
    type: {type: String, default: 'pie'},
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
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: '#000',
              anchor: this.type === 'pie' ? 'center' : 'end',
              align: this.type === 'pie' ? 'center' : 'top',
              font: {
                weight: 'bold',
                size: 14
              },
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0].data;
                const total = data.reduce((a, b) => a + b, 0);
                const percent = (value / total * 100).toFixed(1) + '%';
                return percent;
              }
            }
          }
        },
        plugins: [ChartDataLabels]
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
    this.renderChart(); // Loads full data (no filters)
  }

};
</script>

<style scoped>
div {
  height: 400px;
}
</style>
