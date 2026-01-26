#!/usr/bin/env python3
"""
Devpost API Client for DevCompare
Fetches real hackathon data from devpost.com API
"""

import requests
import json
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_devpost_hackathons():
    """Fetch hackathons from Devpost API"""
    print("Fetching Devpost hackathons...")
    
    url = "https://devpost.com/api/hackathons"
    
    params = {
        'order_by': 'recently-added',
        'per_page': 20
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        hackathons = []
        
        for item in data.get('hackathons', []):
            # Extract themes
            themes = []
            if 'themes' in item:
                themes = [theme.get('name', '') for theme in item['themes'][:5]]
            
            # Extract dates
            dates = item.get('submission_period_dates', {})
            
            # Extract prize
            prize_money = ""
            if 'prizes' in item and item['prizes']:
                total_prize = item['prizes'].get('total_prize_amount')
                if total_prize:
                    prize_money = f"${total_prize:,}"
            
            hackathon = {
                'title': item.get('title', ''),
                'description': item.get('description', ''),
                'short_summary': item.get('tagline', '') or f"Join {item.get('title', '')} and build something amazing!",
                'banner_url': item.get('thumbnail_url'),
                'prize_money': prize_money,
                'start_date': dates.get('start'),
                'end_date': dates.get('end'),
                'registration_deadline': dates.get('end'),
                'themes': themes,
                'platform_source': 'devpost',
                'original_url': item.get('url', ''),
                'eligibility': item.get('eligibility', ''),
                'location_mode': 'online' if item.get('online', True) else 'offline',
            }
            hackathons.append(hackathon)
        
        print(f"Found {len(hackathons)} hackathons from Devpost")
        return hackathons
        
    except Exception as e:
        print(f"Error fetching from Devpost: {str(e)}")
        return []

def save_to_supabase(hackathons):
    """Save hackathons to Supabase"""
    if not hackathons:
        return 0
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    saved_count = 0
    
    for hackathon in hackathons:
        try:
            # Insert hackathon (will skip if URL already exists due to unique constraint)
            response = requests.post(
                f'{supabase_url}/rest/v1/hackathons',
                headers=headers,
                json=hackathon
            )
            
            if response.status_code == 201:
                print(f"Added: {hackathon['title']}")
                saved_count += 1
            elif response.status_code == 409:
                print(f"Exists: {hackathon['title']}")
            else:
                print(f"Error saving {hackathon['title']}: {response.text}")
                
        except Exception as e:
            print(f"Error saving {hackathon.get('title', 'Unknown')}: {str(e)}")
    
    return saved_count

def main():
    print("Starting Devpost scraper...")
    hackathons = fetch_devpost_hackathons()
    
    if hackathons:
        saved_count = save_to_supabase(hackathons)
        print(f"Successfully processed {saved_count} new hackathons from Devpost")
    else:
        print("No hackathons found")

if __name__ == "__main__":
    main()