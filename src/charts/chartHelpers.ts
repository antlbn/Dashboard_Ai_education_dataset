/** Shared chart math: binning, deterministic sampling, seeded jitter. */

/** Bin index for a fixed-width histogram, clamped into the last bin. */
export function binIndex(value: number, width: number, numBins: number): number {
  return Math.min(Math.max(Math.floor(value / width), 0), numBins - 1)
}

/** Equal-width binning of a numeric column → labels (bin starts) + counts. */
export function equalWidthBins(
  values: number[],
  binCount: number,
): { labels: string[]; counts: number[] } {
  if (!values.length) return { labels: [], counts: [] }

  let min = values[0]
  let max = values[0]
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
  }
  if (min === max) {
    // degenerate range — single bucket
    return { labels: [min.toFixed(1)], counts: [values.length] }
  }

  const width = (max - min) / binCount
  const counts = new Array(binCount).fill(0)
  for (const v of values) {
    counts[Math.min(Math.floor((v - min) / width), binCount - 1)]++
  }
  const labels = counts.map((_, i) => (min + i * width).toFixed(1))
  return { labels, counts }
}

/**
 * Deterministic strided sub-sample: returns the array unchanged when it already
 * fits under `max`, otherwise picks evenly spaced elements. No randomness, so
 * the result is stable across re-renders (theme toggles, filter changes).
 */
export function subsample<T>(arr: readonly T[], max: number): T[] {
  if (arr.length <= max) return arr.slice()
  const step = arr.length / max
  return Array.from({ length: max }, (_, i) => arr[Math.floor(i * step)])
}

/**
 * mulberry32 — tiny seeded PRNG. Same seed ⇒ same sequence, so jitter stays
 * put across re-renders instead of re-randomizing every recompute.
 */
export function createRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
