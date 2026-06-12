import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDataStore } from './dataStore'
import type { Student } from '../types/student'

type MajorCategory = Student['Major_Category'] | null
type YearOfStudy = Student['Year_of_Study'] | null

export const useFiltersStore = defineStore('filters', () => {
  const majorCategory = ref<MajorCategory>(null)
  const yearOfStudy = ref<YearOfStudy>(null)

  const filteredStudents = computed(() => {
    const dataStore = useDataStore()
    return dataStore.students.filter(s => {
      if (majorCategory.value && s.Major_Category !== majorCategory.value) return false
      if (yearOfStudy.value && s.Year_of_Study !== yearOfStudy.value) return false
      return true
    })
  })

  function reset() {
    majorCategory.value = null
    yearOfStudy.value = null
  }

  return { majorCategory, yearOfStudy, filteredStudents, reset }
})
