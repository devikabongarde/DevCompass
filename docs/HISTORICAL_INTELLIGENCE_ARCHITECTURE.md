# Historical Intelligence Engine - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DevCompass Mobile App                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         HistoricalIntelligenceScreen (React Native)       │  │
│  │                                                           │  │
│  │  Input Mode:                  Report Mode:               │  │
│  │  ├─ URL input field          ├─ Summary statistics       │  │
│  │  ├─ Analyze button           ├─ Top technologies        │  │
│  │  └─ Help section             ├─ Winning themes          │  │
│  │                              └─ Strategic insights       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Navigation: Drawer Menu Integration             │  │
│  │         "⏰ Hackathon Ops" → "Historical Intelligence"    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Runs Python Backend)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Python Backend (scrapers/)                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ historical_pipeline.py (IntelligenceEngine)            │   │
│  │ ┌──────────────────────────────────────────────────┐   │   │
│  │ │ run_pipeline(url)                                │   │   │
│  │ │  ├─ Step 1: Scrape                              │   │   │
│  │ │  ├─ Step 2: Analyze                             │   │   │
│  │ │  └─ Step 3: Export                              │   │   │
│  │ └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│            │                                  │                │
│            ↓                                  ↓                │
│  ┌──────────────────────┐        ┌──────────────────────┐      │
│  │ historical_scraper.py│        │historical_aggregator │      │
│  │                      │        │.py                   │      │
│  │ DevpostScraper:      │        │                      │      │
│  │ ├─ get_organizer()   │        │ HackathonIntelligence│      │
│  │ ├─ get_past_hackath()│───────→│ class:               │      │
│  │ └─ scrape_winners()  │        │ ├─ analyze()         │      │
│  │                      │        │ └─ generate_report() │      │
│  │ Uses: Playwright     │        │                      │      │
│  └──────────────────────┘        │ Output:              │      │
│                                  │ • JSON report        │      │
│                                  │ • Markdown report    │      │
│                                  │ • Insights array     │      │
│                                  └──────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Output Files                              │
│                                                                 │
│  intelligence_reports/                                         │
│  ├─ report_YYYYMMDD_HHMMSS.json      (Machine-readable)       │
│  │  └─ Contains: summary, tech stack, themes, insights       │
│  │                                                            │
│  └─ report_YYYYMMDD_HHMMSS.md        (Human-readable)        │
│     └─ Contains: formatted report with sections              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Scraping Phase
```
Input: Hackathon URL (e.g., https://bevhacks-2026.devpost.com)
  │
  ├─→ [DevpostScraper.get_organizer_profile()]
  │    └─→ Extract organizer profile URL
  │
  ├─→ [DevpostScraper.get_past_hackathons()]
  │    └─→ Navigate to organizer profile
  │         └─→ Scrape all past event URLs
  │
  └─→ [DevpostScraper.scrape_winners()] for each edition
       ├─→ Visit project gallery
       ├─→ Identify winner badges/ribbons
       └─→ Extract project data:
           ├─ Title
           ├─ URL
           ├─ Tagline
           ├─ Technologies
           └─ Prize info

Output: Raw JSON
{
  "past_hackathons": [
    {
      "hackathon_name": "BevHacks 2025",
      "year": "2025",
      "winners": [
        {
          "title": "Project Name",
          "technologies": ["React", "Node.js"],
          "prize": "Grand Prize",
          ...
        },
        ...
      ]
    },
    ...
  ]
}
```

### 2. Analysis Phase
```
Input: Raw data with all winners
  │
  ├─→ [HackathonIntelligence._analyze_tech_stack()]
  │    ├─→ Count technology occurrences
  │    └─→ Calculate percentages
  │
  ├─→ [HackathonIntelligence._analyze_themes()]
  │    ├─→ Extract text from project titles/taglines
  │    ├─→ Match against theme keywords
  │    └─→ Rank themes by frequency
  │
  ├─→ [HackathonIntelligence._analyze_team_size()]
  │    ├─→ Collect team sizes
  │    └─→ Calculate averages and medians
  │
  ├─→ [HackathonIntelligence._analyze_prizes()]
  │    ├─→ Categorize prize types
  │    └─→ Count distributions
  │
  └─→ [HackathonIntelligence._generate_insights()]
       ├─→ Combine all analyses
       └─→ Generate actionable recommendations

Output: Intelligence Report
{
  "summary": {...},
  "tech_stack_analysis": {...},
  "winning_themes": {...},
  "actionable_insights": [...]
}
```

### 3. Export Phase
```
Input: Intelligence report
  │
  ├─→ [JSON Export]
  │    └─→ Save as report_YYYYMMDD_HHMMSS.json
  │
  └─→ [Markdown Export]
       └─→ Save as report_YYYYMMDD_HHMMSS.md

Output: Files in intelligence_reports/ directory
```

## Component Relationships

```
┌─────────────────────────────────────────┐
│    Historical Intelligence Screen       │
│         (React Native UI)               │
└────────────────┬────────────────────────┘
                 │
                 │ Calls Python Backend
                 │
┌────────────────▼────────────────────────┐
│     IntelligenceEngine (Orchestrator)   │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────────┐
│DevpostScraper│   │HackathonIntelligence│
│   (Scraping) │   │   (Analysis)     │
└──────────────┘   └──────────────────┘
        │                 │
        └────────┬────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Output Files  │
        │  JSON + Markdown
        └────────────────┘
```

## Module Hierarchy

