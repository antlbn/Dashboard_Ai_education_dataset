import { useThemeStore } from '../stores/themeStore'

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function useChartColors() {
  // access isDark to make callers reactive to theme changes
  useThemeStore().$subscribe(() => {})

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
