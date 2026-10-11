# DevForge AI v0.5 — Interactive learning & meaningful engagement

## Scope

- Four hands-on Python foundation labs (`python:0` through `python:3`), each with setup, code, implementation challenge, verification steps, and 3 multiple-choice questions with explanations. This is the **first curriculum slice**, not a claim that all 323 topics have full lessons.
- Save each topic's best score, latest score, attempt count and last attempt time in the existing RLS-protected workspace JSONB. Anonymous users save locally; signed-in users can sync across devices.
- Track **explicit actions only**: topic completed, project milestone completed, revision quiz submitted, practice quiz submitted, flashcard reviewed, journal saved. No content of notes, answers or user-written code is sent to the event log.
- Admin-only aggregate 7-day engagement: unique learners who performed an action, total actions, topic completions, practice submissions, project milestones and revision activity.
- The existing learner directory, learner workspaces, OAuth providers and Content Studio stay unchanged.

## Before you test the feature branch

1. `git fetch origin` and `git switch --track origin/feature/v0.5-interactive-learning-engagement` (or switch to the existing local branch).
2. Confirm `.env.local` has your Supabase URL and **publishable** key; never commit it or any service-role key.
3. Supabase dashboard → **SQL Editor → New query** → run **the entire** `supabase/learning_activity.sql` migration. A privileged SQL Editor owner must run it. Do **not** execute migrations from the browser.
4. `npm ci && npm test && npm run build && npm run dev`.
5. Sign in with a normal Google/GitHub learner. Open **AI Engineer Roadmap → Python for AI → any of the first 4 topics**. Complete the hands-on task on your own machine, answer all three multiple-choice questions, then submit.
6. Refresh and reopen the topic: best score, latest score and attempts should persist for the same learner. Verify another learner cannot access that workspace or event log.
7. Mark a topic complete, complete a project milestone, submit the existing revision quiz, rate a flashcard and save a journal note. Admin → **Admin Analytics → Learning engagement** should update after clicking Refresh.
8. With a non-admin Supabase session, attempt the `admin_learning_engagement` RPC and confirm `42501 Admin access required`; ensure no raw `learner_activity` rows are readable through the frontend.
9. Only after successful CI and end-to-end tests, merge the PR to `main`, build and upload **contents of `dist/`** into InfinityFree `htdocs` via FileZilla. Preserve `.htaccess` and other server config files.

## Data and limits

- The browser does not execute learners' Python code. Knowledge-check questions are self-scored on the client and should **not** be treated as verified coding proficiency or high-stakes grades.
- An engagement event is a deliberate UI action. Multiple attempts create multiple events. It is **not** a measure of study time, mastery or proof of real-time online presence.
- No historical events are backfilled. Metrics start counting once the migration is installed and v0.5 events are recorded.
- Events belong to Supabase Auth user IDs and are deleted on user deletion. Decide on a published retention policy and scheduled deletion of old events before operating at scale; 90 days is a sensible starting option, but **no automated purge is installed in this release**.
- Add a privacy notice explaining the platform's use of progress, account data, and learning-event timestamps for account support and aggregate platform improvement.
- The events table has no public read grants, and the aggregate admin function uses `SECURITY DEFINER` only after checking admin membership. Avoid exposing auth.users or raw workspaces directly to clients.
- Keep `src/data/practice.ts` under editorial review. Future releases can add more labs, question banks, server-side grading, and project links.