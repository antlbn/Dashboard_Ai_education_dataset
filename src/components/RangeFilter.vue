<script setup lang="ts">
import Slider from 'primevue/slider'

const model = defineModel<[number, number] | null>()
const props = defineProps<{ min: number; max: number; step: number }>()
</script>

<template>
  <Slider
    :modelValue="model ?? undefined"
    @update:modelValue="model = $event as [number, number]"
    range
    :min="props.min"
    :max="props.max"
    :step="props.step"
    style="margin: 0.5rem 0.25rem;"
  />
  <div class="range-readout">
    <span>{{ model?.[0] ?? props.min }}</span>
    <span>{{ model?.[1] ?? props.max }}</span>
  </div>
</template>

<style scoped>
.range-readout {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
