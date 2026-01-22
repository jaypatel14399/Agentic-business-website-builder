"""Pydantic models for job management."""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pathlib import Path

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Job status enumeration."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobRequest(BaseModel):
    """Request model for starting a new job."""
    industry: str = Field(..., description="Industry keyword (e.g., 'roofing', 'plumbing')")
    city: str = Field(..., description="City name (e.g., 'Austin')")
    state: str = Field(..., description="State abbreviation (e.g., 'TX')")
    limit: Optional[int] = Field(None, description="Limit number of businesses to process")
    
    class Config:
        json_schema_extra = {
            "example": {
                "industry": "roofing",
                "city": "Austin",
                "state": "TX",
                "limit": 5
            }
        }


class ProgressUpdate(BaseModel):
    """Progress update model."""
    step: str = Field(..., description="Current workflow step")
    progress: float = Field(..., ge=0.0, le=100.0, description="Progress percentage")
    details: Dict[str, Any] = Field(default_factory=dict, description="Additional progress details")
    timestamp: datetime = Field(default_factory=datetime.now)


class WebsiteInfo(BaseModel):
    """Information about a generated website."""
    site_id: str = Field(..., description="Unique site identifier")
    business_name: str = Field(..., description="Business name")
    path: str = Field(..., description="Path to generated website")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "site_id": "abc-roofing-company",
                "business_name": "ABC Roofing Company",
                "path": "generated_sites/abc-roofing-company",
                "created_at": "2024-01-15T10:30:00"
            }
        }


class JobResponse(BaseModel):
    """Response model for job information."""
    job_id: str = Field(..., description="Unique job identifier")
    status: JobStatus = Field(..., description="Current job status")
    request: JobRequest = Field(..., description="Original job request")
    created_at: datetime = Field(..., description="Job creation timestamp")
    started_at: Optional[datetime] = Field(None, description="Job start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Job completion timestamp")
    progress: Optional[ProgressUpdate] = Field(None, description="Current progress")
    generated_websites: List[WebsiteInfo] = Field(default_factory=list, description="Generated websites")
    error: Optional[str] = Field(None, description="Error message if job failed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job-123",
                "status": "running",
                "request": {
                    "industry": "roofing",
                    "city": "Austin",
                    "state": "TX",
                    "limit": 5
                },
                "created_at": "2024-01-15T10:00:00",
                "started_at": "2024-01-15T10:00:05",
                "progress": {
                    "step": "generating_content",
                    "progress": 50.0,
                    "details": {"business_index": 2, "total_businesses": 5}
                },
                "generated_websites": []
            }
        }


class WebsiteListResponse(BaseModel):
    """Response model for website list."""
    websites: List[WebsiteInfo] = Field(..., description="List of generated websites")
    total: int = Field(..., description="Total number of websites")
