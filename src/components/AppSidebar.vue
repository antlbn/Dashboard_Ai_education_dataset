<script setup lang="ts">
import { useFiltersStore } from '../stores/filtersStore'
import { MAJORS, YEARS, withAll } from '../constants'

const filters = useFiltersStore()

const majorOptions = withAll(MAJORS)
const yearOptions = withAll(YEARS)
</script>

<template>
  <aside class="app-sidebar">
    <div class="filter-group">
      <label>Major</label>
      <select v-model="filters.majorCategory">
        <option v-for="opt in majorOptions" :key="String(opt.value)" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label>Year of Study</label>
      <select v-model="filters.yearOfStudy">
        <option v-for="opt in yearOptions" :key="String(opt.value)" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <button class="reset-btn" @click="filters.reset()">Reset</button>
  </aside>
</template>

<style scoped>
.app-sidebar {
  grid-area: sidebar;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

select {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
}

select:focus {
  border-color: var(--accent);
}

.reset-btn {
  margin-top: auto;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  padding: 0.4rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.reset-btn:hover {
  border-color: var(--negative);
  color: var(--negative);
}
</style>
