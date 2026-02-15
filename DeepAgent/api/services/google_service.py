"""Google API service for geocoding and places."""

import logging
import time
from typing import Optional, Dict, Any, Tuple
import googlemaps
from googlemaps.exceptions import ApiError, HTTPError, Timeout

from src.utils.config import get_config

logger = logging.getLogger(__name__)


class GoogleService:
    """Service for Google Geocoding and Places API operations."""
    
    def __init__(self):
        """Initialize Google service with API key from config."""
        config = get_config()
        if not config.google_places_api_key:
            raise ValueError("GOOGLE_PLACES_API_KEY is required")
        
        self.client = googlemaps.Client(key=config.google_places_api_key)
        logger.info("GoogleService initialized")
    
    def geocode_location(self, city: str, state: str) -> Optional[Tuple[float, float]]:
        """
        Geocode city and state to get coordinates.
        
        Args:
            city: City name.
            state: State abbreviation.
        
        Returns:
            Tuple of (latitude, longitude) or None if geocoding fails.
        """
        try:
            address = f"{city}, {state}"
            logger.info(f"Geocoding location: {address}")
            
            geocode_result = self.client.geocode(address)
            
            if not geocode_result:
                logger.warning(f"No geocoding results for {address}")
                return None
            
            location = geocode_result[0]['geometry']['location']
            lat = location['lat']
            lng = location['lng']
            
            logger.info(f"Geocoded {address} to ({lat}, {lng})")
            return (lat, lng)
            
        except (ApiError, HTTPError, Timeout) as e:
            logger.error(f"Google Geocoding API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during geocoding: {str(e)}", exc_info=True)
            raise
    
    def search_places(self, query: str, limit: int = 20) -> list:
        """
        Search for places using Google Places Text Search.
        
        Args:
            query: Search query string.
            limit: Maximum number of results to return.
        
        Returns:
            List of place results from Google Places API.
        """
        try:
            logger.info(f"Searching places with query: {query}")
            
            places_result = self.client.places(query=query)
            
            if not places_result or 'results' not in places_result:
                logger.warning(f"No results found for query: {query}")
                return []
            
            places = places_result.get('results', [])
            logger.info(f"Found {len(places)} places from text search")
            
            # Limit results
            if limit:
                places = places[:limit]
            
            return places
            
        except (ApiError, HTTPError, Timeout) as e:
            logger.error(f"Google Places API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during places search: {str(e)}", exc_info=True)
            raise
    
    def get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information for a place using Place Details API.
        
        Args:
            place_id: Google Place ID.
        
        Returns:
            Place details dictionary or None if not found.
        """
        try:
            logger.debug(f"Fetching place details for place_id: {place_id}")
            
            place_details = self.client.place(
                place_id=place_id,
                fields=[
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'website',
                    'rating',
                    'user_ratings_total',
                    'geometry',
                    'place_id'
                ]
            )
            
            if not place_details or 'result' not in place_details:
                logger.warning(f"No details found for place_id: {place_id}")
                return None
            
            return place_details.get('result')
            
        except (ApiError, HTTPError, Timeout) as e:
            logger.error(f"Google Places API error for place_id {place_id}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching place details: {str(e)}", exc_info=True)
            return None
