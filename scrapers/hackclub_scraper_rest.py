#!/usr/bin/env python3
"""
Hack Club Scraper - Insert hackathons via direct Supabase REST API
"""

import requests
import json
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase configuration in .env file")

def fetch_hackclub_hackathons():
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
        
        for item in events:
            try:
                hackathon = parse_hackclub_hackathon(item)
                if hackathon:
                    hackathons.append(hackathon)
            except Exception as e:
                print(f"Error parsing hackathon: {e}")
                continue
        
        print(f"Successfully parsed {len(hackathons)} hackathons")
        return hackathons
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Hack Club API: {e}")
        return []

def parse_hackclub_hackathon(item):
    """Parse a single hackathon from Hack Club API response"""
    try:
        # Extract basic information
        title = item.get('name', '').strip()
        if not title:
            return None
            
        # Clean title
        title = title.encode('ascii', 'ignore').decode('ascii')
        
        # Generate unique UUID
        hackathon_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"hackclub_{item.get('id', title)}"))
        
        # Extract description and summary
        # Hack Club API doesn't have description, so we'll use a generic one
        description = ''
        city = item.get('city', '')
        state = item.get('state', '')
        location_str = f"{city}, {state}" if city and state else (city or state or "Various Locations")
        short_summary = f"A Hack Club hackathon event at {location_str}. Check website for more details."
        
        # Extract dates from Hack Club API format
        start_date = item.get('start')  # Format: 2026-03-28T08:00:00.000Z
        end_date = item.get('end')
        registration_deadline = None  # Not available in Hack Club API
        
        # Determine location mode
        location_mode = 'in-person'
        if not city and not state:
            location_mode = 'online'
        
        # Extract URL - use website field
        original_url = item.get('website', '') or item.get('url', '') or ''
        
        # Extract banner/logo
        banner_url = item.get('banner') or item.get('logo') or ''
        
        # Extract themes/tags
        themes = ['Hackathon']
        
        # Prize money - not available in Hack Club API
        prize_money = ''
        
        # Build hackathon object
        hackathon = {
            'id': hackathon_id,
            'title': title,
            'description': description,
            'short_summary': short_summary,
            'banner_url': banner_url,
            'prize_money': prize_money,
            'start_date': start_date,
            'end_date': end_date,
            'registration_deadline': registration_deadline,
            'themes': themes,
            'platform_source': 'hackclub',
            'original_url': original_url,
            'eligibility': '',
            'location_mode': location_mode,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
        }
        
        return hackathon
        
    except Exception as e:
        print(f"Error parsing individual hackathon: {e}")
        return None

def insert_hackathons_to_db(hackathons):
    """Insert hackathons into Supabase database using REST API"""
    if not hackathons:
        print("No hackathons to insert")
        return
    
    url = f"{SUPABASE_URL}/rest/v1/hackathons"
    
    headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    try:
        print(f"\nInserting {len(hackathons)} hackathons into database...")
        
        # Insert in batches of 100
        batch_size = 100
        for i in range(0, len(hackathons), batch_size):
            batch = hackathons[i:i+batch_size]
            print(f"  Inserting batch {i//batch_size + 1}/{(len(hackathons) + batch_size - 1)//batch_size}...")
            
            response = requests.post(
                url,
                headers=headers,
                json=batch,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                print(f"    ✅ Successfully inserted {len(batch)} hackathons")
            else:
                print(f"    ❌ Error: {response.status_code} - {response.text[:200]}")
                return False
        
        print(f"\n✅ Successfully inserted {len(hackathons)} hackathons into database!")
        return True
        
    except Exception as e:
        print(f"❌ Error inserting into database: {e}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("🎉 Hack Club Hackathons Scraper")
    print("=" * 60)
    
    # Fetch hackathons
    hackathons = fetch_hackclub_hackathons()
    
    if hackathons:
        # Insert into database
        insert_hackathons_to_db(hackathons)
    else:
        print("❌ No hackathons fetched")

if __name__ == "__main__":
    main()
