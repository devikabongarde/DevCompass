# DevCompare Setup Guide

## 🚀 Quick Start

### 1. Supabase Setup (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project to be ready

2. **Setup Database**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the entire content from `docs/schema.sql`
   - Click "Run" to create all tables and policies

3. **Get API Keys**
   - Go to Settings > API
   - In the "Project API keys" section, copy:
     - `Project URL` (at the top)
     - `anon` key (labeled "public" - safe for client-side)
   - For scrapers, also copy `service_role` key (keep this secret!)

### 2. Mobile App Setup (10 minutes)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies (use legacy peer deps if needed)
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Start the development server
npm start
```

**Testing the App:**
- **Easiest**: Scan QR code with Expo Go app on your phone
- Press `w` for web browser
- Press `i` for iOS simulator (requires Xcode on macOS)
- Press `a` for Android emulator (requires Android Studio + SDK setup)

### 3. Scrapers Setup (5 minutes)

```bash
# Navigate to scrapers directory
cd scrapers

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your-service-role-key

# Test the scrapers
python unstop_scraper.py
python devpost_scraper.py
```

### 4. GitHub Actions Setup (Optional - 3 minutes)

1. **Add Repository Secrets**
   - Go to your GitHub repo > Settings > Secrets and variables > Actions
   - Add these secrets:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_SERVICE_KEY`: Your service role key

2. **Enable Actions**
   - The workflow will run automatically every 6 hours
   - You can also trigger it manually from Actions tab

## 🎯 Testing Your Setup

### Test Authentication
1. Open the mobile app
2. Try signing up with a test email
3. Check Supabase Auth > Users to see if user was created
4. Try signing in

### Test Feed
1. Run scrapers to populate database with hackathons
2. Open mobile app and check if hackathons appear in feed
3. Try saving a hackathon
4. Check Saved tab

### Test Database
1. Go to Supabase > Table Editor
2. Check `hackathons` table has data after running scrapers
3. Check `profiles` table has your user profile
4. Check `saved_hackathons` table when you save hackathons

## 🔧 Development Workflow

### Adding New Features
1. **Mobile**: Add screens in `src/screens/`, components in `src/components/`
2. **Backend**: Modify Supabase schema, update services in `src/services/`
3. **Scrapers**: Extend existing scrapers or add new ones

### Common Commands
```bash
# Mobile development
cd mobile
npm start                 # Start Expo dev server
npm run android          # Run on Android
npm run ios              # Run on iOS
npm run web              # Run in browser

# Scraper testing
cd scrapers
python unstop_scraper.py    # Test Unstop scraper
python devpost_scraper.py   # Test Devpost scraper
```

## 🐛 Troubleshooting

### Mobile App Issues
- **"Network request failed"**: Check your Supabase URL and keys in `.env`
- **"Auth session missing"**: Clear app data and try signing in again
- **Blank feed**: Run scrapers to populate database with hackathons
- **Android SDK not found**: Use Expo Go app on your phone instead of Android emulator

### Scraper Issues
- **"Missing Supabase credentials"**: Check `.env` file has correct keys
- **"No hackathons found"**: Websites may have changed structure, update selectors
- **Rate limiting**: Add delays between requests in scraper code

### Database Issues
- **RLS errors**: Check Row Level Security policies are set up correctly
- **Missing tables**: Re-run the SQL schema from `docs/schema.sql`
- **Permission denied**: Make sure you're using the service role key for scrapers

## 📱 App Features Status

### ✅ Implemented (Phase 1A)
- User authentication (email signup/signin)
- Vertical swipe feed interface
- Save/unsave hackathons
- Basic hackathon cards with platform badges
- Supabase integration
- Python scrapers for Unstop and Devpost

### 🚧 Coming Next (Phase 1B)
- Hackathon detail screen
- Calendar view with deadlines
- Search and filtering
- Push notifications
- Profile management

### 🔮 Future Features
- Google OAuth
- Teammate finder
- In-app messaging
- Advanced filtering
- AI-generated summaries

## 🚀 Deployment

### Mobile App
- **Development**: Use Expo Go app
- **Production**: Build with `eas build` (requires Expo Application Services)

### Scrapers
- **Development**: Run locally or via GitHub Actions
- **Production**: GitHub Actions (free tier includes 2000 minutes/month)

## 💡 Tips for Success

1. **Start Simple**: Get basic functionality working before adding features
2. **Test Early**: Test on real devices, not just simulators
3. **Monitor Scrapers**: Check GitHub Actions logs regularly
4. **User Feedback**: Share with friends and iterate based on feedback
5. **Performance**: Monitor Supabase usage and optimize queries

## 🆘 Getting Help

- **Expo Issues**: Check [Expo documentation](https://docs.expo.dev/)
- **Supabase Issues**: Check [Supabase documentation](https://supabase.com/docs)
- **React Native**: Check [React Native documentation](https://reactnative.dev/)

Happy coding! 🎉