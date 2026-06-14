<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'
import { useThemeStore } from '../stores/themeStore'
import { useChartColors } from './useChartColors'
import type { Student } from '../types/student'

const props = withDefaults(
  defineProps<{
    /** Column from the dataset to visualize. */
    column: keyof Student
    /** Card title. */
    title: string
    /** Histogram for numbers, value-counts bar for categories. */
    type: 'numeric' | 'categorical'
    /** Number of histogram bins (numeric only). */
    bins?: number
  }>(),
  { bins: 30 },
)

const filters = useFiltersStore()
const theme = useThemeStore()
const colors = useChartColors()

/** Build {labels, counts} for a numeric column via equal-width binning. */
function numericDistribution(rows: Student[]) {
  const values = rows.map(r => Number(r[props.column]))
  if (!values.length) return { labels: [], counts: [] }

  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) {
    // degenerate range — single bucket
    return { labels: [min.toFixed(1)], counts: [values.length] }
  }

  const binCount = props.bins
  const width = (max - min) / binCount
  const counts = Array(binCount).fill(0)
  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / width), binCount - 1)
    counts[idx]++
  }
  const labels = counts.map((_, i) => (min + i * width).toFixed(1))
  return { labels, counts }
}

/** Build {labels, counts} for a categorical column, sorted by frequency. */
function categoricalDistribution(rows: Student[]) {
  const tally = new Map<string, number>()
  for (const r of rows) {
    const key = String(r[props.column])
    tally.set(key, (tally.get(key) ?? 0) + 1)
  }
  const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1])
  return {
    labels: sorted.map(([k]) => k),
    counts: sorted.map(([, v]) => v),
  }
}

const distribution = computed(() =>
  props.type === 'numeric'
    ? numericDistribution(filters.filteredStudents)
    : categoricalDistribution(filters.filteredStudents),
)

const chartData = computed(() => {
  void theme.isDark
  return {
    labels: distribution.value.labels,
    datasets: [{
      label: 'Студентов',
      data: distribution.value.counts,
      backgroundColor: colors.bar,
      borderRadius: 1,
      barPercentage: props.type === 'numeric' ? 1.1 : 0.8,
    }],
  }
})

const options = computed(() => {
  void theme.isDark
  const horizontal = props.type === 'categorical'
  const valueAxis = { ticks: { color: colors.tick }, grid: { display: false } }
  const labelAxis = {
    ticks: { color: colors.tick, autoSkip: true, maxRotation: 0 },
    grid: { display: false },
  }
  return {
    indexAxis: horizontal ? ('y' as const) : ('x' as const),
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: horizontal
      ? { x: valueAxis, y: labelAxis }
      : { x: labelAxis, y: valueAxis },
  }
})
</script>

<template>
  <div class="chart-card">
    <h3>{{ title }}</h3>
    <div class="chart-body">
      <Bar :data="chartData" :options="options" />
    </div>
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
.chart-body {
  height: 200px;
}
</style>
