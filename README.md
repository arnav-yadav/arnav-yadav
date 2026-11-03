<picture><source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="./assets/hero-a-phone-dark.svg?v=2026-11-03"><source media="(max-width: 640px)" srcset="./assets/hero-a-phone-light.svg?v=2026-11-03"><source media="(prefers-color-scheme: dark)" srcset="./assets/hero-a-dark.svg?v=2026-11-03"><img alt="Arnav Yadav. I build backends and AI agents. CS at Scaler School of Technology and BITS Pilani." src="./assets/hero-a-light.svg?v=2026-11-03" width="100%"></picture>

<p><a href="https://www.linkedin.com/in/arnav-yadav02/"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/btn-linkedin-dark.svg?v=2026-11-03"><img alt="linkedin" src="./assets/btn-linkedin-light.svg?v=2026-11-03" height="36"></picture></a>&nbsp;<a href="mailto:arnavyadav02.work@gmail.com"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/btn-email-dark.svg?v=2026-11-03"><img alt="email" src="./assets/btn-email-light.svg?v=2026-11-03" height="36"></picture></a>&nbsp;<a href="https://github.com/arnav-yadav?tab=repositories"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/btn-repos-dark.svg?v=2026-11-03"><img alt="repositories" src="./assets/btn-repos-light.svg?v=2026-11-03" height="36"></picture></a></p>

<picture><source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="./assets/row-1-phone-dark.svg?v=2026-11-03"><source media="(max-width: 640px)" srcset="./assets/row-1-phone-light.svg?v=2026-11-03"><source media="(prefers-color-scheme: dark)" srcset="./assets/row-1-dark.svg?v=2026-11-03"><img alt="Real-time event monitoring: Six services, one Kafka log, and no event processed twice. | Website automation agent: A task in plain English in, real clicks on a real page out." src="./assets/row-1-light.svg?v=2026-11-03" width="100%"></picture>

<details><summary><b>How these work</b> · <a href="https://github.com/arnav-yadav/RealTime-EventMonitor">RealTime-EventMonitor ↗</a> · <a href="https://github.com/arnav-yadav/WebsiteAutomationAgent">WebsiteAutomationAgent ↗</a></summary>

**Real-time event monitoring**

- Topic keyed by `userId` across 3 partitions and 2 consumers, so each user's events stay in order; consumer-group rebalancing verified on failover.
- At-least-once delivery with 0 duplicates on replay: manual offset commits plus idempotent Postgres writes (`ON CONFLICT DO NOTHING`).
- Redis sliding-window counters (60 s TTL) and sorted-set rankings feed the dashboard.
- Live events stream to clients over both WebSocket and Server-Sent Events, across 6 Docker Compose services.

**Website automation agent**

- Hand-rolled ReAct loop (perceive, reason, act, observe) calling 7 Zod-validated tools through native function calling.
- Set-of-marks perception: a screenshot plus numbered elements with real DOM centre coordinates, at temperature 0, so clicks land on the DOM instead of guessed pixels.
- Provider-agnostic brain: swap between 2 LLM providers by changing one file.
- Hardened with Zod self-correction, viewport-bounds checks, exponential-backoff retries and a turn cap; every turn is traced to JSONL (thought, tool, args, latency) for replay.


</details>

<br>

<picture><source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="./assets/row-2-phone-dark.svg?v=2026-11-03"><source media="(max-width: 640px)" srcset="./assets/row-2-phone-light.svg?v=2026-11-03"><source media="(prefers-color-scheme: dark)" srcset="./assets/row-2-dark.svg?v=2026-11-03"><img alt="RetrievAI Advanced: Chat with a document, and watch every retrieval stage get timed. | Pluggable rate limiter: Guards paid external APIs, only where a call actually happens." src="./assets/row-2-light.svg?v=2026-11-03" width="100%"></picture>

<details><summary><b>How these work</b> · <a href="https://github.com/arnav-yadav/AdvancedRAG_Notebook">AdvancedRAG_Notebook ↗</a> · <a href="https://github.com/arnav-yadav/rate-limiter">rate-limiter ↗</a></summary>

**RetrievAI Advanced**

- Upload a PDF, .txt or .csv and chat with it; every answer is grounded with source citations.
- Query translation (rewrite, sub-query, multi-query), HyDE, hybrid dense + BM25 retrieval fused with RRF, cross-encoder re-ranking, and Corrective RAG with an LLM judge.
- Every technique is a UI toggle with a live per-stage timing trace, so the speed versus accuracy trade-off is visible.

**Pluggable rate limiter**

- Rate-limits calls to external, paid resources, and only where business logic decides a call is needed, which saves cost and quota.
- Fixed-window and sliding-window counters behind one Strategy interface, switchable without touching business logic; a `RemoteResourceProxy` wraps the external call.
- Runtime-configurable limits, keyed per customer, tenant, API key or provider. Designed thread-safe and SOLID, with token bucket and leaky bucket as extension points.


