#!/usr/bin/env python3
"""
Devpost Live API Scraper for DevCompare
Fetches live hackathon data from devpost.com API
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_devpost_hackathons():
    """Fetch live hackathons from Devpost API"""
    print("Fetching live Devpost hackathons...")
    
    url = "https://devpost.com/api/hackathons"
    params = {
        'order_by': 'recently-added',
        'per_page': 20
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://devpost.com/hackathons'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        print(f"API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Raw API response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            hackathons = []
            
            # Handle different possible response structures
            hackathon_list = []
            if isinstance(data, dict):
                hackathon_list = data.get('hackathons', data.get('data', []))
            elif isinstance(data, list):
                hackathon_list = data
            
            print(f"Found {len(hackathon_list)} hackathons in response")
            
            for item in hackathon_list:
                try:
                    # Extract basic info
                    title = item.get('title', '')
                    if not title:
                        continue
                    
                    # Extract description (not available in this API, use title)
                    description = f"Join {title} and showcase your skills in this exciting hackathon!"
                    
                    # Extract URL
                    original_url = item.get('url', '')
                    
                    # Extract themes
                    themes = []
                    if 'themes' in item and isinstance(item['themes'], list):
                        themes = [theme.get('name', '') for theme in item['themes'][:5] if isinstance(theme, dict)]
                    
                    # Extract dates from submission_period_dates string
                    start_date = None
                    end_date = None
                    deadline = None
                    
                    # Don't store the raw date string in timestamp fields
                    # Just store it as text in description for now
                    date_info = ""
                    if 'submission_period_dates' in item:
                        date_info = item['submission_period_dates']
                    
                    # Update description to include date info
                    if date_info:
                        description = f"Join {title} and showcase your skills! Dates: {date_info}"
                    
                    # Extract prize
                    prize_money = ""
                    if 'prize_amount' in item and item['prize_amount']:
                        prize_money = str(item['prize_amount'])
                    
                    # Extract image
                    banner_url = item.get('thumbnail_url', '')
                    if banner_url and not banner_url.startswith('http'):
                        banner_url = f"https:{banner_url}"
                    
                    # Extract location info
                    location_mode = 'online'
                    if 'displayed_location' in item and item['displayed_location']:
                        location_info = item['displayed_location']
                        if isinstance(location_info, dict) and location_info.get('location'):
                            location_mode = 'offline'
                    
                    hackathon = {
                        'title': title,
                        'description': description,
                        'short_summary': description[:147] + '...' if len(description) > 150 else description,
                        'banner_url': banner_url,
                        'prize_money': prize_money,
                        'start_date': start_date,
                        'end_date': end_date,
                        'registration_deadline': None,  # Set to None to avoid format issues
                        'themes': themes,
                        'platform_source': 'devpost',
                        'original_url': original_url,
                        'eligibility': 'Open to all developers',
                        'location_mode': location_mode,
                    }
                    
                    hackathons.append(hackathon)
                    print(f"Processed: {title}")
                    
                except Exception as e:
                    print(f"Error processing hackathon: {str(e)}")
                    continue
            
            print(f"Successfully processed {len(hackathons)} hackathons from Devpost")
            return hackathons
        else:
            print(f"API request failed with status {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return []
            
    except Exception as e:
        print(f"Error fetching from Devpost API: {str(e)}")
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
            response = requests.post(
                f'{supabase_url}/rest/v1/hackathons',
                headers=headers,
                json=hackathon
            )
            
            if response.status_code == 201:
                print(f"Added: {hackathon['title']}")
                saved_count += 1
            elif response.status_code == 409:
                print(f"Already exists: {hackathon['title']}")
            else:
                print(f"Error saving {hackathon['title']}: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"Error saving {hackathon.get('title', 'Unknown')}: {str(e)}")
    
    return saved_count

def main():
    print("Starting live Devpost API scraper...")
    hackathons = fetch_devpost_hackathons()
    
    if hackathons:
        saved_count = save_to_supabase(hackathons)
        print(f"Successfully processed {saved_count} new hackathons from Devpost!")
        print("Check your DevCompare app for new hackathons!")
    else:
        print("No hackathons found or processed")

if __name__ == "__main__":
    main()