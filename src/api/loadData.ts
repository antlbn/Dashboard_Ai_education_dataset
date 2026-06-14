import axios from 'axios'
import { z } from 'zod'
import { StudentSchema, type Student } from '../types/student'

export async function loadStudents(): Promise<Student[]> {
  const response = await axios.get<unknown[]>(import.meta.env.BASE_URL + 'eda_preprocessed.json')
  const result = z.array(StudentSchema).safeParse(response.data)

  if (!result.success) {
    console.error('Validation error:', result.error.flatten())
    throw new Error('Data validation failed')
  }

  return result.data
}
