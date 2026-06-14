<script setup lang="ts">
import { computed } from 'vue'
import { useFiltersStore } from '../stores/filtersStore'
import '../charts/chartSetup'
import GenAIHistogram from '../charts/GenAIHistogram.vue'
import GPAChangeByMajor from '../charts/GPAChangeByMajor.vue'
import ScatterGenAIvsGPA from '../charts/ScatterGenAIvsGPA.vue'
import BurnoutDoughnut from '../charts/BurnoutDoughnut.vue'
import LowessScatter from '../charts/LowessScatter.vue'
import GPAChangeByBin from '../charts/GPAChangeByBin.vue'

const filters = useFiltersStore()
const students = computed(() => filters.filteredStudents)

const avgPostGPA = computed(() => {
  if (!students.value.length) return '—'
  const sum = students.value.reduce((acc, s) => acc + s.Post_Semester_GPA, 0)
  return (sum / students.value.length).toFixed(2)
})

const avgGenAIHours = computed(() => {
  if (!students.value.length) return '—'
  const sum = students.value.reduce((acc, s) => acc + s.Weekly_GenAI_Hours, 0)
  return (sum / students.value.length).toFixed(1)
})

const avgGPAChange = computed(() => {
  if (!students.value.length) return null
  const sum = students.value.reduce((acc, s) => acc + s.GPA_change, 0)
  return sum / students.value.length
})

const avgGPAChangeFormatted = computed(() => {
  if (avgGPAChange.value === null) return '—'
  const v = avgGPAChange.value
  return (v >= 0 ? '+' : '') + v.toFixed(3)
})

const burnoutHighPct = computed(() => {
  if (!students.value.length) return '—'
  const high = students.value.filter(s => s.Burnout_Risk_Level === 'High').length
  return ((high / students.value.length) * 100).toFixed(1) + '%'
})
</script>

<template>
  <div class="overview">
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Средний GPA (после)</span>
        <span class="kpi-value">{{ avgPostGPA }}</span>
        <span class="kpi-sub">из 4.0</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">GenAI часов/неделю</span>
        <span class="kpi-value">{{ avgGenAIHours }}</span>
        <span class="kpi-sub">среднее</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Изменение GPA</span>
        <span
          class="kpi-value"
          :class="avgGPAChange !== null && avgGPAChange >= 0 ? 'positive' : 'negative'"
        >
          {{ avgGPAChangeFormatted }}
        </span>
        <span class="kpi-sub">Post − Pre</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Burnout High</span>
        <span class="kpi-value">{{ burnoutHighPct }}</span>
        <span class="kpi-sub">от выборки</span>
      </div>
    </div>

    <div class="charts-grid">
      <GenAIHistogram />
      <GPAChangeByMajor />
      <GPAChangeByBin />
      <BurnoutDoughnut />
      <ScatterGenAIvsGPA />
      <LowessScatter />
    </div>

    <p class="count">Студентов в выборке: {{ students.length }}</p>
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 50%;
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.kpi-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.kpi-value.positive { color: var(--positive); }
.kpi-value.negative { color: var(--negative); }

.kpi-sub {
  font-size: 0.75rem;
  color: var(--text-faint);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.charts-grid > * {
  min-width: 0;
}

@media (max-width: 900px) {
  .kpi-grid {
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.count {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--text-faint);
}
</style>
