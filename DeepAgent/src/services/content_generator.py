"""Content generation service for creating website content using LLM."""

import json
import logging
import re
from typing import Dict, Any, Optional
from datetime import datetime

from langchain_openai import ChatOpenAI

from src.models.business import WebsiteRequirements
from src.utils.config import Config


logger = logging.getLogger(__name__)


class ContentGeneratorService:
    """Service that generates website content using LLM."""
    
    def __init__(self, config: Config):
        """
        Initialize content generator service.
        
        Args:
            config: Configuration instance containing LLM settings.
        """
        self.config = config
        
        # Initialize LLM based on config
        self.llm = self._initialize_llm()
        
        logger.info(
            f"ContentGeneratorService initialized with LLM provider: "
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
                temperature=0.7  # Higher temperature for more creative content generation
            )
        
        else:
            raise ValueError(
                f"Unsupported LLM provider: {self.config.llm_provider}. "
                "Must be 'openai'"
            )
    
    def generate_website_content(
        self,
        requirements: WebsiteRequirements
    ) -> Dict[str, Any]:
        """
        Generate comprehensive website content using LLM.
        
        Args:
            requirements: WebsiteRequirements object with business info and requirements.
            
        Returns:
            Dictionary with structured content including:
            - business_info: name, description, tagline
            - about_content: title, description, history, values
            - services: list of service objects with name, description, features
            - seo: meta_title, meta_description, meta_keywords, og_title, og_description
            - call_to_actions: list of CTA phrases
            - testimonials_section: title, subtitle
            - contact: form_title, form_description, phone_display, address_display
            - footer: description, copyright_text
        """
        logger.info(
            f"Starting website content generation for business: {requirements.business.name}"
        )
        
        try:
            # Create comprehensive prompt
            prompt = self._create_content_generation_prompt(requirements)
            
            # Generate content using LLM
            content = self._generate_with_llm(prompt, requirements)
            
            logger.info(
                f"Successfully generated website content for {requirements.business.name}"
            )
            
            return content
            
        except Exception as e:
            logger.error(
                f"Error generating website content: {str(e)}",
                exc_info=True
            )
            # Return partial content with defaults
            return self._create_default_content(requirements)
    
    def _create_content_generation_prompt(
        self,
        requirements: WebsiteRequirements
    ) -> str:
        """
        Create comprehensive prompt for content generation.
        
        Args:
            requirements: WebsiteRequirements object.
            
        Returns:
            Formatted prompt string.
        """
        business = requirements.business
        competitor_analysis = requirements.competitor_analysis
        
        # Build business information section
        business_info = f"""
Business Information:
- Name: {business.name}
- Location: {business.city}, {business.state or 'N/A'}
- Address: {business.address}
- Phone: {business.phone or 'N/A'}
- Industry: {business.industry}
"""
        
        if business.rating:
            business_info += f"- Rating: {business.rating} stars\n"
        
        # Build competitor insights section (if available)
        competitor_section = ""
        if competitor_analysis:
            competitor_section = f"""
Competitor Insights:
- Key Services: {', '.join(competitor_analysis.key_services) if competitor_analysis.key_services else 'N/A'}
- SEO Keywords: {', '.join(competitor_analysis.seo_keywords) if competitor_analysis.seo_keywords else 'N/A'}
- Messaging Themes: {', '.join(competitor_analysis.messaging_themes) if competitor_analysis.messaging_themes else 'N/A'}
- CTAs: {', '.join(competitor_analysis.call_to_actions) if competitor_analysis.call_to_actions else 'N/A'}
"""
        
        # Build requirements section
        requirements_section = f"""
Requirements:
- Brand Tone: {requirements.brand_tone or 'professional'}
- Primary Services: {', '.join(requirements.primary_services) if requirements.primary_services else 'N/A'}
- SEO Keywords: {', '.join(requirements.seo_focus_keywords) if requirements.seo_focus_keywords else 'N/A'}
- Target Audience: {requirements.target_audience or 'General public'}
- Include Contact Form: {requirements.include_contact_form}
- Include Testimonials: {requirements.include_testimonials}
- Include Blog: {requirements.include_blog}
"""
        
        if requirements.generation_notes:
            requirements_section += f"- Additional Notes: {requirements.generation_notes}\n"
        
        # Create comprehensive prompt
        prompt = f"""You are a professional website content writer creating content for a {business.industry} business.

{business_info}
{competitor_section}
{requirements_section}

Generate comprehensive website content including:

1. **Business Description and Tagline**:
   - Create a 2-3 paragraph engaging business description that highlights the business's expertise, location, and value proposition
   - Create a short, memorable tagline (10-15 words) that captures the essence of the business

2. **About Page Content**:
   - Title for the about page
   - Main description (2-3 paragraphs) about the business, its mission, and what makes it unique
   - Company history/story (1-2 paragraphs) - create a compelling narrative
   - List of 3-5 company values or principles

3. **Service Descriptions**:
   For each service in the primary services list, create:
   - Service name
   - Detailed description (1-2 paragraphs) that is benefit-focused and engaging
   - List of 3-5 key features or benefits for that service

4. **SEO Meta Tags**:
   - Meta title (50-60 characters, SEO-optimized, include location and primary service)
   - Meta description (150-160 characters, compelling and keyword-rich)
   - Meta keywords (list of 5-10 relevant keywords, include location-based keywords)
   - Open Graph title (for social media sharing)
   - Open Graph description (for social media sharing)
   - Do NOT use apostrophes or single quotes (') in meta_title, meta_description, og_title, or og_description. These values are embedded in code. Use alternatives instead (e.g. "we have" not "we've", "premier" or "top" instead of "Austin's").

5. **Call-to-Action Phrases**:
   Generate 5-7 action-oriented CTA phrases appropriate for this industry and business type.
   Make them compelling and varied (e.g., "Get Your Free Quote Today", "Schedule Your Consultation", etc.)

6. **Testimonials Section** (if include_testimonials is True):
   - Section title
   - Section subtitle/description

7. **Contact Section**:
   - Contact form title
   - Contact form description
   - Formatted phone number for display
   - Formatted address for display

8. **Footer Content**:
   - Footer description (brief, 1-2 sentences)
   - Copyright text (include current year)

9. **Design Theme** (so each website looks unique and premium):
   - theme_name: A short name (e.g. "Modern Minimal", "Bold Corporate", "Warm Professional", "Dark Elegant", "Fresh Clean")
   - color_palette: Object with hex codes: primary (main brand, e.g. #0f766e), secondary (e.g. #0d9488), accent (highlight, e.g. #f59e0b), background (page bg, e.g. #f8fafc), text (main text, e.g. #1e293b), text_muted (e.g. #64748b). Choose a distinct palette that fits the industry and feels premium.
   - font_heading: One Google Font name for headings (e.g. "Playfair Display", "Clash Display", "Outfit", "Sora", "DM Serif Display", "Plus Jakarta Sans"). Pick something that feels premium and distinct.
   - font_body: One Google Font name for body text (e.g. "Inter", "Source Sans 3", "DM Sans", "Outfit", "Manrope"). Must pair well with font_heading.
   - layout_style: One of "hero-centered", "hero-split", "hero-full-image", "card-heavy", "minimal-stripes". Determines hero and section layout.

10. **Image Keywords** (for fetching or generating relevant images):
   - hero: 2-3 search keywords for the main hero/header image (e.g. "professional roofing team", "residential roof repair")
   - about: 2-3 keywords for about section image (e.g. "local business team", "contractor at work")
   - services: For each service in the services list, add 1-2 keywords (e.g. "roof installation", "commercial roofing"). Return as a list of strings, one entry per service in the same order as the services array.
   Use concrete, industry-specific terms so images are relevant to the business.

**Content Guidelines**:
- All content should match the brand tone: {requirements.brand_tone or 'professional'}
- Incorporate SEO keywords naturally (avoid keyword stuffing)
- Make content engaging, professional, and optimized for local SEO
- Use competitor insights as inspiration, but create original content (do not copy)
- Focus on benefits and value proposition
- Make content location-aware (mention city/state naturally)
- Ensure all content is original and tailored to this specific business
- In all SEO/meta fields (meta_title, meta_description, og_title, og_description), avoid apostrophes and single quotes so the text can be safely embedded in code

Return your response as a JSON object with the following structure:
{{
    "business_info": {{
        "name": "Business Name",
        "description": "2-3 paragraph business description...",
        "tagline": "Short memorable tagline"
    }},
    "about_content": {{
        "title": "About Page Title",
        "description": "About page main content...",
        "history": "Company history/story...",
        "values": ["Value 1", "Value 2", "Value 3"]
    }},
    "services": [
        {{
            "name": "Service Name",
            "description": "Service description...",
            "features": ["Feature 1", "Feature 2", "Feature 3"]
        }}
    ],
    "seo": {{
        "meta_title": "SEO-optimized title",
        "meta_description": "SEO-optimized description",
        "meta_keywords": ["keyword1", "keyword2"],
        "og_title": "OG title",
        "og_description": "OG description"
    }},
    "call_to_actions": ["CTA 1", "CTA 2", "CTA 3"],
    "testimonials_section": {{
        "title": "Testimonials Title",
        "subtitle": "Testimonials Subtitle"
    }},
    "contact": {{
        "form_title": "Contact Form Title",
        "form_description": "Contact form description",
        "phone_display": "Formatted phone",
        "address_display": "Formatted address"
    }},
    "footer": {{
        "description": "Footer description",
        "copyright_text": "Copyright text with year"
    }},
    "design_theme": {{
        "theme_name": "Short theme name",
        "color_palette": {{
            "primary": "#hex",
            "secondary": "#hex",
            "accent": "#hex",
            "background": "#hex",
            "text": "#hex",
            "text_muted": "#hex"
        }},
        "font_heading": "Google Font name",
        "font_body": "Google Font name",
        "layout_style": "hero-centered|hero-split|hero-full-image|card-heavy|minimal-stripes"
    }},
    "image_keywords": {{
        "hero": ["keyword1", "keyword2"],
        "about": ["keyword1", "keyword2"],
        "services": ["service1 keyword", "service2 keyword"]
    }}
}}
"""
        
        return prompt
    
    def _generate_with_llm(
        self,
        prompt: str,
        requirements: WebsiteRequirements
    ) -> Dict[str, Any]:
        """
        Call LLM with prompt and return structured content.
        
        Args:
            prompt: Content generation prompt.
            requirements: WebsiteRequirements for fallback/defaults.
            
        Returns:
            Dictionary with structured content.
        """
        logger.info("Calling LLM for content generation")
        
        try:
            # Use JSON mode for structured output
            # Note: We'll parse JSON from the response
            response = self.llm.invoke(prompt)
            
            # Extract content from response
            content_text = response.content if hasattr(response, 'content') else str(response)
            
            # Try to extract JSON from the response (handle markdown code blocks)
            json_match = re.search(r'\{.*\}', content_text, re.DOTALL)
            if json_match:
                content_json = json.loads(json_match.group())
            else:
                # Try parsing the whole response
                content_json = json.loads(content_text)
            
            # Validate and enhance the content
            content = self._validate_and_enhance_content(content_json, requirements)
            
            logger.info("Successfully generated content from LLM")
            return content
            
        except json.JSONDecodeError as e:
            logger.error(
                f"Error parsing JSON from LLM response: {str(e)}",
                exc_info=True
            )
            logger.warning("Falling back to default content")
            return self._create_default_content(requirements)
            
        except Exception as e:
            logger.error(
                f"Error calling LLM for content generation: {str(e)}",
                exc_info=True
            )
            logger.warning("Falling back to default content")
            return self._create_default_content(requirements)
    
    def _validate_and_enhance_content(
        self,
        content: Dict[str, Any],
        requirements: WebsiteRequirements
    ) -> Dict[str, Any]:
        """
        Validate and enhance generated content with defaults.
        
        Args:
            content: Generated content dictionary.
            requirements: WebsiteRequirements for defaults.
            
        Returns:
            Validated and enhanced content dictionary.
        """
        business = requirements.business
        current_year = datetime.now().year
        
        # Ensure all required sections exist
        if 'business_info' not in content:
            content['business_info'] = {}
        
        if 'about_content' not in content:
            content['about_content'] = {}
        
        if 'services' not in content:
            content['services'] = []
        
        if 'seo' not in content:
            content['seo'] = {}
        
        if 'call_to_actions' not in content:
            content['call_to_actions'] = []
        
        if 'testimonials_section' not in content:
            content['testimonials_section'] = {}
        
        if 'contact' not in content:
            content['contact'] = {}
        
        if 'footer' not in content:
            content['footer'] = {}
        
        if 'design_theme' not in content:
            content['design_theme'] = {}
        
        if 'image_keywords' not in content:
            content['image_keywords'] = {}
        
        # Set defaults for business_info (fill when missing or empty so home page always has content)
        if 'name' not in content['business_info'] or not content['business_info'].get('name'):
            content['business_info']['name'] = business.name

        default_description = (
            f"{business.name} is a {business.industry} business "
            f"located in {business.city}, {business.state or ''}. "
            f"We provide quality services to our customers."
        )
        if not content['business_info'].get('description'):
            content['business_info']['description'] = default_description

        default_tagline = (
            f"Quality {business.industry} services in {business.city}"
        )
        if not content['business_info'].get('tagline'):
            content['business_info']['tagline'] = default_tagline
        
        # Set defaults for about_content (so home/about sections always have content)
        if 'title' not in content['about_content'] or not content['about_content'].get('title'):
            content['about_content']['title'] = f"About {business.name}"
        if not content['about_content'].get('description'):
            content['about_content']['description'] = (
                f"{business.name} has been serving the {business.city}"
                f"{', ' + business.state if business.state else ''} area with reliable {business.industry} services. "
                "We focus on quality, transparency, and customer satisfaction on every job."
            )
        if 'values' not in content['about_content'] or not content['about_content'].get('values'):
            content['about_content']['values'] = ['Quality', 'Integrity', 'Customer Service']
        
        # Ensure services match primary_services
        if requirements.primary_services:
            # If services were generated, keep them; otherwise create defaults
            if not content['services']:
                content['services'] = [
                    {
                        'name': service,
                        'description': f"Professional {service.lower()} services.",
                        'features': ['Expert Service', 'Quality Work', 'Customer Satisfaction']
                    }
                    for service in requirements.primary_services
                ]
        
        # Set defaults for SEO
        if 'meta_title' not in content['seo']:
            location = f"{business.city}, {business.state or ''}".strip()
            content['seo']['meta_title'] = (
                f"{business.name} | {business.industry.title()} Services in {location}"
            )
        
        if 'meta_keywords' not in content['seo']:
            content['seo']['meta_keywords'] = requirements.seo_focus_keywords or []
        
        # Set defaults for CTAs
        if not content['call_to_actions']:
            content['call_to_actions'] = [
                "Get Your Free Quote Today",
                "Contact Us for Expert Service",
                "Schedule Your Consultation"
            ]
        
        # Set defaults for testimonials_section
        if requirements.include_testimonials:
            if 'title' not in content['testimonials_section']:
                content['testimonials_section']['title'] = "What Our Customers Say"
            if 'subtitle' not in content['testimonials_section']:
                content['testimonials_section']['subtitle'] = (
                    f"Trusted by customers in {business.city}"
                )
        
        # Set defaults for contact
        if 'form_title' not in content['contact']:
            content['contact']['form_title'] = "Get In Touch"
        
        if 'phone_display' not in content['contact']:
            content['contact']['phone_display'] = business.phone or "N/A"
        
        if 'address_display' not in content['contact']:
            content['contact']['address_display'] = business.address
        
        # Set defaults for footer
        if 'copyright_text' not in content['footer']:
            content['footer']['copyright_text'] = (
                f"© {current_year} {business.name}. All rights reserved."
            )
        
        # Leave design_theme without color_palette so theme_utils picks one of 5 presets at random
        # (Only ensure the key exists; do not set default palette so each site gets a varied theme.)
        dt = content['design_theme']
        if not dt.get('font_heading'):
            dt['font_heading'] = 'Inter'
        if not dt.get('font_body'):
            dt['font_body'] = 'Inter'
        if not dt.get('layout_style'):
            dt['layout_style'] = 'hero-centered'
        if not dt.get('theme_name'):
            dt['theme_name'] = 'Professional'
        
        # Set defaults for image_keywords
        ik = content['image_keywords']
        industry = (business.industry or 'business').replace(' ', ',')
        if not ik.get('hero'):
            ik['hero'] = [industry, 'professional', 'quality']
        if not ik.get('about'):
            ik['about'] = [industry, 'team', 'local business']
        if not ik.get('services'):
            ik['services'] = [industry] * len(content.get('services', []) or [1])
        
        return content
    
    def _create_default_content(
        self,
        requirements: WebsiteRequirements
    ) -> Dict[str, Any]:
        """
        Create default content structure when LLM generation fails.
        
        Args:
            requirements: WebsiteRequirements object.
            
        Returns:
            Dictionary with default content.
        """
        business = requirements.business
        current_year = datetime.now().year
        
        logger.info("Creating default content structure")
        
        # Create default services
        services = []
        if requirements.primary_services:
            for service in requirements.primary_services:
                services.append({
                    'name': service,
                    'description': (
                        f"Professional {service.lower()} services. "
                        f"We provide quality workmanship and excellent customer service."
                    ),
                    'features': [
                        'Expert Service',
                        'Quality Workmanship',
                        'Customer Satisfaction',
                        'Competitive Pricing'
                    ]
                })
        else:
            # Default service if none specified
            services.append({
                'name': f'{business.industry.title()} Services',
                'description': (
                    f"Professional {business.industry} services. "
                    f"We provide quality workmanship and excellent customer service."
                ),
                'features': [
                    'Expert Service',
                    'Quality Workmanship',
                    'Customer Satisfaction'
                ]
            })
        
        # Default CTAs
        ctas = [
            "Get Your Free Quote Today",
            "Contact Us for Expert Service",
            "Schedule Your Consultation"
        ]
        
        # Add competitor CTAs if available
        if requirements.competitor_analysis and requirements.competitor_analysis.call_to_actions:
            ctas.extend(requirements.competitor_analysis.call_to_actions[:3])
        
        # Default SEO keywords
        seo_keywords = requirements.seo_focus_keywords or []
        if not seo_keywords and requirements.competitor_analysis:
            seo_keywords = requirements.competitor_analysis.seo_keywords[:10] if requirements.competitor_analysis.seo_keywords else []
        
        location = f"{business.city}, {business.state or ''}".strip()
        
        return {
            'business_info': {
                'name': business.name,
                'description': (
                    f"{business.name} is a trusted {business.industry} business "
                    f"serving {business.city}, {business.state or ''} and surrounding areas. "
                    f"With a commitment to quality and customer satisfaction, we provide "
                    f"professional services tailored to meet your needs."
                ),
                'tagline': f"Quality {business.industry.title()} Services in {location}"
            },
            'about_content': {
                'title': f"About {business.name}",
                'description': (
                    f"{business.name} has been serving the {business.city} area "
                    f"with quality {business.industry} services. "
                    f"We are committed to excellence and customer satisfaction."
                ),
                'history': (
                    f"Founded to serve the {business.city} community, "
                    f"{business.name} has built a reputation for quality and reliability."
                ),
                'values': ['Quality', 'Integrity', 'Customer Service', 'Excellence']
            },
            'services': services,
            'seo': {
                'meta_title': (
                    f"{business.name} | {business.industry.title()} Services in {location}"
                ),
                'meta_description': (
                    f"Professional {business.industry} services in {location}. "
                    f"Contact {business.name} for quality service and customer satisfaction."
                ),
                'meta_keywords': seo_keywords,
                'og_title': f"{business.name} - {business.industry.title()} Services",
                'og_description': (
                    f"Professional {business.industry} services in {location}"
                )
            },
            'call_to_actions': ctas[:7],  # Limit to 7
            'testimonials_section': {
                'title': "What Our Customers Say",
                'subtitle': f"Trusted by customers in {business.city}"
            } if requirements.include_testimonials else {},
            'contact': {
                'form_title': "Get In Touch",
                'form_description': (
                    "Have a question or ready to get started? "
                    "Contact us today and we'll be happy to help."
                ),
                'phone_display': business.phone or "N/A",
                'address_display': business.address
            },
            'footer': {
                'description': (
                    f"{business.name} - Your trusted partner for "
                    f"{business.industry} services in {location}."
                ),
                'copyright_text': f"© {current_year} {business.name}. All rights reserved."
            },
            'design_theme': {
                'theme_name': 'Professional',
                'color_palette': {
                    'primary': '#0f766e',
                    'secondary': '#0d9488',
                    'accent': '#f59e0b',
                    'background': '#f8fafc',
                    'text': '#1e293b',
                    'text_muted': '#64748b',
                },
                'font_heading': 'Playfair Display',
                'font_body': 'Source Sans 3',
                'layout_style': 'hero-centered',
            },
            'image_keywords': {
                'hero': [business.industry or 'business', 'professional', 'quality'],
                'about': [business.industry or 'business', 'team', 'local'],
                'services': [business.industry or 'services'] * max(1, len(services)),
            },
        }
