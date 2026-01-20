"""Website generation agent for orchestrating website content generation."""

import logging
from typing import Dict, Any, Optional

from src.models.business import Business, CompetitorAnalysis, WebsiteRequirements
from src.services.content_generator import ContentGeneratorService
from src.utils.config import Config


logger = logging.getLogger(__name__)


class WebsiteGenerationAgent:
    """Agent that orchestrates website content generation."""
    
    def __init__(
        self,
        config: Config,
        content_service: Optional[ContentGeneratorService] = None
    ):
        """
        Initialize website generation agent.
        
        Args:
            config: Configuration instance containing LLM settings.
            content_service: Optional ContentGeneratorService instance.
                           If None, creates a new one.
        """
        self.config = config
        self.content_service = content_service or ContentGeneratorService(config)
        
        logger.info("WebsiteGenerationAgent initialized")
    
    def generate_website_content(
        self,
        requirements: WebsiteRequirements
    ) -> Dict[str, Any]:
        """
        Generate website content from requirements.
        
        Args:
            requirements: WebsiteRequirements object with business info and requirements.
            
        Returns:
            Dictionary with structured website content.
        """
        logger.info(
            f"Starting website content generation for: {requirements.business.name}"
        )
        
        try:
            content = self.content_service.generate_website_content(requirements)
            
            logger.info(
                f"Successfully generated website content for: {requirements.business.name}"
            )
            
            return content
            
        except Exception as e:
            logger.error(
                f"Error generating website content: {str(e)}",
                exc_info=True
            )
            # Return empty dict on error (don't crash)
            return {}
    
    def prepare_website_requirements(
        self,
        business: Business,
        competitor_analysis: Optional[CompetitorAnalysis] = None,
        **kwargs
    ) -> WebsiteRequirements:
        """
        Helper method to create WebsiteRequirements from Business and optional CompetitorAnalysis.
        
        Args:
            business: Business object.
            competitor_analysis: Optional CompetitorAnalysis object.
            **kwargs: Optional overrides for:
                - brand_tone: str
                - target_audience: str
                - primary_services: List[str]
                - seo_focus_keywords: List[str]
                - include_contact_form: bool
                - include_testimonials: bool
                - include_blog: bool
                - color_scheme: str
                - custom_pages: List[str]
                - generation_notes: str
        
        Returns:
            WebsiteRequirements object ready for content generation.
        """
        logger.info(f"Preparing website requirements for: {business.name}")
        
        # Extract primary services from competitor analysis if not provided
        primary_services = kwargs.get('primary_services')
        if not primary_services and competitor_analysis:
            primary_services = competitor_analysis.key_services[:5]  # Limit to 5 services
            logger.info(
                f"Extracted {len(primary_services)} primary services from competitor analysis"
            )
        
        # Extract SEO keywords from competitor analysis if not provided
        seo_focus_keywords = kwargs.get('seo_focus_keywords')
        if not seo_focus_keywords and competitor_analysis:
            seo_focus_keywords = competitor_analysis.seo_keywords[:10]  # Limit to 10 keywords
            logger.info(
                f"Extracted {len(seo_focus_keywords)} SEO keywords from competitor analysis"
            )
        
        # Set defaults based on business and industry
        brand_tone = kwargs.get('brand_tone', 'professional')
        target_audience = kwargs.get('target_audience')
        if not target_audience:
            # Default target audience based on industry
            if business.industry in ['roofing', 'plumbing', 'electrical', 'hvac']:
                target_audience = 'Homeowners and property managers'
            elif business.industry in ['restaurant', 'cafe', 'food']:
                target_audience = 'Local residents and visitors'
            else:
                target_audience = 'Local customers and businesses'
        
        # Create WebsiteRequirements
        requirements = WebsiteRequirements(
            business=business,
            competitor_analysis=competitor_analysis,
            target_audience=target_audience,
            primary_services=primary_services or [],
            brand_tone=brand_tone,
            color_scheme=kwargs.get('color_scheme'),
            include_contact_form=kwargs.get('include_contact_form', True),
            include_testimonials=kwargs.get('include_testimonials', True),
            include_blog=kwargs.get('include_blog', False),
            seo_focus_keywords=seo_focus_keywords or [],
            custom_pages=kwargs.get('custom_pages', []),
            generation_notes=kwargs.get('generation_notes')
        )
        
        logger.info(
            f"Website requirements prepared: "
            f"{len(requirements.primary_services)} services, "
            f"{len(requirements.seo_focus_keywords)} SEO keywords"
        )
        
        return requirements
    
    def generate_complete_website(
        self,
        business: Business,
        competitor_analysis: Optional[CompetitorAnalysis] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Convenience method that combines preparation and generation.
        
        This is the main method that will be called by Orchestrator.
        
        Args:
            business: Business object.
            competitor_analysis: Optional CompetitorAnalysis object.
            **kwargs: Optional overrides for requirements (see prepare_website_requirements).
        
        Returns:
            Dictionary with structured website content.
        """
        logger.info(
            f"Generating complete website for: {business.name}"
        )
        
        try:
            # Prepare requirements
            requirements = self.prepare_website_requirements(
                business=business,
                competitor_analysis=competitor_analysis,
                **kwargs
            )
            
            # Generate content
            content = self.generate_website_content(requirements)
            
            logger.info(
                f"Complete website generation finished for: {business.name}"
            )
            
            return content
            
        except Exception as e:
            logger.error(
                f"Error in complete website generation: {str(e)}",
                exc_info=True
            )
            # Return empty dict on error (don't crash)
            return {}
