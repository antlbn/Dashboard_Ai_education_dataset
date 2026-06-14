<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'
import { useThemeStore } from '../stores/themeStore'
import { useChartColors } from './useChartColors'

const filters = useFiltersStore()
const theme = useThemeStore()
const colors = useChartColors()

const chartData = computed(() => {
  void theme.isDark
  const students = filters.filteredStudents
  const total = students.length || 1
  const low    = students.filter(s => s.Burnout_Risk_Level === 'Low').length
  const medium = students.filter(s => s.Burnout_Risk_Level === 'Medium').length
  const high   = students.filter(s => s.Burnout_Risk_Level === 'High').length

  return {
    labels: [
      `Low (${((low / total) * 100).toFixed(0)}%)`,
      `Medium (${((medium / total) * 100).toFixed(0)}%)`,
      `High (${((high / total) * 100).toFixed(0)}%)`,
    ],
    datasets: [{
      data: [low, medium, high],
      backgroundColor: [colors.low, colors.medium, colors.high],
      borderWidth: 0,
    }],
  }
})

const options = computed(() => {
  void theme.isDark
  return {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: colors.tick, padding: 16 },
      },
    },
  }
})
</script>

<template>
  <div class="chart-card">
    <h3>Уровень выгорания</h3>
    <div class="chart-body">
      <Doughnut :data="chartData" :options="options" />
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1.25rem;
}
h3 {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin: 0 0 1rem;
}
.chart-body {
  height: 300px; /* set a fixed height for the chart container */
} 
</style>
