# Multi-Agent Business Website Generator

An AI-driven, multi-agent system that identifies local businesses without websites, analyzes their competitive landscape, and generates SEO-optimized Next.js websites using publicly available business information.

## Features

- **Business Discovery**: Automatically finds local businesses in a given industry and city using Google Places API
- **Website Detection**: Identifies businesses that lack a dedicated website
- **Competitor Analysis**: Analyzes competitors with strong online presence to inform website generation
- **Website Generation**: Creates SEO-optimized, multi-page Next.js websites with modern design

## Architecture

The system uses a LangChain-based multi-agent architecture with specialized agents:

- **Orchestrator Agent**: Coordinates the entire workflow
- **Business Discovery Agent**: Finds businesses via Google Places API
- **Website Detection Agent**: Checks for existing websites
- **Competitor Analysis Agent**: Analyzes competitor websites
- **Website Generation Agent**: Generates Next.js sites with AI-generated content

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
venv\Scripts\activate
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

### CLI Mode (Original)

```bash
python src/main.py --industry "roofing" --city "Austin" --state "TX" --limit 5
```

### Web UI Mode (New)

**Development Mode:**
```bash
# Option 1: Use startup script (recommended)
./start.sh          # Linux/Mac
start.bat           # Windows

# Option 2: Manual start
# Terminal 1: Start backend
cd api && uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend && npm install && npm run dev
```

**Production Mode (Docker):**
```bash
./start-prod.sh     # Linux/Mac
# Or manually:
docker-compose up -d
```

**Access:**
- Frontend UI: http://localhost:5173 (dev) or http://localhost (prod)
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
DeepAgent/
├── api/                  # FastAPI backend
│   ├── main.py          # FastAPI application
│   ├── routes/          # API routes
│   ├── models/          # Pydantic models
│   ├── tasks/           # Background tasks
│   ├── storage/         # Job storage
│   └── websocket_manager.py
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # React hooks
│   │   └── api/        # API client
│   └── package.json
├── src/
│   ├── agents/          # LangChain agents
│   ├── services/        # External API integrations
│   ├── generators/      # Website generation logic
│   ├── models/          # Data models
│   ├── utils/           # Configuration and utilities
│   └── main.py          # CLI entry point
├── generated_sites/      # Output directory for generated websites
├── docker-compose.yml   # Docker configuration
├── Dockerfile           # Backend Docker image
├── Dockerfile.frontend  # Frontend Docker image
├── start.sh             # Development startup script
├── start.bat            # Windows startup script
├── start-prod.sh        # Production startup script
├── requirements.txt
├── .env.example
└── README.md
```

## License

MIT

