<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Slider from 'primevue/slider'
import { FilterMatchMode } from '@primevue/core/api'
import { Doughnut } from 'vue-chartjs'
import { storeToRefs } from 'pinia'
import { useDataStore } from '../stores/dataStore'
import { useChartColors } from '../charts/useChartColors'
import { computed, ref, watch } from 'vue'

const store = useDataStore()
const { students } = storeToRefs(store)
const colors = useChartColors()

const paidFilter = ref<boolean | null>(null)

const filters = ref({
  global:                   { value: null as string | null,     matchMode: FilterMatchMode.CONTAINS },
  Major_Category:           { value: null,                      matchMode: FilterMatchMode.IN },
  Year_of_Study:            { value: null,                      matchMode: FilterMatchMode.IN },
  Burnout_Risk_Level:       { value: null,                      matchMode: FilterMatchMode.IN },
  Primary_Use_Case:         { value: null,                      matchMode: FilterMatchMode.IN },
  Prompt_Engineering_Skill: { value: null,                      matchMode: FilterMatchMode.IN },
  Institutional_Policy:     { value: null,                      matchMode: FilterMatchMode.IN },
  Perceived_AI_Dependency:  { value: null,                      matchMode: FilterMatchMode.IN },
  Anxiety_Level_During_Exams:{ value: null,                     matchMode: FilterMatchMode.IN },
  Tool_Diversity:           { value: null,                      matchMode: FilterMatchMode.IN },
  Pre_Semester_GPA:         { value: null as [number,number] | null, matchMode: FilterMatchMode.BETWEEN },
  Post_Semester_GPA:        { value: null as [number,number] | null, matchMode: FilterMatchMode.BETWEEN },
  GPA_change:               { value: null as [number,number] | null, matchMode: FilterMatchMode.BETWEEN },
  Weekly_GenAI_Hours:       { value: null as [number,number] | null, matchMode: FilterMatchMode.BETWEEN },
  Traditional_Study_Hours:  { value: null as [number,number] | null, matchMode: FilterMatchMode.BETWEEN },
  Skill_Retention_Score:    { value: null as [number,number] | null, matchMode: FilterMatchMode.BETWEEN },
})

const searchText = ref('')
let debounceTimer: ReturnType<typeof setTimeout>
watch(searchText, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { filters.value.global.value = val }, 300)
})

