"""
Historical Intelligence Engine - Quick Start Examples
Demonstrates how to use the intelligence system
"""

import asyncio
import json
from historical_pipeline import IntelligenceEngine
from historical_scraper import scrape_hackathon_history
from historical_aggregator import HackathonIntelligence


# Example 1: Complete Pipeline Analysis
async def example_complete_analysis():
    """Analyze a hackathon and get full intelligence report"""
    print("=" * 60)
    print("EXAMPLE 1: Complete Analysis")
    print("=" * 60)
    
    engine = IntelligenceEngine(output_dir='intelligence_reports')
    
    result = await engine.run_pipeline(
        hackathon_url="https://bevhacks-2026.devpost.com",
        max_past_editions=3,
        export_formats=['json', 'markdown']
    )
    
    if result['status'] == 'success':
        print(f"\n✅ Analysis Complete!")
        print(f"Past editions analyzed: {result['statistics']['total_past_editions']}")
        print(f"Winners studied: {result['statistics']['total_winners_analyzed']}")
        print(f"\nKey Insights:")
        for insight in result['insights'][:3]:
            print(f"  • {insight}")
    else:
        print(f"❌ Analysis failed: {result.get('message')}")


# Example 2: Just Scrape Data
async def example_scrape_only():
    """Scrape historical data without analysis"""
    print("\n" + "=" * 60)
    print("EXAMPLE 2: Scraping Only")
    print("=" * 60)
    
    raw_data = await scrape_hackathon_history(
        hackathon_url="https://bevhacks-2026.devpost.com",
        max_past_editions=2
    )
    
    print(f"\n✅ Scraping Complete!")
    print(f"Found {len(raw_data['past_hackathons'])} past editions:")
    
    for hackathon in raw_data['past_hackathons']:
        print(f"  • {hackathon['hackathon_name']} ({hackathon['year']})")
        print(f"    Winners: {len(hackathon['winners'])}")
    
    # Save raw data
    with open('scraped_data.json', 'w') as f:
        json.dump(raw_data, f, indent=2)
    print(f"\nRaw data saved to 'scraped_data.json'")


# Example 3: Analyze Existing Data
def example_analyze_existing():
    """Analyze already scraped data (no scraping)"""
    print("\n" + "=" * 60)
    print("EXAMPLE 3: Analyze Existing Data")
    print("=" * 60)
    
    # Load previously scraped data
    with open('scraped_data.json', 'r') as f:
        raw_data = json.load(f)
    
    # Create intelligence analyzer
    intelligence = HackathonIntelligence(raw_data)
    
    # Get analysis
    report = intelligence.analyze()
    
    print(f"\n✅ Analysis Complete!")
    print(f"Winners analyzed: {report['summary']['total_winners_analyzed']}")
    
    print(f"\n🔧 Top Technologies:")
    for tech in report['tech_stack_analysis']['top_technologies'][:3]:
        print(f"  • {tech['technology']}: {tech['percentage']}%")
    
    print(f"\n🎯 Winning Themes:")
    for theme in report['winning_themes']['top_themes'][:3]:
        print(f"  • {theme['theme']}: {theme['percentage']}%")
    
    # Export reports
    markdown = intelligence.generate_markdown_report()
    with open('analysis_report.md', 'w') as f:
        f.write(markdown)
    
    with open('analysis_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nReports saved to:")
    print(f"  • analysis_report.json")
    print(f"  • analysis_report.md")


# Example 4: Batch Analysis
async def example_batch_analysis():
    """Analyze multiple hackathons"""
    print("\n" + "=" * 60)
    print("EXAMPLE 4: Batch Analysis")
    print("=" * 60)
    
    hackathons = [
        "https://bevhacks-2026.devpost.com",
        "https://treehacks-2026.devpost.com",
        # Add more hackathon URLs
    ]
    
    engine = IntelligenceEngine(output_dir='batch_reports')
    results = {}
    
    for url in hackathons:
        print(f"\nAnalyzing: {url}")
        try:
            result = await engine.run_pipeline(url, max_past_editions=2)
            results[url] = result
            print(f"✅ Complete")
        except Exception as e:
            print(f"❌ Failed: {e}")
            results[url] = {'status': 'error', 'error': str(e)}
    
    # Save batch results
    with open('batch_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Batch analysis complete!")
    print(f"Results saved to 'batch_results.json'")


# Example 5: Get Quick Insights Only
async def example_quick_insights():
    """Get just the actionable insights without full report"""
    print("\n" + "=" * 60)
    print("EXAMPLE 5: Quick Insights")
    print("=" * 60)
    
    raw_data = await scrape_hackathon_history(
        "https://bevhacks-2026.devpost.com",
        max_past_editions=2
    )
    
    intelligence = HackathonIntelligence(raw_data)
    insights = intelligence._generate_insights()
    
    print("\n💡 Actionable Insights:")
    for insight in insights:
        print(f"  {insight}\n")


# Example 6: Compare Multiple Hackathons
async def example_compare_hackathons():
    """Compare patterns across different hackathons"""
    print("\n" + "=" * 60)
    print("EXAMPLE 6: Hackathon Comparison")
    print("=" * 60)
    
    hackathons = {
        'BevHacks': 'https://bevhacks-2026.devpost.com',
        'TreeHacks': 'https://treehacks-2026.devpost.com',
    }
    
    comparison = {}
    
    for name, url in hackathons.items():
        print(f"\nAnalyzing {name}...")
        
        raw_data = await scrape_hackathon_history(url, max_past_editions=2)
        intelligence = HackathonIntelligence(raw_data)
        report = intelligence.analyze()
        
        comparison[name] = {
            'winners_analyzed': report['summary']['total_winners_analyzed'],
            'top_tech': report['tech_stack_analysis']['top_technologies'][0]['technology'],
            'top_theme': report['winning_themes']['top_themes'][0]['theme'] if report['winning_themes']['top_themes'] else 'N/A'
        }
    
    print("\n" + "=" * 60)
    print("COMPARISON RESULTS")
    print("=" * 60)
    
    for hackathon, data in comparison.items():
        print(f"\n{hackathon}:")
        print(f"  Winners Analyzed: {data['winners_analyzed']}")
        print(f"  Top Tech: {data['top_tech']}")
        print(f"  Top Theme: {data['top_theme']}")


# Main execution
async def main():
    """Run all examples"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " Historical Intelligence Engine - Examples ".center(58) + "║")
    print("╚" + "=" * 58 + "╝")
    
    # Uncomment to run examples:
    
    # await example_complete_analysis()
    # await example_scrape_only()
    # example_analyze_existing()
    # await example_batch_analysis()
    # await example_quick_insights()
    # await example_compare_hackathons()
    
    # For demonstration, run the complete analysis
    print("\nRunning: Complete Analysis Example\n")
    await example_complete_analysis()


if __name__ == "__main__":
    asyncio.run(main())
