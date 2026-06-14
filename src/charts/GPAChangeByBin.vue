<script setup lang="ts">
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'
import { useThemeStore } from '../stores/themeStore'
import { useChartColors } from './useChartColors'

const filters = useFiltersStore()
const theme = useThemeStore()
const colors = useChartColors()

const BIN_WIDTH = 2
const NUM_BINS = 20

function binLabel(idx: number): string {
  if (idx === NUM_BINS - 1) return '38–40+'
  return `${idx * BIN_WIDTH}–${(idx + 1) * BIN_WIDTH}`
}

const chartData = computed(() => {
  void theme.isDark
  const all = filters.filteredStudents
  if (!all.length) return { datasets: [] }

  const numBins = NUM_BINS

  // map bin index → x center on numeric axis
  const binCenters: number[] = Array.from({ length: numBins }, (_, i) => i)

  // group students by bin
  const groups: number[][] = Array.from({ length: numBins }, () => [])
  for (const s of all) {
    const idx = Math.floor(s.Weekly_GenAI_Hours / BIN_WIDTH)
    if (idx < numBins) groups[idx].push(s.GPA_change)
  }

  // subsample each bin for scatter (max 120 pts per bin → ≤ ~1200 total for 10 bins)
  const PER_BIN = 120
  const scatterPts: Array<{ x: number; y: number }> = []
  for (let i = 0; i < numBins; i++) {
    const pts = groups[i]
    const step = Math.max(1, Math.floor(pts.length / PER_BIN))
    pts.filter((_, j) => j % step === 0).slice(0, PER_BIN).forEach(gpa => {
      scatterPts.push({
        x: i + (Math.random() - 0.5) * 0.55, // jitter
        y: gpa,
      })
    })
  }

  // mean line per bin
  const means: Array<{ x: number; y: number }> = []
  for (let i = 0; i < numBins; i++) {
    if (!groups[i].length) continue
    const avg = groups[i].reduce((s, v) => s + v, 0) / groups[i].length
    means.push({ x: i, y: avg })
  }

  return {
    datasets: [
      {
        label: 'Студент',
        data: scatterPts,
        backgroundColor: colors.scatter,
        pointRadius: 2.5,
        order: 2,
      },
      {
        label: 'Нет изменения (0)',
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
        label: 'Среднее по бину',
        data: means,
        borderColor: 'rgba(220, 50, 50, 0.9)',
        backgroundColor: 'rgba(220, 50, 50, 0.85)',
        pointRadius: 5,
        pointStyle: 'rectRot',
        showLine: false,
        order: 0,
      },
    ],
    // store labels for tick formatter
    _binLabels: Array.from({ length: numBins }, (_, i) => binLabel(i)),
  } as any
})

const options = computed(() => {
  void theme.isDark
  const labels: string[] = chartData.value._binLabels ?? []
  return {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: colors.tick },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === 'Студент')
              return `ΔGPA: ${ctx.parsed.y.toFixed(2)}`
            if (ctx.dataset.label === 'Среднее по бину')
              return `Среднее ΔGPA: ${ctx.parsed.y.toFixed(3)}`
            return ''
          },
        },
      },
    },
    scales: {
      x: {
        min: -0.5,
        max: NUM_BINS - 0.5,
        title: { display: true, text: 'GenAI часов/неделю (бины по 2)', color: colors.tick },
        ticks: {
          color: colors.tick,
          stepSize: 1,
          callback: (val: string | number) => {
            const i = Math.round(Number(val))
            return i >= 0 && i < NUM_BINS ? labels[i] : ''
          },
          maxRotation: 45,
        },
        grid: { color: colors.grid },
      },
      y: {
        title: { display: true, text: 'Изменение GPA (Post − Pre)', color: colors.tick },
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
      Изменение GPA по бинам GenAI часов
      <span class="note">(бины по 2 ч, ромб = среднее)</span>
    </h3>
    <Scatter :data="chartData" :options="(options as any)" />
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
