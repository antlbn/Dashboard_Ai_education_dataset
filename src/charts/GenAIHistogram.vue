<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'

const filters = useFiltersStore()

const chartData = computed(() => {
  const bins = Array(10).fill(0)
  for (const s of filters.filteredStudents) {
    const idx = Math.min(Math.floor(s.Weekly_GenAI_Hours / 2), 9)
    bins[idx]++
  }
  return {
    labels: ['0-2','2-4','4-6','6-8','8-10','10-12','12-14','14-16','16-18','18+'],
    datasets: [{
      label: 'Студентов',
      data: bins,
      backgroundColor: '#89b4fa',
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
    <h3>GenAI часов/неделю</h3>
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
