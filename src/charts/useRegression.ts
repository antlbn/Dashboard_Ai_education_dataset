interface Point { x: number; y: number }

export function linearRegression(data: Point[]) {
  const n = data.length
  if (n < 2) return null

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (const p of data) {
    sumX  += p.x
    sumY  += p.y
    sumXY += p.x * p.y
    sumX2 += p.x * p.x
  }

  // min/max via a loop — spreading a large array into Math.min/max can blow
  // the call stack once the dataset grows past the engine's argument limit.
  let minX = data[0].x
  let maxX = data[0].x
  for (const p of data) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
  }

  const meanX = sumX / n
  const Sxx   = sumX2 - sumX * sumX / n
  const slope = (sumXY - sumX * sumY / n) / Sxx
  const intercept = (sumY - slope * sumX) / n

  // residual standard error
  let sse = 0
  for (const p of data) {
    const residual = p.y - (intercept + slope * p.x)
    sse += residual * residual
  }
  const s2 = sse / (n - 2)

  function regressionLine(steps = 60): Point[] {
    const step = (maxX - minX) / steps
    return Array.from({ length: steps + 1 }, (_, i) => {
      const x = minX + i * step
      return { x, y: intercept + slope * x }
    })
  }

  // 95% CI for mean response at each x: ŷ ± 1.96 * s * sqrt(1/n + (x-x̄)²/Sxx)
  function confidenceBand(steps = 60): { upper: Point[]; lower: Point[] } {
    const step = (maxX - minX) / steps
    const upper: Point[] = []
    const lower: Point[] = []

    for (let i = 0; i <= steps; i++) {
      const x   = minX + i * step
      const yHat = intercept + slope * x
      const se   = Math.sqrt(s2 * (1 / n + (x - meanX) ** 2 / Sxx))
      const margin = 1.96 * se
      upper.push({ x, y: yHat + margin })
      lower.push({ x, y: yHat - margin })
    }
    return { upper, lower }
  }

  return { slope, intercept, regressionLine, confidenceBand }
}
