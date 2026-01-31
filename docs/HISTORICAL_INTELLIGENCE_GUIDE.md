# Historical Intelligence Engine - Integration Guide

## Overview

The Historical Intelligence Engine is integrated into DevCompass and helps students discover winning patterns by analyzing past hackathon editions. It's accessible from the sidebar under "⏰ Hackathon Ops" → "Historical Intelligence".

## Features

✓ **Discovers Past Editions** - Automatically finds all previous editions of a hackathon  
✓ **Scrapes Winner Data** - Extracts technologies, themes, and projects from past winners  
✓ **Generates Intelligence** - Analyzes patterns and creates actionable insights  
✓ **Mobile Integration** - Full UI in the app for easy access  

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd scrapers
pip install -r requirements.txt

# Install Playwright browsers (required for web scraping)
playwright install chromium
```

### 2. Run the Backend Pipeline

```bash
cd scrapers
python historical_pipeline.py "https://your-hackathon-url.devpost.com"
```

Or use it programmatically:

```python
import asyncio
from historical_pipeline import IntelligenceEngine

async def main():
    engine = IntelligenceEngine(output_dir='intelligence_reports')
    result = await engine.run_pipeline(
        hackathon_url="https://bevhacks-2026.devpost.com",
        max_past_editions=3
    )
    
    if result['status'] == 'success':
        print("Analysis complete!")
        print(f"Insights: {result['insights']}")

asyncio.run(main())
```

## File Structure

```
scrapers/
├── historical_scraper.py       # Web scraper using Playwright
├── historical_aggregator.py    # Data analysis and intelligence
├── historical_pipeline.py      # Main orchestrator
├── requirements.txt            # Python dependencies
└── intelligence_reports/       # Output directory
    ├── report_YYYYMMDD_HHMMSS.json
    └── report_YYYYMMDD_HHMMSS.md
```

## Architecture

### 1. **historical_scraper.py** - Web Scraping Engine

Uses Playwright to:
- Visit the hackathon page
- Extract organizer profile URL
- Navigate to organizer's past events
- Scrape winner projects and technologies

**Key Classes:**
- `HackathonScraper` - Base class with common functionality
- `DevpostScraper` - Devpost-specific scraping logic

**Main Function:**
```python
async def scrape_hackathon_history(
    hackathon_url: str,
    platform: str = 'devpost',
    max_past_editions: int = 3
) -> Dict[str, Any]
```

### 2. **historical_aggregator.py** - Intelligence Generation

Analyzes raw data to produce:
- Technology stack dominance
- Winning themes and keywords
- Team size trends
- Prize distribution patterns
- Actionable strategic insights

**Key Class:**
```python
class HackathonIntelligence:
    def analyze() -> Dict[str, Any]  # Comprehensive analysis
    def generate_markdown_report() -> str  # Human-readable report
```

### 3. **historical_pipeline.py** - Orchestration

End-to-end workflow:
1. Scrapes historical data
2. Analyzes patterns
3. Exports JSON and Markdown reports
4. Logs progress and insights

**Usage:**
```python
engine = IntelligenceEngine(output_dir='intelligence_reports')
result = await engine.run_pipeline(hackathon_url)
```

## Output Format

### JSON Report Structure

```json
{
  "summary": {
    "total_past_editions": 3,
    "total_winners_analyzed": 15,
    "platform": "devpost",
    "organizer": "https://devpost.com/organizations/example"
  },
  "tech_stack_analysis": {
    "top_technologies": [
      {
        "technology": "React",
        "count": 10,
        "percentage": 66.7
      }
    ]
  },
  "winning_themes": {
    "top_themes": [
      {
        "theme": "AI/Machine Learning",
        "mentions": 8,
        "percentage": 53.3
      }
    ]
  },
  "actionable_insights": [
    "React used in 66.7% of winners",
    "AI/ML is the trending theme",
    "..."
  ]
}
```

### Markdown Report

Human-readable format with:
- Summary statistics
- Technology rankings
- Trending themes
- Strategic insights

Example:
```markdown
# Hackathon Intelligence Report

## Summary
- **Platform**: devpost
- **Past Editions Analyzed**: 3
- **Total Winners Studied**: 15

## 🔧 Top Technologies
- **React**: 66.7% (10 projects)
- **Node.js**: 60% (9 projects)
...
```

## Mobile App Integration

### UI Features

**Screen: Historical Intelligence**
- Input field for hackathon URL
- "Analyze Hackathon" button
- Loading state with progress indicators
- Report display with:
  - Summary statistics
  - Technology rankings
  - Winning themes
  - Strategic insights

### Navigation

Accessible from:
1. Sidebar drawer
2. Location: "⏰ Hackathon Ops" section
3. Screen name: "Historical Intelligence"

### Code Integration

```tsx
// In AppNavigator.tsx
import HistoricalIntelligenceScreen from '../screens/HistoricalIntelligenceScreen';

<Drawer.Screen 
  name="HistoricalIntelligence" 
  component={HistoricalIntelligenceScreen} 
/>
```

## API Integration (Optional)

To integrate with a backend API:

### Flask Example

```python
from flask import Flask, request, jsonify
import asyncio
from historical_pipeline import IntelligenceEngine

app = Flask(__name__)

@app.route('/api/analyze-hackathon', methods=['POST'])
def analyze():
    url = request.json.get('url')
    max_editions = request.json.get('max_editions', 3)
    
    engine = IntelligenceEngine()
    result = asyncio.run(engine.run_pipeline(url, max_editions))
    
    return jsonify(result)
```

### React Native Integration

```tsx
const handleAnalyze = async (url: string) => {
  const response = await fetch('https://your-api.com/api/analyze-hackathon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, max_editions: 3 })
  });
  
  const data = await response.json();
  setReport(data.report);
};
```

## Performance Notes

- **Scraping Time**: 30-60 seconds for 3 past editions (depends on hackathon size)
- **Caching**: Results are saved locally - no need to re-scrape
- **Rate Limiting**: 2-second delay between requests to be respectful
- **Headless Mode**: Browser runs invisibly (set `headless=False` for debugging)

## Troubleshooting

### Issue: "Playwright browsers not found"
**Solution:**
```bash
playwright install chromium
```

### Issue: "Could not find organizer profile"
**Possible Causes:**
- URL format incorrect (ensure it's `.devpost.com` format)
- Hackathon page layout different than expected
- Website structure changed

**Solution:** Check the hackathon URL manually to verify it has an organizer link.

### Issue: Slow scraping
**Solutions:**
- Reduce `max_past_editions` parameter
- Check internet connection
- Ensure no other heavy processes running

### Issue: No winners found
**Possible Causes:**
- Very new hackathon with no past editions
- Winners not marked with expected CSS classes
- Website layout changed

**Solution:** Check the hackathon's project gallery manually.

## Future Enhancements

- [ ] Support for Devfolio hackathons
- [ ] Caching layer to avoid re-scraping
- [ ] Advanced filtering options
- [ ] Team composition analysis
- [ ] Judge feedback extraction
- [ ] Integration with DevCompass database
- [ ] Real-time batch analysis

## Contributing

To extend the Historical Intelligence Engine:

1. **Add new platforms**: Create new Scraper classes in `historical_scraper.py`
2. **Add new analysis**: Extend `HackathonIntelligence` class in `historical_aggregator.py`
3. **Improve UI**: Enhance `HistoricalIntelligenceScreen.tsx`

## License

Part of the DevCompass project - MIT License

## Support

For issues or questions:
- Check the troubleshooting section
- Review code comments
- Open an issue on GitHub
