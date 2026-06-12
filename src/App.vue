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
    <AppSidebar />
    <AppContent />
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
</style>
