# Historical Intelligence Engine

Transform hackathon history into winning strategy.

## What It Does

The Historical Intelligence Engine analyzes past hackathon winners to help students discover winning patterns. By studying what won before, you can make smarter decisions about:

- **Technology Stack**: What tools do winners use?
- **Themes**: What problems are hackathons rewarding?
- **Team Composition**: How big should your team be?
- **Strategic Focus**: Where should you invest effort?

## Quick Start

### 1. Install Dependencies
```bash
cd scrapers
pip install -r requirements.txt
playwright install chromium
```

### 2. Run Analysis
```bash
python historical_pipeline.py "https://your-hackathon-url.devpost.com"
```

### 3. Check Results
Look in `intelligence_reports/` for:
- `report_YYYYMMDD_HHMMSS.json` - Machine-readable data
- `report_YYYYMMDD_HHMMSS.md` - Human-readable insights

## How It Works

### 3-Step Process

1. **Discovery**: Given a hackathon URL, find all past editions
   - Visit the hackathon page
   - Find the organizer profile link
   - Extract all their past events

2. **Scraping**: Extract winner data from each past edition
   - Identify winning projects
   - Extract technologies used
   - Gather themes and keywords

3. **Intelligence**: Analyze patterns and generate insights
   - Technology stack dominance (e.g., "React in 65% of winners")
   - Trending themes (e.g., "AI/ML is #1 theme")
   - Strategic recommendations

## Example Output

### What You Get

```json
{
  "summary": {
    "total_past_editions": 3,
    "total_winners_analyzed": 15
  },
  "tech_stack_analysis": {
    "top_technologies": [
      {
        "technology": "React",
        "percentage": 66.7,
        "count": 10
      },
      {
        "technology": "Node.js",
        "percentage": 60.0,
        "count": 9
      }
    ]
  },
  "winning_themes": {
    "top_themes": [
      {
        "theme": "AI/Machine Learning",
        "percentage": 53.3,
        "mentions": 8
      }
    ]
  },
  "actionable_insights": [
    "🔧 React used in 66.7% of winners",
    "🎯 AI/ML is the trending theme",
    "💡 Study past winners to identify winning patterns",
    "⏱️ Focus on shipping a polished MVP over ambitious features"
  ]
}
```

### Markdown Report Example

```markdown
# Hackathon Intelligence Report

## Summary
- **Platform**: devpost
- **Past Editions Analyzed**: 3
- **Total Winners Studied**: 15

## 🔧 Top Technologies
- **React**: 66.7% (10 projects)
- **Node.js**: 60% (9 projects)
- **Python**: 53.3% (8 projects)

## 🎯 Winning Themes
- **AI/Machine Learning**: 53.3% (8 mentions)
- **Sustainability**: 33.3% (5 mentions)
- **Healthcare**: 26.7% (4 mentions)

## 💡 Strategic Insights
- React is the dominant frontend framework among winners
- AI/ML projects have the highest success rate
- Most winners use a tech stack combining React + Node.js
```

## File Structure

```
scrapers/
├── historical_scraper.py       # Web scraper (Playwright)
├── historical_aggregator.py    # Analysis engine
├── historical_pipeline.py      # Main orchestrator
├── historical_examples.py      # Usage examples
├── requirements.txt            # Dependencies
└── intelligence_reports/       # Output directory
```

## Usage Examples

### Basic Analysis
```python
import asyncio
from historical_pipeline import IntelligenceEngine

async def analyze():
    engine = IntelligenceEngine()
    result = await engine.run_pipeline(
        hackathon_url="https://bevhacks-2026.devpost.com",
        max_past_editions=3
    )
    print(result['insights'])

asyncio.run(analyze())
```

### Just Scrape Data
```python
from historical_scraper import scrape_hackathon_history

raw_data = await scrape_hackathon_history(
    "https://bevhacks-2026.devpost.com",
    max_past_editions=2
)
```

### Analyze Existing Data
```python
from historical_aggregator import HackathonIntelligence

intelligence = HackathonIntelligence(raw_data)
report = intelligence.analyze()
```

## Mobile App Integration

