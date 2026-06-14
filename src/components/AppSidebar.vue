<script setup lang="ts">
import { useFiltersStore } from '../stores/filtersStore'
import type { Student } from '../types/student'

const filters = useFiltersStore()

const majorOptions: Array<{ label: string; value: Student['Major_Category'] | null }> = [
  { label: 'Все', value: null },
  { label: 'Arts', value: 'Arts' },
  { label: 'Business', value: 'Business' },
  { label: 'Humanities', value: 'Humanities' },
  { label: 'Medical', value: 'Medical' },
  { label: 'STEM', value: 'STEM' },
]

const yearOptions: Array<{ label: string; value: Student['Year_of_Study'] | null }> = [
  { label: 'Все', value: null },
  { label: 'Freshman', value: 'Freshman' },
  { label: 'Sophomore', value: 'Sophomore' },
  { label: 'Junior', value: 'Junior' },
  { label: 'Senior', value: 'Senior' },
  { label: 'Graduate', value: 'Graduate' },
]
</script>

<template>
  <aside class="app-sidebar">
    <div class="filter-group">
      <label>Специальность</label>
      <select v-model="filters.majorCategory">
        <option v-for="opt in majorOptions" :key="String(opt.value)" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label>Курс</label>
      <select v-model="filters.yearOfStudy">
        <option v-for="opt in yearOptions" :key="String(opt.value)" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <button class="reset-btn" @click="filters.reset()">Сбросить</button>
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

@media (max-width: 900px) {
  .app-sidebar {
    flex-direction: row;
    align-items: flex-end;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding: 0.75rem 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }
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
