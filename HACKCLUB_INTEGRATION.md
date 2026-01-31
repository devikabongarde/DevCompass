# Hack Club Hackathons Integration Guide

## Overview

Added Hack Club hackathons as a new data source to the DevCompass app. Hack Club API provides access to 800+ upcoming hackathons globally.

## What Was Added

### 1. Created Hack Club Scraper
- **File**: `scrapers/hackclub_scraper.py`
- **Source**: https://hackathons.hackclub.com/api/events/all/
- **Features**:
  - Fetches all 800+ hackathons from Hack Club's public API
  - Parses hackathon data (title, dates, location, website, banners)
  - Inserts directly into Supabase via REST API (no dependency issues)

### 2. Updated Database Schema
- **File**: `docs/schema.sql`
- **File**: `docs/migration_add_hackclub.sql`
- **Changes**: Updated `platform_source` CHECK constraint to allow 'hackclub'
  - Old: `('unstop', 'devpost', 'devfolio')`
  - New: `('unstop', 'devpost', 'devfolio', 'hackclub')`

### 3. Updated Mobile App
- Frontend will automatically display Hack Club hackathons once data is in the database
- Existing components (HackathonDetailScreen, HackathonCard, FeedScreen) already support 'hackclub' as a platform source
- Share functionality, likes, saves all work with Hack Club hackathons

## Setup Instructions

### Step 1: Update Database Schema

Go to your **Supabase Dashboard**:
1. Click on your project
2. Go to **SQL Editor** → **New Query**
3. Copy and paste this SQL:

```sql
ALTER TABLE hackathons 
DROP CONSTRAINT hackathons_platform_source_check;

ALTER TABLE hackathons 
ADD CONSTRAINT hackathons_platform_source_check
CHECK (platform_source IN ('unstop', 'devpost', 'devfolio', 'hackclub'));
```

4. Click **Run**

### Step 2: Configure Environment Variables

In `scrapers/.env` (if not exists, copy from `.env.example`):

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Get these values from Supabase:
- **SUPABASE_URL**: Dashboard → Home → URL (in "Project URL")
- **SUPABASE_SERVICE_KEY**: Dashboard → Settings → API → Project API Keys → Service role (secret key)

### Step 3: Run the Scraper

```bash
cd scrapers
python hackclub_scraper.py
```

Expected output:
```
============================================================
🎉 Hack Club Hackathons Scraper
============================================================
Fetching hackathons from Hack Club API...
✅ Successfully fetched 838 hackathons
Successfully parsed 838 hackathons

Inserting 838 hackathons into database...
  Inserting batch 1/9...
    ✅ Successfully inserted 100 hackathons
  ...
✅ Successfully inserted 838 hackathons into database!
```

### Step 4: Verify in App

1. Build and run the mobile app
2. Go to the Feed tab
3. You should see Hack Club hackathons mixed with Unstop/Devpost/Devfolio hackathons
4. Tap on a Hack Club hackathon to see details
5. Test: Save, Like, Share functionality

## Data Mapping

### Hack Club API → Database Schema

| Hack Club Field | Database Field | Notes |
|---|---|---|
| `name` | `title` | Hackathon name |
| `start` | `start_date` | ISO 8601 format |
| `end` | `end_date` | ISO 8601 format |
| `website` | `original_url` | Registration link |
| `banner` | `banner_url` | Hero image |
| `logo` | Used as fallback for banner | Logo URL |
| `city, state` | Implied in `short_summary` | Location information |
| — | `platform_source` | Set to `'hackclub'` |
| — | `themes` | Set to `['Hackathon']` (generic) |
| — | `description` | Empty (not provided by API) |
| — | `prize_money` | Empty (not provided by API) |
| — | `eligibility` | Empty (not provided by API) |

### Location Mode Detection

- If `city` OR `state` exists → `location_mode = 'in-person'`
- If neither exists → `location_mode = 'online'`

## Files Modified/Created

### New Files
- `scrapers/hackclub_scraper.py` - Main scraper script
- `scrapers/hackclub_scraper_rest.py` - Alternative REST-based version
- `scrapers/test_hackclub.py` - Quick test script
- `docs/migration_add_hackclub.sql` - Database migration

### Updated Files
- `docs/schema.sql` - Added 'hackclub' to platform_source constraint

### Unchanged (Compatible)
- `mobile/src/screens/FeedScreen.tsx` - Already supports all platforms
- `mobile/src/screens/PlaceholderScreens.tsx` (HackathonDetailScreen) - Already handles 'hackclub'
- `mobile/src/components/HackathonCard.tsx` - Already handles 'hackclub'
- `mobile/src/stores/index.ts` - Already fetches all hackathons

## Future Enhancements

1. **Duplicate Detection**: Could add logic to detect if a hackathon exists on multiple platforms
2. **Automatic Scheduling**: Use cron/scheduler to periodically run the scraper
3. **Hack Club Specific Fields**: If API adds description/prize info, update scraper
4. **Performance**: Implement incremental updates instead of full re-sync
5. **Category Mapping**: Map Hack Club categories to themes if they add category field

## Troubleshooting

### Issue: "400 - Failing row contains..."
**Solution**: The database schema constraint hasn't been updated. Run Step 1 above.

### Issue: "401 - Invalid API key"
**Solution**: Check your SUPABASE_SERVICE_KEY in `.env` file

### Issue: "Connection timeout"
**Solution**: Check internet connection and Supabase service status

### Issue: "No hackathons appear in app"
**Solution**:
1. Verify data was inserted: Check Supabase dashboard → Table Editor → hackathons
2. Filter by `platform_source = 'hackclub'`
3. If no data, re-run scraper
4. If data exists but not showing in app, check FeedScreen for filter logic

## API Details

**Hack Club Hackathons API**
- **URL**: https://hackathons.hackclub.com/api/events/all/
- **Method**: GET
- **Auth**: None (public)
- **Response**: JSON array of ~838 hackathon objects
- **Rate Limit**: Not documented, use reasonable delays

### Sample Response Structure
```json
[
  {
    "id": "pO7IEM",
    "name": "Ponderosa Hacks",
    "website": "https://ponderosa-hacks.com/",
    "start": "2026-03-28T08:00:00.000Z",
    "end": "2026-03-28T17:30:00.000Z",
    "city": "Flagstaff",
    "state": "Arizona",
    "country_code": "US",
    "logo": "https://...",
    "banner": "https://...",
    "createdAt": "2026-01-29T22:14:42.252Z"
  },
  ...
]
```

## Next Steps

1. ✅ Create scraper
2. ⏭️ Update database schema (manual in Supabase)
3. ⏭️ Run scraper to fetch data
4. ⏭️ Test in mobile app
5. ⏭️ (Optional) Add to CI/CD pipeline for automated daily updates
