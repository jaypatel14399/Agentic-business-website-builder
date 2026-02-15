"""Business discovery API routes."""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.services.discovery_service import DiscoveryService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["discovery"])


class DiscoveryRequest(BaseModel):
    """Request model for business discovery."""
    industry: str
    city: str
    state: str
    limit: Optional[int] = None


class DiscoveredBusinessResponse(BaseModel):
    """Response model for discovered business."""
    id: str  # Alias for place_id (backward compatibility)
    place_id: str
    name: str
    lat: float
    lng: float
    address: str
    phone: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    website: Optional[str] = None
    hasWebsite: bool
    websiteStatus: str  # "valid" | "invalid" | "none"
    
    class Config:
        """Pydantic configuration."""
        populate_by_name = True


@router.post("/discover", response_model=List[DiscoveredBusinessResponse])
async def discover(request: DiscoveryRequest):
    """
    Discover businesses using Google Places API with website validation.
    
    This endpoint does NOT create a job. It only returns discovered businesses
    for the frontend Map UI and manual selection.
    
    Args:
        request: Discovery request parameters.
    
    Returns:
        List of discovered businesses with normalized structure.
    """
    try:
        discovery_service = DiscoveryService()
        
        # Discover businesses
        businesses = discovery_service.discover_businesses(
            industry=request.industry,
            city=request.city,
            state=request.state,
            limit=request.limit
        )
        
        # Convert to response format
        results = [
            DiscoveredBusinessResponse(
                id=b['place_id'],  # Alias for backward compatibility
                place_id=b['place_id'],
                name=b['name'],
                lat=b['lat'],
                lng=b['lng'],
                address=b['address'],
                phone=b.get('phone'),
                rating=b.get('rating'),
                reviews=b.get('reviews'),
                website=b.get('website'),
                hasWebsite=b['hasWebsite'],
                websiteStatus=b['websiteStatus']
            )
            for b in businesses
        ]
        
        logger.info(f"Discovered {len(results)} businesses for {request.industry} in {request.city}, {request.state}")
        return results
    
    except Exception as e:
        logger.error(f"Error discovering businesses: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to discover businesses: {str(e)}")


@router.post("/discover-businesses", response_model=List[DiscoveredBusinessResponse])
async def discover_businesses(request: DiscoveryRequest):
    """
    Legacy endpoint - redirects to /discover.
    Kept for backward compatibility.
    """
    return await discover(request)


@router.post("/generate-website")
async def generate_website_for_business(request: dict):
    """
    Generate a website for a specific business.
    
    Note: This is a placeholder endpoint. In a full implementation,
    this would create a job for a single business.
    
    Args:
        request: Request body containing businessId.
    
    Returns:
        Job response.
    """
    # For now, return an error indicating this needs to be implemented
    # or redirect to the regular job creation endpoint
    raise HTTPException(
        status_code=501,
        detail="Single business website generation not yet implemented. Use the jobs endpoint instead."
    )
