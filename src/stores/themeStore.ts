import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  function toggle() {
    isDark.value = !isDark.value
  }

  watch(isDark, val => {
    document.documentElement.classList.toggle('light', !val)
  }, { immediate: true })

  return { isDark, toggle }
})
