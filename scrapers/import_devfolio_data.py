#!/usr/bin/env python3
"""
Import Devfolio Hackathon Data into Supabase
"""

import json
import os
from datetime import datetime
from dotenv import load_dotenv
import requests

load_dotenv()

# Supabase config
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

if not supabase_url or not supabase_key:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    exit(1)

# Devfolio data provided by user
DEVFOLIO_DATA = [
    {
        "platform": "Devfolio",
        "title": "ETHDenver 2026",
        "link": "https://ethdenver2026.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Build India: Anthropic x Replit x Lightspeed Hackathon",
        "link": "https://buildindia2026.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Base Indonesia Hackathon 2025",
        "link": "https://base-indonesia-hackathon-2025.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Hack-Nocturne 2.O",
        "link": "https://hack-nocturne-2.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Electrothon 8.0",
        "link": "https://electrothon-8.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "GHRhack 2.0",
        "link": "https://ghrhack2.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Hack-O-Knight",
        "link": "https://hack-o-knight.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "MERGE-CONFLICT",
        "link": "https://mergeconflict.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "HACK THE THRONE",
        "link": "https://hack-the-throne.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "PayLoad'26",
        "link": "https://pay-load.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Rekkathon",
        "link": "https://rekkathon.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Lean In Hacks 7.0",
        "link": "https://leanin-hacks-7.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "EngineerX HackFest",
        "link": "https://engineerx-hackfest.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Hack With GDG S3",
        "link": "https://hack-with-gdg-s3.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Innov8 4.0",
        "link": "https://innov-77.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "CodeLites 2.0",
        "link": "https://codelite2o.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "AMUHACKS 5.0",
        "link": "https://amuhacks-5.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "RECKON 7.0",
        "link": "https://reckon-7.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Hack the Tank 3.0",
        "link": "https://hack-the-tank-3.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "BINARY v2",
        "link": "https://binaryvtwo.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "PRINCE PROTOTHON",
        "link": "https://prince-protothon.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "HackPrix Season 3",
        "link": "https://hackprix-2026.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "HackNiche 4.0",
        "link": "https://hackniche4-0.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "CODEX '26 : 24 HOUR GEN AI HACKATHON",
        "link": "https://codextki.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "KnowCode 3.0",
        "link": "https://knowcode-3.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "DUHacks 5.0",
        "link": "https://duhacks5.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Skill Climax V1.0",
        "link": "https://skill-climax-v10.devfolio.co/",
        "date": "See Website"
    }
]

