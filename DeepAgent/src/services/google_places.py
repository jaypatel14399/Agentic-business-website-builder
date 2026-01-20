"""Google Places API service for business discovery."""

import logging
import time
from typing import List, Optional, Dict, Any
import googlemaps
from googlemaps.exceptions import ApiError, HTTPError, Timeout

from src.models.business import Business
from src.utils.config import Config


logger = logging.getLogger(__name__)


class GooglePlacesService:
    """Service for searching businesses using Google Places API."""
    
    # Generic types to filter out from place types
    GENERIC_TYPES = {
        'establishment',
        'point_of_interest',
        'premise',
        'subpremise'
    }
    
    def __init__(self, config: Config):
        """
        Initialize Google Places service.
        
        Args:
            config: Configuration instance containing API key and settings.
            
        Raises:
            ValueError: If API key is not configured.
        """
        if not config.google_places_api_key:
            raise ValueError("Google Places API key is required")
        
        self.config = config
        self.client = googlemaps.Client(key=config.google_places_api_key)
        self.max_results = config.google_places_max_results
        logger.info(f"GooglePlacesService initialized with max_results={self.max_results}")
    
    def search_businesses(
        self,
        industry: str,
        city: str,
        state: str
    ) -> List[Business]:
        """
        Search for businesses by industry and location.
        
        Args:
            industry: Industry keyword (e.g., "roofing", "plumbing").
            city: City name (e.g., "Austin").
            state: State abbreviation (e.g., "TX").
            
        Returns:
            List of Business objects found in the search.
            
        Raises:
            ApiError: If Google Places API returns an error.
            HTTPError: If there's a network error.
            Timeout: If the request times out.
        """
        # Construct search query
        query = f"{industry} in {city}, {state}"
        logger.info(f"Searching for businesses: {query}")
        
        businesses = []
        
        try:
            # Perform text search
            places_result = self.client.places(query=query)
            
            if not places_result or 'results' not in places_result:
                logger.warning(f"No results found for query: {query}")
                return businesses
            
            places = places_result.get('results', [])
            logger.info(f"Found {len(places)} places from text search")
            
            # Limit results to max_results
            places = places[:self.max_results]
            
            # Process each place
            for idx, place in enumerate(places):
                try:
                    business = self._extract_business_from_place(
                        place=place,
                        industry=industry,
                        city=city,
                        state=state
                    )
                    
                    if business:
                        businesses.append(business)
                        logger.debug(f"Extracted business: {business.name}")
                    
                    # Rate limiting: add delay between Place Details API calls
                    if idx < len(places) - 1:  # Don't delay after last item
                        time.sleep(0.15)  # 150ms delay between calls
                        
                except Exception as e:
                    logger.error(
                        f"Error processing place {place.get('place_id', 'unknown')}: {str(e)}",
                        exc_info=True
                    )
                    # Continue with next place instead of failing completely
                    continue
            
            logger.info(f"Successfully extracted {len(businesses)} businesses")
            return businesses
            
        except ApiError as e:
            logger.error(f"Google Places API error: {str(e)}")
            raise
        except HTTPError as e:
            logger.error(f"HTTP error during Google Places API call: {str(e)}")
            raise
        except Timeout as e:
            logger.error(f"Timeout during Google Places API call: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during business search: {str(e)}", exc_info=True)
            raise
    
    def _extract_business_from_place(
        self,
        place: Dict[str, Any],
        industry: str,
        city: str,
        state: str
    ) -> Optional[Business]:
        """
        Extract business information from a Google Places result.
        
        Args:
            place: Place data from Google Places API.
            industry: Industry keyword from search.
            city: City name from search.
            state: State abbreviation from search.
            
        Returns:
            Business object if extraction successful, None otherwise.
        """
        place_id = place.get('place_id')
        if not place_id:
            logger.warning("Place missing place_id, skipping")
            return None
        
        # Get place details for additional information
        place_details = self._get_place_details(place_id)
        
        # Merge place data with details (details take precedence)
        merged_place = {**place, **place_details} if place_details else place
        
        try:
            # Extract basic information
            name = merged_place.get('name')
            if not name:
                logger.warning(f"Place {place_id} missing name, skipping")
                return None
            
            address = merged_place.get('formatted_address', '')
            
            # Extract phone number (prefer international_phone_number)
            phone = (
                merged_place.get('international_phone_number') or
                merged_place.get('formatted_phone_number') or
                None
            )
            
            # Extract website URL
            website_url = merged_place.get('website')
            
            # Extract rating
            rating = merged_place.get('rating')
            if rating is not None:
                try:
                    rating = float(rating)
                except (ValueError, TypeError):
                    rating = None
            
            # Extract location coordinates
            geometry = merged_place.get('geometry', {})
            location = geometry.get('location', {})
            latitude = location.get('lat')
            longitude = location.get('lng')
            
            # Extract business status
            business_status = merged_place.get('business_status')
            
            # Extract price level
            price_level = merged_place.get('price_level')
            if price_level is not None:
                try:
                    price_level = int(price_level)
                except (ValueError, TypeError):
                    price_level = None
            
            # Extract and filter types
            types = merged_place.get('types', [])
            filtered_types = [
                t for t in types
                if t.lower() not in self.GENERIC_TYPES
            ]
            
            # Extract reviews (up to 5 most recent)
            reviews = merged_place.get('reviews', [])
            if reviews:
                # Sort by time (most recent first) and limit to 5
                sorted_reviews = sorted(
                    reviews,
                    key=lambda r: r.get('time', 0),
                    reverse=True
                )[:5]
                reviews = sorted_reviews
            else:
                reviews = []
            
            # Create Business object
            business = Business(
                name=name,
                address=address,
                phone=phone,
                industry=industry,
                city=city,
                state=state,
                website_url=website_url,
                has_website=False,  # Will be determined by Website Detection Agent later
                google_place_id=place_id,
                rating=rating,
                reviews=reviews,
                latitude=latitude,
                longitude=longitude,
                business_status=business_status,
                price_level=price_level,
                types=filtered_types
            )
            
            return business
            
        except Exception as e:
            logger.error(
                f"Error extracting business data from place {place_id}: {str(e)}",
                exc_info=True
            )
            return None
    
    def _get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information for a place using Place Details API.
        
        Args:
            place_id: Google Places place ID.
            
        Returns:
            Place details dictionary, or None if request fails.
        """
        # Request only the fields we need
        fields = [
            'name',
            'formatted_address',
            'international_phone_number',
            'formatted_phone_number',
            'website',
            'rating',
            'reviews',
            'geometry',
            'business_status',
            'price_level',
            'types'
        ]
        
        try:
            result = self.client.place(
                place_id=place_id,
                fields=fields
            )
            
            if result and 'result' in result:
                return result['result']
            
            return None
            
        except ApiError as e:
            # Handle rate limiting with exponential backoff
            if hasattr(e, 'status') and e.status == 429:
                logger.warning(f"Rate limit hit for place {place_id}, retrying with backoff")
                time.sleep(1.0)  # Wait 1 second
                try:
                    result = self.client.place(
                        place_id=place_id,
                        fields=fields
                    )
                    if result and 'result' in result:
                        return result['result']
                except Exception as retry_error:
                    logger.error(
                        f"Retry failed for place {place_id}: {str(retry_error)}"
                    )
            
            logger.warning(
                f"Failed to get place details for {place_id}: {str(e)}"
            )
            return None
            
        except (HTTPError, Timeout) as e:
            logger.warning(
                f"Network error getting place details for {place_id}: {str(e)}"
            )
            return None
            
        except Exception as e:
            logger.error(
                f"Unexpected error getting place details for {place_id}: {str(e)}",
                exc_info=True
            )
            return None
