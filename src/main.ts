import './charts/chartSetup'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'
import router from './router'
import './style.css'
import App from './App.vue'

// Aura's default primary is emerald (green). Bake a neutral gray palette into the
// preset so PrimeVue components (e.g. filter Clear/Apply buttons) never show green.
const NeutralAura = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#f4f4f5',
      100: '#e4e4e7',
      200: '#d1d1d6',
      300: '#b0b0b8',
      400: '#8a8a94',
      500: '#6b6b74',
      600: '#57575f',
      700: '#46464e',
      800: '#3a3a40',
      900: '#2e2e33',
      950: '#1a1a1e',
    },
  },
})

createApp(App)
  .use(createPinia())
  .use(router)
  .use(PrimeVue, { theme: { preset: NeutralAura, options: { darkModeSelector: '.dark' } } })
  .mount('#app')
