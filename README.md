# DevForge AI — Learn. Build. Revise.

A **real, deployable, open-to-expand** AI engineering learning platform. Version 0.1 includes the full skill-map outline plus hands-on project plans, topic progress, personal journal, spaced repetition flashcards, a knowledge quiz, import/export backups and optional learner accounts.

> **Important:** The curriculum has 25 modules and 323 topic outlines. This release intentionally includes **8 fully written starter lessons** and links to authoritative resources for other topics. It does **not** yet contain 323 long-form tutorials, video lessons, an AI tutor, automated assessment of source code, paid subscriptions or an online IDE. Those can be built iteratively as the owner learns and publishes lessons.

## Run locally

**Prerequisites:** Node.js 20.19+ recommended, npm and a code editor.

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. You can use every public feature without setting an API key or database. In guest mode your browser saves progress and journal data locally.

### Main pages

- **Overview:** personalized metrics, phases and a project shortlist.
- **AI Engineer Roadmap:** 25 modules, 323 searchable topics, completion status, bookmarks, selected starter lessons, official references and hands-on labs.
- **Project Library:** 14 guided plans with skill dependencies, stack and individually checked milestones.
- **Revision Center:** curated flashcards with a simple interval scheduler and a 12-question quiz. The app calculates exact card counts from the data.
- **Learning Journal:** private freeform notes, per-topic notes and bookmarks.
- **Settings:** JSON backup/import and optional cloud account.

## Optional: learner accounts and cross-device progress

Guest mode is **localStorage only**. It is not a multi-user database. To make a public deployment where registered learners save their private progress:

1. Create a project at [Supabase](https://supabase.com/).
2. In the Supabase SQL Editor run [`supabase/schema.sql`](supabase/schema.sql). This creates `user_workspaces` with **row-level security**; each logged-in person can only read and change their own workspace.
3. In Supabase authentication settings enable email OTP / magic link login and add your deployed domain to redirect URL allow-list.
4. Copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

5. Restart `npm run dev`. Use the profile icon / Settings to send yourself a login email.

**Never put a Supabase service-role key or an LLM provider secret in a `VITE_` variable.** Vite variables are embedded in the public client bundle. Only the publishable/anon key belongs here, and RLS must be enforced server-side.

**Sync behavior:** When a learner first signs in, local progress seeds a new cloud account. When an account already has a workspace, its cloud workspace replaces the current browser progress. After signing in, changes sync to Supabase. For v0.1, there is no conflict-resolution UI for concurrent edits across multiple tabs/devices. Export a backup before changing accounts.

## Deploy to Vercel

1. Push the `devforge-ai` folder to your own GitHub repository. Put its contents at the repository root, or select `devforge-ai` as Root Directory in Vercel.
2. On [Vercel](https://vercel.com/new), import the repository.
3. Set framework to **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. If enabling accounts, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as Vercel environment variables; redeploy.
5. Update Supabase Auth Site URL / Redirect URLs to your actual Vercel domain.
6. `vercel.json` provides a SPA rewrite so direct routes can be supported as routing is expanded.

No Render service is required for the public curriculum frontend. Later, deploy the **ASP.NET Core** application backend and **Python FastAPI** AI services separately (Render or Azure) as the AI tutor and other real features are implemented.

## Project-based learning sequence

1. **Build the platform (Project 0):** learn React data models, type safety, local persistence, identity, Supabase and deployment.
2. **TicketPilot AI (Project 1):** Python/FastAPI + LLM API + React. The earlier starter project can be found in `examples/ticketpilot-ai` in this package. Its own README describes how to run it.
3. **Knowledge retrieval (Project 2):** build document upload, parsing, embeddings, pgvector, ranking and citations.
4. **Agents (Project 3):** tools, MCP, approval and secure business workflows.
5. **Production system:** service orchestration, LLM evaluation, monitoring, budget, security, testing and deployment.

Everything in the **Projects** tab is a hands-on milestone plan; it is not automatically a finished, hosted AI product.

## Add your own lessons and projects

Content lives in version-controlled TypeScript files so you can publish updates through GitHub:

| File | What you add |
|---|---|
| `src/data/curriculum.ts` | A module, its topic list, lab outcome and official references. |
| `src/data/lessons.ts` | A fully written explanation, code example, lab and review question keyed by `module-id:topic-index`. |
| `src/data/projects.ts` | Project details, stack, skill links and milestone checklists. |
| `src/data/revision.ts` | Flashcards with answers and knowledge-check questions. |
| `src/styles.css` | Visual styling and responsive layout. |

**Important for saved progress:** Once published, do not reorder or delete existing `topics` in `curriculum.ts`, because completion IDs are based on topic index (`module-id:0`, `module-id:1`, etc.). For a production content system, migrate to permanent per-topic UUID/slugs and a database or MDX content pipeline. See `docs/CONTENT_PLAN.md` for the roadmap.

## Security, quality and limitations

- No hosted AI model API calls are made by DevForge v0.1, so it does not require a Groq/OpenAI key.
- No user credentials are written to source control. Browser-only storage does not sync between devices.
- RLS rules in `supabase/schema.sql` enforce private account ownership; review grants before launch.
- The flashcard schedule is a simple learning aid, not a validated assessment of competency.
- The curriculum is a broad AI engineering skill map, not a claim that all specialties are mandatory for every position. Prioritize applied AI core topics first.
- Do not place real customer data, copyrighted documents without rights, or sensitive credentials into public demos or model prompts.

## Recommended official references

- [Python Docs](https://docs.python.org/3/tutorial/)
- [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/)
- [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit0/introduction)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [OpenAI API Documentation](https://developers.openai.com/api/docs/)
- [OWASP GenAI Security](https://genai.owasp.org/)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel Vite Deployment](https://vercel.com/docs/frameworks/frontend/vite)

## Suggested next milestone

Publish v0.1, then add lesson authoring and full build-along materials for **Python for AI** and **TicketPilot AI**. Once that learning path is good enough for another developer to follow unaided, add RAG and AI agent modules with a full test/evaluation pipeline.
