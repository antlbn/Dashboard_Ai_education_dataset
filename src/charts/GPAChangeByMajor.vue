<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'

const filters = useFiltersStore()

const majors = ['Arts', 'Business', 'Humanities', 'Medical', 'STEM'] as const

const chartData = computed(() => {
  const values = majors.map(major => {
    const group = filters.filteredStudents.filter(s => s.Major_Category === major)
    if (!group.length) return 0
    return group.reduce((acc, s) => acc + s.GPA_change, 0) / group.length
  })

  return {
    labels: majors,
    datasets: [{
      label: 'Среднее изменение GPA',
      data: values.map(v => +v.toFixed(3)),
      backgroundColor: values.map(v => v >= 0 ? '#a6e3a1' : '#f38ba8'),
      borderRadius: 4,
    }],
  }
})

const options = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#585b70' }, grid: { color: '#313244' } },
    y: { ticks: { color: '#585b70' }, grid: { color: '#313244' } },
  },
}
</script>

<template>
  <div class="chart-card">
    <h3>Среднее изменение GPA по специальности</h3>
    <Bar :data="chartData" :options="options" />
  </div>
</template>

<style scoped>
.chart-card {
  background: #181825;
  border: 1px solid #313244;
  border-radius: 10px;
  padding: 1.25rem;
}
h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #585b70;
  margin: 0 0 1rem;
}
</style>