const filteredStudents = computed(() => {
  if (paidFilter.value === null) return students.value
  return students.value.filter(s => s.Paid_Subscription === paidFilter.value)
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

// categorical options
const majorOptions           = ['Arts', 'Business', 'Humanities', 'Medical', 'STEM']
const yearOptions            = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
const burnoutOptions         = ['Low', 'Medium', 'High']
const useCaseOptions         = ['Copywriting/Drafting', 'Debugging/Troubleshooting', 'Direct_Answer_Generation', 'Ideation', 'Summarizing_Reading']
const promptSkillOptions     = ['Beginner', 'Intermediate', 'Advanced']
const policyOptions          = ['Actively_Encouraged', 'Allowed_With_Citation', 'Strict_Ban']
const dependencyOptions      = [1,2,3,4,5,6,7,8,9,10]
const anxietyOptions         = [1,2,3,4,5,6,7,8,9,10]
const toolDiversityOptions   = [...new Set(students.value.map(s => s.Tool_Diversity))].sort((a,b) => a-b)
</script>

<template>
  <div>
    <div style="margin-bottom: 0.75rem; display: flex; gap: 0.75rem; align-items: center;">
      <InputText v-model="searchText" placeholder="Поиск..." size="small" />

      <label style="font-size: 0.85rem;">Paid:</label>
      <select v-model="paidFilter" style="font-size: 0.85rem; padding: 0.3rem 0.5rem;">
        <option :value="null">Все</option>
        <option :value="true">Да</option>
        <option :value="false">Нет</option>
      </select>

      <div class="result-counter">
        <div class="share-chart">
          <Doughnut :data="shareChartData" :options="shareChartOptions" />
        </div>
        <span>
          <strong>{{ visibleCount.toLocaleString() }}</strong>
          из {{ totalCount.toLocaleString() }}
          <span class="muted">({{ selectedShare.toFixed(1) }}%)</span>
        </span>
      </div>
    </div>

    <DataTable
      :value="filteredStudents"
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['Major_Category', 'Year_of_Study', 'Primary_Use_Case', 'Prompt_Engineering_Skill', 'Institutional_Policy', 'Burnout_Risk_Level']"
      paginator
      :rows="50"
      size="small"
      sortMode="multiple"
      @value-change="onValueChange"
    >
      <Column field="Student_ID"        header="Student ID"        style="min-width: 6rem" />
      <Column field="Paid_Subscription" header="Paid Subscription"  style="min-width: 8rem" sortable />

      <!-- categorical: multiselect -->
      <Column field="Major_Category" header="Major Category" style="min-width: 9rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="majorOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Year_of_Study" header="Year of Study" style="min-width: 8rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="yearOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Burnout_Risk_Level" header="Burnout Risk" style="min-width: 8rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="burnoutOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Primary_Use_Case" header="Primary Use Case" style="min-width: 10rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="useCaseOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Prompt_Engineering_Skill" header="Prompt Engineering Skill" style="min-width: 10rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="promptSkillOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Institutional_Policy" header="Institutional Policy" style="min-width: 10rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="policyOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Perceived_AI_Dependency" header="AI Dependency" style="min-width: 8rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="dependencyOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Anxiety_Level_During_Exams" header="Exam Anxiety" style="min-width: 8rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="anxietyOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Tool_Diversity" header="Tool Diversity" style="min-width: 8rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" filter :options="toolDiversityOptions" placeholder="Все" />
        </template>
      </Column>

      <!-- numeric: range slider -->
      <Column field="Pre_Semester_GPA" header="Pre-Semester GPA" style="min-width: 9rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <Slider v-model="filterModel.value" range :min="0" :max="4" :step="0.1" style="margin: 0.5rem 0.25rem;" />
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted)">
            <span>{{ filterModel.value?.[0] ?? 0 }}</span>
            <span>{{ filterModel.value?.[1] ?? 4 }}</span>
          </div>
        </template>
      </Column>

      <Column field="Post_Semester_GPA" header="Post-Semester GPA" style="min-width: 9rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <Slider v-model="filterModel.value" range :min="0" :max="4" :step="0.1" style="margin: 0.5rem 0.25rem;" />
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted)">
            <span>{{ filterModel.value?.[0] ?? 0 }}</span>
            <span>{{ filterModel.value?.[1] ?? 4 }}</span>
          </div>
        </template>
      </Column>

      <Column field="GPA_change" header="GPA Change (Δ)" style="min-width: 8rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <Slider v-model="filterModel.value" range :min="-2" :max="2" :step="0.01" style="margin: 0.5rem 0.25rem;" />
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted)">
            <span>{{ filterModel.value?.[0] ?? -2 }}</span>
            <span>{{ filterModel.value?.[1] ?? 2 }}</span>
          </div>
        </template>
      </Column>

      <Column field="Weekly_GenAI_Hours" header="GenAI Hours / Week" style="min-width: 9rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <Slider v-model="filterModel.value" range :min="0" :max="40" :step="0.5" style="margin: 0.5rem 0.25rem;" />
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted)">
            <span>{{ filterModel.value?.[0] ?? 0 }}</span>
            <span>{{ filterModel.value?.[1] ?? 40 }}</span>
          </div>
        </template>
      </Column>

      <Column field="Traditional_Study_Hours" header="Study Hours / Week" style="min-width: 9rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <Slider v-model="filterModel.value" range :min="0" :max="40" :step="0.5" style="margin: 0.5rem 0.25rem;" />
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted)">
            <span>{{ filterModel.value?.[0] ?? 0 }}</span>
            <span>{{ filterModel.value?.[1] ?? 40 }}</span>
          </div>
        </template>
      </Column>

      <Column field="Skill_Retention_Score" header="Skill Retention Score" style="min-width: 9rem" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <Slider v-model="filterModel.value" range :min="0" :max="100" :step="1" style="margin: 0.5rem 0.25rem;" />
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted)">
            <span>{{ filterModel.value?.[0] ?? 0 }}</span>
            <span>{{ filterModel.value?.[1] ?? 100 }}</span>
          </div>
        </template>
      </Column>

    </DataTable>
  </div>
</template>

<style scoped>
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
