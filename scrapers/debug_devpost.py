#!/usr/bin/env python3
"""
Debug Devpost API Response
"""

import requests
import json

def debug_devpost_api():
    """Debug the Devpost API response structure"""
    url = "https://devpost.com/api/hackathons"
    params = {
        'order_by': 'recently-added',
        'per_page': 5  # Just get 5 for debugging
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            print(f"Top level keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            if 'hackathons' in data:
                hackathons = data['hackathons']
                print(f"Hackathons type: {type(hackathons)}")
                print(f"Number of hackathons: {len(hackathons)}")
                
                if hackathons:
                    first_hackathon = hackathons[0]
                    print(f"First hackathon type: {type(first_hackathon)}")
                    
                    if isinstance(first_hackathon, dict):
                        print(f"First hackathon keys: {list(first_hackathon.keys())}")
                        print(f"Sample data:")
                        for key, value in list(first_hackathon.items())[:10]:
                            print(f"  {key}: {type(value)} = {str(value)[:100]}")
                    else:
                        print(f"First hackathon content: {str(first_hackathon)[:200]}")
        else:
            print(f"Error response: {response.text[:500]}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    debug_devpost_api()