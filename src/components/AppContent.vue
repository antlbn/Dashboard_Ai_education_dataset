<script setup lang="ts">
import { useUiStore } from '../stores/uiStore'
import OverviewView from './OverviewView.vue'
import DistributionsView from './DistributionsView.vue'
import MyDataTable from './DataTableView.vue'

const ui = useUiStore()
</script>

<template>
  <main class="app-content">
    <OverviewView v-if="ui.activeView === 'overview'" />
    <DistributionsView v-else-if="ui.activeView === 'distributions'" />
    <MyDataTable v-else-if="ui.activeView === 'table'" />
  </main>
</template>

<style scoped>
.app-content {
  grid-area: content;
  background: var(--bg-base);
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
