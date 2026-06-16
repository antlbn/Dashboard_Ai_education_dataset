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
import { computed, ref, watch, toRaw, markRaw } from 'vue'

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
import EnumBadge from './EnumBadge.vue'
import { parseQuery, stringifyQuery, facetSignature, type FacetField } from '../utils/tableQuery'

// Color maps: badge tint color per enum value (text color is derived in EnumBadge).
type ColorEntry = { bg: string }
type ColorMap = Record<string, ColorEntry>

const BADGE_COLORS: Partial<Record<keyof Student, ColorMap>> = {
  Burnout_Risk_Level: {
    Low:    { bg: '#a8a89e' },
    Medium: { bg: '#c9b84a' },
    High:   { bg: '#c96060' },
  },
  Institutional_Policy: {
    Actively_Encouraged:   { bg: '#3b82f6' },
    Allowed_With_Citation: { bg: '#06b6d4' },
    Strict_Ban:            { bg: '#dc2626' },
  },
  Prompt_Engineering_Skill: {
    Beginner:     { bg: '#c4bfbf' },
    Intermediate: { bg: '#8a8585' },
    Advanced:     { bg: '#4b4848' },
  },
  Year_of_Study: {
    Freshman:  { bg: '#d1cece' },
    Sophomore: { bg: '#b0acac' },
    Junior:    { bg: '#8a8585' },
    Senior:    { bg: '#625e5e' },
    Graduate:  { bg: '#3d3a3a' },
  },
}

// Fields that get a neutral pill shape but no semantic color
const NEUTRAL_BADGE_FIELDS = new Set<keyof Student>(['Major_Category', 'Primary_Use_Case'])

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

// Short aliases used for field-scoped tokens in the query string (e.g. "major:STEM").
const FACET_ALIASES: Record<string, string> = {
  Major_Category:             'major',
  Year_of_Study:              'year',
  Burnout_Risk_Level:         'burnout',
  Primary_Use_Case:           'usecase',
  Prompt_Engineering_Skill:   'skill',
  Institutional_Policy:       'policy',
  Perceived_AI_Dependency:    'dependency',
  Anxiety_Level_During_Exams: 'anxiety',
  Tool_Diversity:             'tools',
}
const FACET_FIELDS: FacetField[] = categoricalCols.map(c => ({
  field: c.field, alias: FACET_ALIASES[c.field], options: c.options,
}))

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

// Parsed query string (single source of truth). Field-scoped tokens become facets;
// the rest is free text. See utils/tableQuery for the grammar.
const parsed = computed(() => parseQuery(debouncedSearch.value, FACET_FIELDS))

// Manual layer: free-text terms + negated facets. Positive facets are applied by
// PrimeVue via the synced `filters` model, and numeric ranges by PrimeVue too.
const filteredStudents = computed(() => {
  const { freeIncludes, freeExcludes, negatedFacets } = parsed.value
  const negatedEntries = Object.entries(negatedFacets)
  if (!freeIncludes.length && !freeExcludes.length && !negatedEntries.length) return students.value

  return students.value.filter(s => {
    for (const [field, values] of negatedEntries) {
      if (values.some(v => String(s[field as keyof Student]) === String(v))) return false
    }
    const haystack = globalFilterFields.map(f => String(s[f] ?? '')).join(' ').toLowerCase()
    if (freeExcludes.some(t => haystack.includes(t))) return false
    if (freeIncludes.some(group => !group.some(t => haystack.includes(t)))) return false
    return true
  })
})

// Collect the current positive facet selection from the PrimeVue filter model.
function filtersToFacets(): Record<string, Array<string | number>> {
  const facets: Record<string, Array<string | number>> = {}
  for (const f of FACET_FIELDS) {
    const v = filters.value[f.field].value as Array<string | number> | null
    if (v?.length) facets[f.field] = [...v]
  }
  return facets
}

// String -> facets: push parsed positive facets into the PrimeVue filter model.
// Only write when the selection actually differs, so this never fights typing.
watch(parsed, (q) => {
  for (const f of FACET_FIELDS) {
    const desired = q.facets[f.field] ?? []
    const current = (filters.value[f.field].value as Array<string | number> | null) ?? []
    const same = desired.length === current.length && desired.every(v => current.includes(v))
    if (!same) filters.value[f.field].value = desired.length ? [...desired] : null
  }
})

// Facets -> string: throttled at 150ms so rapid pill clicks don't hammer the URL rewrite.
let _throttleTimer: ReturnType<typeof setTimeout> | null = null
watch(filters, () => {
  if (_throttleTimer) return
  _throttleTimer = setTimeout(() => {
    _throttleTimer = null
    const fromFilters = filtersToFacets()
    const current = parseQuery(searchText.value, FACET_FIELDS)
    if (facetSignature(fromFilters, FACET_FIELDS) === facetSignature(current.facets, FACET_FIELDS)) return
    searchText.value = stringifyQuery({ ...current, facets: fromFilters }, FACET_FIELDS)
  }, 150)
}, { deep: true })

function resetFilters() {
  searchText.value = ''
  for (const key of Object.keys(filters.value)) {
    filters.value[key].value = null
  }
}

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

const sortField = ref<string | null>(null)
const sortOrder = ref<1 | -1>(1)

function onSort(e: { sortField?: string | ((item: unknown) => string); sortOrder?: number | null }) {
  sortField.value = typeof e.sortField === 'string' ? e.sortField : null
  sortOrder.value = e.sortOrder === -1 ? -1 : 1
}

const studentsForTable = computed(() => {
  const raw = filteredStudents.value.map(toRaw)
  const field = sortField.value
  if (!field) return markRaw(raw)
  const order = sortOrder.value
  return markRaw(raw.slice().sort((a, b) => {
    const av = (a as Record<string, unknown>)[field]
    const bv = (b as Record<string, unknown>)[field]
    if (av == null && bv == null) return 0
    if (av == null) return order
    if (bv == null) return -order
    return order * collator.compare(String(av), String(bv))
  }))
})

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
        placeholder="Search — field tokens (major:STEM|Business), -field excludes, free text, comma = AND"
        size="small"
      />

      <div class="result-counter">
        <button class="reset-btn" title="Reset all filters" @click="resetFilters">
          ✕ Reset
        </button>
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
      :value="studentsForTable"
      v-model:filters="filters"
      filterDisplay="menu"
      paginator
      :rows="50"
      size="small"
      sortMode="single"
      :sort-field="sortField ?? undefined"
      :sort-order="sortOrder"
      @sort="onSort"
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
        <template #body="{ data }">
          <EnumBadge
            v-if="BADGE_COLORS[c.field]?.[String(data[c.field])]"
            :value="String(data[c.field])"
            :color="BADGE_COLORS[c.field]![String(data[c.field])].bg"
          />
          <EnumBadge
            v-else-if="NEUTRAL_BADGE_FIELDS.has(c.field)"
            :value="String(data[c.field])"
            color="#9ca3af"
          />
          <span v-else>{{ data[c.field] }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiFilter
            v-model="filterModel.value"
            :options="c.options"
            :colorMap="BADGE_COLORS[c.field]"
            :neutralBg="NEUTRAL_BADGE_FIELDS.has(c.field) ? '#9ca3af' : undefined"
            @update:modelValue="filterCallback()"
          />
        </template>
        <template #filterapply><span /></template>
        <template #filterclear><span /></template>
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
  min-width: 14rem;
}

.reset-btn {
  flex-shrink: 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 0.78rem;
  padding: 0.3rem 0.65rem;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s;
}
.reset-btn:hover {
  border-color: var(--negative);
  color: var(--negative);
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
