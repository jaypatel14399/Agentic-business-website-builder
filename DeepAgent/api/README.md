# API Documentation

## Running the API

### Development Mode

```bash
# From project root
cd api
From project root (DeepAgent): `uvicorn api.main:app --reload --port 8000`
```

### Production Mode

```bash
# Using Docker
docker-compose up backend
```

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Jobs
- `POST /api/jobs` - Create and start a new job
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/{job_id}` - Get job details
- `DELETE /api/jobs/{job_id}` - Cancel a job
- `WS /api/jobs/{job_id}/ws` - WebSocket connection for real-time updates

### Websites
- `GET /api/websites` - List all generated websites
- `GET /api/websites/{site_id}` - Get website details
- `DELETE /api/websites/{site_id}` - Delete a website

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
