"""Website scraper service for extracting content from competitor websites."""

import logging
import time
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse
import requests
from requests.exceptions import (
    RequestException,
    Timeout,
    ConnectionError,
    SSLError,
    TooManyRedirects
)
from bs4 import BeautifulSoup

from src.utils.config import Config


logger = logging.getLogger(__name__)


class WebsiteScraperService:
    """Service for scraping and extracting content from websites."""
    
    def __init__(self, config: Config):
        """
        Initialize website scraper service.
        
        Args:
            config: Configuration instance containing settings.
        """
        self.config = config
        self.timeout = 10  # seconds
        self.max_content_length = 5000  # characters to limit content size
        self.user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
        self.request_delay = 0.5  # seconds between requests
        logger.info("WebsiteScraperService initialized")
    
    def scrape_website_content(self, website_url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape content from a website URL.
        
        Args:
            website_url: URL of the website to scrape.
            
        Returns:
            Dictionary with structured content, or None if scraping fails.
        """
        if not website_url:
            logger.warning("No website URL provided for scraping")
            return None
        
        website_url = website_url.strip()
        
        # Ensure URL has a scheme
        if not website_url.startswith(('http://', 'https://')):
            website_url = 'https://' + website_url
        
        logger.info(f"Scraping website: {website_url}")
        
        try:
            # Validate URL format
            parsed = urlparse(website_url)
            if not parsed.scheme or not parsed.netloc:
                logger.warning(f"Invalid URL format: {website_url}")
                return None
            
            # Make HTTP GET request
            headers = {
                'User-Agent': self.user_agent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
            
            try:
                response = requests.get(
                    website_url,
                    headers=headers,
                    timeout=self.timeout,
                    allow_redirects=True
                )
                
                # Check if request was successful
                if response.status_code != 200:
                    logger.warning(
                        f"Website returned non-200 status code: {website_url} "
                        f"(status: {response.status_code})"
                    )
                    return None
                
                # Parse HTML content
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract content
                content_data = self._extract_content(soup, website_url)
                
                logger.info(
                    f"Successfully scraped website: {website_url} "
                    f"(content length: {len(content_data.get('content', ''))})"
                )
                
                return content_data
                
            except Timeout:
                logger.warning(f"Timeout while scraping website: {website_url}")
                return None
            except SSLError as e:
                logger.warning(f"SSL error while scraping {website_url}: {str(e)}")
                return None
            except ConnectionError as e:
                logger.warning(f"Connection error while scraping {website_url}: {str(e)}")
                return None
            except TooManyRedirects:
                logger.warning(f"Too many redirects for website: {website_url}")
                return None
            except RequestException as e:
                logger.warning(f"Request error while scraping {website_url}: {str(e)}")
                return None
                
        except Exception as e:
            logger.error(
                f"Unexpected error scraping website {website_url}: {str(e)}",
                exc_info=True
            )
            return None
    
    def _extract_content(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """
        Extract structured content from parsed HTML.
        
        Args:
            soup: BeautifulSoup parsed HTML object.
            url: Original URL of the page.
            
        Returns:
            Dictionary with extracted content.
        """
        # Extract title
        title_tag = soup.find('title')
        title = title_tag.get_text(strip=True) if title_tag else ""
        
        # Extract meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        meta_description = meta_desc.get('content', '') if meta_desc else ""
        
        # Extract meta keywords
        meta_keywords_tag = soup.find('meta', attrs={'name': 'keywords'})
        meta_keywords_str = meta_keywords_tag.get('content', '') if meta_keywords_tag else ""
        meta_keywords = [
            kw.strip() 
            for kw in meta_keywords_str.split(',') 
            if kw.strip()
        ] if meta_keywords_str else []
        
        # Extract headings (h1, h2, h3)
        headings = []
        for tag in ['h1', 'h2', 'h3']:
            for heading in soup.find_all(tag):
                heading_text = heading.get_text(strip=True)
                if heading_text:
                    headings.append(heading_text)
        
        # Extract main content (paragraphs)
        # Remove script, style, nav, footer, header tags
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            tag.decompose()
        
        # Get all paragraph text
        paragraphs = soup.find_all('p')
        content_text = ' '.join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
        
        # Limit content size
        if len(content_text) > self.max_content_length:
            content_text = content_text[:self.max_content_length] + "..."
        
        # Extract links (internal navigation)
        links = []
        parsed_url = urlparse(url)
        base_domain = f"{parsed_url.scheme}://{parsed_url.netloc}"
        
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            if href:
                # Convert relative URLs to absolute
                if href.startswith('/'):
                    href = base_domain + href
                elif not href.startswith(('http://', 'https://')):
                    continue
                
                # Only include internal links
                if href.startswith(base_domain):
                    link_text = link.get_text(strip=True)
                    if link_text:
                        links.append(href)
        
        # Remove duplicates from links
        links = list(set(links))[:20]  # Limit to 20 links
        
        # Extract images (alt text for context)
        images = []
        for img in soup.find_all('img', alt=True):
            alt_text = img.get('alt', '')
            if alt_text:
                images.append(alt_text)
        
        images = images[:20]  # Limit to 20 images
        
        # Extract page structure info
        structure = {
            'has_nav': bool(soup.find('nav')),
            'has_footer': bool(soup.find('footer')),
            'has_header': bool(soup.find('header')),
            'heading_count': len(headings),
            'paragraph_count': len(paragraphs),
            'link_count': len(links),
            'image_count': len(images),
        }
        
        return {
            'url': url,
            'title': title,
            'meta_description': meta_description,
            'meta_keywords': meta_keywords,
            'headings': headings,
            'content': content_text,
            'links': links,
            'images': images,
            'structure': structure,
        }
    
    def scrape_multiple_websites(self, websites: List[str]) -> List[Dict[str, Any]]:
        """
        Scrape content from multiple websites.
        
        Args:
            websites: List of website URLs to scrape.
            
        Returns:
            List of content dictionaries (failed scrapes are skipped).
        """
        logger.info(f"Scraping {len(websites)} websites")
        
        scraped_content = []
        
        for i, website_url in enumerate(websites):
            try:
                # Add delay between requests (except for first request)
                if i > 0:
                    time.sleep(self.request_delay)
                
                content = self.scrape_website_content(website_url)
                if content:
                    scraped_content.append(content)
                else:
                    logger.warning(f"Failed to scrape website: {website_url}")
                    
            except Exception as e:
                logger.error(
                    f"Error scraping website {website_url}: {str(e)}",
                    exc_info=True
                )
                # Continue with next website
                continue
        
        logger.info(
            f"Website scraping completed: {len(scraped_content)}/{len(websites)} "
            f"websites successfully scraped"
        )
        
        return scraped_content
