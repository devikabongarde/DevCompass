# Quick Start: Adding Hack Club Hackathons

## TL;DR - 3 Steps

### 1️⃣ Update Database (5 min)
Go to: https://app.supabase.com → Your Project → SQL Editor → New Query

Paste and run:
```sql
ALTER TABLE hackathons DROP CONSTRAINT hackathons_platform_source_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_platform_source_check
CHECK (platform_source IN ('unstop', 'devpost', 'devfolio', 'hackclub'));
```

### 2️⃣ Setup Environment (2 min)
Create `scrapers/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
```

Get `SUPABASE_SERVICE_KEY` from: Supabase Dashboard → Settings → API → Service role (secret)

### 3️⃣ Run Scraper (2 min)
```bash
cd scrapers
python hackclub_scraper.py
```

Wait for: `✅ Successfully inserted 838 hackathons into database!`

## That's It! 🎉

Hack Club hackathons will now appear in your feed mixed with Unstop, Devpost, and Devfolio hackathons.

## Verify It Worked

1. Open Supabase dashboard
2. Go to Table Editor → hackathons
3. Filter: `platform_source is hackclub`
4. Should see ~838 hackathons

## Run Mobile App

```bash
cd mobile
npm start
```

- Tap Feed tab
- Scroll through hackathons
- You'll see titles like "Ponderosa Hacks", "BISV Hacks", "KiwiHacks", etc.
- Tap to view details
- Use Share, Save, Like buttons (all work!)

---

**Need help?** See `HACKCLUB_INTEGRATION.md` for detailed setup guide.
