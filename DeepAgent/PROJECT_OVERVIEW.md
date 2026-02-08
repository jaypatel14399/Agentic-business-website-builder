# DeepAgent — Project Overview for Agents

This document is a concise overview of the **Multi-Agent Business Website Generator** (DeepAgent) project. Use it to onboard another agent or to reason about the codebase.

---

## 1. What the Project Does

**Goal:** Automatically find local businesses that **do not have a website**, then generate **SEO-optimized Next.js websites** for them using public data and AI.

**High-level flow:**
1. **Discover** businesses in an industry + city/state (e.g., "roofing" in "Austin, TX") via Google Places.
2. **Detect** which of those businesses already have a real website (vs. only a Google Business Profile).
3. **Filter** to businesses without a website.
4. For each such business:
   - **Analyze** competitors (same industry/location, with websites) via scraping + LLM.
   - **Generate** website content (copy, SEO, CTAs) with an LLM.
   - **Generate** a full Next.js project (pages, components, Tailwind) and write it to disk.

**Output:** One Next.js project per business under `generated_sites/<business-slug>/`, ready to build and deploy.

---

## 2. Architecture (Two Entry Points)

The system can be used in two ways:

- **CLI:** `python src/main.py --industry "roofing" --city "Austin" --state "TX" --limit 5`
- **Web app:** FastAPI backend + React frontend; user starts jobs via UI and sees real-time logs/progress over WebSockets.

**Core pipeline (shared by both):**

```
User input (industry, city, state, limit)
    → OrchestratorAgent.generate_websites()
        → BusinessDiscoveryAgent (Google Places)
        → WebsiteDetectionAgent (HTTP + “is this a real site?” checks)
        → Filter to businesses without website
        → For each business:
            → CompetitorAnalysisAgent (scrape competitor sites + LLM)
            → WebsiteGenerationAgent (LLM content) + NextJSGenerator (Jinja2 → Next.js files)
    → List[Path] of generated site directories
```

Agents are **Python classes** that call **services**; they are not LangChain “agent executors” with tools. The orchestrator is the single entry that runs the full workflow and can accept an optional **progress_callback(step, progress, details)** for the API/UI.

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Core logic | Python 3.10+ |
| Agents & orchestration | Custom classes in `src/agents/` |
| LLM | LangChain + OpenAI (configurable; Anthropic support in config) |
| External data | Google Places API (`googlemaps`), HTTP + BeautifulSoup for scraping |
| Site generation | Jinja2 templates → Next.js (App Router) + Tailwind |
| Backend API | FastAPI, uvicorn |
| Real-time | WebSockets (per-job log stream + progress) |
| Frontend | React 18, TypeScript, Vite |
| Deployment | Docker (backend + frontend images), docker-compose |

---

## 4. Project Layout (Important Paths)

```
DeepAgent/
├── src/                          # Core pipeline (CLI + used by API)
│   ├── main.py                   # CLI entry (Click)
│   ├── agents/
│   │   ├── orchestrator.py       # Runs full workflow; supports progress_callback
│   │   ├── business_discovery.py # Uses GooglePlacesService
│   │   ├── website_detector.py   # Uses WebsiteCheckerService
│   │   ├── competitor_analyzer.py# Uses WebsiteScraperService + LLM
│   │   └── website_generator.py # Uses ContentGeneratorService
│   ├── services/
│   │   ├── google_places.py      # Google Places API → List[Business]
│   │   ├── website_checker.py   # “Has real website?” (HTTP + not g.page/maps)
│   │   ├── website_scraper.py   # Scrape competitor pages → structured content
│   │   └── content_generator.py # LLM → website copy (business_info, services, SEO, etc.)
│   ├── generators/
│   │   ├── nextjs_generator.py   # Renders Jinja2 templates → Next.js project
│   │   └── templates/           # .j2 templates (pages, components, configs)
│   ├── models/
│   │   └── business.py          # Business, CompetitorAnalysis, WebsiteRequirements
│   └── utils/
│       └── config.py            # Config from env; get_config()
│
├── api/                          # FastAPI backend for Web UI
│   ├── main.py                   # FastAPI app, CORS, routes
│   ├── websocket_manager.py      # Per-job WebSocket broadcast (logs + progress)
│   ├── logging_handler.py        # Logging handler that pushes to WebSocket
│   ├── routes/
│   │   ├── jobs.py               # POST/GET/DELETE jobs, WS /api/jobs/{id}/ws
│   │   └── websites.py           # GET/DELETE generated websites
│   ├── tasks/
│   │   └── generate_websites.py  # Background task: run orchestrator, wire logs/callback
│   ├── models/
│   │   └── job.py               # JobRequest, JobResponse, JobStatus, WebsiteInfo
│   └── storage/
│       └── job_storage.py       # In-memory job store (single process)
│
├── frontend/                      # React SPA
│   ├── src/
│   │   ├── App.tsx               # Layout, job selection, progress, logs
│   │   ├── api/client.ts         # REST client (jobs, websites)
│   │   ├── hooks/useWebSocket.ts # WebSocket hook for a job_id
│   │   ├── components/           # JobForm, LogViewer, ProgressTracker, JobList, WebsiteList
│   │   └── types.ts              # JobRequest, JobResponse, WebSocketMessage, etc.
│   └── vite.config.ts            # Proxy /api and /ws to backend
│
├── generated_sites/               # Output: one Next.js project per business
├── tests/                         # pytest (e.g. test_google_places.py)
├── requirements.txt               # Python deps (incl. fastapi, uvicorn, websockets)
├── docker-compose.yml             # backend + frontend services
├── Dockerfile                     # Backend image
├── Dockerfile.frontend             # Frontend build + nginx
├── start.sh / start.bat           # Dev: run backend + frontend
└── start-prod.sh                  # Prod: docker-compose up
```

