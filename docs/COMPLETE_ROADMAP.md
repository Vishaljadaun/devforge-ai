# Complete AI Engineering Roadmap

**25 modules · 323 tracked topics · 14 guided projects · 46 revision cards · 12 quiz questions · 8 written starter lessons**

This file is the complete syllabus index. Most topics are outlines with links and a hands-on lab, not long-form written lessons yet. Use the DevForge website for progress, bookmarks and revision.

## Foundations

### Python for AI

The programming language for modern AI systems · Beginner · suggested 2 week(s)

- [ ] 1. Python setup, uv and virtual environments
- [ ] 2. Variables, types and collections
- [ ] 3. Functions, lambdas and closures
- [ ] 4. Comprehensions and iterators
- [ ] 5. Generators and decorators
- [ ] 6. Classes, dataclasses and OOP
- [ ] 7. Type hints and Pydantic models
- [ ] 8. Files, JSON, CSV and environment variables
- [ ] 9. Exceptions, logging and debugging
- [ ] 10. AsyncIO, async/await and concurrency
- [ ] 11. Packages, dependency management and linting
- [ ] 12. Unit testing with pytest
- [ ] 13. HTTP clients and REST APIs
- [ ] 14. NumPy arrays and vectorized operations

**Hands-on lab:** Build and test a FastAPI microservice that processes customer support messages.

**Outcome:** Write reliable, typed Python services without copying tutorials.

