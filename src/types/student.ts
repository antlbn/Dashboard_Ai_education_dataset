import { z } from 'zod'

export const StudentSchema = z.object({
  Student_ID: z.number(),
  Major_Category: z.enum(['Arts', 'Business', 'Humanities', 'Medical', 'STEM']),
  Year_of_Study: z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
  Pre_Semester_GPA: z.number(),
  Post_Semester_GPA: z.number(),
  Weekly_GenAI_Hours: z.number(),
  Traditional_Study_Hours: z.number(),
  Tool_Diversity: z.number(),
  Perceived_AI_Dependency: z.number(),
  Anxiety_Level_During_Exams: z.number(),
  Skill_Retention_Score: z.number(),
  Primary_Use_Case: z.enum([
    'Copywriting/Drafting',
    'Debugging/Troubleshooting',
    'Direct_Answer_Generation',
    'Ideation',
    'Summarizing_Reading',
  ]),
  Prompt_Engineering_Skill: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  Institutional_Policy: z.enum([
    'Actively_Encouraged',
    'Allowed_With_Citation',
    'Strict_Ban',
  ]),
  Burnout_Risk_Level: z.enum(['Low', 'Medium', 'High']),
  Paid_Subscription: z.boolean(),
  GPA_change: z.number(),
})

export type Student = z.infer<typeof StudentSchema>
