<script setup lang="ts">
import { useThemeStore } from '../stores/themeStore'

defineProps<{ title: string }>()

const theme = useThemeStore()
</script>

<template>
  <header class="app-header">
    <h1>{{ title }}</h1>
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
