<script setup lang="ts">
defineProps<{ value: string | number; color: string; textColor?: string }>()
</script>

<template>
  <span class="enum-badge" :style="{ '--c': color, '--t': textColor ?? color }">{{ value }}</span>
</template>

<style scoped>
.enum-badge {
  display: inline-block;
  padding: 0.18em 0.6em;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5;
  background: color-mix(in srgb, var(--c) 18%, transparent);
  color: var(--t);
  white-space: nowrap;
}
</style>
