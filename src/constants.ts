import { StudentSchema, type Student } from './types/student'

/**
 * Single source of truth for categorical option lists.
 *
 * Derived from the zod schema so the values stay in sync with validation:
 * add a value to the enum in `types/student.ts` and it appears everywhere.
 */
export const MAJORS = [...StudentSchema.shape.Major_Category.options]
export const YEARS = [...StudentSchema.shape.Year_of_Study.options]
export const USE_CASES = [...StudentSchema.shape.Primary_Use_Case.options]
export const PROMPT_SKILLS = [...StudentSchema.shape.Prompt_Engineering_Skill.options]
export const POLICIES = [...StudentSchema.shape.Institutional_Policy.options]
export const BURNOUT_LEVELS = [...StudentSchema.shape.Burnout_Risk_Level.options]

/** Integer scale used by 1–10 survey columns. */
export const SCALE_1_10 = Array.from({ length: 10 }, (_, i) => i + 1)

/** Build a `[{ label: 'All', value: null }, ...]` list for dropdown filters. */
export function withAll<T extends string>(
  values: readonly T[],
): Array<{ label: string; value: T | null }> {
  return [{ label: 'All', value: null }, ...values.map(v => ({ label: v, value: v }))]
}

export type MajorCategory = Student['Major_Category']
export type YearOfStudy = Student['Year_of_Study']
