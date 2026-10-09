# Project-by-project AI Engineering Guide

These 14 outlines are not complete working applications. Every project has checkable milestones in the live DevForge dashboard.

## 1. Build DevForge AI

**Beginner · 2–3 weeks · Full-stack**

Build a public curriculum, projects library, private progress journal, revision cards and secure cloud sync.

**Stack:** React, TypeScript, Supabase, Vercel

**Skills:** Python for AI, Software Engineering Essentials, Data Analysis and SQL, AI Product Engineering

- [ ] Build landing page and curriculum explorer
- [ ] Create persistent progress and bookmarks
- [ ] Implement notes and spaced repetition flashcards
- [ ] Add optional authentication and row-level security
- [ ] Deploy publicly and collect learner feedback

**Deliverable:** A shareable, working learning product with a documented security model.

## 2. AI Customer Support Copilot

**Beginner · 3–4 weeks · Generative AI**

Classify tickets, retrieve documentation, draft grounded replies and require approval before taking actions.

**Stack:** Python, FastAPI, React, Groq, PostgreSQL

**Skills:** Python for AI, LLM Fundamentals, Prompt Design and Context Engineering, Retrieval-Augmented Generation, AI Security, Privacy and Safety

- [ ] Create ticket CRUD and dashboard
- [ ] Add typed LLM draft generator
- [ ] Store conversations and capture feedback
- [ ] Add RAG knowledge base and citations
- [ ] Evaluate output quality and deploy

**Deliverable:** An end-to-end AI support demo with real API integration, source citations and tests.

## 3. Data Insights Copilot

**Beginner · 2 weeks · Data + ML**

Upload CSVs, validate schemas, generate plots and produce a trustworthy data quality report.

**Stack:** Python, Pandas, Scikit-learn, FastAPI

**Skills:** Python for AI, Data Analysis and SQL, Math for AI and ML, Classical Machine Learning

- [ ] Parse and validate CSV files
- [ ] Clean missing values and duplicates
- [ ] Add descriptive analysis and plotting
- [ ] Train a simple supervised model
- [ ] Package reporting endpoint and tests

**Deliverable:** An interactive data analysis workflow with reproducible outputs.

## 4. Smart Ticket Classifier

**Beginner · 2 weeks · Machine Learning**

Compare TF-IDF + logistic regression with random forests, tune thresholds and explain errors.

**Stack:** Scikit-learn, Python, FastAPI

**Skills:** Classical Machine Learning, ML Evaluation and Experimentation, Math for AI and ML

- [ ] Define categories and labeled dataset
- [ ] Set train/validation/test split
- [ ] Train two baseline classifiers
- [ ] Report confusion matrix and F1
- [ ] Serve and version the best model

**Deliverable:** A tested ML API and honest evaluation report.

## 5. Document Intelligence

**Intermediate · 4 weeks · RAG**

Index PDFs with metadata-aware search, return cited answers and evaluate retrieval precision.

**Stack:** FastAPI, pgvector, React, LLM API

**Skills:** Embeddings and Vector Search, Retrieval-Augmented Generation, AI Quality and Evaluations, AI Security, Privacy and Safety

- [ ] Implement safe document upload and parsing
- [ ] Chunk and embed document content
- [ ] Add vector + keyword retrieval
- [ ] Generate cited answers with abstention
- [ ] Test retrieval and tenant isolation

**Deliverable:** An end-to-end RAG application with grounded answer metrics.

## 6. Semantic Job Search

**Intermediate · 2–3 weeks · Search**

Rank job descriptions against user-provided skills, show explanations and measure ranking quality.

**Stack:** Python, pgvector, React

**Skills:** Embeddings and Vector Search, Data Analysis and SQL, LLM Fundamentals

- [ ] Ingest licensed job descriptions
- [ ] Normalize skills and extract metadata
- [ ] Generate vectors and implement ANN search
- [ ] Explain matched and missing skills
- [ ] Evaluate ranking quality

**Deliverable:** An interactive semantic retrieval system and scoring report.

## 7. AI Pull Request Reviewer

**Intermediate · 3–4 weeks · AI Agents**

Review diffs, spot suspicious patterns, recommend tests and post comments only with permission.

**Stack:** GitHub API, Python, LLM, React

**Skills:** AI Agents and Workflows, MCP and Integrations, AI Quality and Evaluations, AI Security, Privacy and Safety

- [ ] Read GitHub pull-request diffs
- [ ] Summarize modifications by file
- [ ] Add deterministic static checks
- [ ] Add grounded AI suggestions
- [ ] Secure permissions and evaluate false positives

