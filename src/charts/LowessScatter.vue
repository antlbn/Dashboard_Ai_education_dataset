<script setup lang="ts">
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import { useFiltersStore } from '../stores/filtersStore'
import { useThemeStore } from '../stores/themeStore'
import { useChartColors } from './useChartColors'

const filters = useFiltersStore()
const theme = useThemeStore()
const colors = useChartColors()

function lowess(
  xs: number[],
  ys: number[],
  frac: number,
  evalPoints: number,
): Array<{ x: number; y: number }> {
  const n = xs.length
  if (n < 4) return []

  const h = Math.max(4, Math.ceil(frac * n))
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)

  const result: Array<{ x: number; y: number }> = []

  for (let k = 0; k < evalPoints; k++) {
    const x0 = xMin + (k / (evalPoints - 1)) * (xMax - xMin)

    const dists = xs.map(xi => Math.abs(xi - x0))
    const sorted = [...dists].sort((a, b) => a - b)
    const maxDist = sorted[h - 1] || 1e-10

    let sumW = 0, sumWX = 0, sumWY = 0, sumWX2 = 0, sumWXY = 0
    for (let j = 0; j < n; j++) {
      const u = dists[j] / maxDist
      const w = u < 1 ? (1 - u * u * u) ** 3 : 0
      sumW   += w
      sumWX  += w * xs[j]
      sumWY  += w * ys[j]
      sumWX2 += w * xs[j] * xs[j]
      sumWXY += w * xs[j] * ys[j]
    }

    const denom = sumW * sumWX2 - sumWX * sumWX
    let yHat: number
    if (Math.abs(denom) < 1e-12 || sumW < 1e-12) {
      yHat = sumW > 0 ? sumWY / sumW : 0
    } else {
      const b1 = (sumW * sumWXY - sumWX * sumWY) / denom
      const b0 = (sumWY - b1 * sumWX) / sumW
      yHat = b0 + b1 * x0
    }

    result.push({ x: x0, y: yHat })
  }

  return result
}

const chartData = computed(() => {
  void theme.isDark
  const all = filters.filteredStudents

  // subsample for scatter display and LOWESS (capped for perf)
  const sampleSize = Math.min(all.length, 800)
  const step = Math.max(1, Math.floor(all.length / sampleSize))
  const sample = all.filter((_, i) => i % step === 0).slice(0, sampleSize)

  const lowessSize = Math.min(all.length, 2000)
  const lStep = Math.max(1, Math.floor(all.length / lowessSize))
  const lwSrc = all.filter((_, i) => i % lStep === 0).slice(0, lowessSize)

  const xs = lwSrc.map(s => s.Weekly_GenAI_Hours)
  const ys = lwSrc.map(s => s.GPA_change)
  const trend = lowess(xs, ys, 0.3, 60)

  return {
    datasets: [
      {
        label: 'Студент',
        data: sample.map(s => ({ x: s.Weekly_GenAI_Hours, y: s.GPA_change })),
        backgroundColor: colors.scatter,
        pointRadius: 2.5,
        order: 2,
      },
      {
        label: 'LOWESS тренд',
        data: trend,
        borderColor: 'rgba(220, 50, 50, 0.85)',
        backgroundColor: 'transparent',
        pointRadius: 0,
        showLine: true,
        borderWidth: 2.5,
        tension: 0.3,
        order: 1,
      },
    ],
  }
})

const options = computed(() => {
  void theme.isDark
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
              return `GenAI: ${ctx.parsed.x}h, ΔGPA: ${ctx.parsed.y.toFixed(2)}`
            return `LOWESS: ${ctx.parsed.y.toFixed(3)}`
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
      Нелинейный тренд: изменение GPA vs GenAI часы
      <span class="note">(LOWESS, frac=0.3)</span>
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
