"""Discovery service for business discovery workflow."""

import logging
import time
from typing import List, Dict, Any, Optional
from api.services.google_service import GoogleService
from api.services.website_validation_service import WebsiteValidationService

logger = logging.getLogger(__name__)


class DiscoveryService:
    """Service for discovering businesses with website validation."""
    
    def __init__(self):
        """Initialize discovery service with dependencies."""
        self.google_service = GoogleService()
        self.website_validator = WebsiteValidationService(timeout=5)
        logger.info("DiscoveryService initialized")
    
    def discover_businesses(
        self,
        industry: str,
        city: str,
        state: str,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Discover businesses using Google Places API and validate websites.
        
        Flow:
        1. Geocode city + state
        2. Call Google Places Text Search: "{industry} in {city}, {state}"
        3. Limit results to provided limit
        4. For each result, call Place Details API
        5. Validate website using deterministic HEAD request
        
        Args:
            industry: Industry keyword.
            city: City name.
            state: State abbreviation.
            limit: Maximum number of businesses to return.
        
        Returns:
            List of discovered business dictionaries with normalized structure.
        """
        try:
            # Step 1: Geocode location (optional, for map centering)
            coordinates = self.google_service.geocode_location(city, state)
            
            # Step 2: Search for places
            query = f"{industry} in {city}, {state}"
            places = self.google_service.search_places(query, limit=limit or 20)
            
            if not places:
                logger.warning(f"No places found for query: {query}")
                return []
            
            # Step 3: Get details for each place and validate websites
            results = []
            for idx, place in enumerate(places):
                try:
                    place_id = place.get('place_id')
                    if not place_id:
                        logger.warning(f"Place missing place_id, skipping")
                        continue
                    
                    # Get place details
                    place_details = self.google_service.get_place_details(place_id)
                    if not place_details:
                        logger.warning(f"Could not fetch details for place_id: {place_id}")
                        continue
                    
                    # Extract data
                    name = place_details.get('name', '')
                    address = place_details.get('formatted_address', '')
                    phone = place_details.get('formatted_phone_number')
                    website = place_details.get('website')
                    rating = place_details.get('rating')
                    reviews = place_details.get('user_ratings_total')
                    
                    # Get coordinates
                    geometry = place_details.get('geometry', {})
                    location = geometry.get('location', {})
                    lat = location.get('lat', 0.0)
                    lng = location.get('lng', 0.0)
                    
                    # Step 4: Validate website
                    has_website, website_status = self.website_validator.validate_website(website)
                    
                    # Build normalized response
                    business = {
                        'place_id': place_id,
                        'name': name,
                        'lat': lat,
                        'lng': lng,
                        'address': address,
                        'phone': phone,
                        'rating': rating,
                        'reviews': reviews,
                        'website': website,
                        'hasWebsite': has_website,
                        'websiteStatus': website_status
                    }
                    
                    results.append(business)
                    
                    # Rate limiting: add delay between Place Details API calls
                    if idx < len(places) - 1:
                        time.sleep(0.15)  # 150ms delay
                        
                except Exception as e:
                    logger.error(
                        f"Error processing place {place.get('place_id', 'unknown')}: {str(e)}",
                        exc_info=True
                    )
                    continue
            
            logger.info(f"Discovered {len(results)} businesses for {industry} in {city}, {state}")
            return results
            
        except Exception as e:
            logger.error(f"Error discovering businesses: {str(e)}", exc_info=True)
            raise
