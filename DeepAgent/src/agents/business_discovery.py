"""Business discovery agent for finding businesses using Google Places API."""

import logging
from typing import List
from src.models.business import Business
from src.services.google_places import GooglePlacesService


logger = logging.getLogger(__name__)


class BusinessDiscoveryAgent:
    """Agent that discovers businesses using Google Places API."""
    
    def __init__(self, google_places_service: GooglePlacesService):
        """
        Initialize business discovery agent.
        
        Args:
            google_places_service: GooglePlacesService instance for searching businesses.
        """
        self.google_places_service = google_places_service
        logger.info("BusinessDiscoveryAgent initialized")
    
    def discover_businesses(
        self,
        industry: str,
        city: str,
        state: str
    ) -> List[Business]:
        """
        Discover businesses by industry and location.
        
        Args:
            industry: Industry keyword (e.g., "roofing", "plumbing").
            city: City name (e.g., "Austin").
            state: State abbreviation (e.g., "TX").
            
        Returns:
            List of Business objects found in the search.
        """
        logger.info(f"Discovering businesses: industry={industry}, city={city}, state={state}")
        
        try:
            businesses = self.google_places_service.search_businesses(
                industry=industry,
                city=city,
                state=state
            )
            
            logger.info(
                f"Business discovery completed: found {len(businesses)} businesses "
                f"for {industry} in {city}, {state}"
            )
            
            return businesses
            
        except Exception as e:
            logger.error(
                f"Error discovering businesses for {industry} in {city}, {state}: {str(e)}",
                exc_info=True
            )
            # On error, return empty list instead of crashing
            return []
