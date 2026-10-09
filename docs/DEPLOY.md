# Quick live-deployment checklist

## 1. Run the learning platform locally

```bash
npm install
npm run dev
```

## 2. Publish GitHub repo

```bash
git init
git add .
git commit -m "Build DevForge AI learning platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/devforge-ai.git
git push -u origin main
```

Create the GitHub repository before pushing. **Never commit `.env.local`.**

## 3. Publish on Vercel

- Import GitHub repository in Vercel.
- Framework: Vite. Build command `npm run build`. Output `dist`.
- The site is viewable publicly even without Supabase.

## 4. Enable per-user cloud accounts (optional but recommended)

- Create a Supabase project; run `supabase/schema.sql` in SQL Editor.
- Copy project URL and **publishable** key into Vercel env vars and local `.env.local`.
- Enable email login and allow your local+production redirect URLs.
- Redeploy Vercel.
- Verify user A cannot access user B's data. Verify progress survives signed-in browser changes.

## 5. Add TicketPilot's backend separately

- The learning platform is a public **frontend curriculum product**.
- TicketPilot's Python backend is under `examples/ticketpilot-ai/backend`.
- Its own README documents API setup. Deploy that backend to Render or Azure when you want a live project demo.
- **Never expose any LLM provider secret to Vite/React.**
