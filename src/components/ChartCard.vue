<script setup lang="ts">
defineProps<{
  /** Card heading. */
  title: string
  /** Optional muted sub-label shown after the title. */
  note?: string
  /** Fixed body height (e.g. "200px"). Omit to let the chart self-size. */
  bodyHeight?: string
}>()
</script>

<template>
  <div class="chart-card">
    <h3>
      {{ title }}
      <span v-if="note" class="note">{{ note }}</span>
    </h3>
    <div v-if="bodyHeight" class="chart-body" :style="{ height: bodyHeight }">
      <slot />
    </div>
    <slot v-else />
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1.25rem;
}
h3 {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin: 0 0 1rem;
}
.note {
  color: var(--text-faint);
  text-transform: none;
  letter-spacing: 0;
}
.chart-body {
  width: 100%;
}
</style>
