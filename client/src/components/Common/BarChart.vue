<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels);
Chart.plugins.register(ChartDataLabels);

export default {
  name: 'BarChart',
  props: {
    data: { type: Array, required: true }
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
    }
  },

  methods: {
    renderChart() {
      const ctx = this.$refs.chart;

      if (!Array.isArray(this.data) || this.data.length === 0 || !ctx) return;

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const labels = this.data.map(item => item.source);
      const counts = this.data.map(item => item.count);
      const meetingCounts = this.data.map(item => item.meetingCount || 0);

      const totalLeads = counts.reduce((a, b) => a + b, 0);
      const totalMeetings = meetingCounts.reduce((a, b) => a + b, 0);

      const datasets = [
        {
          label: `Leads: ${totalLeads}    -    Metings: ${totalMeetings}`,
          data: counts,
          backgroundColor: 'blue',
          categoryPercentage: 0.7,
          barPercentage: 0.6
        }
      ];

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            datalabels: {
              color: '#000',
              anchor: 'end',
              align: 'top',
              font: {
                weight: 'bold',
                size: 12
              },
              formatter: (value, context) => {
                const index = context.dataIndex;
                const meeting = meetingCounts[index];
                return `${value} (${meeting})`;
              }
            },
            legend: {
              labels: {
                generateLabels: chart => {
                  return chart.data.datasets.map((dataset, i) => ({
                    text: dataset.label,
                    fillStyle: dataset.backgroundColor,
                    hidden: !chart.isDatasetVisible(i),
                    datasetIndex: i
                  }));
                }
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    }
  },

  mounted() {
    this.renderChart();
  }
};
</script>

<style scoped>
div {
  height: 400px;
}
</style>
