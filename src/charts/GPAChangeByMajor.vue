<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'
import { useThemeStore } from '../stores/themeStore'
import { useChartColors } from './useChartColors'

const filters = useFiltersStore()
const theme = useThemeStore()
const colors = useChartColors()

const majors = ['Arts', 'Business', 'Humanities', 'Medical', 'STEM'] as const

const chartData = computed(() => {
  void theme.isDark
  const values = majors.map(major => {
    const group = filters.filteredStudents.filter(s => s.Major_Category === major)
    if (!group.length) return 0
    return group.reduce((acc, s) => acc + s.GPA_change, 0) / group.length
  })
  return {
    labels: majors as unknown as string[],
    datasets: [{
      label: 'Среднее изменение GPA',
      data: values.map(v => +v.toFixed(3)),
      backgroundColor: values.map(v => v >= 0 ? colors.positive : colors.negative),
      borderRadius: 2,
    }],
  }
})

const options = computed(() => {
  void theme.isDark
  return {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: colors.tick }, grid: { color: colors.grid } },
      y: { ticks: { color: colors.tick }, grid: { color: colors.grid } },
    },
  }
})
</script>

<template>
  <div class="chart-card">
    <h3>Среднее изменение GPA по специальности</h3>
    <Bar :data="chartData" :options="options" />
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
</style>
