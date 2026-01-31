#!/usr/bin/env python3
"""
Execute SQL migration to update hackathons table
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase configuration")

def execute_sql(sql):
    """Execute SQL in Supabase"""
    # Use the Supabase SQL API endpoint
    # Note: This requires proper authentication and may not work for all operations
    
    # Instead, print instructions for manual execution
    print("⚠️  IMPORTANT: Manual SQL Execution Required")
    print("=" * 70)
    print("\nTo add Hack Club as a valid platform source, please:")
    print("\n1. Go to your Supabase dashboard: https://app.supabase.com")
    print("2. Select your project")
    print("3. Navigate to the SQL Editor tab")
    print("4. Create a new query and paste the following SQL:")
    print("\n" + "=" * 70)
    print(sql)
    print("=" * 70)
    print("\n5. Click 'Run' to execute the migration")
    print("\nAfter completing this, you can run the Hack Club scraper:")
    print("  python hackclub_scraper.py")
    print("=" * 70)

if __name__ == "__main__":
    sql = """-- Migration: Add Hack Club as a valid platform source

-- Drop the existing CHECK constraint
ALTER TABLE hackathons 
DROP CONSTRAINT hackathons_platform_source_check;

-- Add the new CHECK constraint that includes 'hackclub'
ALTER TABLE hackathons 
ADD CONSTRAINT hackathons_platform_source_check
CHECK (platform_source IN ('unstop', 'devpost', 'devfolio', 'hackclub'));"""
    
    execute_sql(sql)