### Access in App
1. Open DevCompass
2. Tap the sidebar/drawer menu
3. Find "⏰ Hackathon Ops" section
4. Tap "Historical Intelligence"
5. Enter a hackathon URL and analyze!

### UI Features
- Input field for hackathon URL
- Real-time analysis progress
- Formatted intelligence report
- Technology rankings
- Theme analysis
- Strategic recommendations

## How It Discovers Past Editions

The "Organizer Strategy" is the secret sauce:

```
Hackathon Page
    ↓
Find "Hosted By" link
    ↓
Navigate to Organizer Profile
    ↓
Scrape all their hackathons (2025, 2024, 2023, etc.)
    ↓
Extract winners from each
    ↓
Aggregate and analyze
```

This is more reliable than trying to guess URL patterns because:
- URLs vary widely between platforms
- Websites redesign and change structures
- Organizers maintain their own "master list"

## Supported Platforms

Currently supported:
- ✅ **Devpost**: Full support with winner identification
- 🚧 **Devfolio**: Planned (use top 20 voted as proxy for winners)

## Performance

- **Scraping**: 30-60 seconds for 3 editions (depends on hackathon size)
- **Analysis**: < 1 second
- **Total**: ~1-2 minutes for a complete analysis

Rate limiting: 2-second delay between requests (respectful to websites)

## Customization

### Change Past Editions Limit
```python
# Analyze only 2 past editions instead of 3
result = await engine.run_pipeline(url, max_past_editions=2)
```

### Custom Output Directory
```python
engine = IntelligenceEngine(output_dir='my_reports')
```

### Export Formats
```python
result = await engine.run_pipeline(
    url,
    export_formats=['json']  # or ['markdown'] or ['json', 'markdown']
)
```

## Troubleshooting

### "Could not find organizer profile"
- Check the URL format is correct (e.g., `https://something.devpost.com`)
- Verify the hackathon page loads in a browser
- Check if there's a "Hosted By" link visible

### "No winners found"
- The hackathon might be too new (no past editions)
- Winner markup might differ from expected
- Check the project gallery manually to verify

### Playwright installation issues
```bash
playwright install chromium
# or for all browsers:
playwright install
```

### Rate limit/timeout issues
- Reduce `max_past_editions`
- Check your internet connection
- Run during off-peak hours

## Future Roadmap

- [ ] Devfolio platform support
- [ ] Winner data caching (avoid re-scraping)
- [ ] Judge feedback extraction
- [ ] Prize prediction
- [ ] Team composition optimizer
- [ ] Real-time batch analysis API
- [ ] Dashboard for comparing multiple hackathons
- [ ] Integration with DevCompass database

## Contributing

Ways to improve:

1. **Add Devfolio support** - Extend `DevfolioScraper` in `historical_scraper.py`
2. **Better analysis** - Add new methods to `HackathonIntelligence`
3. **Improve UI** - Enhance `HistoricalIntelligenceScreen.tsx`
4. **Fix edge cases** - Help with tricky hackathon layouts

## Architecture

### Classes

**historical_scraper.py**
- `HackathonScraper` - Base class
- `DevpostScraper` - Devpost implementation

**historical_aggregator.py**
- `HackathonIntelligence` - Analysis engine

**historical_pipeline.py**
- `IntelligenceEngine` - Orchestration

### Data Flow

```
Hackathon URL
    ↓
[DevpostScraper]
    ↓
Raw Data (JSON)
    ↓
[HackathonIntelligence]
    ↓
Intelligence Report
    ↓
JSON + Markdown Export
```

## License

MIT License - Part of DevCompass

## Support

- Check `HISTORICAL_INTELLIGENCE_GUIDE.md` for detailed docs
- Review examples in `historical_examples.py`
- Check code comments for implementation details

---

**Tips for Using Intelligence:**

1. **Analyze multiple past editions** - More data = better insights
2. **Look for patterns, not rules** - Insights are trends, not guarantees
3. **Combine insights** - Use tech + theme + team size together
4. **Iterate** - You can always run analysis again to verify

Remember: Past hackathons won't predict the future perfectly, but they reveal what organizers and judges value. Use that knowledge strategically!
