<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import ChartCard from '../components/ChartCard.vue'
import { useThemedChart } from './useThemedChart'
import { BURNOUT_LEVELS } from '../constants'

const { filters, theme, colors } = useThemedChart()

const chartData = computed(() => {
  void theme.isDark
  const students = filters.filteredStudents
  const total = students.length || 1
  const counts = BURNOUT_LEVELS.map(
    level => students.filter(s => s.Burnout_Risk_Level === level).length,
  )
  return {
    labels: BURNOUT_LEVELS.map(
      (level, i) => `${level} (${((counts[i] / total) * 100).toFixed(0)}%)`,
    ),
    datasets: [{
      data: counts,
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
  <ChartCard title="Burnout risk level" body-height="300px">
    <Doughnut :data="chartData" :options="options" />
  </ChartCard>
</template>
