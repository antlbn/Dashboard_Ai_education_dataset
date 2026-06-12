<script setup lang="ts">
import { computed } from 'vue'
import { useFiltersStore } from '../stores/filtersStore'

const filters = useFiltersStore()

const students = computed(() => filters.filteredStudents)

const avgPostGPA = computed(() => {
  if (!students.value.length) return 0
  const sum = students.value.reduce((acc, s) => acc + s.Post_Semester_GPA, 0)
  return (sum / students.value.length).toFixed(2)
})

const avgGenAIHours = computed(() => {
  if (!students.value.length) return 0
  const sum = students.value.reduce((acc, s) => acc + s.Weekly_GenAI_Hours, 0)
  return (sum / students.value.length).toFixed(1)
})

const avgGPAChange = computed(() => {
  if (!students.value.length) return 0
  const sum = students.value.reduce((acc, s) => acc + s.GPA_change, 0)
  return (sum / students.value.length).toFixed(3)
})

const burnoutHighPct = computed(() => {
  if (!students.value.length) return 0
  const high = students.value.filter(s => s.Burnout_Risk_Level === 'High').length
  return ((high / students.value.length) * 100).toFixed(1)
})
</script>

<template>
  <main class="app-content">
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
        <span class="kpi-value" :class="Number(avgGPAChange) >= 0 ? 'positive' : 'negative'">
          {{ Number(avgGPAChange) >= 0 ? '+' : '' }}{{ avgGPAChange }}
        </span>
        <span class="kpi-sub">Post − Pre</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Burnout High</span>
        <span class="kpi-value">{{ burnoutHighPct }}%</span>
        <span class="kpi-sub">от выборки</span>
      </div>
    </div>

    <p class="count">Студентов в выборке: {{ students.length }}</p>
  </main>
</template>

<style scoped>
.app-content {
  grid-area: content;
  background: #1e1e2e;
  padding: 1.5rem;
  overflow-y: auto;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.kpi-card {
  background: #181825;
  border: 1px solid #313244;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.kpi-label {
  font-size: 0.75rem;
  color: #585b70;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #cdd6f4;
  line-height: 1;
}

.kpi-value.positive { color: #a6e3a1; }
.kpi-value.negative { color: #f38ba8; }

.kpi-sub {
  font-size: 0.75rem;
  color: #45475a;
}

.count {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #45475a;
}
</style>
