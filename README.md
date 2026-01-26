# DevCompare - Hackathon Discovery Engine

A mobile-first platform for discovering hackathons through a TikTok-style vertical feed.

## Tech Stack
- **Mobile**: Expo React Native + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Scrapers**: Python + GitHub Actions
- **State Management**: Zustand
- **Navigation**: React Navigation v6

## Project Structure
```
devcompare/
├── mobile/                 # Expo React Native app
├── scrapers/              # Python web scrapers
└── docs/                  # Documentation
```

## Quick Start

### 1. Setup Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL schema from `docs/schema.sql`
4. Get API keys from Settings > API

### 2. Mobile App
```bash
cd mobile
npm install
npm start
```

### 3. Scrapers
```bash
cd scrapers
pip install -r requirements.txt
python unstop_scraper.py
```

## Features (Phase 1)
- ✅ Vertical swipe feed for hackathons
- ✅ Save hackathons for later
- ✅ Calendar view with deadlines
- ✅ Authentication (Email + Google)
- ✅ Auto-updated data from Unstop & Devpost

## Development Status
🚧 **In Development** - Phase 1 MVP

## Contributing
This is a personal project, but feedback welcome!