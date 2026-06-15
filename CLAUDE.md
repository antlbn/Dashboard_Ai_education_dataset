# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

Build an **interactive dashboard** that visualizes the AI Student Impact Dataset. The dashboard application does not exist yet — the repo currently holds only the raw dataset, an exploratory analysis notebook (`EDA.ipynb`), and the task brief (`MyTask.md`, written in Russian).

The required frontend stack (from `MyTask.md`) is mandatory:

- **Vite** (build/dev) + **TypeScript**
- **Vue 3** + **Pinia** (state)
- **PrimeVue** (PrimeUI component library) + **shadcn** (shadcn-vue) for UI
- **axios** (data fetching), **zod** (schema validation of incoming data)
- **Chart.js** for charts

When scaffolding the app, keep these as the chosen libraries rather than substituting equivalents.

## Working with the EDA

The notebook is the source of truth for what the data means and which relationships matter. Run it before designing visualizations.

```bash
# First cell installs analysis deps: statsmodels seaborn scipy scikit-learn xgboost
jupyter lab EDA.ipynb        # or: jupyter notebook EDA.ipynb
```

The notebook loads the CSV by its literal filename `ai_student_impact_dataset (1).csv` (note the space and parentheses) from the repo root.

## Dataset

`ai_student_impact_dataset (1).csv` — 50,000 rows, one per student, no missing values.

Numeric columns:
- `Student_ID` (identifier, exclude from analysis/correlations)
- `Pre_Semester_GPA`, `Post_Semester_GPA` (0–4 scale)
- `Weekly_GenAI_Hours`, `Traditional_Study_Hours`
- `Tool_Diversity` (count), `Perceived_AI_Dependency` (1–10), `Anxiety_Level_During_Exams` (1–10)
- `Skill_Retention_Score` (0–100)

Categorical columns:
- `Major_Category`: Arts, Business, Humanities, Medical, STEM
- `Year_of_Study`: Freshman, Sophomore, Junior, Senior, Graduate
- `Primary_Use_Case`: Copywriting/Drafting, Debugging/Troubleshooting, Direct_Answer_Generation, Ideation, Summarizing_Reading
- `Prompt_Engineering_Skill`: Beginner, Intermediate, Advanced
- `Institutional_Policy`: Actively_Encouraged, Allowed_With_Citation, Strict_Ban
- `Burnout_Risk_Level`: Low, Medium, High
- `Paid_Subscription`: boolean (`True`/`False` as strings in the CSV)

**Engineered feature:** `GPA_change = Post_Semester_GPA - Pre_Semester_GPA` is the notebook's primary outcome variable. It is **pre-computed during Python preprocessing** and stored in `eda_preprocessed.json` alongside the raw columns — treat it as a regular field, do not recompute it in the app.

## Key analytical finding (shapes dashboard messaging)

The headline relationship — GenAI usage vs. GPA change — is **statistically significant but practically negligible** (Pearson r ≈ -0.046 across n=50,000; p→0 purely from sample size; mutual information ≈ 0.019, so no meaningful non-linear signal either). LOWESS and K-Means confirm clusters segment by usage hours, not by outcome.

Implication for the dashboard: do **not** present GenAI hours as a driver of GPA. With this large n, almost any correlation will read as "significant," so favor effect-size framing (variance explained, distributions, segment comparisons) over raw p-values or naive correlation claims.
