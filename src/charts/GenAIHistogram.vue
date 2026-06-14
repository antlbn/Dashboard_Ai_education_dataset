<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'
import { useThemeStore } from '../stores/themeStore'
import { useChartColors } from './useChartColors'

const filters = useFiltersStore()
const theme = useThemeStore()
const colors = useChartColors()

const chartData = computed(() => {
  void theme.isDark
  const bins = Array(20).fill(0)
  for (const s of filters.filteredStudents) {
    const idx = Math.min(Math.floor(s.Weekly_GenAI_Hours / 2), 19)
    bins[idx]++
  }
  const labels = Array.from({ length: 20 }, (_, i) => {
    const start = i * 2
    const end = (i + 1) * 2
    return `${start}-${end}`
  })
  labels[19] = '38-40+'
  return {
    labels,
    datasets: [{
      label: 'Студентов',
      data: bins,
      backgroundColor: colors.bar,
      borderRadius: 1,
      barPercentage: 1.1 ,
    }],
  }
})

const options = computed(() => {
  void theme.isDark
  return {
    responsive: true,
    maintainAspectRatio: false, // allow chart to fill container height
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: colors.tick },
        grid: { display: false },
      },
      y: {
        ticks: { display: false },
        grid: { display: false }
      },
    },
  }
})
</script>

<template>
  <div class="chart-card">
     <h3>GenAI часов/неделю</h3>
    <div class="chart-body">
      <Bar :data="chartData" :options="options" />
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
  height: 200px; /* set a fixed height for the chart container */
} 
</style>

