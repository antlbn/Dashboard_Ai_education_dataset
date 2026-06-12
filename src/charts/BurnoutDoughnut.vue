<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'

const filters = useFiltersStore()

const chartData = computed(() => {
  const students = filters.filteredStudents
  const total = students.length || 1
  const low = students.filter(s => s.Burnout_Risk_Level === 'Low').length
  const medium = students.filter(s => s.Burnout_Risk_Level === 'Medium').length
  const high = students.filter(s => s.Burnout_Risk_Level === 'High').length

  return {
    labels: [
      `Low (${((low / total) * 100).toFixed(0)}%)`,
      `Medium (${((medium / total) * 100).toFixed(0)}%)`,
      `High (${((high / total) * 100).toFixed(0)}%)`,
    ],
    datasets: [{
      data: [low, medium, high],
      backgroundColor: ['#a6e3a1', '#f9e2af', '#f38ba8'],
      borderWidth: 0,
    }],
  }
})

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#cdd6f4', padding: 16 },
    },
  },
}
</script>

<template>
  <div class="chart-card">
    <h3>Уровень выгорания</h3>
    <Doughnut :data="chartData" :options="options" />
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
