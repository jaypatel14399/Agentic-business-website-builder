# Quick Start Guide

## Full-Stack Application Setup

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Docker (optional, for production)

### Step 1: Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file with your API keys:
```env
GOOGLE_PLACES_API_KEY=your_key
OPENAI_API_KEY=your_key
```

### Step 2: Frontend Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
cd ..
```

### Step 3: Run the Application

**Option A: Using Startup Scripts (Recommended)**

```bash
# Linux/Mac
chmod +x start.sh
./start.sh

# Windows
start.bat
```

**Option B: Manual Start**

Terminal 1 (Backend):
```bash
cd api
uvicorn api.main:app --reload --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option C: Docker (Production)**

```bash
docker-compose up -d
```

### Step 4: Access the Application

- **Frontend UI**: http://localhost:5173 (dev) or http://localhost (prod)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Using the Web UI

1. Open http://localhost:5173 in your browser
2. Fill in the form:
   - Industry (e.g., "roofing")
   - City (e.g., "Austin")
   - State (e.g., "TX")
   - Limit (optional, number of businesses)
3. Click "Start Generation"
4. Watch real-time progress and logs in the UI
5. View generated websites in the "Generated Websites" section

### Features

- **Real-Time Progress**: See live updates via WebSocket
- **Log Viewer**: Watch detailed logs from the orchestrator
- **Job Management**: View all jobs and their status
- **Website Gallery**: Browse all generated websites

### Troubleshooting

**Backend won't start:**
- Check that all API keys are set in `.env`
- Ensure port 8000 is not in use

**Frontend won't start:**
- Run `npm install` in the `frontend` directory
- Check that Node.js 18+ is installed

**WebSocket connection fails:**
- Ensure backend is running on port 8000
- Check browser console for errors
- Verify CORS settings in `api/main.py`

**Docker issues:**
- Ensure Docker and Docker Compose are installed
- Check that `.env` file exists
- View logs: `docker-compose logs -f`