---

## 5. Core Data Models (`src/models/business.py`)

- **Business:** name, address, phone, industry, city, state, website_url, has_website, google_place_id, reviews, rating, lat/lng, business_status, types, etc. Used everywhere.
- **CompetitorAnalysis:** competitor_businesses, key_services, content_structure, seo_keywords, design_patterns, messaging_themes, call_to_actions, industry_insights. Output of competitor analyzer; input to content generation.
- **WebsiteRequirements:** business, competitor_analysis (optional), target_audience, primary_services, brand_tone, seo_focus_keywords, include_contact_form, include_testimonials, etc. Input to content generator and high-level “brief” for the site.

Content generator returns a **dict** (not a Pydantic model) with keys like: `business_info`, `about_content`, `services`, `seo`, `call_to_actions`, `testimonials_section`, `contact`, `footer`. The Next.js generator consumes this dict when rendering Jinja2 templates.

---

## 6. Configuration (`src/utils/config.py`)

- **Config** is built from environment (and optional `.env` path). Use **get_config()** to get the singleton.
- **Required env:** `GOOGLE_PLACES_API_KEY`; `OPENAI_API_KEY` when `LLM_PROVIDER=openai`.
- **Important options:** `LLM_PROVIDER`, `LLM_MODEL`, `OUTPUT_DIR` (default `generated_sites`), `GOOGLE_PLACES_MAX_RESULTS`, `COMPETITOR_ANALYSIS_MAX_COMPETITORS`, `CONTENT_GENERATION_TEMPERATURE`, `LOG_LEVEL`. Validation runs in `_validate()`; missing required vars raise.

---

## 7. API Layer (for the Web UI)

- **Base URL:** e.g. `http://localhost:8000`.
- **Endpoints:**
  - `GET /api/health` — health check.
  - `POST /api/jobs` — body: `{ industry, city, state, limit? }`. Creates job, starts background task, returns `JobResponse` (job_id, status, request, etc.).
  - `GET /api/jobs`, `GET /api/jobs/{job_id}` — list / get job.
  - `DELETE /api/jobs/{job_id}` — cancel job.
  - `WS /api/jobs/{job_id}/ws` — real-time: messages are `{ type: "log" | "progress" | "connected", ... }` (level, message, step, progress, details, etc.).
  - `GET /api/websites`, `GET /api/websites/{site_id}`, `DELETE /api/websites/{site_id}` — list/get/delete generated site records.

Background task in `api/tasks/generate_websites.py`: sets a **WebSocketLoggingHandler** on the root logger for the job’s run, calls **OrchestratorAgent.generate_websites(..., progress_callback=...)** so progress and logs are pushed to **WebSocketManager** and thus to the frontend.

---

## 8. Frontend (React)

- **Stack:** React 18, TypeScript, Vite. API client (axios), reconnecting WebSocket for `/api/jobs/{id}/ws`.
- **Flow:** User submits JobForm (industry, city, state, limit) → POST `/api/jobs` → select returned job → open WebSocket for that job_id → show ProgressTracker + LogViewer; JobList and WebsiteList show all jobs and generated sites.
- **Important:** Frontend expects backend at same host in dev (Vite proxy) or configurable `VITE_API_URL`; WebSocket URL is derived from that (e.g. `ws://localhost:8000`).

---

## 9. Running the Project

- **CLI only:**  
  `python src/main.py --industry "roofing" --city "Austin" --state "TX" --limit 5`  
  (Ensure `.env` is set; run from repo root.)

- **Web UI (dev):**  
  - Backend: `uvicorn api.main:app --reload --port 8000` (from project root so `api` and `src` are importable).  
  - Frontend: `cd frontend && npm install && npm run dev`.  
  - Or use `./start.sh` / `start.bat` if available.

- **Prod (Docker):**  
  `docker-compose up -d`. Frontend and API ports depend on compose/nginx config (e.g. 80 for frontend, 8000 for API).

---

## 10. Conventions and Patterns

- **Agents** take **services** (and optionally **Config**) in `__init__`; they do not create their own clients. Orchestrator creates all services and agents once.
- **Errors:** Services and agents typically log and return empty/None or skip one business rather than raising; orchestrator continues with the next business. API layer catches and returns appropriate HTTP status and messages.
- **Imports:** Core pipeline lives under `src/`; API under `api/`. Backend runs with cwd = project root so both `src` and `api` are on the path. Frontend has no Python code.
- **Generated sites:** Stored under `generated_sites/<slug>/`; each is a full Next.js app (package.json, next.config, Tailwind, pages, components). No server-side Next.js at runtime—static export intended.

---

## 11. What Another Agent Should Know

1. **Do not** change the overall workflow (discover → detect → filter → for each: competitors → content → Next.js) without aligning with the plan/orchestrator.
2. **Config** is the single source of env-based config; use **get_config()** and avoid new env readers elsewhere.
3. **Business** and **WebsiteRequirements** are the main contracts between discovery → detection → analysis → content → generator; changing them affects multiple layers.
4. **Content generator** output shape is fixed by **NextJSGenerator** (e.g. `business_info`, `services`, `seo`); template variable names must match.
5. **API** job storage is in-memory; restart clears jobs. WebSocket is per-job; reconnecting is handled on the frontend.
6. **Tests:** pytest in `tests/`; at least `tests/services/test_google_places.py` exists. Run from project root.

Use this overview to navigate the repo, add features, or fix bugs without contradicting existing architecture or contracts.
