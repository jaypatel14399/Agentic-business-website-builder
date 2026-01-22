"""Website management API routes."""

import logging
from pathlib import Path
from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException

from api.models.job import WebsiteInfo, WebsiteListResponse
from api.storage.job_storage import job_storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/websites", tags=["websites"])


@router.get("", response_model=WebsiteListResponse)
async def list_websites():
    """
    List all generated websites from all jobs.
    
    Returns:
        List of generated websites.
    """
    try:
        # Get all completed jobs
        all_jobs = job_storage.list_jobs()
        
        # Collect all websites
        all_websites = []
        seen_paths = set()
        
        for job in all_jobs:
            for website in job.generated_websites:
                # Avoid duplicates based on path
                if website.path not in seen_paths:
                    all_websites.append(website)
                    seen_paths.add(website.path)
        
        # Sort by creation time (newest first)
        all_websites.sort(key=lambda w: w.created_at, reverse=True)
        
        return WebsiteListResponse(
            websites=all_websites,
            total=len(all_websites)
        )
    
    except Exception as e:
        logger.error(f"Error listing websites: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list websites: {str(e)}")


@router.get("/{site_id}", response_model=WebsiteInfo)
async def get_website(site_id: str):
    """
    Get website information by site ID.
    
    Args:
        site_id: Site ID (directory name).
    
    Returns:
        Website information.
    """
    try:
        # Search through all jobs
        all_jobs = job_storage.list_jobs()
        
        for job in all_jobs:
            for website in job.generated_websites:
                if website.site_id == site_id:
                    return website
        
        raise HTTPException(status_code=404, detail=f"Website {site_id} not found")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting website {site_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get website: {str(e)}")


@router.delete("/{site_id}", status_code=204)
async def delete_website(site_id: str):
    """
    Delete a generated website.
    
    Args:
        site_id: Site ID (directory name).
    
    Returns:
        No content on success.
    """
    try:
        # Find the website
        all_jobs = job_storage.list_jobs()
        website_path = None
        
        for job in all_jobs:
            for website in job.generated_websites:
                if website.site_id == site_id:
                    website_path = Path(website.path)
                    break
            if website_path:
                break
        
        if not website_path:
            raise HTTPException(status_code=404, detail=f"Website {site_id} not found")
        
        # Delete the directory
        if website_path.exists():
            import shutil
            shutil.rmtree(website_path)
            logger.info(f"Deleted website directory: {website_path}")
        else:
            logger.warning(f"Website directory does not exist: {website_path}")
        
        # Note: We don't remove it from job_storage for historical record
        # In a production system, you might want to mark it as deleted
        
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=204, content=None)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting website {site_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete website: {str(e)}")
