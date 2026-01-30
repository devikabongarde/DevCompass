#!/usr/bin/env python3
"""
Update Unstop hackathons with default banner image
"""

import os
from dotenv import load_dotenv
import requests

load_dotenv()

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

if not supabase_url or not supabase_key:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    exit(1)

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
}

# First, get all Unstop hackathons with null or empty banner_url
print("Fetching Unstop hackathons without images...")
response = requests.get(
    f"{supabase_url}/rest/v1/hackathons?platform_source=eq.unstop&banner_url=is.null",
    headers=headers
)

if response.status_code != 200:
    print(f"❌ Failed to fetch: {response.status_code}")
    exit(1)

hackathons = response.json()
print(f"Found {len(hackathons)} Unstop hackathons without banner images")

# Update each one with a default banner
default_banner = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"
updated_count = 0

for hackathon in hackathons:
    try:
        response = requests.patch(
            f"{supabase_url}/rest/v1/hackathons?id=eq.{hackathon['id']}",
            headers=headers,
            json={"banner_url": default_banner}
        )
        
        if response.status_code == 204:
            updated_count += 1
            print(f"✅ Updated: {hackathon['title']}")
        else:
            print(f"❌ Failed to update: {hackathon['title']} - {response.status_code}")
    except Exception as e:
        print(f"❌ Error updating {hackathon['title']}: {str(e)}")

print(f"\n✅ Updated {updated_count} hackathons with default banner image")
