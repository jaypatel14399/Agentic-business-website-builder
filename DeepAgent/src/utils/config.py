"""Configuration management for the application."""

import os
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv


class Config:
    """Application configuration loaded from environment variables."""
    
    def __init__(self, env_file: Optional[str] = None):
        """
        Initialize configuration.
        
        Args:
            env_file: Optional path to .env file. If None, looks for .env in project root.
        """
        # Load environment variables
        if env_file:
            load_dotenv(env_file)
        else:
            # Try to find .env in project root (2 levels up from src/utils)
            project_root = Path(__file__).parent.parent.parent
            env_path = project_root / ".env"
            load_dotenv(env_path)
        
        # Google Places API
        self.google_places_api_key = os.getenv("GOOGLE_PLACES_API_KEY")
        
        # LLM Configuration
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.llm_provider = os.getenv("LLM_PROVIDER", "openai").lower()
        self.llm_model = os.getenv("LLM_MODEL", "gpt-4-turbo-preview")
        
        # Output Configuration
        self.output_dir = os.getenv("OUTPUT_DIR", "generated_sites")
        
        # Google Places API Settings
        self.google_places_max_results = int(os.getenv("GOOGLE_PLACES_MAX_RESULTS", "20"))
        
        # Competitor Analysis Settings
        self.competitor_analysis_max_competitors = int(
            os.getenv("COMPETITOR_ANALYSIS_MAX_COMPETITORS", "5")
        )
        
        # Website Scraper Settings
        self.website_scraper_timeout = int(os.getenv("WEBSITE_SCRAPER_TIMEOUT", "10"))
        
        # Content Generation Settings
        self.content_generation_temperature = float(
            os.getenv("CONTENT_GENERATION_TEMPERATURE", "0.7")
        )
        self.competitor_analysis_temperature = float(
            os.getenv("COMPETITOR_ANALYSIS_TEMPERATURE", "0.3")
        )
        
        # Logging Settings
        self.log_level = os.getenv("LOG_LEVEL", "INFO").upper()
        
        # Validate required configuration
        self._validate()
    
    def _validate(self) -> None:
        """Validate that required configuration is present."""
        errors = []
        
        if not self.google_places_api_key:
            errors.append("GOOGLE_PLACES_API_KEY is required")
        
        if self.llm_provider == "openai" and not self.openai_api_key:
            errors.append("OPENAI_API_KEY is required when LLM_PROVIDER=openai")
        
        if self.llm_provider == "anthropic" and not self.anthropic_api_key:
            errors.append("ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic")
        
        if self.llm_provider not in ["openai", "anthropic"]:
            errors.append(f"LLM_PROVIDER must be 'openai' or 'anthropic', got: {self.llm_provider}")
        
        if errors:
            raise ValueError(
                "Configuration errors:\n" + "\n".join(f"  - {error}" for error in errors) +
                "\n\nPlease check your .env file or set the required environment variables."
            )
    
    def get_output_path(self) -> Path:
        """Get the output directory path."""
        project_root = Path(__file__).parent.parent.parent
        output_path = project_root / self.output_dir
        output_path.mkdir(parents=True, exist_ok=True)
        return output_path
    
    def __repr__(self) -> str:
        """String representation of configuration (hides API keys)."""
        return (
            f"Config("
            f"llm_provider={self.llm_provider}, "
            f"llm_model={self.llm_model}, "
            f"output_dir={self.output_dir}, "
            f"google_places_max_results={self.google_places_max_results}, "
            f"competitor_analysis_max_competitors={self.competitor_analysis_max_competitors}, "
            f"website_scraper_timeout={self.website_scraper_timeout}, "
            f"content_generation_temperature={self.content_generation_temperature}, "
            f"competitor_analysis_temperature={self.competitor_analysis_temperature}, "
            f"log_level={self.log_level}"
            f")"
        )


# Global configuration instance (will be initialized when imported)
_config: Optional[Config] = None


def get_config(env_file: Optional[str] = None) -> Config:
    """
    Get the global configuration instance.
    
    Args:
        env_file: Optional path to .env file for initialization.
    
    Returns:
        Config instance.
    """
    global _config
    if _config is None:
        _config = Config(env_file)
    return _config

