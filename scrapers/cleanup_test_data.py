#!/usr/bin/env python3
"""
Cleanup Expired Data - Remove expired hackathons from database
"""

import os
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

def cleanup_expired_hackathons():
    """Remove expired hackathons from database"""
    try:
        print("Cleaning up expired hackathons...")
        
        # Get current date
        current_date = datetime.now().isoformat()
        
        # Delete hackathons where end_date is in the past
        result = supabase.table('hackathons').delete().lt('end_date', current_date).execute()
        
        if result.data:
            print(f"Deleted {len(result.data)} expired hackathons")
        else:
            print("No expired hackathons found")
        
        # Also delete hackathons where registration_deadline is in the past and no end_date
        result2 = supabase.table('hackathons').delete().is_('end_date', 'null').lt('registration_deadline', current_date).execute()
        
        if result2.data:
            print(f"Deleted {len(result2.data)} hackathons with expired registration")
        
        total_deleted = len(result.data or []) + len(result2.data or [])
        print(f"Total deleted: {total_deleted} expired hackathons")
        
    except Exception as e:
        print(f"Error cleaning up expired data: {e}")

if __name__ == "__main__":
    cleanup_expired_hackathons()