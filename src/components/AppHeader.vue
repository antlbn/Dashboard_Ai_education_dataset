<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <header class="app-header">
    <h1>{{ title }}</h1>
  </header>
</template>

<style scoped>
.app-header {
  grid-area: header;
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #313244;
}

h1 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}
</style>
