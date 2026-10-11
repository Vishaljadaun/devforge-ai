# DevForge AI v0.4 — Admin learner directory

Add an admin-only table within **Admin Analytics** with registered emails, curriculum progress percentages, completed topics, registration date, last sign-in, and last progress save.

The rollout requires applying `supabase/admin_learners.sql` in the Supabase SQL Editor, passing security checks with a non-admin account, and testing the production build before merging.

**Progress** is based on unique checked-off topics out of the current 323-topic curriculum, not graded achievement. **Recent sign-in** means a login within seven days, not real-time activity. **Last progress save** may update during login or refresh and is not proof of topic completion.

The SQL RPC must check `content_admins` authorization before returning any account information. It may return registration emails and summary counts to admins, but never raw workspaces, journal text, or learning notes. Do not expose service-role credentials to the browser. Paginate and search accounts on the server.
