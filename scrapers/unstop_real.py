#!/usr/bin/env python3
"""
Unstop API Client for DevCompare
Fetches real hackathon data from unstop.com API
"""

import requests
import json
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_unstop_hackathons():
    """Fetch hackathons from Unstop API"""
    print("Fetching Unstop hackathons...")
    
    url = "https://unstop.com/api/public/opportunity/search-result"
    
    payload = {
        "opportunity_type": "hackathons",
        "page": 1,
        "per_page": 20,
        "sort_by": "trending"
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        hackathons = []
        
        for item in data.get('data', {}).get('data', []):
            hackathon = {
                'title': item.get('title', ''),
                'description': item.get('description', ''),
                'short_summary': item.get('short_description', '')[:150] + '...' if item.get('short_description') else f"Join {item.get('title', '')} and showcase your skills!",
                'banner_url': item.get('banner_image'),
                'prize_money': item.get('prizes', [{}])[0].get('prize', '') if item.get('prizes') else '',
                'start_date': item.get('start_date'),
                'end_date': item.get('end_date'),
                'registration_deadline': item.get('end_date'),
                'themes': [tag.get('name', '') for tag in item.get('tags', [])[:5]],
                'platform_source': 'unstop',
                'original_url': f"https://unstop.com/{item.get('public_url', '')}",
                'eligibility': item.get('eligibility', ''),
                'location_mode': 'online' if item.get('is_online', True) else 'offline',
            }
            hackathons.append(hackathon)
        
        print(f"Found {len(hackathons)} hackathons from Unstop")
        return hackathons
        
    except Exception as e:
        print(f"Error fetching from Unstop: {str(e)}")
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
    print("Starting Unstop scraper...")
    hackathons = fetch_unstop_hackathons()
    
    if hackathons:
        saved_count = save_to_supabase(hackathons)
        print(f"Successfully processed {saved_count} new hackathons from Unstop")
    else:
        print("No hackathons found")

if __name__ == "__main__":
    main()