<script setup lang="ts">
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import ChartCard from '../components/ChartCard.vue'
import { useThemedChart } from './useThemedChart'
import { linearRegression } from './useRegression'
import { subsample } from './chartHelpers'

const { filters, theme, colors } = useThemedChart()

// Render every point up to this cap; above it we strided-sample for perf.
const MAX_POINTS = 5000

const chartData = computed(() => {
  void theme.isDark
  const all = filters.filteredStudents
  const sample = subsample(all, MAX_POINTS)
  const allPoints = all.map(s => ({ x: s.Weekly_GenAI_Hours, y: s.GPA_change }))

  const reg = linearRegression(allPoints)

  const datasets: any[] = [
    {
      label: 'Student',
      data: sample.map(s => ({ x: s.Weekly_GenAI_Hours, y: s.GPA_change })),
      backgroundColor: colors.scatter,
      pointRadius: 3,
      order: 3,
    },
  ]

  if (reg) {
    const { upper, lower } = reg.confidenceBand()
    const line = reg.regressionLine()

    // upper CI boundary (fills down to lower)
    datasets.push({
      label: '95% CI',
      data: upper,
      borderColor: 'transparent',
      backgroundColor: 'rgba(220, 50, 50, 0.1)',
      pointRadius: 0,
      showLine: true,
      fill: '+1',
      tension: 0.3,
      order: 2,
    })

    // lower CI boundary
    datasets.push({
      label: '',
      data: lower,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      pointRadius: 0,
      showLine: true,
      fill: false,
      tension: 0.3,
      order: 2,
    })

    // regression line
    datasets.push({
      label: `Regression (slope=${reg.slope.toFixed(4)})`,
      data: line,
      borderColor: 'rgba(220, 50, 50, 0.85)',
      backgroundColor: 'transparent',
      pointRadius: 0,
      showLine: true,
      borderWidth: 2,
      tension: 0,
      order: 1,
    })
  }

  return { datasets }
})

const options = computed(() => {
  void theme.isDark
  return {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: colors.tick,
          filter: (item: any) => item.text !== '',
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === 'Student')
              return `GenAI: ${ctx.parsed.x}h, ΔGPA: ${ctx.parsed.y.toFixed(2)}`
            return ctx.dataset.label || ''
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'GenAI hours / week', color: colors.tick },
        ticks: { color: colors.tick },
        grid: { color: colors.grid },
      },
      y: {
        title: { display: true, text: 'GPA change', color: colors.tick },
        ticks: { color: colors.tick },
        grid: { color: colors.grid },
      },
    },
  }
})
</script>

<template>
  <ChartCard
    title="GenAI hours vs GPA change"
    note="(r ≈ −0.05, no meaningful relationship)"
  >
    <Scatter :data="chartData" :options="options" />
  </ChartCard>
</template>
