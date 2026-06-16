<script setup lang="ts">
import MultiSelect from 'primevue/multiselect'

const model = defineModel<Array<string | number> | null>()
defineProps<{ options: ReadonlyArray<string | number> }>()
</script>

<template>
  <MultiSelect v-model="model" append-to="self" filter :options="[...options]" placeholder="All" />
</template>
