<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import { FilterMatchMode } from '@primevue/core/api'
import { storeToRefs } from 'pinia'
import { useDataStore } from '../stores/dataStore'
import { computed, ref, watch } from 'vue'

const store = useDataStore()
const { students } = storeToRefs(store)

const paidFilter = ref<boolean | null>(null)

const filters = ref({
  global:                  { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  Major_Category:          { value: null, matchMode: FilterMatchMode.IN },
  Year_of_Study:           { value: null, matchMode: FilterMatchMode.IN },
  Burnout_Risk_Level:      { value: null, matchMode: FilterMatchMode.IN },
  Primary_Use_Case:        { value: null, matchMode: FilterMatchMode.IN },
  Prompt_Engineering_Skill:{ value: null, matchMode: FilterMatchMode.IN },
  Institutional_Policy:    { value: null, matchMode: FilterMatchMode.IN },
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

const majorOptions          = ['Arts', 'Business', 'Humanities', 'Medical', 'STEM']
const yearOptions           = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
const burnoutOptions        = ['Low', 'Medium', 'High']
const useCaseOptions        = ['Copywriting/Drafting', 'Debugging/Troubleshooting', 'Direct_Answer_Generation', 'Ideation', 'Summarizing_Reading']
const promptSkillOptions    = ['Beginner', 'Intermediate', 'Advanced']
const policyOptions         = ['Actively_Encouraged', 'Allowed_With_Citation', 'Strict_Ban']
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
    >
      <Column field="Student_ID"              header="ID" />
      <Column field="Weekly_GenAI_Hours"      header="GenAI h/w" sortable />
      <Column field="Traditional_Study_Hours" header="Study h/w" sortable />
      <Column field="Pre_Semester_GPA"        header="Pre GPA" sortable />
      <Column field="Paid_Subscription"       header="Paid" sortable />
      <Column field="Tool_Diversity"          header="Tools" sortable />
      <Column field="Perceived_AI_Dependency" header="AI Depend." sortable />

      <Column field="Major_Category" header="Major" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" :options="majorOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Year_of_Study" header="Year" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" :options="yearOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Burnout_Risk_Level" header="Burnout" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" :options="burnoutOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Primary_Use_Case" header="Use Case" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" :options="useCaseOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Prompt_Engineering_Skill" header="Prompt Skill" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" :options="promptSkillOptions" placeholder="Все" />
        </template>
      </Column>

      <Column field="Institutional_Policy" header="Policy" sortable :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" appendTo="self" :options="policyOptions" placeholder="Все" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
