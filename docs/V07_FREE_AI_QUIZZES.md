# DevForge AI v0.7 — Zero-paid-API quiz generation

This milestone introduces a server-side Cloudflare Workers AI quiz service, a private Supabase bank, and a **local** Ollama draft generator. The frontend stays on InfinityFree and Supabase Auth stays as-is.

## Safety / cost rules
- Cloudflare Workers **Free plan only**. Do not switch to Workers Paid or add paid inference or a paid fallback provider. Cloudflare currently offers a fixed free Workers AI daily allowance; limits are provider-controlled and can change.
- Database RPC hard cap: **8 AI generations total per UTC day** and **2 per account per UTC day**. These limits count even failed generation attempts (safe budget upper bound).
- Cache first: use approved question sets, then draft sets; generate only when no saved set exists. The Cloudflare free quota itself is a second independent cutoff.
- If no cached quiz and generation is unavailable, show an honest error; do not pretend quiz content exists. The existing v0.6 curated Python quizzes remain accessible separately.
- Answer keys and explanations remain in server-only tables and are sent **only after quiz submission**. Generated questions are **unreviewed practice drafts** until editorially approved; don't use drafts for certification or official lesson completion.
- Admin must independently verify any generated question's correctness before changing its status to approved. Approved Medium quizzes are marked eligible by the server for future server-authoritative completion integration, but this v0.7 client does **not** automatically mark lessons complete from AI quizzes. The four existing curated quizzes remain authoritative.
- This is not a guarantee that Cloudflare or Ollama's availability or free allowance will remain unchanged.

## 1. Apply SQL
Open Supabase SQL Editor and run, in order:
1. `supabase/ai_quiz_bank.sql`
2. `supabase/ai_quiz_topics.sql`
3. From your VS Code repo run `node scripts/export-quiz-topics.mjs > supabase/quiz_topics_seed.sql`, then paste that generated file into Supabase SQL Editor and execute it. This seeds all 323 canonical topics.

SQL Editor may warn that `REVOKE` changes permissions. Review statements before approving. Never expose Supabase secret/service_role keys in the browser. The bank, sessions, scores and quotas are server-only with RLS enabled.

## 2. Create free Cloudflare Worker
Sign in to Cloudflare, create a Workers Free application and deploy from the repo's `workers/quiz-api` directory.
Use Wrangler CLI:
```sh
cd workers/quiz-api
npx wrangler login
npx wrangler deploy
```
Binding AI and ALLOWED_ORIGIN are in `workers/quiz-api/wrangler.json`. Attach the following Worker **secrets**, not regular public vars:
```sh
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```
For the URL, paste your existing Supabase project URL (not a frontend URL); for the public publishable key, use your existing `VITE_SUPABASE_PUBLISHABLE_KEY`. For `SUPABASE_SERVICE_ROLE_KEY`, use the private server-side key from your Supabase dashboard. **Never publish that secret in GitHub, logs, browser or Vite variables.** Workers secret values are entered privately at prompts.

Review and set `ALLOWED_ORIGIN` to your exact production origin in `wrangler.json`. The default is `https://vishalk.great-site.net`. To test locally, deploy a **separate development Worker** with `ALLOWED_ORIGIN=http://localhost:5173` (your actual Vite port may differ). Do not relax production CORS to a wildcard.

## 3. Browser configuration
Add the published Worker URL to your local `.env.local` and hosting build environment:
```env
VITE_QUIZ_API_URL=https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev
```
This is a public endpoint URL, *not* a secret. Run `npm ci`, `npm test`, `npm run build`, `npm run dev`. The feature stays disabled gracefully if the URL is not configured.

On a live site, rebuild `dist/` after setting this variable and upload the **contents** to InfinityFree `/htdocs` (assets first, index last; preserve server settings).

## 4. Test
- Sign in with Google or GitHub. Open a topic and pick Easy, Medium or Hard. Start quiz, answer all five, submit.
- Check browser Network tab: `/quiz/start` must return questions **without** `correct` or `explanation`; `/quiz/submit` returns the grade and explanations.
- Generate at most 2 new sets per account and 8 globally per UTC day; cached sets should not consume generation quota.
- Verify different accounts cannot submit each other's session IDs; anonymous users cannot request AI generation.
- Verify a learner cannot read `ai_quiz_bank` via Supabase anon/publishable credentials, nor invoke the claim quota RPC.
- Disconnect the Worker: the existing four curated v0.6 Python quizzes must still work.
- Confirm no AI draft automatically completes a lesson. Current v0.6 pass rules must remain intact.
- Monitor Cloudflare free allocation (neurons) and use alerts/manual observation. The budget here is conservative, but free allowance depends on token/model usage.

## 5. Bulk author with local Ollama
Install Ollama on your local PC and download an open-weight model:
```sh
ollama pull qwen2.5:7b
node scripts/ollama-quiz-bank.mjs --topic python:0 --level medium
```
This creates `quiz-drafts/python-0-medium.json`. Inspect/edit each question, distractor, answer index and explanation. Do **not** blindly approve LLM output or ingest all drafts. Import reviewed JSON via a privileged SQL Editor INSERT into `ai_quiz_bank` with source `ollama` and status `approved` only when independently verified.

To generate multiple drafts for a module with a local model, use `node scripts/ollama-bulk.mjs --module python --level all --max 10` (this example creates up to ten individual draft sets).

After **independently checking every answer**, convert an approved draft into a SQL statement using:

```sh
node scripts/approved-quiz-sql.mjs quiz-drafts/python-0-medium.json --reviewed > approved.sql
```

Inspect `approved.sql` and execute it through Supabase SQL Editor with privileged credentials; review/approval is a human action, not automated fact checking. No service key is needed for these local scripts.

Do not store or commit learner PII or tokens in draft files. Local Ollama costs no paid AI inference API fees, but requires CPU/GPU resources and electricity. Model licenses vary.

## Known limitations
- Prompt-based generation can output inaccurate questions; server validates shape, not technical correctness.
- Cloudflare Worker URL, secrets and Supabase SQL require your account setup. The GitHub PR cannot deploy these resources for you.
- No server-authoritative progress gating was introduced for AI questions. It remains the v0.6 curated completion rule; integrating verified Medium quizzes requires another carefully reviewed update.
- Initial cached bank is empty until seed/import or first generated draft. Failures return real errors, not guaranteed quiz availability.
