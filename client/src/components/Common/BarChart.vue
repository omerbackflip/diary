<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { isMobile } from '../../constants/constants';

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
  const hasMeetings = this.data.some(item => typeof item.meetingCount === 'number');
  const meetingCounts = hasMeetings ? this.data.map(item => item.meetingCount || 0) : [];

  const totalLeads = counts.reduce((a, b) => a + b, 0);
  const totalMeetings = hasMeetings ? meetingCounts.reduce((a, b) => a + b, 0) : 0;

  const datasets = [
    {
      label: `Total Leads - ${totalLeads} ${!isMobile() ? `         ` : ``}`,
      data: counts,
      backgroundColor: 'blue',
      categoryPercentage: 0.7,
      barPercentage: 0.6
    }
  ];

  if (hasMeetings) {
    datasets.push({
      label: `Meetings - ${totalMeetings}`,
      data: meetingCounts,
      backgroundColor: 'red',
      categoryPercentage: 0.7,
      barPercentage: 0.6
    });
  }

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
          formatter: value => value
        },
        legend: {
          labels: {
            // Override the default legend labels
            generateLabels: chart => {
              const datasets = chart.data.datasets;
              return datasets.map((dataset, i) => ({
                text: dataset.label,
                fillStyle: dataset.backgroundColor,
                hidden: !chart.isDatasetVisible(i),
                lineCap: 'butt',
                lineDash: [],
                lineDashOffset: 0,
                lineJoin: 'miter',
                strokeStyle: dataset.borderColor,
                pointStyle: 'rect',
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
