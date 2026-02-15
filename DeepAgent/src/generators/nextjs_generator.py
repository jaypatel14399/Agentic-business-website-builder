"""Next.js site generator for creating complete Next.js websites from business data."""

import logging
import re
from pathlib import Path
from typing import Any, Dict, Optional
from datetime import datetime

from jinja2 import Environment, FileSystemLoader, select_autoescape

from src.models.business import Business
from src.utils.config import Config
from src.generators.theme_utils import (
    resolve_design_theme,
    get_image_urls,
    select_theme,
    get_theme_css_variables,
)
import shutil


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
        self.env.filters['escape_js'] = self._escape_js

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
            theme_id = select_theme(generation_seed=output_dir_name, business_name=business.name)

            # Prepare template data (includes theme_id and content_for_theme for premium themes)
            template_data = self._prepare_template_data(
                business, content, output_dir_name, theme_id=theme_id
            )

            # Create directory structure
            self._create_directory_structure(output_dir)

            # Copy premium theme components (shared + selected theme) into output
            self._copy_theme_files(output_dir, theme_id)

            # Generate all files (styles before pages so layout can import globals.css)
            self._generate_config_files(output_dir, template_data)
            self._generate_styles(output_dir, template_data)
            self._generate_pages(output_dir, template_data)
            self._generate_components(output_dir, template_data)
            
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
        content: Dict[str, Any],
        output_dir_name: Optional[str] = None,
        theme_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Prepare template data by combining business and content data.
        output_dir_name is used as generation_seed. theme_id selects premium theme layout.
        """
        business_slug = output_dir_name or self._slugify(business.name)
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
        
        # Escape strings that are interpolated into JS/TS string literals only (layout.tsx, SEO.tsx)
        # so apostrophes/quotes in LLM output don't break syntax. Keep business/contact unescaped
        # for normal JSX text (e.g. {{ business.name }} on the page).
        def safe_esc(s: Any) -> str:
            return self._escape_js(s) if s is not None and isinstance(s, str) else self._escape_js(str(s) if s is not None else '')

        default_meta_title = f'{business.name} | {business.industry.title()} Services'
        default_og_title = business.name
        contact_phone = contact.get('phone_display', business.phone or 'N/A')
        contact_address = contact.get('address_display', business.address)
        if contact_address is None:
            contact_address = business.address or ''

        # Prepare template data
        template_data = {
            # Business data (unescaped for JSX text; use business_escaped in SEO.tsx only)
            'business': {
                'name': business.name,
                'address': business.address or '',
                'phone': business.phone or '',
                'city': business.city or '',
                'state': business.state or '',
                'industry': business.industry,
                'rating': business.rating,
                'reviews': business.reviews or [],
            },
            # Positive Google reviews only (rating >= 4) for home page testimonials
            'positive_reviews': [
                r for r in (business.reviews or [])
                if (r.get('rating') or 0) >= 4
            ][:6],
            'business_slug': business_slug,
            'current_year': current_year,

            # Escaped business/contact for SEO.tsx (TS string literals only)
            'business_escaped': {
                'name': safe_esc(business.name),
                'address': safe_esc(business.address or ''),
                'phone': safe_esc(business.phone or ''),
                'city': safe_esc(business.city or ''),
                'state': safe_esc(business.state or ''),
            },
            'contact_escaped': {
                'form_title': safe_esc(contact.get('form_title', 'Get In Touch')),
                'form_description': safe_esc(contact.get('form_description', '')),
                'phone_display': safe_esc(contact_phone if isinstance(contact_phone, str) else str(contact_phone)),
                'address_display': safe_esc(contact_address),
            },

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
                'meta_title': safe_esc(seo.get('meta_title', default_meta_title)),
                'meta_description': safe_esc(seo.get('meta_description', '')),
                'meta_keywords': seo.get('meta_keywords', []),
                'og_title': safe_esc(seo.get('og_title', default_og_title)),
                'og_description': safe_esc(seo.get('og_description', '')),
            },
            'call_to_actions': call_to_actions[:7],  # Limit to 7
            'testimonials_section': {
                'title': testimonials_section.get('title', 'What Our Customers Say'),
                'subtitle': testimonials_section.get('subtitle', ''),
            },
            'contact': {
                'form_title': contact.get('form_title', 'Get In Touch'),
                'form_description': contact.get('form_description', ''),
                'phone_display': contact_phone,
                'address_display': contact_address if contact_address is not None else (business.address or ''),
            },
            'footer': {
                'description': footer.get('description', ''),
                'copyright_text': footer.get('copyright_text', f'© {current_year} {business.name}. All rights reserved.'),
            },
            # Design theme (for non-theme pages: about, services, contact)
            'design': resolve_design_theme(content, business.name, generation_seed=business_slug),
            # Premium theme ID for home page (aurora | midnight | horizon | mono | gradient)
            'theme_id': theme_id or 'aurora',
            # Theme CSS variables for light/dark (used by globals.css.j2)
            'theme_css_vars': get_theme_css_variables(theme_id or 'aurora'),
            # Image URLs for hero, about, service_0, ... (business-relevant keywords)
            'image_urls': get_image_urls(
                content.get('image_keywords') or {},
                business.name,
                services_count=len(services),
                unsplash_access_key=getattr(self.config, 'unsplash_access_key', None),
                industry=business.industry,
                service_names=[s.get('name') for s in services if isinstance(s, dict) and s.get('name')],
            ),
        }

        # Content shape for theme sections (same structure for all 5 themes)
        template_data['content_for_theme'] = self._build_content_for_theme(
            business, content, template_data
        )

        return template_data

    def _build_content_for_theme(
        self, business: Business, content: Dict[str, Any], template_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build the shared content object for premium theme sections (ContentProps shape)."""
        business_info = template_data.get('business_info', {})
        about_content = template_data.get('about_content', {})
        services = template_data.get('services', [])
        contact = template_data.get('contact', {})
        footer = template_data.get('footer', {})
        call_to_actions = template_data.get('call_to_actions', [])
        testimonials_section = template_data.get('testimonials_section', {})
        positive_reviews = template_data.get('positive_reviews', [])
        image_urls = template_data.get('image_urls', {})

        primary_cta = (call_to_actions[0] if call_to_actions else 'Contact Us Today')
        service_image_urls = [
            image_urls.get(f'service_{i}', '') for i in range(min(3, len(services)))
        ]

        return {
            'businessName': business.name,
            'tagline': business_info.get('tagline', ''),
            'description': business_info.get('description', ''),
            'industry': business.industry or '',
            'city': business.city or '',
            'state': business.state or '',
            'services': services,
            'testimonials': [
                {
                    'text': r.get('text', ''),
                    'author_name': r.get('author_name', ''),
                    'rating': r.get('rating', 5),
                }
                for r in positive_reviews
            ],
            'testimonialsTitle': testimonials_section.get('title', 'What Our Customers Say'),
            'testimonialsSubtitle': testimonials_section.get('subtitle', ''),
            'contactInfo': {
                'form_title': contact.get('form_title', 'Get In Touch'),
                'form_description': contact.get('form_description', ''),
                'phone_display': contact.get('phone_display', business.phone or 'N/A'),
                'address_display': contact.get('address_display', business.address or ''),
            },
            'aboutTitle': about_content.get('title', f'About {business.name}'),
            'aboutDescription': about_content.get('description', ''),
            'aboutHistory': about_content.get('history', ''),
            'aboutValues': about_content.get('values', []),
            'aboutImageUrl': image_urls.get('about', ''),
            'footerCopyright': footer.get(
                'copyright_text',
                f'© {template_data.get("current_year", 2025)} {business.name}. All rights reserved.',
            ),
            'primaryCTA': primary_cta,
            'heroImageUrl': image_urls.get('hero', ''),
            'serviceImageUrls': service_image_urls,
            'rating': business.rating,
            'reviewCount': len(business.reviews or []),
        }

    def _copy_theme_files(self, output_path: Path, theme_id: str) -> None:
        """Copy premium theme shared + selected theme folder into output src/theme/."""
        themes_root = Path(__file__).parent / 'themes'
        theme_out = output_path / 'src' / 'theme'
        theme_out.mkdir(parents=True, exist_ok=True)
        # Copy shared (content-types, theme-config-type)
        shared_src = themes_root / 'shared'
        shared_dst = theme_out / 'shared'
        if shared_src.is_dir():
            if shared_dst.exists():
                shutil.rmtree(shared_dst)
            shutil.copytree(shared_src, shared_dst)
            logger.info("Copied theme shared to %s", shared_dst)
        # Copy selected theme (aurora, midnight, etc.)
        theme_src = themes_root / theme_id
        theme_dst = theme_out / theme_id
        if theme_src.is_dir():
            if theme_dst.exists():
                shutil.rmtree(theme_dst)
            shutil.copytree(theme_src, theme_dst)
            logger.info("Copied theme %s to %s", theme_id, theme_dst)

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
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Created directory: {directory}")
    
    def _generate_config_files(
        self,
        output_path: Path,
        data: Dict[str, Any]
    ) -> None:
        """Generate configuration files (package.json first so npm install never sees an empty dir)."""
        logger.info("Generating configuration files")
        # Write package.json first so the site dir is never left without it (avoids ENOENT on 2nd site)
        self._generate_file('package.json.j2', output_path / 'package.json', data)
        other_config_files = [
            ('next.config.js.j2', output_path / 'next.config.js'),
            ('tailwind.config.js.j2', output_path / 'tailwind.config.js'),
            ('postcss.config.js.j2', output_path / 'postcss.config.js'),
            ('tsconfig.json.j2', output_path / 'tsconfig.json'),
            ('.gitignore.j2', output_path / '.gitignore'),
        ]
        for template_name, output_file in other_config_files:
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
        """Generate all page files. Home, About, Contact use premium theme when theme_id is set."""
        logger.info("Generating page files")
        theme_id = data.get('theme_id')
        home_template = 'page_theme.tsx.j2' if theme_id else 'page.tsx.j2'
        about_template = 'about_theme.tsx.j2' if theme_id else 'about_page.tsx.j2'
        contact_template = 'contact_theme.tsx.j2' if theme_id else 'contact_page.tsx.j2'

        pages = [
            ('layout.tsx.j2', output_path / 'src' / 'app' / 'layout.tsx'),
            (home_template, output_path / 'src' / 'app' / 'page.tsx'),
            (about_template, output_path / 'src' / 'app' / 'about' / 'page.tsx'),
            ('services_page.tsx.j2', output_path / 'src' / 'app' / 'services' / 'page.tsx'),
            (contact_template, output_path / 'src' / 'app' / 'contact' / 'page.tsx'),
        ]

        for template_name, output_file in pages:
            try:
                self._generate_file(template_name, output_file, data)
            except Exception as e:
                if output_file.name == 'page.tsx':
                    logger.warning("Failed to generate home page from template: %s. Writing fallback.", e)
                    self._write_fallback_page('home', output_file, data)
                elif template_name == 'about_theme.tsx.j2':
                    logger.warning("Failed to generate theme about page: %s. Using legacy about page.", e)
                    self._generate_file('about_page.tsx.j2', output_file, data)
                elif template_name == 'contact_theme.tsx.j2':
                    logger.warning("Failed to generate theme contact page: %s. Using legacy contact page.", e)
                    self._generate_file('contact_page.tsx.j2', output_file, data)
                elif template_name == 'services_page.tsx.j2':
                    logger.warning("Failed to generate services page from template: %s. Writing fallback.", e)
                    self._write_fallback_page('services', output_file, data)
                else:
                    logger.warning(
                        f"Failed to generate {output_file.name}: {str(e)}. "
                        "Continuing with other files..."
                    )
    
    def _write_fallback_page(
        self, name: str, output_path: Path, data: Dict[str, Any]
    ) -> None:
        """Write minimal fallback page so home and /services never 404."""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        business_name = (data.get('business') or {}).get('name', 'Our Business')
        # Safe for TSX text content (escape only & and <)
        safe_name = str(business_name).replace("&", "&amp;").replace("<", "&lt;")
        if name == 'home':
            content = (
                "import Link from 'next/link'\nimport SEO from '@/components/SEO'\n\n"
                "export default function Home() {\n  return (\n    <>\n      <SEO />\n"
                "      <section className=\"min-h-[60vh] flex items-center justify-center px-4\">\n"
                "        <div className=\"text-center\">\n"
                "          <h1 className=\"text-4xl font-bold mb-4\">" + safe_name + "</h1>\n"
                "          <p className=\"text-lg text-content-muted mb-8\">Welcome. Get in touch with us today.</p>\n"
                "          <Link href=\"/contact\" className=\"inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold\">Contact Us</Link>\n"
                "        </div>\n      </section>\n    </>\n  )\n}\n"
            )
        else:  # services
            content = (
                "import Link from 'next/link'\nimport SEO from '@/components/SEO'\n\n"
                "export default function ServicesPage() {\n  return (\n    <>\n      <SEO />\n"
                "      <section className=\"py-20 px-4\">\n        <div className=\"max-w-4xl mx-auto text-center\">\n"
                "          <h1 className=\"text-4xl font-bold mb-4\">Our Services</h1>\n"
                "          <p className=\"text-content-muted mb-8\">Professional services tailored to your needs.</p>\n"
                "          <Link href=\"/contact\" className=\"inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold\">Get in Touch</Link>\n"
                "        </div>\n      </section>\n    </>\n  )\n}\n"
            )
        output_path.write_text(content, encoding='utf-8')
        logger.debug("Wrote fallback page: %s", output_path)

    def _write_fallback_component(self, name: str, output_path: Path) -> None:
        """Write minimal fallback component so build never fails with module not found."""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        if name == 'SEO':
            content = (
                "export default function SEO() {\n  return <></>;\n}\n"
            )
        elif name == 'ContactForm':
            content = (
                "'use client'\n\nexport default function ContactForm() {\n"
                "  return (\n    <form className=\"space-y-4\">\n"
                "      <p>Contact form will be available soon.</p>\n    </form>\n  );\n}\n"
            )
        else:
            return
        output_path.write_text(content, encoding='utf-8')
        logger.debug(f"Wrote fallback component: {output_path}")

    def _generate_components(
        self,
        output_path: Path,
        data: Dict[str, Any]
    ) -> None:
        """Generate all component files. Writes fallbacks for SEO/ContactForm if template fails."""
        logger.info("Generating component files")

        components = [
            ('Header.tsx.j2', output_path / 'src' / 'components' / 'Header.tsx'),
            ('Footer.tsx.j2', output_path / 'src' / 'components' / 'Footer.tsx'),
            ('ServiceCard.tsx.j2', output_path / 'src' / 'components' / 'ServiceCard.tsx'),
            ('SEO.tsx.j2', output_path / 'src' / 'components' / 'SEO.tsx'),
            ('ContactForm.tsx.j2', output_path / 'src' / 'components' / 'ContactForm.tsx'),
            ('DarkModeToggle.tsx.j2', output_path / 'src' / 'components' / 'DarkModeToggle.tsx'),
        ]

        for template_name, output_file in components:
            try:
                self._generate_file(template_name, output_file, data)
            except Exception as e:
                if template_name == 'SEO.tsx.j2':
                    logger.warning(
                        f"Failed to generate SEO from template: {e}. Writing fallback."
                    )
                    self._write_fallback_component('SEO', output_file)
                elif template_name == 'ContactForm.tsx.j2':
                    logger.warning(
                        f"Failed to generate ContactForm from template: {e}. Writing fallback."
                    )
                    self._write_fallback_component('ContactForm', output_file)
                else:
                    logger.warning(
                        f"Failed to generate {output_file.name}: {str(e)}. "
                        "Continuing with other files..."
                    )
    
    def _generate_styles(
        self,
        output_path: Path,
        data: Dict[str, Any]
    ) -> None:
        """Generate style files (globals.css in app folder so layout can import with ./globals.css)."""
        logger.info("Generating style files")
        globals_path = output_path / 'src' / 'app' / 'globals.css'
        try:
            self._generate_file('globals.css.j2', globals_path, data)
        except Exception as e:
            logger.warning(
                f"Failed to generate globals.css from template: {str(e)}. Writing minimal fallback."
            )
            globals_path.parent.mkdir(parents=True, exist_ok=True)
            globals_path.write_text(
                "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
                "body { font-family: system-ui, sans-serif; }\n",
                encoding='utf-8'
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
    
    def _escape_js(self, text: Any) -> str:
        """
        Escape text for use in JavaScript/JSX string literals.
        Handles None and non-strings; safe for single- or double-quoted literals.

        Args:
            text: Text to escape (str, None, or coercible to str).

        Returns:
            Escaped text safe for JS/TS string literals.
        """
        if text is None:
            return ''
        if not isinstance(text, str):
            text = str(text)
        if not text:
            return ''

        # Escape backslash first, then quotes, then newlines
        text = text.replace('\\', '\\\\')
        text = text.replace('"', '\\"')
        text = text.replace("'", "\\'")
        text = text.replace('\n', '\\n')
        text = text.replace('\r', '')

        return text
