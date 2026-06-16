<script setup lang="ts">
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import ChartCard from '../components/ChartCard.vue'
import { useThemedChart } from './useThemedChart'
import { binIndex, createRng } from './chartHelpers'

const { filters, theme, colors } = useThemedChart()

const BIN_WIDTH = 2
const NUM_BINS = 20
const PER_BIN = 120 // max scatter points drawn per bin

// Static — depends only on bin index, so it lives outside chartData.
const binLabels = Array.from({ length: NUM_BINS }, (_, i) =>
  i === NUM_BINS - 1
    ? `${i * BIN_WIDTH}–${NUM_BINS * BIN_WIDTH}+`
    : `${i * BIN_WIDTH}–${(i + 1) * BIN_WIDTH}`,
)

const chartData = computed(() => {
  void theme.isDark
  const all = filters.filteredStudents
  if (!all.length) return { datasets: [] as any[] }

  const binCenters = Array.from({ length: NUM_BINS }, (_, i) => i)

  // group students by bin
  const groups: number[][] = Array.from({ length: NUM_BINS }, () => [])
  for (const s of all) {
    groups[binIndex(s.Weekly_GenAI_Hours, BIN_WIDTH, NUM_BINS)].push(s.GPA_change)
  }

  // seeded jitter so points don't jump around on every recompute
  const rng = createRng(0x9e3779b1)
  const scatterPts: Array<{ x: number; y: number }> = []
  for (let i = 0; i < NUM_BINS; i++) {
    const pts = groups[i]
    const step = Math.max(1, Math.floor(pts.length / PER_BIN))
    pts.filter((_, j) => j % step === 0).slice(0, PER_BIN).forEach(gpa => {
      scatterPts.push({ x: i + (rng() - 0.5) * 0.55, y: gpa })
    })
  }

  // mean line per bin
  const means: Array<{ x: number; y: number }> = []
  for (let i = 0; i < NUM_BINS; i++) {
    if (!groups[i].length) continue
    means.push({ x: i, y: groups[i].reduce((s, v) => s + v, 0) / groups[i].length })
  }

  return {
    datasets: [
      {
        label: 'Student',
        data: scatterPts,
        backgroundColor: colors.scatter,
        pointRadius: 2.5,
        order: 2,
      },
      {
        label: 'No change (0)',
        data: binCenters.map(x => ({ x, y: 0 })),
        borderColor: 'rgba(255, 160, 50, 0.7)',
        backgroundColor: 'transparent',
        pointRadius: 0,
        showLine: true,
        borderDash: [5, 4],
        borderWidth: 1.5,
        order: 1,
      },
      {
        label: 'Mean per bin',
        data: means,
        borderColor: 'rgba(220, 50, 50, 0.9)',
        backgroundColor: 'rgba(220, 50, 50, 0.85)',
        pointRadius: 5,
        pointStyle: 'rectRot',
        showLine: false,
        order: 0,
      },
    ] as any[],
  }
})

const options = computed(() => {
  void theme.isDark
  return {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: colors.tick } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === 'Student')
              return `ΔGPA: ${ctx.parsed.y.toFixed(2)}`
            if (ctx.dataset.label === 'Mean per bin')
              return `Mean ΔGPA: ${ctx.parsed.y.toFixed(3)}`
            return ''
          },
        },
      },
    },
    scales: {
      x: {
        min: -0.5,
        max: NUM_BINS - 0.5,
        title: { display: true, text: 'GenAI hours / week (bins of 2)', color: colors.tick },
        ticks: {
          color: colors.tick,
          stepSize: 1,
          callback: (val: string | number) => {
            const i = Math.round(Number(val))
            return i >= 0 && i < NUM_BINS ? binLabels[i] : ''
          },
          maxRotation: 45,
        },
        grid: { color: colors.grid },
      },
      y: {
        title: { display: true, text: 'GPA change (Post − Pre)', color: colors.tick },
        ticks: { color: colors.tick },
        grid: { color: colors.grid },
      },
    },
  }
})
</script>

<template>
  <ChartCard
    title="GPA change by GenAI-hours bin"
    note="(2h bins, diamond = mean)"
  >
    <Scatter :data="chartData" :options="options" />
  </ChartCard>
</template>
