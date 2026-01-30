#!/usr/bin/env python3
"""
Unstop API Client for DevCompare
Fetches hackathon data from unstop.com API and stores in Supabase
"""

import requests
import json
from datetime import datetime
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class UnstopScraper:
    def __init__(self):
        self.api_url = "https://unstop.com/api/public/opportunity/search-result"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Initialize Supabase
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials in environment variables")
            
        self.supabase: Client = create_client(supabase_url, supabase_key)

    def fetch_hackathons(self) -> List[Dict]:
        """Fetch hackathons from Unstop API"""
        print("Fetching Unstop hackathons from API...")
        
        try:
            # Unstop API parameters for hackathons
            payload = {
                "opportunity_type": "hackathons",
                "page": 1,
                "per_page": 50,
                "sort_by": "trending"
            }
            
            response = self.session.post(self.api_url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            hackathons = []
            
            for item in data.get('data', {}).get('data', []):
                hackathon = self.process_hackathon_data(item)
                if hackathon:
                    hackathons.append(hackathon)
            
            print(f"Found {len(hackathons)} hackathons from Unstop API")
            return hackathons
            
        except Exception as e:
            print(f"Error fetching from Unstop API: {str(e)}")
            return []

    def process_hackathon_data(self, item: Dict) -> Optional[Dict]:
        """Process hackathon data from API response"""
        try:
            # Extract themes/tags
            themes = []
            if 'tags' in item:
                themes = [tag.get('name', '') for tag in item['tags'][:5]]
            
            # Process dates
            start_date = item.get('start_date')
            end_date = item.get('end_date')
            deadline = item.get('end_date')
            
            # Extract prize money
            prize_money = ""
            if 'prizes' in item and item['prizes']:
                prize_money = item['prizes'][0].get('prize', '')
            
            hackathon_data = {
                'title': item.get('title', ''),
                'description': item.get('description', ''),
                'short_summary': self.generate_short_summary(item.get('description', ''), item.get('title', '')),
                'banner_url': item.get('banner_image') or 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
                'prize_money': prize_money,
                'start_date': start_date,
                'end_date': end_date,
                'registration_deadline': deadline,
                'themes': themes,
                'platform_source': 'unstop',
                'original_url': f"https://unstop.com/{item.get('public_url', '')}",
                'eligibility': item.get('eligibility', ''),
                'location_mode': 'online' if item.get('is_online', True) else 'offline',
            }
            
            return hackathon_data
            
        except Exception as e:
            print(f"Error processing hackathon data: {str(e)}")
            return None

    def generate_short_summary(self, description: str, title: str) -> str:
        """Generate a short summary"""
        if not description:
            return f"Join {title} and showcase your skills!"
        
        # Clean and truncate description
        clean_desc = description.replace('\n', ' ').strip()
        if len(clean_desc) <= 150:
            return clean_desc
        
        return clean_desc[:147].strip() + '...'

    def save_to_supabase(self, hackathons: List[Dict]) -> int:
        """Save hackathons to Supabase database"""
        if not hackathons:
            return 0
        
        print(f"Saving {len(hackathons)} hackathons to database...")
        saved_count = 0
        
        for hackathon in hackathons:
            try:
                # Check if hackathon already exists
                existing = self.supabase.table('hackathons').select('id').eq('original_url', hackathon['original_url']).execute()
                
                if existing.data:
                    # Update existing hackathon
                    self.supabase.table('hackathons').update(hackathon).eq('original_url', hackathon['original_url']).execute()
                    print(f"Updated: {hackathon['title']}")
                else:
                    # Insert new hackathon
                    self.supabase.table('hackathons').insert(hackathon).execute()
                    print(f"Added: {hackathon['title']}")
                
                saved_count += 1
                
            except Exception as e:
                print(f"Error saving {hackathon.get('title', 'Unknown')}: {str(e)}")
        
        return saved_count

    def run(self):
        """Main function"""
        print("Starting Unstop API client...")
        
        hackathons = self.fetch_hackathons()
        if hackathons:
            saved_count = self.save_to_supabase(hackathons)
            print(f"Successfully processed {saved_count} hackathons from Unstop")
        else:
            print("No hackathons found to save")

if __name__ == "__main__":
    scraper = UnstopScraper()
    scraper.run()