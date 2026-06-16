<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'
import { Doughnut } from 'vue-chartjs'
import { storeToRefs } from 'pinia'
import { useDataStore } from '../stores/dataStore'
import { useChartColors } from '../charts/useChartColors'
import RangeFilter from './RangeFilter.vue'
import MultiFilter from './MultiFilter.vue'
import {
  MAJORS, YEARS, BURNOUT_LEVELS, USE_CASES, PROMPT_SKILLS, POLICIES, SCALE_1_10,
} from '../constants'
import type { Student } from '../types/student'
import { computed, ref, watch } from 'vue'

const store = useDataStore()
const { students } = storeToRefs(store)
const colors = useChartColors()

// Distinct Tool_Diversity values present in the data, ascending.
const toolDiversityOptions = [...new Set(students.value.map(s => s.Tool_Diversity))].sort((a, b) => a - b)

interface CatCol { field: keyof Student; header: string; minWidth: string; options: ReadonlyArray<string | number> }
interface NumCol { field: keyof Student; header: string; minWidth: string; min: number; max: number; step: number }

const categoricalCols: CatCol[] = [
  { field: 'Major_Category',            header: 'Major Category',           minWidth: '9rem',  options: MAJORS },
  { field: 'Year_of_Study',             header: 'Year of Study',            minWidth: '8rem',  options: YEARS },
  { field: 'Burnout_Risk_Level',        header: 'Burnout Risk',             minWidth: '8rem',  options: BURNOUT_LEVELS },
  { field: 'Primary_Use_Case',          header: 'Primary Use Case',         minWidth: '10rem', options: USE_CASES },
  { field: 'Prompt_Engineering_Skill',  header: 'Prompt Engineering Skill', minWidth: '10rem', options: PROMPT_SKILLS },
  { field: 'Institutional_Policy',      header: 'Institutional Policy',     minWidth: '10rem', options: POLICIES },
  { field: 'Perceived_AI_Dependency',   header: 'AI Dependency',            minWidth: '8rem',  options: SCALE_1_10 },
  { field: 'Anxiety_Level_During_Exams',header: 'Exam Anxiety',             minWidth: '8rem',  options: SCALE_1_10 },
  { field: 'Tool_Diversity',            header: 'Tool Diversity',           minWidth: '8rem',  options: toolDiversityOptions },
]

const numericCols: NumCol[] = [
  { field: 'Pre_Semester_GPA',       header: 'Pre-Semester GPA',     minWidth: '9rem', min: 0,  max: 4,   step: 0.1 },
  { field: 'Post_Semester_GPA',      header: 'Post-Semester GPA',    minWidth: '9rem', min: 0,  max: 4,   step: 0.1 },
  { field: 'GPA_change',             header: 'GPA Change (Δ)',       minWidth: '8rem', min: -2, max: 2,   step: 0.01 },
  { field: 'Weekly_GenAI_Hours',     header: 'GenAI Hours / Week',   minWidth: '9rem', min: 0,  max: 40,  step: 0.5 },
  { field: 'Traditional_Study_Hours',header: 'Study Hours / Week',   minWidth: '9rem', min: 0,  max: 40,  step: 0.5 },
  { field: 'Skill_Retention_Score',  header: 'Skill Retention Score',minWidth: '9rem', min: 0,  max: 100, step: 1 },
]

// Fields included in the global text search (string categoricals only).
const globalFilterFields = categoricalCols
  .filter(c => typeof c.options[0] === 'string')
  .map(c => c.field)

// Build the PrimeVue filter model from the column config (column filters only;
// global text search is handled manually below in filteredStudents).
const filters = ref<Record<string, { value: unknown; matchMode: string }>>({
  ...Object.fromEntries(categoricalCols.map(c => [c.field, { value: null, matchMode: FilterMatchMode.IN }])),
  ...Object.fromEntries(numericCols.map(c => [c.field, { value: null, matchMode: FilterMatchMode.BETWEEN }])),
})

const searchText = ref('')
const debouncedSearch = ref('')
let debounceTimer: ReturnType<typeof setTimeout>
watch(searchText, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { debouncedSearch.value = val }, 300)
})

// Comma-separated keyword search across the string fields. A "-" prefix excludes.
// Includes are OR'd; excludes apply across the whole row. "stem, -graduate" =>
// rows containing "stem" but NOT "graduate" anywhere in the searchable fields.
const filteredStudents = computed(() => {
  const terms = debouncedSearch.value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  const excludes = terms.filter(t => t.startsWith('-')).map(t => t.slice(1)).filter(Boolean)
  const includes = terms.filter(t => !t.startsWith('-'))
  if (!includes.length && !excludes.length) return students.value

  return students.value.filter(s => {
    const haystack = globalFilterFields.map(f => String(s[f] ?? '')).join(' ').toLowerCase()
    if (excludes.some(t => haystack.includes(t))) return false
    if (includes.length && !includes.some(t => haystack.includes(t))) return false
    return true
  })
})

// total dataset size and number of rows visible after search + column filters
const totalCount = computed(() => students.value.length)
const visibleCount = ref(students.value.length)
function onValueChange(rows: unknown[]) {
  visibleCount.value = rows.length
}

const selectedShare = computed(() =>
  totalCount.value ? (visibleCount.value / totalCount.value) * 100 : 0,
)

const shareChartData = computed(() => ({
  datasets: [{
    data: [visibleCount.value, Math.max(totalCount.value - visibleCount.value, 0)],
    backgroundColor: [colors.scatter, colors.grid],
    borderWidth: 0,
  }],
}))

const shareChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
}
</script>

<template>
  <div>
    <div class="toolbar">
      <InputText
        v-model="searchText"
        class="search-input"
        placeholder="Search — comma-separated keywords, use - to exclude (e.g. stem, medical, -graduate)"
        size="small"
      />

      <div class="result-counter">
        <div class="share-chart">
          <Doughnut :data="shareChartData" :options="shareChartOptions" />
        </div>
        <span>
          <strong>{{ visibleCount.toLocaleString() }}</strong>
          of {{ totalCount.toLocaleString() }}
          <span class="muted">({{ selectedShare.toFixed(1) }}%)</span>
        </span>
      </div>
    </div>

    <DataTable
      :value="filteredStudents"
      v-model:filters="filters"
      filterDisplay="menu"
      paginator
      :rows="50"
      size="small"
      sortMode="multiple"
      @value-change="onValueChange"
    >
      <Column field="Student_ID"        header="Student ID"        style="min-width: 6rem" />
      <Column field="Paid_Subscription" header="Paid Subscription" style="min-width: 8rem" sortable />

      <!-- categorical: multiselect -->
      <Column
        v-for="c in categoricalCols"
        :key="c.field"
        :field="c.field"
        :header="c.header"
        :style="{ minWidth: c.minWidth }"
        sortable
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <MultiFilter v-model="filterModel.value" :options="c.options" />
        </template>
      </Column>

      <!-- numeric: range slider -->
      <Column
        v-for="c in numericCols"
        :key="c.field"
        :field="c.field"
        :header="c.header"
        :style="{ minWidth: c.minWidth }"
        sortable
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <RangeFilter v-model="filterModel.value" :min="c.min" :max="c.max" :step="c.step" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 0.75rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.search-input {
  flex: 1;
  min-width: 18rem;
}
.result-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  font-size: 0.85rem;
  white-space: nowrap;
}
.result-counter .muted {
  color: var(--text-muted);
}
.share-chart {
  width: 40px;
  height: 40px;
}

:deep(.p-datatable-column-title) {
  white-space: normal;
  line-height: 1.3;
  font-size: 0.75rem;
}
</style>
