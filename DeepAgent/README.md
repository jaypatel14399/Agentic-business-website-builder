# Multi-Agent Business Website Generator

An AI-driven, multi-agent system that identifies local businesses without websites, analyzes their competitive landscape, and generates SEO-optimized Next.js websites using publicly available business information.

## Features

- **Business Discovery**: Finds local businesses in a given industry and city using Google Places API. **Checks whether each business already has a website listed in Google Business**—treats a real website URL as “has website” and Google Business Profile–only links (e.g. `g.page`, maps links) as “no website.”
- **Discovery API & Map UI**: Optional discover-first flow: call `POST /api/discover` to get businesses with map coordinates and website status, then view them on a map and in a list before starting generation.
- **Website Detection**: Re-validates website presence (e.g. HTTP reachability); filters out businesses that already have a dedicated website.
- **Competitor Analysis**: Analyzes competitors with strong online presence to inform website generation.
- **Website Generation**: Creates SEO-optimized, multi-page Next.js websites with modern design.

## Architecture

The system uses a multi-agent architecture with specialized agents (Python classes that call services):

- **Orchestrator Agent**: Coordinates the full workflow; supports progress callbacks for the Web UI.
- **Business Discovery Agent**: Finds businesses via Google Places API. Uses **Google Place Details** to read the `website` field and sets `has_website` from it (real URL = has website; Google Profile/maps URL = no website). Website Detection can still re-validate later.
- **Website Detection Agent**: Verifies websites (e.g. HEAD request, excludes Google Business Profile links).
- **Competitor Analysis Agent**: Analyzes competitor websites.
- **Website Generation Agent**: Generates Next.js sites with AI-generated content.

## Setup

### Prerequisites

- Python 3.10 or higher
- API keys for:
  - Google Places API
  - OpenAI API (or Anthropic API)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DeepAgent
```

2. Create a virtual environment:
```bash
python -m venv venv
# Activate: source venv/bin/activate  (Linux/Mac)  or  venv\Scripts\activate  (Windows)
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```

5. Edit `.env` and add your API keys:
```env
GOOGLE_PLACES_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## Getting API Keys

### Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Places API" in the API Library
4. Create credentials (API Key) in the Credentials section
5. Copy the API key to your `.env` file

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key to your `.env` file

## Usage

### CLI Mode

```bash
python src/main.py --industry "roofing" --city "Austin" --state "TX" --limit 5
```

Run from the **project root** (DeepAgent/) so `src` and `api` are on the Python path.

### Web UI Mode

**Development:**
```bash
# Option 1: Startup script (recommended)
./start.sh          # Linux/Mac
start.bat           # Windows

# Option 2: Manual start (both from project root)
# Terminal 1: Backend
uvicorn api.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

**Production (Docker):**
```bash
./start-prod.sh     # Linux/Mac
# Or: docker-compose up -d
```

**Access:**
- **Frontend**: http://localhost:5173 (dev) or http://localhost (prod)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

**Web UI flow:**
- **Discover**: Use the discovery section to find businesses by industry and location. Results show on a map and in a list with website status (has website / no website / invalid). This uses `POST /api/discover`, which checks each business’s Google Business listing for a website and validates it.
- **Generate**: Start a job (industry, city, state, limit) to run the full pipeline. You can also use pre-discovered businesses from the UI when supported.

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/discover` | Discover businesses (industry, city, state, limit). Returns list with coordinates and website status from Google Business + validation. |
| `POST` | `/api/jobs` | Create a generation job (industry, city, state, limit). |
| `GET` | `/api/jobs`, `/api/jobs/{id}` | List or get job status. |
| `WS` | `/api/jobs/{id}/ws` | WebSocket for real-time logs and progress. |
| `GET` | `/api/websites` | List generated websites. |
| `GET` | `/api/health` | Health check. |

Full interactive docs: http://localhost:8000/docs

## Project Structure

```
DeepAgent/
├── api/                     # FastAPI backend
│   ├── main.py              # FastAPI application
│   ├── routes/              # API routes
│   │   ├── jobs.py          # Job CRUD, WebSocket
│   │   ├── websites.py      # Generated sites list/delete
│   │   └── discovery.py     # POST /api/discover (business discovery + website validation)
│   ├── services/            # API-layer services
│   │   ├── discovery_service.py   # Discover businesses, validate websites
│   │   ├── google_service.py      # Geocoding, Places search, Place Details
│   │   └── website_validation_service.py  # HEAD-based website validation
│   ├── models/              # Pydantic models (e.g. job.py)
│   ├── tasks/               # Background tasks (generate_websites.py)
│   ├── storage/             # Job storage
│   ├── websocket_manager.py
│   └── logging_handler.py   # WebSocket log forwarding
├── frontend/                # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── DiscoverySection.tsx   # Discover businesses, map + list
│   │   │   ├── MapContainer.tsx       # Map view of discovered businesses
│   │   │   ├── BusinessListPanel.tsx  # List + BusinessListItem
│   │   │   ├── BusinessDetailDrawer.tsx
│   │   │   ├── JobForm.tsx, JobList.tsx, LogViewer.tsx
│   │   │   ├── ProgressTracker.tsx, TimelineStepper.tsx, DarkProgressBar.tsx
│   │   │   ├── WebsiteList.tsx, AgentPipelineView.tsx
│   │   │   ├── ModeToggle.tsx, Sidebar.tsx, StatCard.tsx
│   │   │   └── ...
│   │   ├── contexts/       # React context (e.g. ThemeContext)
│   │   ├── hooks/           # useWebSocket, etc.
│   │   ├── api/             # API client
│   │   ├── utils/           # Utilities (e.g. themeClasses)
│   │   └── types.ts
│   └── package.json
├── src/                     # Core pipeline (CLI + used by API)
│   ├── agents/              # Orchestrator, BusinessDiscovery, WebsiteDetector, etc.
│   ├── services/            # Google Places, website_checker, scraper, content_generator
│   ├── generators/          # Next.js generator + Jinja2 templates
│   ├── models/              # Business, CompetitorAnalysis, WebsiteRequirements
│   ├── utils/               # Config, get_config()
│   └── main.py              # CLI entry point
├── generated_sites/        # Output directory for generated websites
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.frontend
├── start.sh                 # Development: backend + frontend
├── start.bat
├── start-prod.sh            # Production: docker-compose
├── requirements.txt
├── .env.example
├── README.md
├── QUICKSTART.md            # Short setup + run guide
└── PROJECT_OVERVIEW.md      # Detailed overview for developers
```

## License

MIT