```
scrapers/
│
├─ historical_pipeline.py [ORCHESTRATOR]
│  └─ IntelligenceEngine class
│     ├─ Calls scraper
│     ├─ Calls aggregator
│     └─ Handles export
│
├─ historical_scraper.py [SCRAPING LAYER]
│  ├─ HackathonScraper (base class)
│  │  └─ Common browser operations
│  └─ DevpostScraper (implementation)
│     ├─ get_organizer_profile()
│     ├─ get_past_hackathons()
│     └─ scrape_winners()
│
└─ historical_aggregator.py [ANALYSIS LAYER]
   └─ HackathonIntelligence class
      ├─ analyze()
      ├─ _analyze_tech_stack()
      ├─ _analyze_themes()
      ├─ _analyze_team_size()
      ├─ _analyze_prizes()
      ├─ _generate_insights()
      └─ generate_markdown_report()
```

## Class Relationships

```
HackathonScraper (Base)
    │
    └─→ DevpostScraper (Specialization)
         ├─ Methods:
         │  ├─ get_organizer_profile()
         │  ├─ get_past_hackathons()
         │  ├─ scrape_winners()
         │  └─ _extract_project_data()
         └─ Uses: Playwright browser


HackathonIntelligence (Analysis)
    ├─ Constructor:
    │  └─ Takes: raw_data dict
    │
    ├─ Public Methods:
    │  ├─ analyze() → Full report
    │  └─ generate_markdown_report() → String
    │
    └─ Private Methods:
       ├─ _generate_summary()
       ├─ _analyze_tech_stack()
       ├─ _analyze_themes()
       ├─ _analyze_team_size()
       ├─ _analyze_prizes()
       └─ _generate_insights()


IntelligenceEngine (Orchestrator)
    ├─ Constructor:
    │  └─ Takes: output_dir (optional)
    │
    ├─ Async Methods:
    │  └─ run_pipeline(url, params...) → Result dict
    │
    └─ Workflow:
       1. Create scraper
       2. Scrape data
       3. Create intelligence analyzer
       4. Analyze data
       5. Export reports
       6. Return summary
```

## Data Structures

### Raw Scraped Data
```typescript
{
  input_url: string
  platform: 'devpost' | 'devfolio'
  organizer_url: string
  past_hackathons: [
    {
      hackathon_name: string
      year: string
      winners: [
        {
          title: string
          url: string
          tagline: string
          prize: string
          technologies: string[]
        }
      ]
    }
  ]
}
```

### Intelligence Report
```typescript
{
  summary: {
    total_past_editions: number
    total_winners_analyzed: number
    platform: string
    organizer: string
  }
  tech_stack_analysis: {
    top_technologies: {
      technology: string
      count: number
      percentage: number
    }[]
  }
  winning_themes: {
    top_themes: {
      theme: string
      mentions: number
      percentage: number
    }[]
  }
  actionable_insights: string[]
}
```

## External Dependencies

```
┌──────────────────────────────────────┐
│    Playwright (Browser Automation)   │
│  • Headless Chrome control           │
│  • JavaScript rendering              │
│  • Dynamic content scraping          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│    Website Targets                   │
│  • Devpost.com (hackathon platform)  │
│  • Future: Devfolio.co              │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│    DevCompass Mobile App             │
│  • React Native                      │
│  • Expo                              │
│  • Navigation stack                  │
└──────────────────────────────────────┘
```

## Deployment Architecture

### Local Setup
```
Developer Machine
  │
  ├─ Python 3.8+
  │  ├─ Playwright
  │  └─ Dependencies
  │
  ├─ Mobile App (npm start)
  │
  └─ Run backend:
     python historical_pipeline.py <url>
```

### Optional Cloud Setup
```
┌──────────────────────┐
│  DevCompass App      │
│  (React Native)      │
└──────────┬───────────┘
           │ API Call
           ↓
┌──────────────────────┐
│  API Server          │
│  (Flask/FastAPI)     │
└──────────┬───────────┘
           │ Async Job
           ↓
┌──────────────────────┐
│  Worker Process      │
│  (Historical Engine) │
└──────────┬───────────┘
           │ Results
           ↓
┌──────────────────────┐
│  Database/Cache      │
│  (Optional)          │
└──────────────────────┘
```

## File I/O Flow

```
User Input (URL)
    ↓
In-Memory Processing
    ├─→ Scraper (no file I/O, all in memory)
    ├─→ Aggregator (no file I/O, all in memory)
    │
    └─→ Export to Disk:
         ├─ intelligence_reports/
         │  ├─ report_*.json
         │  └─ report_*.md
         │
         └─ Return summary to app
```

## Performance Characteristics

```
Operation              Time          Note
─────────────────────────────────────────────
get_organizer()        5-10s         Page load + parsing
get_past_hackathons()  10-15s        DOM traversal
scrape_winners() x3    45-60s        3 editions, 2s delay each
Analysis               < 1s          In-memory computation
Export                 < 1s          File write
─────────────────────────────────────────────
Total (3 editions)     ~60-90s       ~1-2 minutes
```

## Error Handling

```
Flow:
  Input Validation
    ↓
  Scraper Error Handling
    ├─ Page not found
    ├─ Organizer not found
    ├─ Winners not found
    └─ Playwright errors
    ↓
  Analysis Error Handling
    ├─ No data to analyze
    ├─ Empty winners list
    └─ Calculation errors
    ↓
  Export Error Handling
    ├─ Permission denied
    ├─ Disk full
    └─ File write errors
    ↓
  Return Status
    ├─ 'success'
    ├─ 'no_data'
    ├─ 'error'
    └─ Error message
```

---

**This architecture ensures:**
- ✅ Modular, testable code
- ✅ Clear separation of concerns
- ✅ Flexible for future extensions
- ✅ Easy to debug and maintain
- ✅ Seamless mobile app integration
