<script setup lang="ts">
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import ChartCard from '../components/ChartCard.vue'
import { useThemedChart } from './useThemedChart'
import { subsample } from './chartHelpers'

const { filters, theme, colors } = useThemedChart()

// Caps: scatter points drawn, and rows fed to the (heavier) LOWESS fit.
const MAX_SCATTER = 5000
const MAX_LOWESS = 2000

function lowess(
  xs: number[],
  ys: number[],
  frac: number,
  evalPoints: number,
): Array<{ x: number; y: number }> {
  const n = xs.length
  if (n < 4) return []

  const h = Math.max(4, Math.ceil(frac * n))
  let xMin = xs[0]
  let xMax = xs[0]
  for (const x of xs) {
    if (x < xMin) xMin = x
    if (x > xMax) xMax = x
  }

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

  const sample = subsample(all, MAX_SCATTER)
  const lwSrc = subsample(all, MAX_LOWESS)

  const xs = lwSrc.map(s => s.Weekly_GenAI_Hours)
  const ys = lwSrc.map(s => s.GPA_change)
  const trend = lowess(xs, ys, 0.3, 60)

  return {
    datasets: [
      {
        label: 'Student',
        data: sample.map(s => ({ x: s.Weekly_GenAI_Hours, y: s.GPA_change })),
        backgroundColor: colors.scatter,
        pointRadius: 2.5,
        order: 2,
      },
      {
        label: 'LOWESS trend',
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
            if (ctx.dataset.label === 'Student')
              return `GenAI: ${ctx.parsed.x}h, ΔGPA: ${ctx.parsed.y.toFixed(2)}`
            return `LOWESS: ${ctx.parsed.y.toFixed(3)}`
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
    title="Non-linear trend: GPA change vs GenAI hours"
    note="(LOWESS, frac=0.3)"
  >
    <Scatter :data="chartData" :options="options" />
  </ChartCard>
</template>