</details>

<br>

<picture><source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="./assets/row-3-phone-dark.svg?v=2026-11-03"><source media="(max-width: 640px)" srcset="./assets/row-3-phone-light.svg?v=2026-11-03"><source media="(prefers-color-scheme: dark)" srcset="./assets/row-3-dark.svg?v=2026-11-03"><img alt="Website cloner agent: Point it at a URL. It scrapes the real page, then rebuilds it. | Sahaara: Peer support for mental health, with a real person on the other end." src="./assets/row-3-light.svg?v=2026-11-03" width="100%"></picture>

<details><summary><b>How these work</b> · <a href="https://github.com/arnav-yadav/AIAgentCLI">AIAgentCLI ↗</a> · <a href="https://github.com/arnav-yadav/Sahaara">Sahaara ↗</a></summary>

**Website cloner agent**

- Conversational CLI agent on Gemini 2.5 Flash, running a START → THINK → TOOL → OBSERVE → OUTPUT loop.
- Puppeteer scrapes real DOM content, heading hierarchy, class frequencies and CSS design tokens (colours, fonts); prompts force real scraped data, never Lorem Ipsum.
- Tools are restricted to custom functions such as `fetchWebpage(url)` and `createFile`, so it can't hallucinate shell commands. API keys rotate automatically on 429 and 403.

**Sahaara**

- Peer-to-peer mental health support: topic-based peer discovery, friend requests, and real-time 1:1 chat and video calling on Stream Chat and Video SDKs.
- JWT in HTTP-only cookies, bcrypt and gated onboarding; protected routes, CORS and input validation.
- React 19 with Zustand and TanStack Query; DaisyUI with 30+ themes. *"Because sometimes, all we need is someone to talk to."*
- [Live demo](https://sahaara-m6qg.onrender.com/)


</details>

<br>

<picture><source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="./assets/row-4-phone-dark.svg?v=2026-11-03"><source media="(max-width: 640px)" srcset="./assets/row-4-phone-light.svg?v=2026-11-03"><source media="(prefers-color-scheme: dark)" srcset="./assets/row-4-dark.svg?v=2026-11-03"><img alt="Argus: Spots dead services by their silence, and warns before the budget runs out. | Jailbreak Arena: An attacker LLM and a defender LLM in a self-play arms race." src="./assets/row-4-light.svg?v=2026-11-03" width="100%"></picture>

<details><summary><b>How these work</b> · <a href="https://github.com/arnav-yadav/argus">argus ↗</a> · <a href="https://github.com/arnav-yadav/jailbreak-arena">jailbreak-arena ↗</a></summary>

**Argus**

- Services register with a heartbeat interval and an SLO target. One that misses two intervals is marked down, because a dead process can't report its own death.
- Uptime, error budget and burn rate over 1 h, 24 h and 7 d, judged per time slot rather than per beat, by pure functions covered by 48 tests.
- GitOps delivery: GitHub Actions tests, builds multi-arch images, gates them with Trivy, pushes to GHCR and commits the new SHA tag; ArgoCD rolls it out. One commit goes from `git push` to the running cluster with no manual step.
- Non-root, read-only containers under the restricted Pod Security profile; Terraform for AWS VPC + EKS; Prometheus burn-rate alerts and a Grafana dashboard. [3½-minute walkthrough](https://youtu.be/C6kht1PKC-k).

**Jailbreak Arena**

- Built with my teammate [@paradoxicsys](https://github.com/paradoxicsys) at the OpenEnv Hackathon, Scaler Bangalore 2026.
- Attacker (Qwen 1.5B + GRPO) versus defender (Qwen 1.5B + safety fine-tune); a detector scores each reply refused, partial or complied, and the defender is fine-tuned on the attacker's successful payloads after every cycle.
- Over-refusal isn't free: refusing a legitimate prompt costs the defender −1.0, the same as letting a jailbreak through.
- OpenEnv-compliant FastAPI server (`/reset`, `/step`, `/state`, `/health`, `/metrics`), Dockerised and deployable as a Hugging Face Space.


</details>

<br>

<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/off-keyboard-dark.svg?v=2026-11-03"><img alt="Idle loop: the puzzles I solve, films, random facts, and mentoring as a buddy / TA." src="./assets/off-keyboard-light.svg?v=2026-11-03" width="100%"></picture>

<sub>Every image here is drawn by <code>tools/build.mjs</code>. Figures are made with the <a href="https://github.com/wheresryan22/anatomy">anatomy</a> kit (MIT). Type: Schibsted Grotesk and JetBrains Mono, SIL Open Font License.</sub>
