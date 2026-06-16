<script setup lang="ts">
defineProps<{ value: string | number; color: string }>()
</script>

<template>
  <span class="enum-badge" :style="{ '--c': color }">{{ value }}</span>
</template>

<style scoped>
/* Text color is derived from the badge color blended toward the theme
   foreground (--text), so badges stay readable in both light and dark themes. */
.enum-badge {
  display: inline-block;
  padding: 0.18em 0.6em;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5;
  background: color-mix(in srgb, var(--c) 22%, transparent);
  color: color-mix(in srgb, var(--c) 55%, var(--text));
  white-space: nowrap;
}
</style>
