#!/usr/bin/env python3
"""
Update Supabase schema to allow 'hackclub' as platform source
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase configuration in .env file")

def update_platform_source_constraint():
    """Update the platform_source CHECK constraint to include 'hackclub'"""
    
    # SQL to update the constraint
    sql = """
    -- Drop the existing constraint
    ALTER TABLE hackathons DROP CONSTRAINT hackathons_platform_source_check;
    
    -- Add the new constraint with hackclub included
    ALTER TABLE hackathons ADD CONSTRAINT hackathons_platform_source_check
    CHECK (platform_source IN ('unstop', 'devpost', 'devfolio', 'hackclub'));
    """
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json',
    }
    
    # Actually, let's use the SQL API directly
    sql_api_url = f"{SUPABASE_URL}/rest/v1/exec_sql"
    
    try:
        print("Updating platform_source constraint in Supabase...")
        
        # First, let's try using a raw SQL execution endpoint
        # Most Supabase instances require using the SQL editor or a direct query
        
        # Alternative: Drop and recreate the constraint
        sql_statements = [
            "ALTER TABLE hackathons DROP CONSTRAINT hackathons_platform_source_check;",
            "ALTER TABLE hackathons ADD CONSTRAINT hackathons_platform_source_check CHECK (platform_source IN ('unstop', 'devpost', 'devfolio', 'hackclub'));"
        ]
        
        print("\n⚠️  To update the database schema, run the following SQL in your Supabase SQL Editor:")
        print("\n" + "="*60)
        for stmt in sql_statements:
            print(stmt)
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    update_platform_source_constraint()
