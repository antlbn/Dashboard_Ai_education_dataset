<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <main class="app-content">
    <router-view v-slot="{ Component }">
      <Transition name="slide" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </router-view>
  </main>
</template>

<style scoped>
.app-content {
  grid-area: content;
  background: var(--bg-base);
  padding: 1.5rem;
  overflow-y: auto;
  position: relative;
}

.slide-enter-from {
  transform: translateX(60px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-60px);
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
</style>
