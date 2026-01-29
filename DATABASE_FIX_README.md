# Database Fix for Foreign Key Relationship Error

## Problem
The error `"Could not find a relationship between 'messages' and 'profiles' in the schema cache"` occurs because the database tables have inconsistent foreign key references between `auth.users` and `profiles` tables.

## Solution

### Step 1: Run the Database Fix Script
Execute the comprehensive fix script in your Supabase SQL Editor:

```sql
-- Run the contents of docs/comprehensive_fix.sql in Supabase SQL Editor
```

This script will:
- Drop and recreate all tables with correct foreign key references to `profiles` table
- Set up proper indexes for performance
- Configure Row Level Security (RLS) policies
- Create necessary triggers and functions

### Step 2: Verify the Fix
After running the script, the TypeScript code has been updated to:
- Remove dependency on specific foreign key relationship names
- Use manual profile fetching instead of JOIN operations
- Handle the relationships more reliably

### Step 3: Test the Application
1. Start your mobile app: `cd mobile && npm start`
2. Test the conversations feature to ensure the error is resolved
3. Verify that messages, follows, and team features work correctly

## Files Changed
- `mobile/src/services/supabase.ts` - Updated to avoid foreign key relationship dependencies
- `docs/comprehensive_fix.sql` - Complete database schema fix
- `docs/fix_messages_schema.sql` - Specific fix for messages table

## Key Changes Made
1. **Database Schema**: All tables now properly reference `profiles(id)` instead of mixing `auth.users(id)` and `profiles(id)`
2. **TypeScript Code**: Removed usage of `profiles!table_column_fkey(*)` syntax and replaced with manual profile fetching
3. **Performance**: Added proper indexes and optimized queries

The application should now work without the foreign key relationship error.