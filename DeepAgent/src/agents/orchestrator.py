"""Orchestrator agent for coordinating the complete website generation workflow."""

import logging
from typing import List, Optional, Callable, Dict, Any
from pathlib import Path

from src.models.business import Business
from src.services.google_places import GooglePlacesService
from src.services.website_checker import WebsiteCheckerService
from src.services.website_scraper import WebsiteScraperService
from src.services.content_generator import ContentGeneratorService
from src.agents.business_discovery import BusinessDiscoveryAgent
from src.agents.website_detector import WebsiteDetectionAgent
from src.agents.competitor_analyzer import CompetitorAnalysisAgent
from src.agents.website_generator import WebsiteGenerationAgent
from src.generators.nextjs_generator import NextJSGenerator
from src.utils.config import Config


logger = logging.getLogger(__name__)


class OrchestratorAgent:
    """Main orchestrator agent that coordinates all other agents in the workflow."""
    
    def __init__(self, config: Config):
        """
        Initialize orchestrator agent with all required services and agents.
        
        Args:
            config: Configuration instance containing API keys and settings.
        """
        self.config = config
        
        # Initialize services
        logger.info("Initializing services...")
        google_places_service = GooglePlacesService(config)
        website_checker_service = WebsiteCheckerService(config)
        website_scraper_service = WebsiteScraperService(config)
        content_generator_service = ContentGeneratorService(config)
        
        # Initialize agents
        logger.info("Initializing agents...")
        self.business_discovery_agent = BusinessDiscoveryAgent(google_places_service)
        self.website_detection_agent = WebsiteDetectionAgent(website_checker_service)
        self.competitor_analysis_agent = CompetitorAnalysisAgent(
            config, 
            website_scraper_service
        )
        self.website_generation_agent = WebsiteGenerationAgent(
            config,
            content_generator_service
        )
        
        # Initialize generator
        logger.info("Initializing Next.js generator...")
        self.nextjs_generator = NextJSGenerator(config)
        
        logger.info("OrchestratorAgent initialized successfully")
    
    def generate_websites(
        self,
        industry: str,
        city: str,
        state: str,
        limit: Optional[int] = None,
        progress_callback: Optional[Callable[[str, float, Dict[str, Any]], None]] = None
    ) -> List[Path]:
        """
        Main entry point for generating websites for businesses without websites.
        
        Workflow:
        1. Discover businesses in the industry/location
        2. Detect which businesses have websites
        3. Filter businesses without websites
        4. For each business without website:
           - Find competitors
           - Analyze competitors
           - Generate website content
           - Generate Next.js site
        
        Args:
            industry: Industry keyword (e.g., "roofing", "plumbing").
            city: City name (e.g., "Austin").
            state: State abbreviation (e.g., "TX").
            limit: Optional limit on number of businesses to process.
            progress_callback: Optional callback function(step, progress, details) for progress updates.
        
        Returns:
            List of Paths to successfully generated websites.
        """
        logger.info(
            f"Starting website generation workflow: "
            f"industry={industry}, city={city}, state={state}, limit={limit}"
        )
        
        generated_paths = []
        
        try:
            # Step 1: Business Discovery
            if progress_callback:
                progress_callback("discovering_businesses", 5.0, {"message": "Discovering businesses..."})
            logger.info("Step 1: Discovering businesses...")
            businesses = self.business_discovery_agent.discover_businesses(
                industry=industry,
                city=city,
                state=state
            )
            
            if not businesses:
                logger.warning("No businesses found. Exiting workflow.")
                if progress_callback:
                    progress_callback("completed", 100.0, {"message": "No businesses found"})
                return generated_paths
            
            logger.info(f"Discovered {len(businesses)} businesses")
            if progress_callback:
                progress_callback("discovering_businesses", 20.0, {"businesses_found": len(businesses)})
            
            # Step 2: Website Detection
            if progress_callback:
                progress_callback("detecting_websites", 25.0, {"message": "Detecting existing websites..."})
            logger.info("Step 2: Detecting websites for businesses...")
            businesses_with_website_status = self.website_detection_agent.detect_websites(
                businesses
            )
            
            # Count how many have websites
            businesses_with_websites = [
                b for b in businesses_with_website_status if b.has_website
            ]
            logger.info(
                f"Website detection completed: "
                f"{len(businesses_with_websites)}/{len(businesses_with_website_status)} "
                f"businesses have websites"
            )
            if progress_callback:
                progress_callback("detecting_websites", 35.0, {
                    "businesses_with_websites": len(businesses_with_websites),
                    "total_businesses": len(businesses_with_website_status)
                })
            
            # Step 3: Filter Businesses Without Websites
            if progress_callback:
                progress_callback("filtering_businesses", 40.0, {"message": "Filtering businesses without websites..."})
            logger.info("Step 3: Filtering businesses without websites...")
            businesses_without_websites = [
                b for b in businesses_with_website_status 
                if not b.has_website
            ]
            
            if not businesses_without_websites:
                logger.info("All businesses have websites. No websites to generate.")
                if progress_callback:
                    progress_callback("completed", 100.0, {"message": "All businesses have websites"})
                return generated_paths
            
            # Apply limit if specified
            if limit and limit > 0:
                businesses_without_websites = businesses_without_websites[:limit]
                logger.info(f"Applied limit: processing {len(businesses_without_websites)} businesses")
            
            logger.info(
                f"Found {len(businesses_without_websites)} businesses without websites "
                f"to process"
            )
            if progress_callback:
                progress_callback("filtering_businesses", 45.0, {
                    "businesses_to_process": len(businesses_without_websites)
                })
            
            # Step 4: For Each Business Without Website
            total_businesses = len(businesses_without_websites)
            base_progress = 45.0
            progress_per_business = 50.0 / total_businesses if total_businesses > 0 else 0
            
            for idx, business in enumerate(businesses_without_websites, 1):
                current_progress = base_progress + (idx - 1) * progress_per_business
                if progress_callback:
                    progress_callback("processing_business", current_progress, {
                        "business_index": idx,
                        "total_businesses": total_businesses,
                        "business_name": business.name
                    })
                
                logger.info(
                    f"Processing business {idx}/{total_businesses}: {business.name}"
                )
                
                try:
                    # Step 4a: Find Competitors
                    if progress_callback:
                        progress_callback("finding_competitors", current_progress + progress_per_business * 0.1, {
                            "business_name": business.name,
                            "message": f"Finding competitors for {business.name}..."
                        })
                    logger.info(f"Finding competitors for {business.name}...")
                    competitors = self._find_competitors(
                        all_businesses=businesses_with_website_status,
                        target_business=business,
                        industry=industry,
                        city=city,
                        state=state,
                        max_competitors=self.config.competitor_analysis_max_competitors
                    )
                    
                    logger.info(
                        f"Found {len(competitors)} competitors for {business.name}"
                    )
                    
                    # Step 4b: Analyze Competitors
                    competitor_analysis = None
                    if competitors:
                        try:
                            if progress_callback:
                                progress_callback("analyzing_competitors", current_progress + progress_per_business * 0.2, {
                                    "business_name": business.name,
                                    "competitors_count": len(competitors),
                                    "message": f"Analyzing {len(competitors)} competitors..."
                                })
                            logger.info(
                                f"Analyzing competitors for {business.name}..."
                            )
                            competitor_analysis = self.competitor_analysis_agent.analyze_competitors(
                                competitor_businesses=competitors,
                                industry=industry,
                                city=city,
                                state=state
                            )
                            logger.info(
                                f"Competitor analysis completed for {business.name}"
                            )
                        except Exception as e:
                            logger.error(
                                f"Error analyzing competitors for {business.name}: {str(e)}",
                                exc_info=True
                            )
                            # Continue without competitor analysis
                            competitor_analysis = None
                    else:
                        logger.warning(
                            f"No competitors found for {business.name}. "
                            "Continuing without competitor analysis."
                        )
                    
                    # Step 4c: Generate Website Content
                    try:
                        if progress_callback:
                            progress_callback("generating_content", current_progress + progress_per_business * 0.5, {
                                "business_name": business.name,
                                "message": f"Generating content for {business.name}..."
                            })
                        logger.info(
                            f"Generating website content for {business.name}..."
                        )
                        content = self.website_generation_agent.generate_complete_website(
                            business=business,
                            competitor_analysis=competitor_analysis
                        )
                        
                        if not content:
                            logger.error(
                                f"Failed to generate content for {business.name}. "
                                "Skipping site generation."
                            )
                            continue
                        
                        logger.info(
                            f"Website content generated successfully for {business.name}"
                        )
                    except Exception as e:
                        logger.error(
                            f"Error generating content for {business.name}: {str(e)}",
                            exc_info=True
                        )
                        # Skip this business and continue
                        continue
                    
                    # Step 4d: Generate Next.js Site
                    try:
                        if progress_callback:
                            progress_callback("generating_site", current_progress + progress_per_business * 0.8, {
                                "business_name": business.name,
                                "message": f"Generating Next.js site for {business.name}..."
                            })
                        logger.info(
                            f"Generating Next.js site for {business.name}..."
                        )
                        site_path = self.nextjs_generator.generate_website(
                            business=business,
                            content=content
                        )
                        
                        generated_paths.append(site_path)
                        logger.info(
                            f"✓ Successfully generated website for {business.name} "
                            f"at {site_path}"
                        )
                        if progress_callback:
                            progress_callback("business_completed", current_progress + progress_per_business, {
                                "business_name": business.name,
                                "site_path": str(site_path),
                                "websites_generated": len(generated_paths)
                            })
                    except Exception as e:
                        logger.error(
                            f"Error generating Next.js site for {business.name}: {str(e)}",
                            exc_info=True
                        )
                        # Continue with next business
                        continue
                
                except Exception as e:
                    logger.error(
                        f"Unexpected error processing business {business.name}: {str(e)}",
                        exc_info=True
                    )
                    # Continue with next business
                    continue
            
            # Final summary
            logger.info(
                f"Workflow completed: Generated {len(generated_paths)}/{total_businesses} "
                f"websites successfully"
            )
            
            if progress_callback:
                progress_callback("completed", 100.0, {
                    "websites_generated": len(generated_paths),
                    "total_businesses": total_businesses,
                    "message": f"Successfully generated {len(generated_paths)} websites"
                })
            
            return generated_paths
            
        except Exception as e:
            logger.error(
                f"Critical error in workflow: {str(e)}",
                exc_info=True
            )
            # Return whatever we've generated so far
            return generated_paths
    
    def _find_competitors(
        self,
        all_businesses: List[Business],
        target_business: Business,
        industry: str,
        city: str,
        state: str,
        max_competitors: int = 5
    ) -> List[Business]:
        """
        Find top competitors for a target business.
        
        Criteria:
        - Same industry and location (city, state)
        - Has website (has_website=True)
        - Not the target business itself
        - Top-rated (sort by rating, highest first, then by number of reviews)
        - Limit to max_competitors
        
        Args:
            all_businesses: List of all businesses discovered.
            target_business: Business for which to find competitors.
            industry: Industry keyword.
            city: City name.
            state: State abbreviation.
            max_competitors: Maximum number of competitors to return.
        
        Returns:
            List of competitor Business objects.
        """
        logger.debug(
            f"Finding competitors for {target_business.name} "
            f"(industry={industry}, city={city}, state={state})"
        )
        
        # Filter competitors based on criteria
        competitors = []
        
        for business in all_businesses:
            # Skip if it's the target business itself
            if business.google_place_id == target_business.google_place_id:
                continue
            
            # Must have website
            if not business.has_website:
                continue
            
            # Must be in same industry
            if business.industry.lower() != industry.lower():
                continue
            
            # Must be in same city and state
            if business.city.lower() != city.lower():
                continue
            
            if business.state and state:
                if business.state.upper() != state.upper():
                    continue
            
            # Add to competitors list
            competitors.append(business)
        
        # Sort by rating (descending), then by number of reviews (descending)
        def sort_key(b: Business) -> tuple:
            rating = b.rating if b.rating is not None else 0.0
            num_reviews = len(b.reviews) if b.reviews else 0
            # Negate for descending order
            return (-rating, -num_reviews)
        
        competitors.sort(key=sort_key)
        
        # Limit to max_competitors
        competitors = competitors[:max_competitors]
        
        logger.debug(
            f"Found {len(competitors)} competitors for {target_business.name}"
        )
        
        return competitors
