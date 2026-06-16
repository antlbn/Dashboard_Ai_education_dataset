<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import ChartCard from '../components/ChartCard.vue'
import { useThemedChart } from './useThemedChart'
import { MAJORS } from '../constants'

const { filters, theme, colors } = useThemedChart()

const chartData = computed(() => {
  void theme.isDark
  const values = MAJORS.map(major => {
    const group = filters.filteredStudents.filter(s => s.Major_Category === major)
    if (!group.length) return 0
    return group.reduce((acc, s) => acc + s.GPA_change, 0) / group.length
  })
  return {
    labels: [...MAJORS],
    datasets: [{
      label: 'Average GPA change',
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
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: colors.tick }, grid: { color: colors.grid } },
      y: { ticks: { color: colors.tick }, grid: { color: colors.grid } },
    },
  }
})
</script>

<template>
  <ChartCard title="Average GPA change by major" body-height="200px">
    <Bar :data="chartData" :options="options" />
  </ChartCard>
</template>
