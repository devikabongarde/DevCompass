#!/usr/bin/env python3
"""
Simple test to verify Supabase connection and add sample data
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_supabase_connection():
    """Test basic Supabase connection"""
    print("Testing Supabase connection...")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Missing Supabase credentials")
        return False
    
    # Test connection by inserting sample hackathon
    sample_hackathon = {
        'title': 'Test Hackathon - DevCompare Demo',
        'description': 'This is a test hackathon to verify the DevCompare app is working correctly.',
        'short_summary': 'Test hackathon for DevCompare app verification.',
        'prize_money': '$10,000',
        'themes': ['Test', 'Demo', 'DevCompare'],
        'platform_source': 'unstop',
        'original_url': 'https://example.com/test-hackathon',
        'location_mode': 'online'
    }
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Insert sample data
        response = requests.post(
            f'{supabase_url}/rest/v1/hackathons',
            headers=headers,
            json=sample_hackathon
        )
        
        if response.status_code == 201:
            print("[SUCCESS] Connected to Supabase and added sample hackathon!")
            print("[SUCCESS] Your DevCompare app should now show data in the feed!")
            return True
        else:
            print(f"[ERROR] {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Connection error: {str(e)}")
        return False

if __name__ == "__main__":
    test_supabase_connection()