def insert_hackathons():
    """Insert devfolio hackathons into database"""
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    print(f"Saving {len(DEVFOLIO_DATA)} hackathons to database...")
    saved_count = 0
    duplicate_count = 0
    error_count = 0
    
    for hackathon in DEVFOLIO_DATA:
        try:
            # Format data for database
            payload = {
                "title": hackathon["title"],
                "description": f"Hackathon: {hackathon['title']}",
                "short_summary": hackathon["title"],
                "original_url": hackathon["link"],
                "platform_source": "devfolio",
                "banner_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
                "prize_money": "Prize details available on website",
                "start_date": None,
                "end_date": None,
                "registration_deadline": None,
                "themes": ["Hackathon"],
                "eligibility": "Check website for eligibility",
                "location_mode": "online"
            }
            
            # Try to insert new hackathon
            response = requests.post(
                f"{supabase_url}/rest/v1/hackathons",
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 201:
                saved_count += 1
                print(f"✅ {hackathon['title']}")
            elif response.status_code == 409:
                duplicate_count += 1
                print(f"⏭️  {hackathon['title']} (already exists)")
            else:
                error_count += 1
                print(f"❌ {hackathon['title']} - Status: {response.status_code}")
                if response.text:
                    print(f"   Response: {response.text[:100]}")
                
        except Exception as e:
            error_count += 1
            print(f"❌ {hackathon['title']} - Error: {str(e)}")
    
    print("\n" + "="*60)
    print(f"✅ Successfully inserted: {saved_count}")
    print(f"⏭️  Already existed: {duplicate_count}")
    print(f"❌ Errors: {error_count}")
    print(f"📊 Total processed: {len(DEVFOLIO_DATA)}")
    print("="*60)

if __name__ == "__main__":
    print("🚀 Importing Devfolio hackathons into Supabase...\n")
    insert_hackathons()

# Devfolio data provided by user
DEVFOLIO_DATA = [
    {
        "platform": "Devfolio",
        "title": "ETHDenver 2026",
        "link": "https://ethdenver2026.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Build India: Anthropic x Replit x Lightspeed Hackathon",
        "link": "https://buildindia2026.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Base Indonesia Hackathon 2025",
        "link": "https://base-indonesia-hackathon-2025.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Hack-Nocturne 2.O",
        "link": "https://hack-nocturne-2.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Electrothon 8.0",
        "link": "https://electrothon-8.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "GHRhack 2.0",
        "link": "https://ghrhack2.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Hack-O-Knight",
        "link": "https://hack-o-knight.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "MERGE-CONFLICT",
        "link": "https://mergeconflict.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "HACK THE THRONE",
        "link": "https://hack-the-throne.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "PayLoad'26",
        "link": "https://pay-load.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Rekkathon",
        "link": "https://rekkathon.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Lean In Hacks 7.0",
        "link": "https://leanin-hacks-7.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "EngineerX HackFest",
        "link": "https://engineerx-hackfest.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Hack With GDG S3",
        "link": "https://hack-with-gdg-s3.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Innov8 4.0",
        "link": "https://innov-77.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "CodeLites 2.0",
        "link": "https://codelite2o.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "AMUHACKS 5.0",
        "link": "https://amuhacks-5.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "RECKON 7.0",
        "link": "https://reckon-7.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Hack the Tank 3.0",
        "link": "https://hack-the-tank-3.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "BINARY v2",
        "link": "https://binaryvtwo.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "PRINCE PROTOTHON",
        "link": "https://prince-protothon.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "HackPrix Season 3",
        "link": "https://hackprix-2026.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "HackNiche 4.0",
        "link": "https://hackniche4-0.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "CODEX '26 : 24 HOUR GEN AI HACKATHON",
        "link": "https://codextki.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "KnowCode 3.0",
        "link": "https://knowcode-3.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "DUHacks 5.0",
        "link": "https://duhacks5.devfolio.co/",
        "date": "See Website"
    },
    {
        "platform": "Devfolio",
        "title": "Skill Climax V1.0",
        "link": "https://skill-climax-v10.devfolio.co/",
        "date": "See Website"
    }
]

def insert_hackathons():
    """Insert devfolio hackathons into database"""
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    success_count = 0
    duplicate_count = 0
    error_count = 0
    
    for hackathon in DEVFOLIO_DATA:
        # Format data for database
        payload = {
            "title": hackathon["title"],
            "description": f"Hackathon: {hackathon['title']}",
            "short_summary": hackathon["title"],
            "original_url": hackathon["link"],
            "platform_source": "devfolio",
            "banner_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
            "prize_money": "Prize details available on website",
            "start_date": None,
            "end_date": None,
            "registration_deadline": None,
            "themes": ["Hackathon"],
            "eligibility": "Check website for eligibility",
            "location_mode": "online"
        }
        
        try:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/hackathons",
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 201:
                success_count += 1
                print(f"✅ {hackathon['title']}")
            elif response.status_code == 409:
                duplicate_count += 1
                print(f"⏭️  {hackathon['title']} (already exists)")
            else:
                error_count += 1
                print(f"❌ {hackathon['title']} - Status: {response.status_code}")
                
        except Exception as e:
            error_count += 1
            print(f"❌ {hackathon['title']} - Error: {str(e)}")
    
if __name__ == "__main__":
    print("🚀 Importing Devfolio hackathons into Supabase...\n")
    insert_hackathons()
