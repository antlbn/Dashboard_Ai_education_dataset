<script setup lang="ts">
import { ref, computed } from 'vue'
import EnumBadge from './EnumBadge.vue'

const model = defineModel<Array<string | number> | null>()

const props = defineProps<{
  options: ReadonlyArray<string | number>
  colorMap?: Record<string, { bg: string; text?: string }>
  neutralBg?: string
  neutralText?: string
}>()

const FIXED_GRAY = '#5a5656'
const search = ref('')

const visibleOptions = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? props.options.filter(o => String(o).toLowerCase().includes(q)) : props.options
})

function toggle(val: string | number) {
  const current = model.value ?? []
  const next = current.includes(val)
    ? current.filter(v => v !== val)
    : [...current, val]
  model.value = next.length ? next : null
}

function isActive(val: string | number) {
  return !model.value || model.value.includes(val)
}

function colorFor(val: string | number) {
  const entry = props.colorMap?.[String(val)]
  if (entry) return { bg: entry.bg, text: entry.text ?? FIXED_GRAY }
  return { bg: props.neutralBg ?? '#9ca3af', text: props.neutralText ?? FIXED_GRAY }
}
</script>

<template>
  <div class="pill-filter">
    <input
      v-if="options.length > 4"
      v-model="search"
      class="pill-search"
      placeholder="Search…"
    />
    <button
      v-for="opt in visibleOptions"
      :key="String(opt)"
      class="pill-btn"
      :class="{ dim: !isActive(opt) }"
      @click="toggle(opt)"
    >
      <EnumBadge
        :value="String(opt)"
        :color="colorFor(opt).bg"
        :textColor="colorFor(opt).text"
      />
    </button>
  </div>
</template>

<style scoped>
.pill-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.25rem 0;
  max-width: 16rem;
}

.pill-search {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  padding: 0.3rem 0.5rem;
  font-size: 0.8rem;
  outline: none;
}

.pill-search:focus {
  border-color: var(--text-muted);
}

.pill-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.15s;
}

.pill-btn.dim {
  opacity: 0.3;
}
</style>