**Deliverable:** A practical GitHub-integrated code-review copilot.

## 8. MCP Tool Server

**Intermediate · 2 weeks · Agentic AI**

Implement a read-only MCP server with typed tools and strong authorization boundaries.

**Stack:** Python, MCP, SQLite

**Skills:** MCP and Integrations, AI Agents and Workflows, AI Security, Privacy and Safety

- [ ] Define a simple tool contract
- [ ] Implement stdio MCP server
- [ ] Connect from a test client
- [ ] Add input validation and safe errors
- [ ] Document permissions and security testing

**Deliverable:** A reusable, audited tool-server integration.

## 9. Business Operations Agent

**Advanced · 4 weeks · AI Agents**

Search policies, read orders, recommend actions and ask humans to approve any changes.

**Stack:** LangGraph, FastAPI, PostgreSQL, React

**Skills:** AI Agents and Workflows, Retrieval-Augmented Generation, MCP and Integrations, AI Security, Privacy and Safety, AI Quality and Evaluations

- [ ] Define deterministic business workflow
- [ ] Add tool schemas and safe execution
- [ ] Build pause/resume human approval
- [ ] Persist agent state and trace runs
- [ ] Evaluate failures, costs and injection risks

**Deliverable:** A supervised agent application with audit logs and evaluation.

## 10. AI Receipt and Voice Assistant

**Advanced · 3 weeks · Multimodal**

Extract fields from photographed receipts and transcribed audio, with verification and correction workflows.

**Stack:** Python, React, Vision, Speech APIs

**Skills:** Multimodal AI, LLM Fundamentals, AI Quality and Evaluations

- [ ] Create image/audio upload UI
- [ ] Extract text from documents and voice
- [ ] Validate structured fields
- [ ] Require correction for uncertain fields
- [ ] Test extraction accuracy on labeled samples

**Deliverable:** A multimodal pipeline with transparent uncertainty handling.

## 11. Domain Model Adapter

**Advanced · 3–4 weeks · Deep Learning**

Adapt a small pretrained model using permitted labeled data and compare it to a strong baseline.

**Stack:** PyTorch, Transformers, LoRA

**Skills:** Neural Networks with PyTorch, NLP and Transformers, Fine-tuning and Model Adaptation, ML Evaluation and Experimentation

- [ ] Select task and curated dataset
- [ ] Train strong no-tuning baseline
- [ ] Prepare PEFT training workflow
- [ ] Fine-tune a small model
- [ ] Evaluate quality, cost and regression

**Deliverable:** A reproducible model comparison and responsible model card.

## 12. LLM Observability Studio

**Advanced · 3 weeks · LLMOps**

Build an evaluation and monitoring dashboard for prompts, tools, latency, error rate and cost.

**Stack:** Python, OpenTelemetry, PostgreSQL, React

**Skills:** LLMOps and Model Serving, AI Quality and Evaluations, Cloud, DevOps and Architecture

- [ ] Create request and trace event schema
- [ ] Collect timings and model usage
- [ ] Run automatic evaluation fixtures
- [ ] Visualize regressions and incidents
- [ ] Add cost budgets and alert rules

**Deliverable:** A production-minded evaluation and observability solution.

## 13. Enterprise .NET AI Platform

**Advanced · 4 weeks · .NET + AI**

Expose a secure AI gateway from ASP.NET Core to Python AI services with tracing and user permissions.

**Stack:** ASP.NET Core, FastAPI, React, Azure

**Skills:** .NET + React AI Integration, Cloud, DevOps and Architecture, AI System Design, AI Security, Privacy and Safety

- [ ] Design .NET/Python API contracts
- [ ] Implement authentication and authorization
- [ ] Create async inference and streaming
- [ ] Add CI/CD and end-to-end tests
- [ ] Deploy with secrets and monitoring

**Deliverable:** A complete enterprise-style .NET + AI reference architecture.

## 14. Production Multi-tenant AI SaaS

**Advanced · 6+ weeks · Capstone**

Combine billing-ready quotas, multi-tenant RAG, operations approval, evaluation, logs and support workflows.

**Stack:** React, ASP.NET Core, Python, PostgreSQL, Azure

**Skills:** AI System Design, Cloud, DevOps and Architecture, AI Security, Privacy and Safety, LLMOps and Model Serving, AI Product Engineering

- [ ] Choose a specific paying-user problem
- [ ] Build secure tenancy and subscription-ready data model
- [ ] Integrate AI workflows and knowledge retrieval
- [ ] Implement monitoring and quality gates
- [ ] Launch a beta and incorporate feedback

**Deliverable:** A portfolio flagship and foundation for a real commercial product.
