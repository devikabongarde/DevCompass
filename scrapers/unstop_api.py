#!/usr/bin/env python3
"""
Unstop API Scraper - Fetches hackathons from Unstop's public API
"""

import requests
import json
import os
import uuid
import re
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase configuration in .env file")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def fetch_unstop_hackathons():
    """Fetch hackathons from Unstop API"""
    url = "https://unstop.com/api/public/opportunity/search-result"
    
    # Parameters for hackathons
    params = {
        'opportunity': 'hackathons',
        'per_page': 50,
        'page': 1
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://unstop.com/',
    }
    
    try:
        print(f"Fetching hackathons from Unstop API...")
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        print(f"API Response Status: {response.status_code}")
        
        # Extract hackathons from response
        hackathons = []
        if 'data' in data and 'data' in data['data']:
            opportunities = data['data']['data']
            print(f"Found {len(opportunities)} opportunities")
            
            for item in opportunities:
                try:
                    hackathon = parse_unstop_hackathon(item)
                    if hackathon:
                        hackathons.append(hackathon)
                except Exception as e:
                    print(f"Error parsing hackathon: {e}")
                    continue
        
        print(f"Successfully parsed {len(hackathons)} hackathons")
        return hackathons
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Unstop API: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        return []

def parse_unstop_hackathon(item):
    """Parse a single hackathon from Unstop API response"""
    try:
        # Extract basic information
        title = item.get('title', '').strip()
        if not title:
            return None
            
        # Clean title of special characters
        title = title.encode('ascii', 'ignore').decode('ascii')
        
        # Generate unique UUID
        hackathon_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"unstop_{item.get('id', '')}"))
        
        # Extract description and summary
        description = item.get('description', '') or item.get('about', '') or item.get('details', '') or ''
        # Clean and format description
        if description:
            # Remove HTML tags
            description = re.sub(r'<[^>]+>', '', description)
            # Remove HTML entities
            description = re.sub(r'&[a-zA-Z0-9#]+;', ' ', description)
            # Clean special characters and encode
            description = description.encode('ascii', 'ignore').decode('ascii').strip()
            # Remove extra whitespace and newlines
            description = ' '.join(description.split())
            # Limit length
            if len(description) > 500:
                description = description[:500] + '...'
        
        short_summary = item.get('tagline', '') or item.get('summary', '') or description[:150] + '...' if len(description) > 150 else description
        if short_summary:
            short_summary = short_summary.encode('ascii', 'ignore').decode('ascii').strip()
        
        # Extract dates
        start_date = None
        end_date = None
        registration_deadline = None
        
        if 'start_date' in item:
            start_date = item['start_date']
        if 'end_date' in item:
            end_date = item['end_date']
        if 'regnRequiredTill' in item:
            registration_deadline = item['regnRequiredTill']
        elif 'registration_end_date' in item:
            registration_deadline = item['registration_end_date']
            
        # Extract prize money with better formatting
        prize_money = None
        if 'prizes' in item and item['prizes']:
            if isinstance(item['prizes'], list) and len(item['prizes']) > 0:
                # Extract from first prize entry
                first_prize = item['prizes'][0]
                if isinstance(first_prize, dict):
                    cash = first_prize.get('cash', 0)
                    currency = first_prize.get('currency', '')
                    if cash and cash > 0:
                        if 'rupee' in currency.lower():
                            prize_money = f"Prize Pool: ₹{cash:,}"
                        else:
                            prize_money = f"Prize Pool: ${cash:,}"
                    elif first_prize.get('rank'):
                        prize_money = first_prize.get('rank')
            else:
                prize_text = str(item['prizes'])
                # Clean JSON-like strings
                if prize_text.startswith('[') or prize_text.startswith('{'):
                    try:
                        # Try to parse as JSON and extract meaningful text
                        parsed = json.loads(prize_text) if isinstance(prize_text, str) else item['prizes']
                        if isinstance(parsed, list) and len(parsed) > 0:
                            first_item = parsed[0]
                            if isinstance(first_item, dict):
                                if 'cash' in first_item and first_item['cash']:
                                    cash = first_item['cash']
                                    currency = first_item.get('currency', '')
                                    if 'rupee' in currency.lower():
                                        prize_money = f"Prize Pool: ₹{cash:,}"
                                    else:
                                        prize_money = f"Prize Pool: ${cash:,}"
                                elif 'amount' in first_item:
                                    prize_money = f"Prize Pool: {first_item['amount']}"
                                elif 'title' in first_item:
                                    prize_money = f"Prize Pool: {first_item['title']}"
                    except:
                        # If JSON parsing fails, clean the string
                        prize_text = re.sub(r'[\[\]{}"\']', '', prize_text)
                        prize_text = prize_text.encode('ascii', 'ignore').decode('ascii').strip()
                        if prize_text and prize_text != 'None' and len(prize_text) < 100:
                            prize_money = f"Prize Pool: {prize_text}"
                else:
                    prize_text = prize_text.encode('ascii', 'ignore').decode('ascii').strip()
                    if prize_text and prize_text != 'None' and len(prize_text) < 100:
                        prize_money = f"Prize Pool: {prize_text}"
        elif 'prize_money' in item and item['prize_money']:
            prize_text = str(item['prize_money']).encode('ascii', 'ignore').decode('ascii')
            if prize_text and prize_text != 'None':
                prize_money = f"Prize Pool: {prize_text}"
        elif 'total_prize' in item and item['total_prize']:
            prize_text = str(item['total_prize']).encode('ascii', 'ignore').decode('ascii')
            if prize_text and prize_text != 'None':
                prize_money = f"Prize Pool: {prize_text}"
            
        # Extract themes/categories
        themes = []
        if 'tags' in item and isinstance(item['tags'], list):
            themes = [tag.get('name', '') for tag in item['tags'] if tag.get('name')]
        elif 'categories' in item and isinstance(item['categories'], list):
            themes = [cat.get('name', '') for cat in item['categories'] if cat.get('name')]
        elif 'opportunity_type' in item:
            themes = [item['opportunity_type']]
            
        # Extract other details
        location_mode = 'online'  # Default to online
        if 'mode' in item and item['mode']:
            mode_value = str(item['mode']).lower()
            if 'offline' in mode_value or 'physical' in mode_value:
                location_mode = 'offline'
            elif 'hybrid' in mode_value:
                location_mode = 'hybrid'
        elif 'type' in item and item['type']:
            type_value = str(item['type']).lower()
            if 'offline' in type_value or 'physical' in type_value:
                location_mode = 'offline'
            elif 'hybrid' in type_value:
                location_mode = 'hybrid'
            
        eligibility = item.get('eligibility', '') or item.get('who_can_participate', '')
        
        # Extract banner image with better URL handling
        banner_url = None
        # Try multiple possible image fields in order of preference
        image_fields = ['public_url', 'banner_image', 'cover_pic', 'banner', 'image', 'logo', 'cover_image', 'thumbnail', 'poster']
        
        for field in image_fields:
            if field in item and item[field]:
                url = item[field]
                if isinstance(url, str) and url.strip():
                    # Clean and validate URL
                    url = url.strip()
                    if url.startswith('http'):
                        banner_url = url
                        break
                    elif url.startswith('//'):
                        banner_url = f"https:{url}"
                        break
                    elif url.startswith('/'):
                        banner_url = f"https://unstop.com{url}"
                        break
                elif isinstance(url, dict):
                    # Handle nested URL objects
                    for sub_field in ['url', 'src', 'href', 'link']:
                        if sub_field in url and url[sub_field]:
                            nested_url = str(url[sub_field]).strip()
                            if nested_url.startswith('http'):
                                banner_url = nested_url
                                break
                            elif nested_url.startswith('//'):
                                banner_url = f"https:{nested_url}"
                                break
                            elif nested_url.startswith('/'):
                                banner_url = f"https://unstop.com{nested_url}"
                                break
                    if banner_url:
                        break
        
        # If no banner found, try to construct from ID or use a default
        if not banner_url and item.get('id'):
            # Try common Unstop image patterns
            unstop_id = item.get('id')
            banner_url = f"https://d8it4huxumps7.cloudfront.net/uploads/images/opportunity/{unstop_id}/banner.jpg"
            
        # Create original URL
        original_url = f"https://unstop.com/hackathons/{item.get('id', '')}"
        if 'url' in item:
            original_url = item['url'] if item['url'].startswith('http') else f"https://unstop.com{item['url']}"
        
        hackathon = {
            'id': hackathon_id,
            'title': title,
            'description': description,
            'short_summary': short_summary,
            'start_date': start_date,
            'end_date': end_date,
            'registration_deadline': registration_deadline,
            'location_mode': location_mode,
            'prize_money': prize_money,
            'themes': themes,
            'eligibility': eligibility,
            'banner_url': banner_url,
            'original_url': original_url,
            'platform_source': 'unstop'
        }
        
        return hackathon
        
    except Exception as e:
        print(f"Error parsing hackathon item: {e}")
        return None

