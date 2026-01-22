"""In-memory job storage (can be upgraded to Redis/DB later)."""

import uuid
from datetime import datetime
from typing import Dict, Optional, List
from pathlib import Path

from api.models.job import JobResponse, JobStatus, JobRequest, WebsiteInfo


class JobStorage:
    """In-memory storage for jobs."""
    
    def __init__(self):
        """Initialize job storage."""
        self.jobs: Dict[str, JobResponse] = {}
    
    def create_job(self, request: JobRequest) -> str:
        """
        Create a new job.
        
        Args:
            request: Job request.
        
        Returns:
            Job ID.
        """
        job_id = f"job-{uuid.uuid4().hex[:8]}"
        
        job = JobResponse(
            job_id=job_id,
            status=JobStatus.PENDING,
            request=request,
            created_at=datetime.now()
        )
        
        self.jobs[job_id] = job
        return job_id
    
    def get_job(self, job_id: str) -> Optional[JobResponse]:
        """
        Get a job by ID.
        
        Args:
            job_id: Job ID.
        
        Returns:
            Job response or None if not found.
        """
        return self.jobs.get(job_id)
    
    def update_job_status(
        self,
        job_id: str,
        status: JobStatus,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        error: Optional[str] = None
    ) -> bool:
        """
        Update job status.
        
        Args:
            job_id: Job ID.
            status: New status.
            started_at: Optional start timestamp.
            completed_at: Optional completion timestamp.
            error: Optional error message.
        
        Returns:
            True if job was updated, False if not found.
        """
        if job_id not in self.jobs:
            return False
        
        job = self.jobs[job_id]
        job.status = status
        
        if started_at:
            job.started_at = started_at
        if completed_at:
            job.completed_at = completed_at
        if error:
            job.error = error
        
        return True
    
    def update_job_progress(self, job_id: str, progress_update) -> bool:
        """
        Update job progress.
        
        Args:
            job_id: Job ID.
            progress_update: ProgressUpdate object.
        
        Returns:
            True if job was updated, False if not found.
        """
        if job_id not in self.jobs:
            return False
        
        self.jobs[job_id].progress = progress_update
        return True
    
    def add_generated_website(self, job_id: str, website_info: WebsiteInfo) -> bool:
        """
        Add a generated website to a job.
        
        Args:
            job_id: Job ID.
            website_info: Website information.
        
        Returns:
            True if job was updated, False if not found.
        """
        if job_id not in self.jobs:
            return False
        
        self.jobs[job_id].generated_websites.append(website_info)
        return True
    
    def list_jobs(self, status: Optional[JobStatus] = None) -> List[JobResponse]:
        """
        List all jobs, optionally filtered by status.
        
        Args:
            status: Optional status filter.
        
        Returns:
            List of jobs.
        """
        jobs = list(self.jobs.values())
        
        if status:
            jobs = [job for job in jobs if job.status == status]
        
        # Sort by creation time (newest first)
        jobs.sort(key=lambda j: j.created_at, reverse=True)
        
        return jobs
    
    def delete_job(self, job_id: str) -> bool:
        """
        Delete a job.
        
        Args:
            job_id: Job ID.
        
        Returns:
            True if job was deleted, False if not found.
        """
        if job_id in self.jobs:
            del self.jobs[job_id]
            return True
        return False


# Global job storage instance
job_storage = JobStorage()
