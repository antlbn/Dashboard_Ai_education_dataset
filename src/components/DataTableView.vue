<script setup lang="ts">

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../stores/dataStore';


const store = useDataStore();
const { students } = storeToRefs(store);


</script>


<template>
  <DataTable :value="students" responsiveLayout="scroll">
    <Column field="Student_ID" header="Student_ID" />
    <Column field="Weekly_GenAI_Hours" header="Weekly_GenAI_Hours" />
  </DataTable>
</template>

