<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/hero-a-dark.svg?v=2026-11-03"><img alt="Arnav Yadav. I build backends and AI agents. CS at Scaler School of Technology and BITS Pilani. Mentored 25 students." src="./assets/hero-a-light.svg?v=2026-11-03" width="100%"></picture>

<p><a href="https://www.linkedin.com/in/arnav-yadav02/"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/btn-linkedin-dark.svg?v=2026-11-03"><img alt="LinkedIn" src="./assets/btn-linkedin-light.svg?v=2026-11-03" height="40"></picture></a>&nbsp;<a href="mailto:arnavyadav02.work@gmail.com"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/btn-email-dark.svg?v=2026-11-03"><img alt="Email" src="./assets/btn-email-light.svg?v=2026-11-03" height="40"></picture></a>&nbsp;<a href="https://github.com/arnav-yadav?tab=repositories"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/btn-repos-dark.svg?v=2026-11-03"><img alt="All repositories" src="./assets/btn-repos-light.svg?v=2026-11-03" height="40"></picture></a></p>

<a href="https://github.com/arnav-yadav/RealTime-EventMonitor"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/plate-event-monitor-dark.svg?v=2026-11-03"><img alt="Real-time event monitoring: Six services, one Kafka log, and no event processed twice." src="./assets/plate-event-monitor-light.svg?v=2026-11-03" width="100%"></picture></a>

<details><summary><b>How it works</b> · 84/s events, load-tested · 0 errors under load · 0 duplicates on replay</summary>

- Topic keyed by `userId` across 3 partitions and 2 consumers, so each user's events stay in order; consumer-group rebalancing verified on failover.
- At-least-once delivery with 0 duplicates on replay: manual offset commits plus idempotent Postgres writes (`ON CONFLICT DO NOTHING`).
- Redis sliding-window counters (60 s TTL) and sorted-set rankings feed the dashboard.
- Live events stream to clients over both WebSocket and Server-Sent Events, across 6 Docker Compose services.

