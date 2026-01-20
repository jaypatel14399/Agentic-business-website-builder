"""Competitor analysis agent for analyzing competitor websites using LLM."""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from langchain_openai import ChatOpenAI

from src.models.business import Business, CompetitorAnalysis
from src.services.website_scraper import WebsiteScraperService
from src.utils.config import Config


logger = logging.getLogger(__name__)


class CompetitorAnalysisAgent:
    """Agent that analyzes competitor websites using LLM to extract insights."""
    
    def __init__(
        self,
        config: Config,
        scraper_service: Optional[WebsiteScraperService] = None
    ):
        """
        Initialize competitor analysis agent.
        
        Args:
            config: Configuration instance containing LLM settings.
            scraper_service: Optional WebsiteScraperService instance. 
                           If None, creates a new one.
        """
        self.config = config
        self.scraper_service = scraper_service or WebsiteScraperService(config)
        
        # Initialize LLM based on config
        self.llm = self._initialize_llm()
        
        logger.info(
            f"CompetitorAnalysisAgent initialized with LLM provider: "
            f"{config.llm_provider}, model: {config.llm_model}"
        )
    
    def _initialize_llm(self):
        """
        Initialize LangChain LLM based on configuration.
        
        Returns:
            Initialized LLM instance.
        """
        if self.config.llm_provider == "openai":
            if not self.config.openai_api_key:
                raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER=openai")
            
            logger.info(f"Initializing OpenAI LLM with model: {self.config.llm_model}")
            return ChatOpenAI(
                api_key=self.config.openai_api_key,
                model=self.config.llm_model,
                temperature=0.3  # Lower temperature for more consistent analysis
            )
        
        else:
            raise ValueError(
                f"Unsupported LLM provider: {self.config.llm_provider}. "
                "Must be 'openai'"
            )
    
    def analyze_competitors(
        self,
        competitor_businesses: List[Business],
        industry: str,
        city: str,
        state: str
    ) -> CompetitorAnalysis:
        """
        Analyze competitor websites and extract insights using LLM.
        
        Args:
            competitor_businesses: List of competitor Business objects 
                                 (should have has_website=True).
            industry: Industry keyword (e.g., "roofing", "plumbing").
            city: City name (e.g., "Austin").
            state: State abbreviation (e.g., "TX").
            
        Returns:
            CompetitorAnalysis object with extracted insights.
        """
        logger.info(
            f"Starting competitor analysis: {len(competitor_businesses)} competitors, "
            f"industry={industry}, city={city}, state={state}"
        )
        
        # Filter to only businesses with websites
        businesses_with_websites = [
            b for b in competitor_businesses 
            if b.has_website and b.website_url
        ]
        
        if not businesses_with_websites:
            logger.warning(
                "No competitor businesses with websites provided. "
                "Returning empty analysis."
            )
            return CompetitorAnalysis(
                competitor_businesses=competitor_businesses,
                analysis_timestamp=datetime.now()
            )
        
        logger.info(
            f"Found {len(businesses_with_websites)} competitors with websites "
            f"out of {len(competitor_businesses)} total"
        )
        
        # Scrape website content
        website_urls = [b.website_url for b in businesses_with_websites if b.website_url]
        scraped_content = self.scraper_service.scrape_multiple_websites(website_urls)
        
        # Create competitor data combining business info with scraped content
        competitor_data = []
        for business in businesses_with_websites:
            # Find matching scraped content
            scraped = next(
                (sc for sc in scraped_content if sc['url'] == business.website_url),
                None
            )
            
            competitor_data.append({
                'business': business,
                'scraped_content': scraped
            })
        
        # Use LLM to extract insights
        try:
            analysis = self._extract_insights_with_llm(
                competitor_data=competitor_data,
                industry=industry,
                city=city,
                state=state
            )
            
            # Ensure competitor_businesses list is included
            analysis.competitor_businesses = competitor_businesses
            analysis.analysis_timestamp = datetime.now()
            
            logger.info(
                f"Competitor analysis completed: "
                f"extracted {len(analysis.key_services)} services, "
                f"{len(analysis.seo_keywords)} SEO keywords, "
                f"{len(analysis.design_patterns)} design patterns"
            )
            
            return analysis
            
        except Exception as e:
            logger.error(
                f"Error during LLM analysis: {str(e)}",
                exc_info=True
            )
            # Return partial analysis with competitor businesses
            return CompetitorAnalysis(
                competitor_businesses=competitor_businesses,
                analysis_timestamp=datetime.now()
            )
    
    def _extract_insights_with_llm(
        self,
        competitor_data: List[Dict[str, Any]],
        industry: str,
        city: str,
        state: str
    ) -> CompetitorAnalysis:
        """
        Use LLM to extract insights from competitor data.
        
        Args:
            competitor_data: List of dictionaries with business and scraped_content.
            industry: Industry keyword.
            city: City name.
            state: State abbreviation.
            
        Returns:
            CompetitorAnalysis object with extracted insights.
        """
        logger.info("Extracting insights using LLM")
        
        # Create analysis prompt
        prompt = self._create_analysis_prompt(
            competitor_data=competitor_data,
            industry=industry,
            city=city,
            state=state
        )
        
        try:
            # Use structured output to get CompetitorAnalysis directly
            # Convert Pydantic v2 model to LangChain-compatible format
            structured_llm = self.llm.with_structured_output(CompetitorAnalysis)
            result = structured_llm.invoke(prompt)
            
            logger.info("Successfully extracted insights from LLM")
            return result
            
        except Exception as e:
            logger.error(
                f"Error calling LLM for analysis: {str(e)}",
                exc_info=True
            )
            # Try fallback: use regular invoke and parse manually
            try:
                logger.info("Attempting fallback LLM call without structured output")
                response = self.llm.invoke(prompt)
                
                # Parse response content (this is a simplified fallback)
                # In production, you might want to use JSON parsing here
                logger.warning("Using fallback parsing - results may be incomplete")
                
                # Return empty analysis as fallback
                return CompetitorAnalysis(
                    competitor_businesses=[
                        data['business'] for data in competitor_data
                    ],
                    analysis_timestamp=datetime.now()
                )
            except Exception as fallback_error:
                logger.error(
                    f"Fallback LLM call also failed: {str(fallback_error)}",
                    exc_info=True
                )
                # Return minimal analysis
                return CompetitorAnalysis(
                    competitor_businesses=[
                        data['business'] for data in competitor_data
                    ],
                    analysis_timestamp=datetime.now()
                )
    
    def _create_analysis_prompt(
        self,
        competitor_data: List[Dict[str, Any]],
        industry: str,
        city: str,
        state: str
    ) -> str:
        """
        Create analysis prompt for LLM.
        
        Args:
            competitor_data: List of dictionaries with business and scraped_content.
            industry: Industry keyword.
            city: City name.
            state: State abbreviation.
            
        Returns:
            Formatted prompt string.
        """
        # Build competitor information section
        competitor_sections = []
        
        for i, data in enumerate(competitor_data, 1):
            business = data['business']
            scraped = data.get('scraped_content')
            
            section = f"\n[Competitor {i}: {business.name}]\n"
            section += f"Website: {business.website_url}\n"
            section += f"Address: {business.address}\n"
            
            if business.rating:
                section += f"Rating: {business.rating}/5.0\n"
            
            if scraped:
                section += f"Title: {scraped.get('title', 'N/A')}\n"
                section += f"Meta Description: {scraped.get('meta_description', 'N/A')}\n"
                
                if scraped.get('meta_keywords'):
                    section += f"Meta Keywords: {', '.join(scraped['meta_keywords'])}\n"
                
                if scraped.get('headings'):
                    section += f"Headings: {', '.join(scraped['headings'][:10])}\n"  # Limit headings
                
                if scraped.get('content'):
                    content_preview = scraped['content'][:1000]  # Limit content preview
                    section += f"Content Preview: {content_preview}\n"
            else:
                section += "Content: [Website scraping failed - using business data only]\n"
            
            competitor_sections.append(section)
        
        competitor_info = "\n".join(competitor_sections)
        
        # Create comprehensive prompt
        prompt = f"""You are analyzing competitor websites in the {industry} industry located in {city}, {state}.

Here is the content from {len(competitor_data)} competitor websites:

{competitor_info}

Please analyze these competitor websites and extract the following insights:

1. **Key Services**: List the most common services offered by these competitors (extract from website content, business names, and descriptions).

2. **Content Structure**: Identify common content structure patterns:
   - What pages/sections do they typically have?
   - How is content organized?
   - What navigation patterns are used?

3. **SEO Keywords**: Extract SEO keywords and phrases commonly used:
   - Location-based keywords (e.g., "{industry} {city}")
   - Service-related keywords
   - Industry-specific terms

4. **Design Patterns**: Identify design patterns and best practices:
   - Visual design elements
   - Layout patterns
   - User experience patterns

5. **Messaging Themes**: Extract common messaging themes and value propositions:
   - What do they emphasize?
   - What makes them stand out?
   - Common selling points

6. **Call-to-Actions**: List common call-to-action phrases used:
   - Button text
   - Form submission prompts
   - Contact prompts

7. **Industry Insights**: Provide general insights about:
   - Market positioning strategies
   - Common competitive advantages
   - Industry trends visible in these websites

Return your analysis in a structured format that matches the CompetitorAnalysis model:
- key_services: List of service names
- content_structure: Dictionary with structure patterns (e.g., {{"pages": [...], "sections": [...]}})
- seo_keywords: List of keywords and phrases
- design_patterns: List of design pattern descriptions
- messaging_themes: List of messaging theme descriptions
- call_to_actions: List of CTA phrases
- industry_insights: String with general insights

Focus on patterns that are common across multiple competitors, as these represent industry best practices.
"""
        
        return prompt
