import { useFiltersStore } from '../stores/filtersStore'
import { useThemeStore } from '../stores/themeStore'
import { useChartColors } from './useChartColors'

/**
 * Bundles the three stores every chart needs. Touch `theme.isDark` inside a
 * `computed` (e.g. `void theme.isDark`) to make chart data/options recompute
 * when the theme changes, since chart colors are read from CSS variables.
 */
export function useThemedChart() {
  const filters = useFiltersStore()
  const theme = useThemeStore()
  const colors = useChartColors()
  return { filters, theme, colors }
}