[Repository](https://github.com/arnav-yadav/RealTime-EventMonitor)

</details>

<br>

<a href="https://github.com/arnav-yadav/WebsiteAutomationAgent"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/plate-browser-agent-dark.svg?v=2026-11-03"><img alt="Website automation agent: A task in plain English in, real clicks on a real page out." src="./assets/plate-browser-agent-light.svg?v=2026-11-03" width="100%"></picture></a>

<details><summary><b>How it works</b> · 7 Zod-validated tools · 2 LLM providers, 1-file swap · 0 hardcoded selectors</summary>

- Hand-rolled ReAct loop (perceive, reason, act, observe) calling 7 Zod-validated tools through native function calling.
- Set-of-marks perception: a screenshot plus numbered elements with real DOM centre coordinates, at temperature 0, so clicks land on the DOM instead of guessed pixels.
- Provider-agnostic brain: swap between 2 LLM providers by changing one file.
- Hardened with Zod self-correction, viewport-bounds checks, exponential-backoff retries and a turn cap; every turn is traced to JSONL (thought, tool, args, latency) for replay.

[Repository](https://github.com/arnav-yadav/WebsiteAutomationAgent)

</details>

<br>

<a href="https://github.com/arnav-yadav/AdvancedRAG_Notebook"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/plate-retrievai-dark.svg?v=2026-11-03"><img alt="RetrievAI Advanced: Chat with a document, and watch every retrieval stage get timed." src="./assets/plate-retrievai-light.svg?v=2026-11-03" width="100%"></picture></a>

<details><summary><b>How it works</b> · 5 techniques, each a toggle · 3 file types: PDF, txt, csv · ms timed at every stage</summary>

- Upload a PDF, .txt or .csv and chat with it; every answer is grounded with source citations.
- Query translation (rewrite, sub-query, multi-query), HyDE, hybrid dense + BM25 retrieval fused with RRF, cross-encoder re-ranking, and Corrective RAG with an LLM judge.
- Every technique is a UI toggle with a live per-stage timing trace, so the speed versus accuracy trade-off is visible.

[Repository](https://github.com/arnav-yadav/AdvancedRAG_Notebook)

</details>

<br>

<a href="https://github.com/arnav-yadav/Rate-Limiter-Design-main"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/plate-rate-limiter-dark.svg?v=2026-11-03"><img alt="Pluggable rate limiter: Guards paid external APIs, only where a call actually happens." src="./assets/plate-rate-limiter-light.svg?v=2026-11-03" width="100%"></picture></a>

<details><summary><b>How it works</b> · 2 algorithms, 1 interface · 0 business-logic changes · 4 ways to key a limit</summary>

- Rate-limits calls to external, paid resources, and only where business logic decides a call is needed, which saves cost and quota.
- Fixed-window and sliding-window counters behind one Strategy interface, switchable without touching business logic; a `RemoteResourceProxy` wraps the external call.
- Runtime-configurable limits, keyed per customer, tenant, API key or provider. Designed thread-safe and SOLID, with token bucket and leaky bucket as extension points.

[Repository](https://github.com/arnav-yadav/Rate-Limiter-Design-main)

</details>

<br>

<a href="https://github.com/arnav-yadav/AIAgentCLI"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/plate-web-cloner-dark.svg?v=2026-11-03"><img alt="Website cloner agent: Point it at a URL. It scrapes the real page, then rebuilds it." src="./assets/plate-web-cloner-light.svg?v=2026-11-03" width="100%"></picture></a>

<details><summary><b>How it works</b> · 5 step loop, think to output · 0 Lorem Ipsum, real DOM · 429 triggers key rotation</summary>

- Conversational CLI agent on Gemini 2.5 Flash, running a START → THINK → TOOL → OBSERVE → OUTPUT loop.
- Puppeteer scrapes real DOM content, heading hierarchy, class frequencies and CSS design tokens (colours, fonts); prompts force real scraped data, never Lorem Ipsum.
- Tools are restricted to custom functions such as `fetchWebpage(url)` and `createFile`, so it can't hallucinate shell commands. API keys rotate automatically on 429 and 403.

[Repository](https://github.com/arnav-yadav/AIAgentCLI)

</details>

<br>

<a href="https://github.com/arnav-yadav/Sahaara"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/plate-sahaara-dark.svg?v=2026-11-03"><img alt="Sahaara: Peer support for mental health, with a real person on the other end." src="./assets/plate-sahaara-light.svg?v=2026-11-03" width="100%"></picture></a>

<details><summary><b>How it works</b> · 1:1 chat and video calls · 30+ UI themes · live deployed on Render</summary>

- Peer-to-peer mental health support: topic-based peer discovery, friend requests, and real-time 1:1 chat and video calling on Stream Chat and Video SDKs.
- JWT in HTTP-only cookies, bcrypt and gated onboarding; protected routes, CORS and input validation.
- React 19 with Zustand and TanStack Query; DaisyUI with 30+ themes. *"Because sometimes, all we need is someone to talk to."*

[Repository](https://github.com/arnav-yadav/Sahaara) · [Live demo](https://sahaara-m6qg.onrender.com/)

</details>

<br>

<a href="https://github.com/arnav-yadav/argus"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/plate-argus-dark.svg?v=2026-11-03"><img alt="Argus: Spots dead services by their silence, and warns before the budget runs out." src="./assets/plate-argus-light.svg?v=2026-11-03" width="100%"></picture></a>

<details><summary><b>How it works</b> · 48 tests, incl. SLO maths · 14.4× burn rate that pages · 0 manual steps, push to cluster</summary>

- Services register with a heartbeat interval and an SLO target. One that misses two intervals is marked down, because a dead process can't report its own death.
- Uptime, error budget and burn rate over 1 h, 24 h and 7 d, judged per time slot rather than per beat, by pure functions covered by 48 tests.
- GitOps delivery: GitHub Actions tests, builds multi-arch images, gates them with Trivy, pushes to GHCR and commits the new SHA tag; ArgoCD rolls it out. One commit goes from `git push` to the running cluster with no manual step.
- Non-root, read-only containers under the restricted Pod Security profile; Terraform for AWS VPC + EKS; Prometheus burn-rate alerts and a Grafana dashboard. [3½-minute walkthrough](https://youtu.be/C6kht1PKC-k).

[Repository](https://github.com/arnav-yadav/argus)

</details>

<br>

<a href="https://github.com/arnav-yadav/jailbreak-arena"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/plate-jailbreak-arena-dark.svg?v=2026-11-03"><img alt="Jailbreak Arena: An attacker LLM and a defender LLM in a self-play arms race." src="./assets/plate-jailbreak-arena-light.svg?v=2026-11-03" width="100%"></picture></a>

<details><summary><b>How it works</b> · 8 attack strategies · 3 curriculum levels · 24 topics, 4 categories</summary>

- Built with my teammate [@paradoxicsys](https://github.com/paradoxicsys) at the OpenEnv Hackathon, Scaler Bangalore 2026.
- Attacker (Qwen 1.5B + GRPO) versus defender (Qwen 1.5B + safety fine-tune); a detector scores each reply refused, partial or complied, and the defender is fine-tuned on the attacker's successful payloads after every cycle.
- Over-refusal isn't free: refusing a legitimate prompt costs the defender −1.0, the same as letting a jailbreak through.
- OpenEnv-compliant FastAPI server (`/reset`, `/step`, `/state`, `/health`, `/metrics`), Dockerised and deployable as a Hugging Face Space.

[Repository](https://github.com/arnav-yadav/jailbreak-arena)

</details>

<br>

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/off-keyboard-dark.svg?v=2026-11-03"><img alt="Off the keyboard: the puzzles I solve, films, random facts, and mentoring as a buddy / TA." src="./assets/off-keyboard-light.svg?v=2026-11-03" width="100%"></picture>

<sub>Every image here is drawn by <code>tools/build.mjs</code>. Figures are made with the <a href="https://github.com/wheresryan22/anatomy">anatomy</a> kit (MIT). Type: Schibsted Grotesk and JetBrains Mono, SIL Open Font License.</sub>
