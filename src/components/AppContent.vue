<template>
  <main class="app-content">
    <router-view />
  </main>
</template>

<style scoped>
.app-content {
  grid-area: content;
  background: var(--bg-base);
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