**References:** [Python Tutorial](https://docs.python.org/3/tutorial/) · [FastAPI](https://fastapi.tiangolo.com/tutorial/)

### Software Engineering Essentials

Build robust AI-powered applications · Beginner · suggested 1 week(s)

- [ ] 1. Git branching and pull requests
- [ ] 2. Linux CLI and shell scripting
- [ ] 3. HTTP, HTTPS, JSON and REST
- [ ] 4. Design patterns and SOLID principles
- [ ] 5. Authentication, OAuth and JWT
- [ ] 6. Frontend fundamentals with React
- [ ] 7. Backend services with .NET and FastAPI
- [ ] 8. API contracts and OpenAPI
- [ ] 9. Testing pyramid and integration testing
- [ ] 10. Docker containers and networking
- [ ] 11. Environment variables and secret management
- [ ] 12. Async jobs, queues and retries

**Hands-on lab:** Add authentication, tests and a deployment pipeline to a sample API.

**Outcome:** Ship production-quality software around any AI model.

**References:** [MDN Web Docs](https://developer.mozilla.org/) · [Docker Get Started](https://docs.docker.com/get-started/)

### Math for AI and ML

Just enough mathematics to reason about models · Beginner · suggested 2 week(s)

- [ ] 1. Scalars, vectors, matrices and tensors
- [ ] 2. Matrix multiplication and transposes
- [ ] 3. Dot products and cosine similarity
- [ ] 4. Norms, eigenvalues and eigenvectors
- [ ] 5. Probability and conditional probability
- [ ] 6. Bayes theorem and independence
- [ ] 7. Distributions, expectation and variance
- [ ] 8. Sampling, confidence intervals and hypothesis tests
- [ ] 9. Derivatives and partial derivatives
- [ ] 10. Gradients and chain rule
- [ ] 11. Gradient descent and learning rates
- [ ] 12. Entropy, cross entropy and KL divergence
- [ ] 13. Optimization intuition and regularization

**Hands-on lab:** Implement cosine similarity, gradient descent and logistic regression with NumPy.

**Outcome:** Explain why embeddings, model training and optimizers work.

**References:** [Khan Academy Linear Algebra](https://www.khanacademy.org/math/linear-algebra) · [3Blue1Brown Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra)

### Data Analysis and SQL

Prepare the information that models need · Beginner · suggested 2 week(s)

- [ ] 1. NumPy broadcasting and arrays
- [ ] 2. Pandas DataFrames and indexing
- [ ] 3. Data cleaning and missing values
- [ ] 4. EDA and data profiling
- [ ] 5. Data visualization and distributions
- [ ] 6. SQL SELECT, JOIN and GROUP BY
- [ ] 7. Window functions and CTEs
- [ ] 8. PostgreSQL indexes and query plans
- [ ] 9. Normalization and relational modeling
- [ ] 10. Data ingestion, ETL and ELT
- [ ] 11. Data quality and schema validation
- [ ] 12. Feature stores and dataset versioning
- [ ] 13. Privacy, licensing and dataset consent

**Hands-on lab:** Design a PostgreSQL dataset, clean it, and build a repeatable ETL script.

**Outcome:** Turn raw data into trustworthy training and retrieval inputs.

**References:** [Pandas User Guide](https://pandas.pydata.org/docs/user_guide/) · [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

## Machine Learning

### Classical Machine Learning

Understand algorithms before jumping to LLMs · Intermediate · suggested 3 week(s)

- [ ] 1. Supervised vs unsupervised learning
- [ ] 2. Regression vs classification
- [ ] 3. Linear and logistic regression
- [ ] 4. K-nearest neighbors and distance metrics
- [ ] 5. Decision trees and random forests
- [ ] 6. Gradient boosting and XGBoost
- [ ] 7. K-means and hierarchical clustering
- [ ] 8. Dimensionality reduction and PCA
- [ ] 9. Feature engineering and selection
- [ ] 10. Class imbalance and weighting
- [ ] 11. Train/validation/test split
- [ ] 12. Cross-validation and hyperparameter tuning
- [ ] 13. Bias-variance tradeoff
- [ ] 14. Overfitting, underfitting and regularization
- [ ] 15. Scikit-learn pipelines

**Hands-on lab:** Build a ticket classifier and compare logistic regression to a tree-based baseline.

**Outcome:** Train and evaluate conventional ML models rigorously.

**References:** [Scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)

### ML Evaluation and Experimentation

Prove a model works with valid evidence · Intermediate · suggested 1 week(s)

- [ ] 1. Confusion matrix and classification metrics
- [ ] 2. Precision, recall, F1 and accuracy
- [ ] 3. ROC-AUC and PR-AUC
- [ ] 4. Regression metrics MAE, MSE and RMSE
- [ ] 5. Data leakage and target leakage
- [ ] 6. Calibration and decision thresholds
- [ ] 7. A/B testing fundamentals
- [ ] 8. Statistical significance and confidence intervals
- [ ] 9. Experiment tracking and reproducibility
- [ ] 10. Error analysis and learning curves
- [ ] 11. Model drift and distribution shift

**Hands-on lab:** Produce an evaluation report with dataset splits, confusion matrix and error categories.

**Outcome:** Make defensible model quality claims.

**References:** [Model Evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html)

## Deep Learning

### Neural Networks with PyTorch

Build the foundations of modern deep learning · Intermediate · suggested 3 week(s)

- [ ] 1. Perceptrons and multilayer networks
- [ ] 2. Activation functions and nonlinearities
- [ ] 3. Loss functions and objectives
- [ ] 4. Backpropagation and autograd
- [ ] 5. Optimization: SGD and Adam
- [ ] 6. Mini-batches and DataLoaders
- [ ] 7. Regularization, dropout and batch norm
- [ ] 8. Convolutional neural networks
- [ ] 9. Sequence modeling with RNN and LSTM
- [ ] 10. GPU tensors and accelerators
- [ ] 11. Training loops, checkpoints and reproducibility
- [ ] 12. Learning rate schedules and mixed precision
- [ ] 13. Debugging exploding and vanishing gradients

**Hands-on lab:** Train, evaluate, save and serve a PyTorch text or image classifier.

**Outcome:** Understand training loops and adapt existing deep models.

**References:** [PyTorch Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/intro.html)

### NLP and Transformers

From tokens to modern foundation models · Intermediate · suggested 2 week(s)

- [ ] 1. Text preprocessing and normalization
- [ ] 2. Bag of words, TF-IDF and baselines
- [ ] 3. Word2Vec and contextual embeddings
- [ ] 4. Subword tokenization and BPE
- [ ] 5. Positional encodings
- [ ] 6. Attention and self-attention
- [ ] 7. Multi-head attention
- [ ] 8. Encoder vs decoder architectures
- [ ] 9. Transformer blocks and residual connections
- [ ] 10. Pretraining objectives and transfer learning
- [ ] 11. Hugging Face models, tokenizers and datasets
- [ ] 12. Sequence classification and named-entity recognition
- [ ] 13. Text generation and decoding strategies
- [ ] 14. Fine-tuning pretrained transformers

**Hands-on lab:** Compare TF-IDF against a pretrained transformer on the same text dataset.

**Outcome:** Explain attention and use the transformer ecosystem confidently.

**References:** [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/chapter1/1)

### Fine-tuning and Model Adaptation

Know when retrieval is not enough · Advanced · suggested 2 week(s)

- [ ] 1. Prompting vs RAG vs fine-tuning decisions
- [ ] 2. Dataset curation and consent
- [ ] 3. Training/validation examples and formatting
- [ ] 4. Supervised fine-tuning (SFT)
- [ ] 5. Parameter-efficient fine-tuning (PEFT)
- [ ] 6. LoRA and QLoRA
- [ ] 7. Quantization-aware serving basics
- [ ] 8. Instruction tuning and preference optimization
- [ ] 9. Synthetic data pitfalls
- [ ] 10. Catastrophic forgetting and regression tests
- [ ] 11. Evaluating adapted models
- [ ] 12. Model cards and licensing

**Hands-on lab:** Fine-tune a small open-weight model on a permitted labeled dataset and compare baselines.

**Outcome:** Choose and evaluate parameter-efficient model adaptation.

**References:** [Hugging Face PEFT](https://huggingface.co/docs/peft/index)

## Generative AI

### LLM Fundamentals

Know how model inference actually works · Intermediate · suggested 2 week(s)

- [ ] 1. Foundation models and model families
- [ ] 2. Tokens and context windows
- [ ] 3. System, user and assistant roles
- [ ] 4. Inference and next-token prediction
- [ ] 5. Temperature, top-p and sampling
- [ ] 6. Model context limitations
- [ ] 7. Hallucinations and uncertainty
- [ ] 8. Hosted vs open-weight models
- [ ] 9. Quantization, inference memory and GPU needs
- [ ] 10. API latency, throughput and rate limits
- [ ] 11. Cost per token and caching
- [ ] 12. Model routing, fallback and retries
- [ ] 13. Structured outputs and schemas
- [ ] 14. Tool calling and function definitions

**Hands-on lab:** Create a typed API wrapper for two model providers with retries, usage tracking and JSON validation.

**Outcome:** Use LLM APIs as reliable application components.

**References:** [OpenAI API](https://developers.openai.com/api/docs/) · [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/)

### Prompt Design and Context Engineering

Make outputs useful, reliable and measurable · Intermediate · suggested 1 week(s)

- [ ] 1. Instruction hierarchy and prompt roles
- [ ] 2. Few-shot and zero-shot prompting
- [ ] 3. Output formatting and JSON schema
- [ ] 4. Context selection and context budgeting
- [ ] 5. Prompt templates and versioning
- [ ] 6. Separating data from instructions
- [ ] 7. Grounding, citations and abstention
- [ ] 8. Multi-turn history and summarization
- [ ] 9. Prompt injection basics
- [ ] 10. Model failure analysis
- [ ] 11. Prompt tests and golden datasets
- [ ] 12. Retrieval-aware prompts

**Hands-on lab:** Build a customer reply drafter and evaluate it against a fixed test suite.

**Outcome:** Create testable prompts instead of relying on trial and error.

**References:** [OpenAI Prompting Guide](https://developers.openai.com/api/docs/guides/prompt-engineering)

### Embeddings and Vector Search

Teach software to retrieve semantic meaning · Intermediate · suggested 2 week(s)

- [ ] 1. Embedding vectors and dimensions
- [ ] 2. Cosine vs dot-product vs Euclidean distance
- [ ] 3. Embedding model selection and benchmarks
- [ ] 4. Indexing, recall and approximate nearest neighbors
- [ ] 5. FAISS indexes
- [ ] 6. pgvector in PostgreSQL
- [ ] 7. Hybrid search: keyword plus vector
- [ ] 8. Metadata filters and ACLs
- [ ] 9. Chunk size and overlap tradeoffs
- [ ] 10. Reranking and cross-encoders
- [ ] 11. Embedding versioning and reindexing
- [ ] 12. Multilingual and domain embeddings

**Hands-on lab:** Build a semantic search API for product documents with pgvector.

**Outcome:** Retrieve relevant information accurately and securely.

**References:** [pgvector Repository](https://github.com/pgvector/pgvector)

### Retrieval-Augmented Generation

Build AI grounded in real source documents · Intermediate · suggested 3 week(s)

- [ ] 1. RAG architecture and use cases
- [ ] 2. Document parsers for PDF, HTML and DOCX
- [ ] 3. OCR limitations and table extraction
- [ ] 4. Chunking and ingestion pipelines
- [ ] 5. Deduplication, cleaning and metadata
- [ ] 6. Vector, keyword and hybrid retrieval
- [ ] 7. Reranking and contextual compression
- [ ] 8. Query rewriting and expansion
- [ ] 9. Multi-document synthesis and citations
- [ ] 10. No-answer behavior and source grounding
- [ ] 11. RAG evaluation: recall@k and MRR
- [ ] 12. Faithfulness and answer relevance
- [ ] 13. Access-control filters and tenant isolation
- [ ] 14. Caching, refresh and deletion workflows
- [ ] 15. Advanced RAG: hierarchical and graph retrieval

**Hands-on lab:** Build a document Q&A product with citations, evaluations and secure document access.

**Outcome:** Deliver an accurate, maintainable knowledge assistant.

**References:** [OpenAI Retrieval Guide](https://developers.openai.com/api/docs/guides/retrieval)

## Agentic AI

### AI Agents and Workflows

Create agents that take controlled action · Advanced · suggested 3 week(s)

- [ ] 1. Agent vs deterministic workflow
- [ ] 2. Function calling and tool schemas
- [ ] 3. Reason-act-observe tool loops
- [ ] 4. Tool validation and error handling
- [ ] 5. Planning, state and persistence
- [ ] 6. Multi-step workflows and branching
- [ ] 7. Agent memory and conversation state
- [ ] 8. Human-in-the-loop approvals
- [ ] 9. Long-running tasks and cancellation
- [ ] 10. Idempotency and retry safety
- [ ] 11. Multi-agent orchestration and handoffs
- [ ] 12. LangGraph or agent SDK fundamentals
- [ ] 13. Code execution and sandboxing
- [ ] 14. Tracing and agent observability
- [ ] 15. Task-level evaluation and guardrails

**Hands-on lab:** Build a support agent that reads docs, checks orders, drafts responses and asks for approval.

**Outcome:** Deploy safe tool-using AI workflows.

**References:** [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit0/introduction) · [OpenAI Agents Docs](https://openai.github.io/openai-agents-python/)

### MCP and Integrations

Connect models to tools, data and enterprise systems · Advanced · suggested 2 week(s)

- [ ] 1. Model Context Protocol concepts
- [ ] 2. MCP tools, resources and prompts
- [ ] 3. MCP clients and servers
- [ ] 4. Stdio and streamable HTTP transports
- [ ] 5. Tool discovery and schemas
- [ ] 6. Authentication and consent
- [ ] 7. Scoped permissions and least privilege
- [ ] 8. MCP server implementation in Python
- [ ] 9. Connecting GitHub and business APIs
- [ ] 10. Rate limits and third-party failures
- [ ] 11. MCP testing and security boundaries
- [ ] 12. Versioning and compatibility

**Hands-on lab:** Create an MCP server that exposes a read-only project status API.

**Outcome:** Connect agent applications to real systems responsibly.

**References:** [MCP Documentation](https://modelcontextprotocol.io/introduction)

## Production AI

### AI Quality and Evaluations

Measure the system instead of guessing · Advanced · suggested 2 week(s)

- [ ] 1. Evaluation datasets and golden examples
- [ ] 2. Deterministic unit checks
- [ ] 3. LLM-as-judge and its limitations
- [ ] 4. Retrieval metrics and groundedness
- [ ] 5. Hallucination and factuality checks
- [ ] 6. Instruction following and schema validity
- [ ] 7. Tool choice and agent trajectory grading
- [ ] 8. Adversarial and regression testing
- [ ] 9. Human evaluation and annotation
- [ ] 10. Online feedback and A/B tests
- [ ] 11. Latency and cost quality tradeoffs
- [ ] 12. Tracing and prompt observability
- [ ] 13. Continuous evaluations in CI/CD

**Hands-on lab:** Create a 50-case test suite and build an evaluation dashboard for your RAG assistant.

**Outcome:** Prove changes improve quality and catch regressions.

**References:** [OpenAI Agent Evaluations](https://developers.openai.com/api/docs/guides/agent-evals)

### AI Security, Privacy and Safety

Protect users from AI-specific failures · Advanced · suggested 2 week(s)

- [ ] 1. Prompt injection and untrusted content
- [ ] 2. Indirect prompt injection in retrieved docs
- [ ] 3. Data exfiltration and tool misuse
- [ ] 4. Least privilege and authorization
- [ ] 5. Multi-tenant data isolation
- [ ] 6. Secrets and API key handling
- [ ] 7. PII detection and minimization
- [ ] 8. Data retention, deletion and audit trails
- [ ] 9. Content safety and abuse prevention
- [ ] 10. Supply chain and model artifact risks
- [ ] 11. Rate limiting and denial of wallet
- [ ] 12. Safe code execution and sandboxing
- [ ] 13. Responsible AI, fairness and bias
- [ ] 14. Human oversight and incident response

**Hands-on lab:** Red-team a support assistant and fix prompt injection, authorization and leakage flaws.

**Outcome:** Ship AI systems with privacy and security built in.

**References:** [OWASP GenAI Security](https://genai.owasp.org/)

### LLMOps and Model Serving

Operate reliable AI services at scale · Advanced · suggested 2 week(s)

- [ ] 1. LLM application lifecycle and environments
- [ ] 2. GitHub Actions and continuous deployment
- [ ] 3. Docker images and container registries
- [ ] 4. Model artifact and prompt versioning
- [ ] 5. Online inference vs batch jobs
- [ ] 6. Serving open models with vLLM concepts
- [ ] 7. GPU sizing, batching and quantization
- [ ] 8. Streaming response patterns
- [ ] 9. Queues, backpressure and timeouts
- [ ] 10. Caching, token budgets and cost controls
- [ ] 11. Observability, tracing and metrics
- [ ] 12. SLOs, incident handling and rollback
- [ ] 13. Load testing and capacity planning
- [ ] 14. Model monitoring and drift detection

**Hands-on lab:** Containerize an AI API, add tracing, budgets, health checks and CI evaluation gates.

**Outcome:** Deploy and maintain production AI applications.

**References:** [MLflow Docs](https://mlflow.org/docs/latest/) · [OpenTelemetry Docs](https://opentelemetry.io/docs/)

### Cloud, DevOps and Architecture

Engineer AI systems that are available and maintainable · Intermediate · suggested 2 week(s)

- [ ] 1. Azure AI and managed inference overview
- [ ] 2. Compute, storage and managed PostgreSQL
- [ ] 3. Identity and access management
- [ ] 4. API gateways, CORS and network security
- [ ] 5. Vercel and Render deployment basics
- [ ] 6. Terraform and infrastructure as code
- [ ] 7. Container apps and Kubernetes basics
- [ ] 8. Secrets management and key rotation
- [ ] 9. Horizontal scaling and load balancing
- [ ] 10. Disaster recovery and backups
- [ ] 11. Cloud budget alerts and cost estimation
- [ ] 12. Monitoring dashboards and distributed tracing

**Hands-on lab:** Deploy a React + .NET + FastAPI application with managed database and production secrets.

**Outcome:** Architect an AI platform for cloud deployment.

**References:** [Microsoft AI Learning](https://learn.microsoft.com/en-us/training/paths/get-started-with-artificial-intelligence-on-azure/)

### AI System Design

Combine software architecture, data and models · Advanced · suggested 2 week(s)

- [ ] 1. Choosing API vs RAG vs fine-tuning
- [ ] 2. Latency, throughput and scalability
- [ ] 3. Stateless vs stateful AI services
- [ ] 4. Synchronous and asynchronous inference
- [ ] 5. Service boundaries and event-driven systems
- [ ] 6. Storage and indexing tradeoffs
- [ ] 7. Data ingestion and reprocessing architecture
- [ ] 8. Model fallback and resilience
- [ ] 9. Consistency and failure recovery
- [ ] 10. Inference routing and provider abstraction
- [ ] 11. Security boundaries and threat modeling
- [ ] 12. Architectural decision records and cost reviews

**Hands-on lab:** Design a multi-tenant document agent for 10,000 users with an architecture review.

**Outcome:** Explain and defend enterprise AI architecture decisions.

**References:** [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/)

## Specializations

### Multimodal AI

Go beyond text to images, audio and video · Advanced · suggested 2 week(s)

- [ ] 1. Vision encoders and image embeddings
- [ ] 2. Image classification and object detection
- [ ] 3. Visual question answering
- [ ] 4. Document vision and layout understanding
- [ ] 5. OCR and structured document extraction
- [ ] 6. Speech-to-text transcription
- [ ] 7. Text-to-speech and voice UX
- [ ] 8. Audio streaming and latency
- [ ] 9. Image generation and image editing APIs
- [ ] 10. Video sampling, indexing and summarization
- [ ] 11. Multimodal retrieval and evaluation
- [ ] 12. Safety and consent for media inputs

**Hands-on lab:** Build a receipt reader or audio meeting assistant with verification of extracted results.

**Outcome:** Integrate vision and audio in real products.

**References:** [Hugging Face Tasks](https://huggingface.co/tasks)

### .NET + React AI Integration

Your existing experience becomes a differentiator · Intermediate · suggested 2 week(s)

- [ ] 1. ASP.NET Core minimal APIs and controllers
- [ ] 2. HttpClient and resilience pipelines
- [ ] 3. Typed DTOs and JSON schema validation
- [ ] 4. Microsoft.Extensions.AI abstractions
- [ ] 5. Semantic Kernel and orchestration concepts
- [ ] 6. Microsoft Agent Framework concepts
- [ ] 7. Integrating Python inference APIs
- [ ] 8. React streaming chat interfaces
- [ ] 9. Authentication and authorization in AI apps
- [ ] 10. WebSockets and server-sent events
- [ ] 11. Background jobs and queue consumers
- [ ] 12. Testing cross-service AI contracts

**Hands-on lab:** Integrate a Python RAG service with ASP.NET Core and a React dashboard.

**Outcome:** Deliver AI features inside production .NET applications.

**References:** [Microsoft .NET AI](https://learn.microsoft.com/en-us/dotnet/ai/)

### Advanced AI Specializations

Choose a deeper path after the core · Advanced · suggested 3 week(s)

- [ ] 1. Graph RAG and knowledge graphs
- [ ] 2. Recommendation and ranking systems
- [ ] 3. Time-series modeling and forecasting
- [ ] 4. Reinforcement learning foundations
- [ ] 5. Reward models and preference learning
- [ ] 6. Causal inference fundamentals
- [ ] 7. Distributed model training concepts
- [ ] 8. Mixture-of-experts architecture
- [ ] 9. Interpretability and explainability
- [ ] 10. Edge inference and on-device models
- [ ] 11. Federated learning and privacy techniques
- [ ] 12. Research paper reading and reproduction
- [ ] 13. Benchmarking and methodology
- [ ] 14. Hardware-aware optimization

**Hands-on lab:** Pick one specialty, reproduce an established baseline and document findings.

**Outcome:** Explore research-oriented or domain-specific engineering paths.

**References:** [Papers With Code](https://paperswithcode.com/)

## Career

### AI Product Engineering

Solve real problems for real users · Intermediate · suggested 1 week(s)

- [ ] 1. Customer problem discovery
- [ ] 2. AI vs non-AI solution tradeoffs
- [ ] 3. UX for uncertainty and citations
- [ ] 4. Human approval and workflow design
- [ ] 5. Designing feedback loops
- [ ] 6. Accessibility and internationalization
- [ ] 7. SaaS plans, quotas and rate limits
- [ ] 8. Usage analytics and product metrics
- [ ] 9. Pricing and inference unit economics
- [ ] 10. Data rights and customer trust
- [ ] 11. Documentation and onboarding

**Hands-on lab:** Interview two users and improve your AI support product based on their needs.

**Outcome:** Build useful and marketable AI products.

**References:** [Google PAIR Guidebook](https://pair.withgoogle.com/guidebook/)

### AI Engineer Interview and Portfolio

Prove you can build and explain production AI · Intermediate · suggested 2 week(s)

- [ ] 1. Python coding interviews
- [ ] 2. SQL and ML case studies
- [ ] 3. Transformers and LLM explanations
- [ ] 4. RAG system design interviews
- [ ] 5. Agent and MCP design interviews
- [ ] 6. Security and evaluation discussion
- [ ] 7. Project README and architecture diagram
- [ ] 8. Case studies with measured outcomes
- [ ] 9. Live demos and deployment proof
- [ ] 10. Resume bullets and experience reframing
- [ ] 11. Mock interviews and behavioral stories
- [ ] 12. Open-source contributions and networking

**Hands-on lab:** Publish three case studies with live demos, metrics and architecture diagrams.

**Outcome:** Present yourself convincingly for Applied AI, GenAI and FDE roles.

**References:** [Hugging Face Learn](https://huggingface.co/learn)
