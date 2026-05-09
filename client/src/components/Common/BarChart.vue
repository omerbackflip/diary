<template>
  <div style="width:100%; overflow-x:auto;">
    <div style="min-width:600px;">
      <canvas ref="chart" height="400"></canvas>
    </div>
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

      // השמדת גרף קודם אם קיים
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
          label: `Leads: ${totalLeads}    -    Meetings: ${totalMeetings}`,
          data: counts,
          backgroundColor: 'blue',
          categoryPercentage: 0.7,
          barPercentage: 0.6
        }
      ];

      // ---- 👇 דינאמיות של רוחב ----
      // אם יש יותר מ-10 עמודות – נרחיב את הקנבס לפי הכמות
      const baseWidth = 800; // ברירת מחדל (פיקסלים)
      const dynamicWidth = Math.max(labels.length * 100, baseWidth);

      ctx.width = dynamicWidth; // מגדיר את הרוחב בפועל של ה-canvas

      // ---- יצירת הגרף ----
      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
          responsive: labels.length <= 10, // אם מעט קטגוריות – תן לו להיות רספונסיבי
          maintainAspectRatio: false,
          onHover: (event, elements) => {
            event.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          },
          plugins: {
            datalabels: {
              color: '#000',
              anchor: 'end',
              align: 'top',
              font: { weight: 'bold', size: 12 },
              formatter: (value, context) => {
                const i = context.dataIndex;
                return `${value} (${meetingCounts[i]})`;
              }
            },
            legend: {
              labels: {
                generateLabels: chart => chart.data.datasets.map((d, i) => ({
                  text: d.label,
                  fillStyle: d.backgroundColor,
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i
                }))
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });

      // Set onClick after chart creation
      this.chartInstance.options.onClick = (event, elements) => {
        if (elements && elements.length > 0) {
          const index = elements[0]._index;
          if (index >= 0 && index < this.data.length) {
            const label = this.data[index].source;
            this.$emit('bar-click', label);
          }
        }
      };
    },

  },

  mounted() {
    this.renderChart();
  }
};
</script>

<style scoped>
/* div {
  height: 400px;
} */
</style>