def save_to_supabase(hackathons):
    """Save hackathons to Supabase database"""
    if not hackathons:
        print("No hackathons to save")
        return
        
    try:
        print(f"Saving {len(hackathons)} hackathons to database...")
        
        saved_count = 0
        for hackathon in hackathons:
            try:
                # Clean all string fields to prevent encoding issues
                cleaned_hackathon = {}
                for key, value in hackathon.items():
                    if isinstance(value, str):
                        # Remove non-ASCII characters
                        cleaned_hackathon[key] = value.encode('ascii', 'ignore').decode('ascii')
                    elif isinstance(value, list):
                        # Clean list items
                        cleaned_hackathon[key] = [item.encode('ascii', 'ignore').decode('ascii') if isinstance(item, str) else item for item in value]
                    else:
                        cleaned_hackathon[key] = value
                
                # Try to insert, update if exists
                result = supabase.table('hackathons').upsert(cleaned_hackathon).execute()
                print(f"+ Saved: {cleaned_hackathon['title'][:50]}...")
                saved_count += 1
                
            except Exception as e:
                print(f"- Error saving {hackathon.get('title', 'Unknown')[:50]}: {e}")
                continue
                
        print(f"Successfully saved {saved_count}/{len(hackathons)} hackathons to database")
        
    except Exception as e:
        print(f"Error saving to database: {e}")

def main():
    """Main scraper function"""
    print("=== Unstop API Scraper ===")
    print(f"Started at: {datetime.now()}")
    
    # Fetch hackathons from Unstop API
    hackathons = fetch_unstop_hackathons()
    
    if hackathons:
        # Save to database
        save_to_supabase(hackathons)
        
        # Print summary
        print(f"\n=== Summary ===")
        print(f"Total hackathons fetched: {len(hackathons)}")
        print(f"Completed at: {datetime.now()}")
        
        # Show sample hackathons
        print(f"\n=== Sample Hackathons ===")
        for i, hackathon in enumerate(hackathons[:3]):
            print(f"{i+1}. {hackathon['title']}")
            print(f"   Prize: {hackathon.get('prize_money', 'Not specified')}")
            print(f"   Deadline: {hackathon.get('registration_deadline', 'Not specified')}")
            print(f"   URL: {hackathon['original_url']}")
            print()
    else:
        print("No hackathons found")

if __name__ == "__main__":
    main()