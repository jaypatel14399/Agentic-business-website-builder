"""Next.js site generator for creating complete Next.js websites from business data."""

import logging
import re
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

from jinja2 import Environment, FileSystemLoader, select_autoescape

from src.models.business import Business
from src.utils.config import Config


logger = logging.getLogger(__name__)


class NextJSGenerator:
    """Generator for creating complete Next.js websites."""
    
    def __init__(self, config: Config):
        """
        Initialize Next.js generator.
        
        Args:
            config: Configuration instance containing output path settings.
        """
        self.config = config
        self.output_path = config.get_output_path()
        
        # Set up template directory
        template_dir = Path(__file__).parent / "templates"
        template_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        logger.info(f"NextJSGenerator initialized with output path: {self.output_path}")
    
    def generate_website(
        self,
        business: Business,
        content: Dict[str, Any],
        output_dir_name: Optional[str] = None
    ) -> Path:
        """
        Generate complete Next.js website.
        
        Args:
            business: Business object with business information.
            content: Content dictionary from ContentGeneratorService.
            output_dir_name: Optional custom output directory name.
                          Defaults to business name slug.
        
        Returns:
            Path to generated website directory.
        """
        logger.info(f"Starting Next.js website generation for: {business.name}")
        
        try:
            # Determine output directory name
            if not output_dir_name:
                output_dir_name = self._slugify(business.name)
            
            output_dir = self.output_path / output_dir_name
            
            # Prepare template data
            template_data = self._prepare_template_data(business, content)
            
            # Create directory structure
            self._create_directory_structure(output_dir)
            
            # Generate all files
            self._generate_config_files(output_dir, template_data)
            self._generate_pages(output_dir, template_data)
            self._generate_components(output_dir, template_data)
            self._generate_styles(output_dir, template_data)
            
            logger.info(f"Successfully generated Next.js website at: {output_dir}")
            return output_dir
            
        except Exception as e:
            logger.error(
                f"Error generating Next.js website: {str(e)}",
                exc_info=True
            )
            raise
    
    def _prepare_template_data(
        self,
        business: Business,
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Prepare template data by combining business and content data.
        
        Args:
            business: Business object.
            content: Content dictionary from ContentGeneratorService.
        
        Returns:
            Dictionary with all data needed for templates.
        """
        business_slug = self._slugify(business.name)
        current_year = datetime.now().year
        
        # Extract content sections with defaults
        business_info = content.get('business_info', {})
        about_content = content.get('about_content', {})
        services = content.get('services', [])
        seo = content.get('seo', {})
        call_to_actions = content.get('call_to_actions', [])
        testimonials_section = content.get('testimonials_section', {})
        contact = content.get('contact', {})
        footer = content.get('footer', {})
        
        # Prepare template data
        template_data = {
            # Business data
            'business': {
                'name': business.name,
                'address': business.address,
                'phone': business.phone or '',
                'city': business.city,
                'state': business.state or '',
                'industry': business.industry,
                'rating': business.rating,
                'reviews': business.reviews or [],
            },
            'business_slug': business_slug,
            'current_year': current_year,
            
            # Content data
            'business_info': {
                'name': business_info.get('name', business.name),
                'description': business_info.get('description', ''),
                'tagline': business_info.get('tagline', ''),
            },
            'about_content': {
                'title': about_content.get('title', f'About {business.name}'),
                'description': about_content.get('description', ''),
                'history': about_content.get('history', ''),
                'values': about_content.get('values', []),
            },
            'services': services,
            'seo': {
                'meta_title': seo.get('meta_title', f'{business.name} | {business.industry.title()} Services'),
                'meta_description': seo.get('meta_description', ''),
                'meta_keywords': seo.get('meta_keywords', []),
                'og_title': seo.get('og_title', business.name),
                'og_description': seo.get('og_description', ''),
            },
            'call_to_actions': call_to_actions[:7],  # Limit to 7
            'testimonials_section': {
                'title': testimonials_section.get('title', 'What Our Customers Say'),
                'subtitle': testimonials_section.get('subtitle', ''),
            },
            'contact': {
                'form_title': contact.get('form_title', 'Get In Touch'),
                'form_description': contact.get('form_description', ''),
                'phone_display': contact.get('phone_display', business.phone or 'N/A'),
                'address_display': contact.get('address_display', business.address),
            },
            'footer': {
                'description': footer.get('description', ''),
                'copyright_text': footer.get('copyright_text', f'© {current_year} {business.name}. All rights reserved.'),
            },
        }
        
        return template_data
    
    def _create_directory_structure(self, output_path: Path) -> None:
        """
        Create complete Next.js project directory structure.
        
        Args:
            output_path: Base output directory path.
        """
        logger.info(f"Creating directory structure at: {output_path}")
        
        directories = [
            output_path / 'public',
            output_path / 'src' / 'app',
            output_path / 'src' / 'app' / 'about',
            output_path / 'src' / 'app' / 'services',
            output_path / 'src' / 'app' / 'contact',
            output_path / 'src' / 'components',
            output_path / 'src' / 'styles',
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Created directory: {directory}")
    
    def _generate_config_files(
        self,
        output_path: Path,
        data: Dict[str, Any]
    ) -> None:
        """Generate configuration files (package.json, next.config.js, etc.)."""
        logger.info("Generating configuration files")
        
        config_files = [
            ('package.json.j2', output_path / 'package.json'),
            ('next.config.js.j2', output_path / 'next.config.js'),
            ('tailwind.config.js.j2', output_path / 'tailwind.config.js'),
            ('postcss.config.js.j2', output_path / 'postcss.config.js'),
            ('tsconfig.json.j2', output_path / 'tsconfig.json'),
            ('.gitignore.j2', output_path / '.gitignore'),
        ]
        
        for template_name, output_file in config_files:
            try:
                self._generate_file(template_name, output_file, data)
            except Exception as e:
                logger.warning(
                    f"Failed to generate {output_file.name}: {str(e)}. "
                    "Continuing with other files..."
                )
    
    def _generate_pages(
        self,
        output_path: Path,
        data: Dict[str, Any]
    ) -> None:
        """Generate all page files."""
        logger.info("Generating page files")
        
        pages = [
            ('layout.tsx.j2', output_path / 'src' / 'app' / 'layout.tsx'),
            ('page.tsx.j2', output_path / 'src' / 'app' / 'page.tsx'),
            ('about_page.tsx.j2', output_path / 'src' / 'app' / 'about' / 'page.tsx'),
            ('services_page.tsx.j2', output_path / 'src' / 'app' / 'services' / 'page.tsx'),
            ('contact_page.tsx.j2', output_path / 'src' / 'app' / 'contact' / 'page.tsx'),
        ]
        
        for template_name, output_file in pages:
            try:
                self._generate_file(template_name, output_file, data)
            except Exception as e:
                logger.warning(
                    f"Failed to generate {output_file.name}: {str(e)}. "
                    "Continuing with other files..."
                )
    
    def _generate_components(
        self,
        output_path: Path,
        data: Dict[str, Any]
    ) -> None:
        """Generate all component files."""
        logger.info("Generating component files")
        
        components = [
            ('Header.tsx.j2', output_path / 'src' / 'components' / 'Header.tsx'),
            ('Footer.tsx.j2', output_path / 'src' / 'components' / 'Footer.tsx'),
            ('ServiceCard.tsx.j2', output_path / 'src' / 'components' / 'ServiceCard.tsx'),
            ('SEO.tsx.j2', output_path / 'src' / 'components' / 'SEO.tsx'),
            ('ContactForm.tsx.j2', output_path / 'src' / 'components' / 'ContactForm.tsx'),
        ]
        
        for template_name, output_file in components:
            try:
                self._generate_file(template_name, output_file, data)
            except Exception as e:
                logger.warning(
                    f"Failed to generate {output_file.name}: {str(e)}. "
                    "Continuing with other files..."
                )
    
    def _generate_styles(
        self,
        output_path: Path,
        data: Dict[str, Any]
    ) -> None:
        """Generate style files."""
        logger.info("Generating style files")
        
        styles = [
            ('globals.css.j2', output_path / 'src' / 'styles' / 'globals.css'),
        ]
        
        for template_name, output_file in styles:
            try:
                self._generate_file(template_name, output_file, data)
            except Exception as e:
                logger.warning(
                    f"Failed to generate {output_file.name}: {str(e)}. "
                    "Continuing with other files..."
                )
    
    def _generate_file(
        self,
        template_name: str,
        output_path: Path,
        data: Dict[str, Any]
    ) -> None:
        """
        Render template and write to file.
        
        Args:
            template_name: Name of Jinja2 template file.
            output_path: Path where file should be written.
            data: Template data dictionary.
        """
        try:
            template = self.env.get_template(template_name)
            rendered = template.render(**data)
            output_path.write_text(rendered, encoding='utf-8')
            logger.debug(f"Generated file: {output_path}")
        except Exception as e:
            logger.error(
                f"Error generating file {output_path} from template {template_name}: {str(e)}",
                exc_info=True
            )
            raise
    
    def _slugify(self, text: str) -> str:
        """
        Convert text to URL-friendly slug.
        
        Args:
            text: Text to slugify.
        
        Returns:
            URL-friendly slug string.
        """
        # Convert to lowercase
        text = text.lower()
        
        # Replace spaces and special characters with hyphens
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        
        # Remove leading/trailing hyphens
        text = text.strip('-')
        
        # Fallback if empty
        if not text:
            text = 'business'
        
        return text
    
    def _escape_js(self, text: str) -> str:
        """
        Escape text for use in JavaScript/JSX.
        
        Args:
            text: Text to escape.
        
        Returns:
            Escaped text safe for JSX.
        """
        if not text:
            return ''
        
        # Escape quotes
        text = text.replace('\\', '\\\\')
        text = text.replace('"', '\\"')
        text = text.replace("'", "\\'")
        
        # Escape newlines
        text = text.replace('\n', '\\n')
        text = text.replace('\r', '')
        
        return text
