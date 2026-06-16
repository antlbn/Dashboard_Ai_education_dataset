import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function toggle() {
    isDark.value = !isDark.value
  }

  // Toggle the `.dark` class on <html> — the single source of truth shared
  // by app CSS (:root.dark) and PrimeVue (darkModeSelector: '.dark').
  watch(isDark, val => {
    document.documentElement.classList.toggle('dark', val)
  }, { immediate: true })

  return { isDark, toggle }
})
