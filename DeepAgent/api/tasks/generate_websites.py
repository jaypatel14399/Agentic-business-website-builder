"""Background task for website generation."""

import asyncio
import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Callable, Optional

# Add project root to path
project_root = Path(__file__).parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.utils.config import get_config
from src.agents.orchestrator import OrchestratorAgent
from api.models.job import JobRequest, JobStatus, ProgressUpdate, WebsiteInfo
from api.storage.job_storage import job_storage
from api.websocket_manager import websocket_manager
from api.logging_handler import WebSocketLoggingHandler

logger = logging.getLogger(__name__)


def run_website_generation_task(job_id: str, request: JobRequest):
    """
    Run website generation task in background.
    
    This function runs in a separate thread and executes the orchestrator.
    
    Args:
        job_id: Job ID.
        request: Job request.
    """
    # Get root logger (outside try block for cleanup)
    root_logger = logging.getLogger()
    ws_handler = None
    
    try:
        # Update job status to running
        job_storage.update_job_status(
            job_id=job_id,
            status=JobStatus.RUNNING,
            started_at=datetime.now()
        )
        
        # Set up WebSocket logging handler
        ws_handler = WebSocketLoggingHandler(job_id=job_id)
        ws_handler.setLevel(logging.INFO)
        
        # Add handler to root logger
        root_logger.addHandler(ws_handler)
        
        # Broadcast initial progress
        asyncio.run(websocket_manager.broadcast_progress(
            job_id=job_id,
            step="initializing",
            progress=0.0,
            details={"message": "Initializing orchestrator..."}
        ))
        
        # Initialize config and orchestrator
        logger.info(f"Initializing orchestrator for job {job_id}")
        config = get_config()
        orchestrator = OrchestratorAgent(config)
        
        # Create progress callback
        def progress_callback(step: str, progress: float, details: dict = None):
            """Callback for progress updates."""
            try:
                progress_update = ProgressUpdate(
                    step=step,
                    progress=progress,
                    details=details or {},
                    timestamp=datetime.now()
                )
                job_storage.update_job_progress(job_id, progress_update)
                
                # Broadcast via WebSocket
                asyncio.run(websocket_manager.broadcast_progress(
                    job_id=job_id,
                    step=step,
                    progress=progress,
                    details=details or {}
                ))
            except Exception as e:
                logger.error(f"Error in progress callback: {str(e)}")
        
        # Run orchestrator with progress callback
        logger.info(f"Starting website generation for job {job_id}")
        generated_paths = orchestrator.generate_websites(
            industry=request.industry,
            city=request.city,
            state=request.state,
            limit=request.limit,
            progress_callback=progress_callback
        )
        
        # Convert paths to WebsiteInfo objects
        websites = []
        for path in generated_paths:
            site_id = path.name
            # Try to get business name from path or use site_id
            business_name = site_id.replace("-", " ").title()
            
            website_info = WebsiteInfo(
                site_id=site_id,
                business_name=business_name,
                path=str(path),
                created_at=datetime.now()
            )
            websites.append(website_info)
            job_storage.add_generated_website(job_id, website_info)
        
        # Update job status to completed
        job_storage.update_job_status(
            job_id=job_id,
            status=JobStatus.COMPLETED,
            completed_at=datetime.now()
        )
        
        # Broadcast completion
        asyncio.run(websocket_manager.broadcast_progress(
            job_id=job_id,
            step="completed",
            progress=100.0,
            details={
                "message": f"Successfully generated {len(websites)} websites",
                "websites": len(websites)
            }
        ))
        
        logger.info(f"Job {job_id} completed successfully. Generated {len(websites)} websites.")
        
    except Exception as e:
        logger.error(f"Error in website generation task for job {job_id}: {str(e)}", exc_info=True)
        
        # Update job status to failed
        job_storage.update_job_status(
            job_id=job_id,
            status=JobStatus.FAILED,
            completed_at=datetime.now(),
            error=str(e)
        )
        
        # Broadcast error
        try:
            asyncio.run(websocket_manager.broadcast_progress(
                job_id=job_id,
                step="failed",
                progress=0.0,
                details={"error": str(e)}
            ))
        except:
            pass
    
    finally:
        # Remove WebSocket handler if it exists
        if ws_handler:
            try:
                root_logger.removeHandler(ws_handler)
            except:
                pass
        else:
            # Fallback: remove any handler with this job_id
            for handler in root_logger.handlers[:]:
                if isinstance(handler, WebSocketLoggingHandler) and handler.job_id == job_id:
                    try:
                        root_logger.removeHandler(handler)
                    except:
                        pass
