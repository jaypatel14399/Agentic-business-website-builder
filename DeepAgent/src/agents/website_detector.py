"""Website detection agent for checking if businesses have websites."""

import logging
from typing import List
from src.models.business import Business
from src.services.website_checker import WebsiteCheckerService


logger = logging.getLogger(__name__)


class WebsiteDetectionAgent:
    """Agent that detects whether businesses have accessible websites."""
    
    def __init__(self, website_checker_service: WebsiteCheckerService):
        """
        Initialize website detection agent.
        
        Args:
            website_checker_service: WebsiteCheckerService instance for checking websites.
        """
        self.website_checker = website_checker_service
        logger.info("WebsiteDetectionAgent initialized")
    
    def detect_website(self, business: Business) -> Business:
        """
        Detect if a business has a website and update the business object.
        
        Args:
            business: Business object to check for website.
            
        Returns:
            Updated Business object with has_website field set correctly.
        """
        logger.info(f"Detecting website for business: {business.name}")
        
        try:
            updated_business = self.website_checker.check_business_website(business)
            
            logger.info(
                f"Website detection completed for {business.name}: "
                f"has_website={updated_business.has_website}"
            )
            
            return updated_business
            
        except Exception as e:
            logger.error(
                f"Error detecting website for business {business.name}: {str(e)}",
                exc_info=True
            )
            # On error, assume no website and return business with has_website=False
            return business.model_copy(update={'has_website': False})
    
    def detect_websites(self, businesses: List[Business]) -> List[Business]:
        """
        Detect websites for multiple businesses in batch.
        
        Args:
            businesses: List of Business objects to check for websites.
            
        Returns:
            List of updated Business objects with has_website fields set correctly.
        """
        logger.info(f"Detecting websites for {len(businesses)} businesses")
        
        updated_businesses = []
        
        for business in businesses:
            try:
                updated_business = self.detect_website(business)
                updated_businesses.append(updated_business)
            except Exception as e:
                logger.error(
                    f"Error processing business {business.name}: {str(e)}",
                    exc_info=True
                )
                # On error, add business with has_website=False
                updated_businesses.append(
                    business.model_copy(update={'has_website': False})
                )
        
        # Count how many have websites
        websites_found = sum(1 for b in updated_businesses if b.has_website)
        logger.info(
            f"Website detection completed: {websites_found}/{len(businesses)} "
            f"businesses have websites"
        )
        
        return updated_businesses
