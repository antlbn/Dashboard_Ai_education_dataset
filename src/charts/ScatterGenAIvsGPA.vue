<script setup lang="ts">
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'

const filters = useFiltersStore()

// Sample max 500 points — scatter with 5000 is unreadable
const chartData = computed(() => {
  const sample = filters.filteredStudents.slice(0, 500)
  return {
    datasets: [{
      label: 'Студент',
      data: sample.map(s => ({ x: s.Weekly_GenAI_Hours, y: s.GPA_change })),
      backgroundColor: 'rgba(137, 180, 250, 0.4)',
      pointRadius: 3,
    }],
  }
})

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `GenAI: ${ctx.parsed.x}h, ΔGPA: ${ctx.parsed.y.toFixed(2)}`,
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'GenAI часов/неделю', color: '#585b70' },
      ticks: { color: '#585b70' },
      grid: { color: '#313244' },
    },
    y: {
      title: { display: true, text: 'Изменение GPA', color: '#585b70' },
      ticks: { color: '#585b70' },
      grid: { color: '#313244' },
    },
  },
}
</script>

<template>
  <div class="chart-card">
    <h3>GenAI часы vs изменение GPA <span class="note">(r ≈ −0.05, связь незначима)</span></h3>
    <Scatter :data="chartData" :options="options" />
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
.note {
  color: #45475a;
  text-transform: none;
  letter-spacing: 0;
}
</style>
