"""Website validation service for deterministic website checking."""

import logging
from typing import Optional, Tuple
from urllib.parse import urlparse
import requests
from requests.exceptions import (
    RequestException,
    Timeout,
    ConnectionError,
    SSLError,
    TooManyRedirects
)

logger = logging.getLogger(__name__)


class WebsiteValidationService:
    """Service for deterministic website validation using HEAD requests."""
    
    def __init__(self, timeout: int = 5):
        """
        Initialize website validation service.
        
        Args:
            timeout: Request timeout in seconds (default: 5).
        """
        self.timeout = timeout
        self.user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
        logger.info(f"WebsiteValidationService initialized with timeout={timeout}s")
    
    def validate_website(self, website_url: Optional[str]) -> Tuple[bool, str]:
        """
        Validate a website URL using deterministic HEAD request.
        
        Logic:
        - If no website URL: hasWebsite=False, status="none"
        - If website URL exists:
          - Try HEAD request (5 sec timeout)
          - If response status 200-399: hasWebsite=True, status="valid"
          - Else: hasWebsite=False, status="invalid"
        
        Args:
            website_url: Website URL to validate (can be None).
        
        Returns:
            Tuple of (hasWebsite: bool, websiteStatus: str)
            where websiteStatus is "valid", "invalid", or "none".
        """
        if not website_url:
            logger.debug("No website URL provided")
            return (False, "none")
        
        website_url = website_url.strip()
        
        # Validate URL format
        try:
            parsed = urlparse(website_url)
            if not parsed.scheme or not parsed.netloc:
                logger.warning(f"Invalid URL format: {website_url}")
                return (False, "invalid")
        except Exception as e:
            logger.warning(f"Error parsing URL {website_url}: {str(e)}")
            return (False, "invalid")
        
        # Ensure URL has a scheme
        if not website_url.startswith(('http://', 'https://')):
            website_url = 'https://' + website_url
        
        # Make HEAD request
        try:
            headers = {
                'User-Agent': self.user_agent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
            
            try:
                response = requests.head(
                    website_url,
                    headers=headers,
                    timeout=self.timeout,
                    allow_redirects=True
                )
                
                # Check if status code is in 200-399 range
                if 200 <= response.status_code < 400:
                    logger.info(f"Website valid: {website_url} (status: {response.status_code})")
                    return (True, "valid")
                else:
                    logger.info(f"Website invalid: {website_url} (status: {response.status_code})")
                    return (False, "invalid")
                    
            except TooManyRedirects:
                logger.warning(f"Too many redirects for URL: {website_url}")
                return (False, "invalid")
            except SSLError as e:
                logger.warning(f"SSL error for URL {website_url}: {str(e)}")
                return (False, "invalid")
            except Timeout:
                logger.warning(f"Timeout while checking URL: {website_url}")
                return (False, "invalid")
            except ConnectionError as e:
                logger.warning(f"Connection error for URL {website_url}: {str(e)}")
                return (False, "invalid")
            except RequestException as e:
                logger.warning(f"Request error for URL {website_url}: {str(e)}")
                return (False, "invalid")
                
        except Exception as e:
            logger.error(
                f"Unexpected error validating URL {website_url}: {str(e)}",
                exc_info=True
            )
            return (False, "invalid")
