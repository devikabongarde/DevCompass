#!/usr/bin/env python3
"""
Test Hack Club API scraper - fetch and parse data
"""

import requests
import json
import uuid
from datetime import datetime

def fetch_hackclub_data():
    """Fetch hackathons from Hack Club API"""
    url = "https://hackathons.hackclub.com/api/events/all/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
    }
    
    try:
        print(f"Fetching hackathons from Hack Club API...")
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        print(f"✅ Successfully fetched {len(data) if isinstance(data, list) else '?'} hackathons")
        
        # Parse hackathons
        hackathons = []
        events = data if isinstance(data, list) else data.get('events', [])
        
        for item in events[:5]:  # First 5 items
            try:
                title = item.get('name', '').strip()
                if not title:
                    continue
                
                # Generate unique UUID
                hackathon_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"hackclub_{item.get('id', title)}"))
                
                hackathon = {
                    'id': hackathon_id,
                    'title': title,
                    'website': item.get('website'),
                    'city': item.get('city'),
                    'state': item.get('state'),
                    'start': item.get('start'),
                    'end': item.get('end'),
                    'banner': item.get('banner'),
                    'logo': item.get('logo'),
                }
                hackathons.append(hackathon)
                print(f"  - {title} ({item.get('city', 'Unknown')})")
            except Exception as e:
                print(f"    Error parsing: {e}")
                continue
        
        return hackathons
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching: {e}")
        return []

if __name__ == "__main__":
    hackathons = fetch_hackclub_data()
    print(f"\nParsed {len(hackathons)} hackathons:")
    print(json.dumps(hackathons, indent=2))
