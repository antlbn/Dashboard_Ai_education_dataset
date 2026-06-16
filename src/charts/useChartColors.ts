function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Reads chart colors from CSS custom properties. The getters are not reactive
 * by themselves — callers touch `theme.isDark` inside a `computed` so chart
 * data/options recompute after the theme class on <html> changes.
 */
export function useChartColors() {
  return {
    get bar()     { return cssVar('--chart-bar') },
    get grid()    { return cssVar('--chart-grid') },
    get tick()    { return cssVar('--chart-tick') },
    get scatter() { return cssVar('--chart-scatter') },
    get low()     { return cssVar('--chart-low') },
    get medium()  { return cssVar('--chart-medium') },
    get high()    { return cssVar('--chart-high') },
    get positive(){ return cssVar('--positive') },
    get negative(){ return cssVar('--negative') },
  }
}
