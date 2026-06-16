<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import ChartCard from '../components/ChartCard.vue'
import { useThemedChart } from './useThemedChart'
import { binIndex } from './chartHelpers'

const { filters, theme, colors } = useThemedChart()

const BIN_WIDTH = 2
const NUM_BINS = 20

const chartData = computed(() => {
  void theme.isDark
  const bins = new Array(NUM_BINS).fill(0)
  for (const s of filters.filteredStudents) {
    bins[binIndex(s.Weekly_GenAI_Hours, BIN_WIDTH, NUM_BINS)]++
  }
  const labels = Array.from({ length: NUM_BINS }, (_, i) => `${i * BIN_WIDTH}-${(i + 1) * BIN_WIDTH}`)
  labels[NUM_BINS - 1] = `${(NUM_BINS - 1) * BIN_WIDTH}-${NUM_BINS * BIN_WIDTH}+`
  return {
    labels,
    datasets: [{
      label: 'Students',
      data: bins,
      backgroundColor: colors.bar,
      borderRadius: 1,
      barPercentage: 1.1,
    }],
  }
})

const options = computed(() => {
  void theme.isDark
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: colors.tick }, grid: { display: false } },
      y: { ticks: { display: false }, grid: { display: false } },
    },
  }
})
</script>

<template>
  <ChartCard title="GenAI hours / week" body-height="200px">
    <Bar :data="chartData" :options="options" />
  </ChartCard>
</template>
