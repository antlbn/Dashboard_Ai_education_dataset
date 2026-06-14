<script setup lang="ts">
import { computed } from 'vue'
import { useFiltersStore } from '../stores/filtersStore'
import '../charts/chartSetup'
import DistributionChart from '../charts/DistributionChart.vue'
import type { Student } from '../types/student'

const filters = useFiltersStore()
const count = computed(() => filters.filteredStudents.length)

// Mirrors the EDA notebook's numeric_cols / cat_cols overview grids.
const numericCols: Array<{ column: keyof Student; title: string }> = [
  { column: 'Pre_Semester_GPA', title: 'Pre-Semester GPA' },
  { column: 'Post_Semester_GPA', title: 'Post-Semester GPA' },
  { column: 'GPA_change', title: 'GPA Change' },
  { column: 'Weekly_GenAI_Hours', title: 'Weekly GenAI Hours' },
  { column: 'Traditional_Study_Hours', title: 'Traditional Study Hours' },
  { column: 'Skill_Retention_Score', title: 'Skill Retention Score' },
]

const categoricalCols: Array<{ column: keyof Student; title: string }> = [
  { column: 'Major_Category', title: 'Major Category' },
  { column: 'Year_of_Study', title: 'Year of Study' },
  { column: 'Primary_Use_Case', title: 'Primary Use Case' },
  { column: 'Prompt_Engineering_Skill', title: 'Prompt Engineering Skill' },
  { column: 'Institutional_Policy', title: 'Institutional Policy' },
  { column: 'Burnout_Risk_Level', title: 'Burnout Risk Level' },
]
</script>

<template>
  <div class="distributions">
    <p class="intro">
      Разведочный обзор распределений — формы данных по выборке. Реагирует на
      фильтры. Не интерпретируется как причинно-следственная связь.
    </p>

    <h2 class="section-title">Числовые признаки</h2>
    <div class="dist-grid">
      <DistributionChart
        v-for="c in numericCols"
        :key="c.column"
        :column="c.column"
        :title="c.title"
        type="numeric"
      />
    </div>

    <h2 class="section-title">Категориальные признаки</h2>
    <div class="dist-grid">
      <DistributionChart
        v-for="c in categoricalCols"
        :key="c.column"
        :column="c.column"
        :title="c.title"
        type="categorical"
      />
    </div>

    <p class="count">Студентов в выборке: {{ count }}</p>
  </div>
</template>

<style scoped>
.intro {
  font-size: 0.8rem;
  color: var(--text-faint);
  margin: 0 0 1.5rem;
  max-width: 640px;
}

.section-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin: 0 0 1rem;
}

.dist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.dist-grid > * {
  min-width: 0;
}

@media (max-width: 1200px) {
  .dist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .dist-grid {
    grid-template-columns: 1fr;
  }
}

.count {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-faint);
}
</style>
