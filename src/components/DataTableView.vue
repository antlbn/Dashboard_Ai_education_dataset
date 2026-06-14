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
      <Column field="Weekly_GenAI_Hours" header="Weekly_GenAI_Hours" sortable />
      <Column field="Paid_Subscription" header="Paid" sortable />
    </DataTable>
  </div>
</template>

