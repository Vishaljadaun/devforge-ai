# Content and feature plan

## North star

A learner should be able to **start with a real problem, complete a deployed project, revise its key concepts later, and show evidence of competency**. A catalog of many headings is not sufficient.

## What a complete lesson must contain

1. Goal and prerequisites; connect topic to a concrete project milestone.
2. Plain-language explanation with diagrams where relevant.
3. Runnable, version-pinned code with setup instructions.
4. Practical exercises and sample inputs/outputs.
5. Unit/integration tests and common debugging failures.
6. Security/cost/performance tradeoffs where relevant.
7. Three revision questions, one debugging challenge and an interview explanation.
8. A checkpoint that learners can actually verify, not just click "complete".
9. Official documentation references and date/version review.

## Rollout phases

### Phase A — Public learning foundation (current)
- 25 curriculum modules, 323 topic outlines and resources.
- 14 hands-on project plans with completion checklists.
- Progress tracking, bookmarked lessons, learning journal, revision cards and quiz.
- 8 fully authored example lessons, optional Supabase Auth and RLS-based private cloud storage.
- Deployable Vite frontend and existing TicketPilot starter under examples/.

### Phase B — First complete guided journey
- Author every lesson in Python Fundamentals and LLM Fundamentals.
- Publish TicketPilot AI as a project with checkpoints, code diffs, tests and a live demo.
- Replace array-index topic identifiers with permanent IDs.
- Add in-browser runnable examples that execute in a secure sandbox, not arbitrary server shell commands.

### Phase C — Core Applied AI
- Deepen ML, PyTorch, Transformers, embeddings, RAG, agents, MCP and security.
- Add database-driven MDX authoring and admin review workflow.
- Attach evaluations to project milestones, citations and threat-model checklists.
- Add progress prerequisites and curriculum versioning.

### Phase D — Production product
- ASP.NET Core gateway, Python FastAPI model services.
- User/team profiles, organization roles, moderator and lesson publishing pipeline.
- Secure AI tutoring grounded in published lessons only.
- Curated test challenges with safe code execution limits.
- Billing-ready usage quotas only after genuine user demand is validated.

## Recommended applied AI sequence

1. Python, software engineering and data foundations.
2. ML and evaluation fundamentals; PyTorch and transformer concepts.
3. LLM APIs and structured output.
4. Embeddings, vector databases and RAG.
5. Tool calling, agents and MCP.
6. Evaluation, security, LLMOps and deployment.
7. Specialize in fine-tuning, multimodal AI, .NET enterprise AI or research, depending on the role.

## Content quality checklist

- Every example is tested on clean installs and pinned dependencies.
- Every external reference is reviewed periodically for staleness.
- No hard-coded production secrets, unlicensed datasets, or unauthorized data reuse.
- Clear distinction between "read", "implemented", "tested", and "deployed".
- Projects include real evaluation data and failure cases.
- Contributors can propose edits via pull requests and code review.
