<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppContent from './components/AppContent.vue'
import { useDataStore } from './stores/dataStore'

const dataStore = useDataStore()
onMounted(() => dataStore.load())
</script>

<template>
  <div class="app-layout">
    <AppHeader title="AI Student Impact Dashboard" />

    <template v-if="dataStore.status === 'loading'">
      <div class="state-screen">
        <div class="spinner" />
        <p>Загружаем данные…</p>
      </div>
    </template>

    <template v-else-if="dataStore.status === 'error'">
      <div class="state-screen error">
        <p class="error-title">Не удалось загрузить данные</p>
        <p class="error-msg">{{ dataStore.error }}</p>
        <button @click="dataStore.load()">Попробовать снова</button>
      </div>
    </template>

    <template v-else>
      <AppSidebar />
      <AppContent />
    </template>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-areas:
    "header  header"
    "sidebar content";
  grid-template-rows: 56px 1fr;
  grid-template-columns: 240px 1fr;
  height: 100vh;
}

@media (max-width: 900px) {
  .app-layout {
    grid-template-areas:
      "header"
      "sidebar"
      "content";
    grid-template-rows: 56px auto 1fr;
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
  }
}

.state-screen {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.state-screen p { margin: 0; }

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.state-screen.error { color: var(--negative); }

.error-title {
  font-weight: 600;
  font-size: 1rem;
}

.error-msg {
  font-size: 0.8rem;
  color: var(--text-faint);
  max-width: 400px;
  text-align: center;
}

.state-screen button {
  margin-top: 0.5rem;
  background: transparent;
  border: 1px solid var(--negative);
  border-radius: 4px;
  color: var(--negative);
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.state-screen button:hover {
  background: var(--negative);
  color: var(--bg-base);
}
</style>
