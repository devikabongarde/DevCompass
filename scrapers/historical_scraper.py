"""
Historical Intelligence Engine - Web Scraper Module
Scrapes past hackathon winners from Devpost and Devfolio
Uses synchronous Playwright API to avoid greenlet DLL issues
"""

import json
import re
import time
from typing import List, Dict, Optional, Any
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright, Page, Browser
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HackathonScraper:
    """Base scraper class with common functionality"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.context = None
        self.playwright = None
        
    def initialize(self):
        """Initialize browser"""
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=self.headless)
        self.context = self.browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        
    def close(self):
        """Close browser"""
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()


class DevpostScraper(HackathonScraper):
    """Scraper for Devpost hackathons"""
    
    def get_organizer_profile(self, hackathon_url: str) -> Optional[str]:
        """Extract organizer profile URL from hackathon page"""
        logger.info(f"Visiting hackathon page: {hackathon_url}")
        page = self.context.new_page()
        
        try:
            page.goto(hackathon_url, wait_until='networkidle', timeout=30000)
            
            # Look for organizer link
            organizer_selectors = [
                'a[href*="/organizations/"]',
                '.organizer a',
                'a.host-link',
                '[data-role="organizer"] a'
            ]
            
            for selector in organizer_selectors:
                element = page.query_selector(selector)
                if element:
                    href = element.get_attribute('href')
                    if href and '/organizations/' in href:
                        org_url = urljoin('https://devpost.com', href)
                        logger.info(f"Found organizer: {org_url}")
                        return org_url
            
            # Fallback: search in page content
            content = page.content()
            match = re.search(r'devpost\.com/organizations/([a-zA-Z0-9-_]+)', content)
            if match:
                org_url = f"https://devpost.com/organizations/{match.group(1)}"
                logger.info(f"Found organizer via regex: {org_url}")
                return org_url
                
            logger.warning("Could not find organizer profile")
            return None
            
        except Exception as e:
            logger.error(f"Error getting organizer: {e}")
            return None
        finally:
            page.close()
            
    def get_past_hackathons(self, organizer_url: str) -> List[str]:
        """Get all past hackathon URLs from organizer profile"""
        logger.info(f"Fetching past hackathons from: {organizer_url}")
        page = self.context.new_page()
        hackathon_urls = []
        
        try:
            page.goto(organizer_url, wait_until='networkidle', timeout=30000)
            page.wait_for_selector('a[href*=".devpost.com"]', timeout=10000)
            
            hackathon_links = page.query_selector_all('a[href*=".devpost.com"]')
            
            for link in hackathon_links:
                href = link.get_attribute('href')
                if href:
                    if '.devpost.com' in href and not any(x in href for x in ['/users/', '/software/', '/challenges']):
                        if not href.startswith('http'):
                            href = 'https://' + href
                        if href not in hackathon_urls:
                            hackathon_urls.append(href)
                            
            logger.info(f"Found {len(hackathon_urls)} past hackathons")
            return hackathon_urls
            
        except Exception as e:
            logger.error(f"Error getting past hackathons: {e}")
            return []
        finally:
            page.close()
            
    def scrape_winners(self, hackathon_url: str) -> Dict[str, Any]:
        """Scrape winning projects from a hackathon's project gallery"""
        if not hackathon_url.endswith('/'):
            hackathon_url += '/'
        gallery_url = hackathon_url + 'project-gallery'
        
        logger.info(f"Scraping winners from: {gallery_url}")
        page = self.context.new_page()
        
        hackathon_data = {
            'hackathon_url': hackathon_url,
            'gallery_url': gallery_url,
            'hackathon_name': '',
            'year': '',
            'winners': []
        }
        
        try:
            page.goto(gallery_url, wait_until='networkidle', timeout=30000)
            
            title_elem = page.query_selector('h1, .header-title, #header h1')
            if title_elem:
                hackathon_data['hackathon_name'] = title_elem.inner_text()
                
            year_match = re.search(r'20\d{2}', hackathon_data['hackathon_name'] + hackathon_url)
            if year_match:
                hackathon_data['year'] = year_match.group(0)
            
            page.wait_for_selector('.software-entry, .gallery-item', timeout=10000)
            
            winner_selectors = [
                '.software-entry.winner',
                '.gallery-item.winner',
                'article.winner',
            ]
            
            winners_found = set()
            
            for selector in winner_selectors:
                winner_cards = page.query_selector_all(selector)
                
                for card in winner_cards:
                    project_data = self._extract_project_data(card)
                    
                    if project_data and project_data['url'] not in winners_found:
                        winners_found.add(project_data['url'])
                        hackathon_data['winners'].append(project_data)
            
            logger.info(f"Found {len(hackathon_data['winners'])} winners")
            return hackathon_data
            
        except Exception as e:
            logger.error(f"Error scraping winners: {e}")
            return hackathon_data
        finally:
            page.close()
            
    def _extract_project_data(self, card_element) -> Optional[Dict[str, Any]]:
        """Extract project data from a card element"""
        try:
            title_link = card_element.query_selector('a[href*="/software/"], h5 a, .software-entry-name a')
            if not title_link:
                return None
                
            title = title_link.inner_text().strip()
            url = title_link.get_attribute('href')
            
            if not url.startswith('http'):
                url = urljoin('https://devpost.com', url)
            
            # Tagline
            tagline_elem = card_element.query_selector('.tagline, .software-tagline, p')
            tagline = tagline_elem.inner_text() if tagline_elem else ""
            
            # Prize info
            prize_elem = card_element.query_selector('.winner-ribbon, .prize-tag, [class*="prize"]')
            prize = prize_elem.inner_text() if prize_elem else ""
            
            # Technologies
            tech_elements = card_element.query_selector_all('.tag, .tech-tag, [class*="built-with"] li')
            technologies = []
            for tech in tech_elements:
                tech_text = tech.inner_text().strip()
                if tech_text:
                    technologies.append(tech_text)
            
            return {
                'title': title,
                'url': url,
                'tagline': tagline.strip(),
                'prize': prize.strip(),
                'technologies': technologies
            }
            
        except Exception as e:
            logger.debug(f"Error extracting project data: {e}")
            return None


def scrape_hackathon_history(
    hackathon_url: str,
    platform: str = 'devpost',
    max_past_editions: int = 3
) -> Dict[str, Any]:
    """Main pipeline: Scrape historical data for a hackathon"""
    results = {
        'input_url': hackathon_url,
        'platform': platform,
        'organizer_url': None,
        'past_hackathons': []
    }
    
    scraper = DevpostScraper(headless=True)
    scraper.initialize()
    
    try:
        # Step 1: Get organizer profile
        org_url = scraper.get_organizer_profile(hackathon_url)
        results['organizer_url'] = org_url
        
        if not org_url:
            logger.error("Could not find organizer profile")
            return results
        
        # Step 2: Get past hackathons
        past_urls = scraper.get_past_hackathons(org_url)
        past_urls = past_urls[:max_past_editions]
        
        # Step 3: Scrape winners from each past edition
        for url in past_urls:
            logger.info(f"Processing: {url}")
            hackathon_data = scraper.scrape_winners(url)
            results['past_hackathons'].append(hackathon_data)
            time.sleep(2)  # Rate limiting
            
    finally:
        scraper.close()
    
    return results


if __name__ == "__main__":
    def main():
        devpost_url = "https://bevhacks-2026.devpost.com"
        results = scrape_hackathon_history(devpost_url, max_past_editions=2)
        
        with open('historical_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Scraped {len(results['past_hackathons'])} past hackathons")
        
    main()
