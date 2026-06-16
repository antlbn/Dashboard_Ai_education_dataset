<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import ChartCard from '../components/ChartCard.vue'
import { useThemedChart } from './useThemedChart'
import { equalWidthBins } from './chartHelpers'
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

const { filters, theme, colors } = useThemedChart()

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
    ? equalWidthBins(filters.filteredStudents.map(r => Number(r[props.column])), props.bins)
    : categoricalDistribution(filters.filteredStudents),
)

const chartData = computed(() => {
  void theme.isDark
  return {
    labels: distribution.value.labels,
    datasets: [{
      label: 'Students',
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
  <ChartCard :title="title" body-height="200px">
    <Bar :data="chartData" :options="options" />
  </ChartCard>
</template>
