<script setup lang="ts">
import { useThemeStore } from '../stores/themeStore'

defineProps<{ title: string }>()

const theme = useThemeStore()

const tabs = [
  { label: 'Overview', to: '/' },
  { label: 'Distributions', to: '/distributions' },
  { label: 'Table', to: '/table' },
]
</script>

<template>
  <header class="app-header">
    <h1>{{ title }}</h1>
    <nav class="tabs">
      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="tab"
        active-class="active"
        exact-active-class="active"
      >
        {{ tab.label }}
      </router-link>
    </nav>
    <button class="theme-toggle" @click="theme.toggle()">
      {{ theme.isDark ? '☀ Light' : '◑ Dark' }}
    </button>
  </header>
</template>

<style scoped>
.app-header {
  grid-area: header;
  background: var(--bg-card);
  color: var(--text);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

h1 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  margin-right: auto;
  margin-left: 1.5rem;
}

.tab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  text-decoration: none;
}

.tab:hover {
  color: var(--text);
}

.tab.active {
  color: var(--text);
  border-bottom-color: var(--accent);
}

.theme-toggle {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.theme-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
