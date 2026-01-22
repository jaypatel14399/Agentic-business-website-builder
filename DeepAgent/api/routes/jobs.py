"""Job management API routes."""

import logging
import asyncio
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from api.models.job import JobRequest, JobResponse, JobStatus
from api.storage.job_storage import job_storage
from api.websocket_manager import websocket_manager
from api.tasks.generate_websites import run_website_generation_task

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(request: JobRequest, background_tasks: BackgroundTasks):
    """
    Create and start a new website generation job.
    
    Args:
        request: Job request parameters.
        background_tasks: FastAPI background tasks.
    
    Returns:
        Created job response.
    """
    try:
        # Create job
        job_id = job_storage.create_job(request)
        job = job_storage.get_job(job_id)
        
        logger.info(f"Created job {job_id} for {request.industry} in {request.city}, {request.state}")
        
        # Start background task
        background_tasks.add_task(run_website_generation_task, job_id, request)
        
        return job
    
    except Exception as e:
        logger.error(f"Error creating job: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")


@router.get("", response_model=List[JobResponse])
async def list_jobs(status: Optional[JobStatus] = None):
    """
    List all jobs, optionally filtered by status.
    
    Args:
        status: Optional status filter.
    
    Returns:
        List of jobs.
    """
    try:
        jobs = job_storage.list_jobs(status=status)
        return jobs
    except Exception as e:
        logger.error(f"Error listing jobs: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list jobs: {str(e)}")


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """
    Get a job by ID.
    
    Args:
        job_id: Job ID.
    
    Returns:
        Job response.
    """
    job = job_storage.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    return job


@router.delete("/{job_id}", status_code=204)
async def cancel_job(job_id: str):
    """
    Cancel a job (if it's still running).
    
    Args:
        job_id: Job ID.
    
    Returns:
        No content on success.
    """
    job = job_storage.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    if job.status == JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed job")
    
    if job.status == JobStatus.FAILED:
        raise HTTPException(status_code=400, detail="Cannot cancel a failed job")
    
    # Update status to cancelled
    job_storage.update_job_status(
        job_id=job_id,
        status=JobStatus.CANCELLED,
        completed_at=datetime.now()
    )
    
    logger.info(f"Job {job_id} cancelled")
    
    return JSONResponse(status_code=204, content=None)


@router.websocket("/{job_id}/ws")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """
    WebSocket endpoint for real-time job updates.
    
    Args:
        websocket: WebSocket connection.
        job_id: Job ID to subscribe to.
    """
    # Verify job exists
    job = job_storage.get_job(job_id)
    if not job:
        await websocket.close(code=1008, reason=f"Job {job_id} not found")
        return
    
    # Connect
    await websocket_manager.connect(websocket, job_id)
    
    try:
        # Send initial connection message
        await websocket_manager.send_personal_message({
            "type": "connected",
            "job_id": job_id,
            "status": job.status.value,
            "timestamp": datetime.now().isoformat()
        }, websocket)
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for any message from client (ping/pong)
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                # Echo back or handle ping
                if data == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await websocket.send_text("ping")
            except WebSocketDisconnect:
                break
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {str(e)}", exc_info=True)
    finally:
        await websocket_manager.disconnect(websocket, job_id)
