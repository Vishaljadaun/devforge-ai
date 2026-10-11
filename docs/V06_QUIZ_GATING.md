# DevForge AI v0.6 — Quiz-gated lesson completion (Phase 1)

This release adds mandatory practice quiz completion for the four Python foundation topics that have interactive quizzes (`python:0` through `python:3`). The other 319 roadmap topics still allow manual self-reported completion until they receive suitable quizzes.

## Completion rules

- Passing requires **2 correct answers out of 3** for each existing practice quiz.
- Clicking a gated topic's roadmap checkbox cannot mark it complete. Instead, the UI displays **QUIZ REQUIRED** and directs learners to its practice lab.
- A passing submission automatically marks the topic complete. Failing submissions preserve the attempt score and allow unlimited retries.
- The latest and best scores, attempt count, and lesson progress are saved in the existing browser/Supabase workspace.
- Previously completed topics with saved passing quiz results remain complete. A previously manually checked gated topic **without** a passing saved quiz result becomes incomplete when the workspace is loaded.
- Passing results are treated as earned completion and cannot be manually unchecked; revisiting quizzes remains possible.
- Activity events record `practice_submitted` for every submission and `topic_completed` for the first passing submission.

## Test and deployment

1. Pull and switch to `feature/v0.6-quiz-gated-completion`.
2. Run `npm ci`, `npm test`, `npm run build`, and `npm run dev` with the same `.env.local` configuration.
3. Try the first Python topic and score 0/3 or 1/3: the lesson remains incomplete.
4. Retry and score 2/3 or 3/3: the lesson becomes complete automatically.
5. Refresh after passing; confirm cloud progress remains saved. The other topics should retain their manual checkbox.
6. Validate admin learner progress and engagement on a non-admin test account.
7. Only after tests and CI succeed, merge into `main` and upload the build output to InfinityFree via FileZilla.

No new Supabase migration is necessary for this change; it uses the existing workspace record.

**Scope limits:** This is client-side quiz scoring, suitable for self-guided learning and not a tamper-proof exam system. Scores can be manipulated by someone who controls their browser or directly edits their own workspace. Future server-side grading should be added before granting verified certifications or using scores for high-stakes decisions.
