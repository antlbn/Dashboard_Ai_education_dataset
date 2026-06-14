import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ActiveView = 'overview' | 'distributions' | 'table'



export const useUiStore = defineStore('ui', () => {
  const activeView = ref<ActiveView>('overview')

  function setView(view: ActiveView) {
    activeView.value = view
  }

  return { activeView, setView }
})
