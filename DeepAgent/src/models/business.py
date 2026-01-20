"""Data models for business information, competitor analysis, and website requirements."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime


class Business(BaseModel):
    """Model representing a business entity."""
    
    name: str = Field(..., description="Business name")
    address: str = Field(..., description="Full business address")
    phone: Optional[str] = Field(None, description="Business phone number")
    industry: str = Field(..., description="Business industry or category")
    city: str = Field(..., description="City where business is located")
    state: Optional[str] = Field(None, description="State where business is located")
    website_url: Optional[str] = Field(None, description="Business website URL if available")
    has_website: bool = Field(default=False, description="Whether business has a dedicated website")
    google_place_id: Optional[str] = Field(None, description="Google Places API place ID")
    reviews: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Business reviews from Google")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Business rating (0-5)")
    latitude: Optional[float] = Field(None, description="Business latitude coordinate")
    longitude: Optional[float] = Field(None, description="Business longitude coordinate")
    business_status: Optional[str] = Field(None, description="Business status (e.g., OPERATIONAL, CLOSED_PERMANENTLY)")
    price_level: Optional[int] = Field(None, ge=0, le=4, description="Price level indicator (0-4)")
    types: Optional[List[str]] = Field(default_factory=list, description="Business types/categories from Google")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "name": "ABC Roofing Company",
                "address": "123 Main St, Austin, TX 78701",
                "phone": "+1-512-555-0123",
                "industry": "roofing",
                "city": "Austin",
                "state": "TX",
                "website_url": None,
                "has_website": False,
                "google_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
                "rating": 4.5,
                "reviews": []
            }
        }


class CompetitorAnalysis(BaseModel):
    """Model representing competitor analysis data."""
    
    competitor_businesses: List[Business] = Field(
        default_factory=list,
        description="List of competitor businesses analyzed"
    )
    key_services: List[str] = Field(
        default_factory=list,
        description="Key services commonly offered by competitors"
    )
    content_structure: Dict[str, Any] = Field(
        default_factory=dict,
        description="Common content structure patterns found in competitor websites"
    )
    seo_keywords: List[str] = Field(
        default_factory=list,
        description="SEO keywords and phrases used by competitors"
    )
    design_patterns: List[str] = Field(
        default_factory=list,
        description="Design patterns and best practices observed"
    )
    messaging_themes: List[str] = Field(
        default_factory=list,
        description="Common messaging themes and value propositions"
    )
    call_to_actions: List[str] = Field(
        default_factory=list,
        description="Common call-to-action phrases used"
    )
    industry_insights: Optional[str] = Field(
        None,
        description="General insights about the industry and market positioning"
    )
    analysis_timestamp: datetime = Field(
        default_factory=datetime.now,
        description="Timestamp when analysis was performed"
    )
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "competitor_businesses": [],
                "key_services": ["Residential Roofing", "Commercial Roofing", "Roof Repair"],
                "content_structure": {
                    "pages": ["home", "about", "services", "contact"],
                    "sections": ["hero", "services", "testimonials", "cta"]
                },
                "seo_keywords": ["roofing austin", "roof repair", "residential roofing"],
                "design_patterns": ["modern", "clean", "professional"],
                "messaging_themes": ["quality", "experience", "local expertise"],
                "call_to_actions": ["Get Free Quote", "Contact Us Today", "Schedule Inspection"]
            }
        }


class WebsiteRequirements(BaseModel):
    """Model representing requirements for website generation."""
    
    business: Business = Field(..., description="Business for which website is being generated")
    competitor_analysis: Optional[CompetitorAnalysis] = Field(
        None,
        description="Competitor analysis to inform website generation"
    )
    target_audience: Optional[str] = Field(
        None,
        description="Target audience description"
    )
    primary_services: List[str] = Field(
        default_factory=list,
        description="Primary services to highlight on the website"
    )
    brand_tone: Optional[str] = Field(
        "professional",
        description="Desired brand tone (e.g., professional, friendly, modern)"
    )
    color_scheme: Optional[str] = Field(
        None,
        description="Preferred color scheme for the website"
    )
    include_contact_form: bool = Field(
        default=True,
        description="Whether to include a contact form"
    )
    include_testimonials: bool = Field(
        default=True,
        description="Whether to include testimonials section"
    )
    include_blog: bool = Field(
        default=False,
        description="Whether to include a blog section"
    )
    seo_focus_keywords: List[str] = Field(
        default_factory=list,
        description="Primary SEO keywords to target"
    )
    custom_pages: List[str] = Field(
        default_factory=list,
        description="Additional custom pages to generate beyond standard pages"
    )
    generation_notes: Optional[str] = Field(
        None,
        description="Additional notes or requirements for generation"
    )
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "business": {
                    "name": "ABC Roofing Company",
                    "address": "123 Main St, Austin, TX 78701",
                    "phone": "+1-512-555-0123",
                    "industry": "roofing",
                    "city": "Austin",
                    "state": "TX",
                    "has_website": False
                },
                "primary_services": ["Residential Roofing", "Roof Repair"],
                "brand_tone": "professional",
                "seo_focus_keywords": ["roofing austin", "roof repair austin"]
            }
        }
