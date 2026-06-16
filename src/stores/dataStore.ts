import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadStudents } from '../api/loadData'
import type { Student } from '../types/student'

type Status = 'idle' | 'loading' | 'ready' | 'error'

export const useDataStore = defineStore('data', () => {
  const students = ref<Student[]>([])
  const status = ref<Status>('idle')
  const error = ref<string | null>(null)

  async function load() {
    status.value = 'loading'
    try {
      students.value = await loadStudents()
      status.value = 'ready'
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      status.value = 'error'
    }
  }

  return { students, status, error, load }
})
