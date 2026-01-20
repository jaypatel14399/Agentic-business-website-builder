"""Website checker service for verifying website existence and accessibility."""

import logging
import re
from typing import Optional
from urllib.parse import urlparse
import requests
from requests.exceptions import (
    RequestException,
    Timeout,
    ConnectionError,
    SSLError,
    TooManyRedirects
)

from src.models.business import Business
from src.utils.config import Config


logger = logging.getLogger(__name__)


class WebsiteCheckerService:
    """Service for checking if a business has a valid, accessible website."""
    
    # Google Business Profile URL patterns
    GOOGLE_BUSINESS_PATTERNS = [
        r'https?://(www\.)?google\.com/maps/place/',
        r'https?://maps\.google\.com/',
        r'https?://g\.page/',
        r'https?://.*google\.com/maps',
        r'https?://.*google\.com/business',
    ]
    
    def __init__(self, config: Config):
        """
        Initialize website checker service.
        
        Args:
            config: Configuration instance containing settings.
        """
        self.config = config
        self.timeout = 10  # seconds
        self.max_redirects = 3
        self.user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
        logger.info("WebsiteCheckerService initialized")
    
    def is_google_business_profile(self, url: str) -> bool:
        """
        Detect if URL is a Google Business Profile link.
        
        Args:
            url: URL string to check.
            
        Returns:
            True if URL is a Google Business Profile link, False otherwise.
        """
        if not url:
            return False
        
        url_lower = url.lower().strip()
        
        # Check against known Google Business Profile patterns
        for pattern in self.GOOGLE_BUSINESS_PATTERNS:
            if re.search(pattern, url_lower):
                logger.debug(f"Detected Google Business Profile link: {url}")
                return True
        
        return False
    
    def verify_url_accessibility(self, url: str) -> bool:
        """
        Make HTTP request to verify URL is accessible.
        
        Args:
            url: URL string to verify.
            
        Returns:
            True if URL responds with 2xx status code, False otherwise.
        """
        if not url:
            return False
        
        try:
            # Validate URL format
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                logger.warning(f"Invalid URL format: {url}")
                return False
            
            # Ensure URL has a scheme
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            # Make HEAD request first (lighter, faster)
            headers = {
                'User-Agent': self.user_agent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
            
            try:
                response = requests.head(
                    url,
                    headers=headers,
                    timeout=self.timeout,
                    allow_redirects=True
                )
                
                # Check redirect count (requests follows up to 30 redirects by default)
                if len(response.history) > self.max_redirects:
                    logger.warning(
                        f"Too many redirects ({len(response.history)}) for URL: {url}"
                    )
                    return False
                
                # If HEAD is not allowed, try GET
                if response.status_code == 405:  # Method Not Allowed
                    logger.debug(f"HEAD not allowed for {url}, trying GET")
                    response = requests.get(
                        url,
                        headers=headers,
                        timeout=self.timeout,
                        allow_redirects=True,
                        stream=True  # Don't download full content
                    )
                    # Check redirect count for GET request
                    if len(response.history) > self.max_redirects:
                        logger.warning(
                            f"Too many redirects ({len(response.history)}) for URL: {url}"
                        )
                        response.close()
                        return False
                    # Close connection immediately
                    response.close()
                
                # Check if status code is in 2xx range
                if 200 <= response.status_code < 300:
                    logger.debug(f"URL accessible: {url} (status: {response.status_code})")
                    return True
                else:
                    logger.debug(
                        f"URL not accessible: {url} (status: {response.status_code})"
                    )
                    return False
                    
            except TooManyRedirects:
                logger.warning(f"Too many redirects for URL: {url}")
                return False
            except SSLError as e:
                logger.warning(f"SSL error for URL {url}: {str(e)}")
                return False
            except Timeout:
                logger.warning(f"Timeout while checking URL: {url}")
                return False
            except ConnectionError as e:
                logger.warning(f"Connection error for URL {url}: {str(e)}")
                return False
            except RequestException as e:
                logger.warning(f"Request error for URL {url}: {str(e)}")
                return False
                
        except Exception as e:
            logger.error(
                f"Unexpected error verifying URL {url}: {str(e)}",
                exc_info=True
            )
            return False
    
    def check_website_exists(self, website_url: str) -> bool:
        """
        Check if a website URL exists and is accessible.
        
        Args:
            website_url: Website URL string to check.
            
        Returns:
            True if URL is accessible and is a real website, False otherwise.
        """
        if not website_url:
            logger.debug("No website URL provided")
            return False
        
        website_url = website_url.strip()
        
        # Check if it's a Google Business Profile link
        if self.is_google_business_profile(website_url):
            logger.debug(f"URL is Google Business Profile, not a real website: {website_url}")
            return False
        
        # Verify URL accessibility
        is_accessible = self.verify_url_accessibility(website_url)
        
        if is_accessible:
            logger.info(f"Website exists and is accessible: {website_url}")
        else:
            logger.info(f"Website does not exist or is not accessible: {website_url}")
        
        return is_accessible
    
    def check_business_website(self, business: Business) -> Business:
        """
        Check if a business has a website and update the has_website field.
        
        Args:
            business: Business object to check.
            
        Returns:
            Updated Business object with has_website field set correctly.
        """
        logger.info(f"Checking website for business: {business.name}")
        
        # If no website_url, set has_website to False
        if not business.website_url:
            logger.debug(f"Business {business.name} has no website_url")
            updated_business = business.model_copy(update={'has_website': False})
            return updated_business
        
        # Check if website exists and is accessible
        has_website = self.check_website_exists(business.website_url)
        
        # Update business with new has_website value
        updated_business = business.model_copy(update={'has_website': has_website})
        
        logger.info(
            f"Business {business.name}: has_website={has_website}, "
            f"website_url={business.website_url}"
        )
        
        return updated_business
