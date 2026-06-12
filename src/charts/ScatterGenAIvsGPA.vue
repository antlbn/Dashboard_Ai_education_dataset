<script setup lang="ts">
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'
import { useThemeStore } from '../stores/themeStore'
import { useChartColors } from './useChartColors'
import { linearRegression } from './useRegression'

const filters = useFiltersStore()
const theme = useThemeStore()
const colors = useChartColors()

const chartData = computed(() => {
  void theme.isDark
  const all = filters.filteredStudents
  const sample = all.slice(0, 500)
  const allPoints = all.map(s => ({ x: s.Weekly_GenAI_Hours, y: s.GPA_change }))

  const reg = linearRegression(allPoints)

  const datasets: any[] = [
    {
      label: 'Студент',
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
      label: `Регрессия (slope=${reg.slope.toFixed(4)})`,
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
            if (ctx.dataset.label === 'Студент')
              return `GenAI: ${ctx.parsed.x}h, ΔGPA: ${ctx.parsed.y.toFixed(2)}`
            return ctx.dataset.label || ''
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'GenAI часов/неделю', color: colors.tick },
        ticks: { color: colors.tick },
        grid: { color: colors.grid },
      },
      y: {
        title: { display: true, text: 'Изменение GPA', color: colors.tick },
        ticks: { color: colors.tick },
        grid: { color: colors.grid },
      },
    },
  }
})
</script>

<template>
  <div class="chart-card">
    <h3>
      GenAI часы vs изменение GPA
      <span class="note">(r ≈ −0.05, связь незначима)</span>
    </h3>
    <Scatter :data="chartData" :options="options" />
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
.note {
  color: var(--text-faint);
  text-transform: none;
  letter-spacing: 0;
}
</style>
