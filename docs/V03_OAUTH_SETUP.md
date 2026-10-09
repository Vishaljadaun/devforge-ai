# DevForge AI v0.3 — Google/GitHub OAuth and Admin Analytics

## What this update does

- Learners sign in with GitHub or Google through Supabase Auth (no Magic Link required for OAuth).
- All new identities start as ordinary learners. **No registration flow grants admin access.**
- An account's existing `content_admins` record still controls the Content Studio and new analytics menu.
- Every learner uses their own RLS-protected `user_workspaces` row.
- The admin-only `admin_platform_stats()` RPC returns **aggregate counts only**. It cannot expose learner notes or email addresses.
- The existing Magic Link form is kept for limited testing; verified SMTP is still required if you later enable general email sign-in.

## Before you install

Working repository: `https://github.com/Vishaljadaun/devforge-ai`.
Starting point: latest `main` from v0.2. Keep your `.env.local` **on your computer only**.

## 1 — Supabase: enable GitHub OAuth

1. In Supabase, open **Authentication → Sign In / Providers → GitHub**; copy the Supabase **Callback URL** (usually `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`).
2. At `https://github.com/settings/developers`, choose **OAuth Apps → New OAuth App**.
3. Application name: `DevForge AI`; Homepage URL: `https://vishalk.great-site.net`.
4. Authorization callback URL: **Supabase callback URL from step 1**, not your InfinityFree homepage.
5. Create the app, copy Client ID and generate Client Secret.
6. In Supabase GitHub provider, paste ID and Secret; enable and save. **Keep the secret in Supabase only**.

Official instructions: https://supabase.com/docs/guides/auth/social-login/auth-github

## 2 — Supabase: enable Google OAuth

1. Go to `https://console.cloud.google.com/` → Google Auth Platform. Set up branding, an external audience, consent screen and supported scopes as the console prompts.
2. Create a **Web application** OAuth client.
3. Add Authorized JavaScript origins: `https://vishalk.great-site.net`, `http://localhost:5173`, `http://localhost:5174` (or your actual local Vite port).
4. Add an **Authorized redirect URI** equal to the **Supabase Google provider Callback URL** (`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`). This URI is **not** `http://localhost:5174`.
5. Copy Client ID and Secret to **Supabase → Authentication → Sign In / Providers → Google**, enable and save.
6. If Google OAuth is in testing mode, add your own email under **Test users**. Before public launch, publish the consent screen and complete any verification Google requires.

Official instructions: https://supabase.com/docs/guides/auth/social-login/auth-google

## 3 — Supabase: redirect URLs

Open **Authentication → URL Configuration**.

- **Site URL**: `https://vishalk.great-site.net`
- **Redirect URLs**: `https://vishalk.great-site.net`, `http://localhost:5173`, `http://localhost:5174` (and any other local port you use).

The app passes `window.location.origin` as the `redirectTo` argument. Keep the URLs exact.

Official instructions: https://supabase.com/docs/guides/auth/redirect-urls

## 4 — Supabase: analytics database function

Run `supabase/admin_analytics.sql` in **SQL Editor** after the existing v0.2 schema and content studio migrations. It reads `auth.users` and the private workspace table **only after checking** that the signed-in user's UUID exists in `content_admins`. Execute permission is granted only to the `authenticated` database role; a second admin check runs inside the function for every request.

### What it measures

- Registered accounts: unique Supabase Auth users.
- Registrations last 7 days: new Auth users (UTC/server dates for daily chart).
- Recently updated workspaces: records written in the last 7 days. **Not exact daily active users.**
- Topics marked complete: user-reported checklist items; not formally graded skills.
- Project checklists started: projects with at least one completed step; not full project completion.

**This is not a user-browsing dashboard** and does not return names, emails, or private learning notes. A fuller analytics product will need consent, retention policies, accurate client-side activity events and database migrations.

## 5 — Test locally

In the repository root:

```powershell
npm install
npm run build
npm test
npm run dev
```

Open the exact localhost URL printed by Vite.

- Sign out before testing a **new** account; export a backup of any guest learning data you need to preserve.
- Click the profile button → **Continue with GitHub**; complete consent and return to DevForge AI.
- Verify **Cloud sync active** and that an ordinary learner **does not** see Content Studio or Admin Analytics.
- Mark one topic complete, refresh, and confirm the record persists for that account.
- Sign out and sign in as your existing authorized administrator; verify both admin menu entries.
- Open **Admin Analytics** and check actual counts.
- Optionally test Google similarly using a different test account.

**Caution:** Signing into Google and GitHub with the same email does *not* guarantee both providers use the same Supabase `auth.users.id`. Check **Authentication → Users** and Supabase's account linking guidance before assuming histories/privileges carry over. Never blindly assign admin rights to every account with a matching email.

## 6 — Commit through a new branch

```powershell
git status
git switch main
git pull --ff-only origin main
git switch -c feature/v0.3-social-login-analytics
# Copy the patch files into the repository root, replacing only matched paths.
npm run build
npm test
git add src/App.tsx src/styles.css src/AdminInsights.tsx src/admin-insights.css supabase/admin_analytics.sql docs/V03_OAUTH_SETUP.md tests/oauth-insights.test.mjs
git commit -m "feat: add GitHub Google login and admin analytics"
git push -u origin feature/v0.3-social-login-analytics
```

Create a PR into `main`. **Do not merge or deploy** if CI fails.

## 7 — Deploy to InfinityFree

Once GitHub CI and local testing pass, rebuild in the repo root with `.env.local` configured. In FileZilla, back up your current `htdocs` and upload the contents of the generated `dist` folder. `VITE_SUPABASE_URL` and the public publishable key are compiled into the JS; **never** include a secret or service-role key in `VITE_` variables.

Verify real Google/GitHub flows on `https://vishalk.great-site.net` before inviting users. OAuth providers may require a non-`resend.dev` sender **only for email features**, not for the OAuth redirect itself.