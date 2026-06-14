<script setup lang="ts">

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../stores/dataStore';
import { computed, ref } from 'vue';

const store = useDataStore();
const { students } = storeToRefs(store);

const paidFilter = ref<boolean | null>(null);

const filteredStudents = computed(() => {
  if (paidFilter.value === null) return students.value;
  return students.value.filter(s => s.Paid_Subscription === paidFilter.value);
});

</script>


<template>
  <div>
    <div style="margin-bottom: 0.5rem">
      <label>Paid Subscription: </label>
      <select v-model="paidFilter">
        <option :value="null">Все</option>
        <option :value="true">Да</option>
        <option :value="false">Нет</option>
      </select>
    </div>

    <DataTable :value="filteredStudents" paginator :rows="50" size="small" sortMode="multiple">
      <Column field="Student_ID" header="Student_ID" />
      <Column field="Weekly_GenAI_Hours" header="Weekly_AI_Hours" sortable />
      <Column field="Paid_Subscription" header="Paid" sortable />
      <Column field="Major_Category" header="Major_Category" sortable />
      <Column field="Year_of_Study" header="Year_of_Study" sortable />
      <Column field="Pre_Semester_GPA" header="Pre_Semester_GPA" sortable />  
      <Column field="Primary_Use_Case" header="Primary_Use_Case" sortable />
      <Column field="Prompt_Engineering_Skill" header="Prompt_Engineering_Skill" sortable />
      <Column field="Tool_Diversity" header="Tool_Diversity" sortable />
      <Column field="Traditional_Study_Hours" header="Traditional_Study_Hours" sortable />
      <Column field="Perceived_AI_Dependency" header="Perceived_AI_Dependency" sortable />

    </DataTable>
  </div>
</template>

