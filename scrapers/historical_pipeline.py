"""
Historical Intelligence Engine - Main Pipeline
Complete end-to-end workflow for hackathon intelligence gathering
Uses synchronous API to avoid greenlet DLL loading issues
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from historical_scraper import scrape_hackathon_history
from historical_aggregator import HackathonIntelligence

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class IntelligenceEngine:
    """Main orchestrator for the Historical Intelligence Engine"""
    
    def __init__(self, output_dir: str = 'intelligence_reports'):
        """
        Args:
            output_dir: Directory to store output files
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
    def run_pipeline(
        self,
        hackathon_url: str,
        max_past_editions: int = 3,
        export_formats: list = ['json', 'markdown']
    ) -> dict:
        """
        Execute the complete intelligence pipeline
        
        Args:
            hackathon_url: URL of the hackathon to analyze
            max_past_editions: Number of past editions to analyze
            export_formats: List of export formats ('json', 'markdown')
            
        Returns:
            Dictionary with results and file paths
        """
        logger.info("="*60)
        logger.info("HISTORICAL INTELLIGENCE ENGINE - STARTING")
        logger.info("="*60)
        logger.info(f"Target: {hackathon_url}")
        logger.info(f"Max Past Editions: {max_past_editions}")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        try:
            # Step 1: Scrape historical data
            logger.info("\nStep 1: Scraping historical data...")
            raw_data = scrape_hackathon_history(
                hackathon_url=hackathon_url,
                max_past_editions=max_past_editions
            )
            
            if not raw_data.get('past_hackathons'):
                logger.warning("No past hackathons found")
                return {
                    'status': 'no_data',
                    'message': 'Could not find past hackathons for this event'
                }
            
            logger.info(f"✓ Found {len(raw_data['past_hackathons'])} past editions")
            
            # Step 2: Analyze and generate intelligence
            logger.info("\nStep 2: Analyzing data...")
            intelligence = HackathonIntelligence(raw_data)
            report = intelligence.analyze()
            
            # Step 3: Export results
            logger.info("\nStep 3: Exporting results...")
            output_files = {}
            
            if 'json' in export_formats:
                json_file = self.output_dir / f'report_{timestamp}.json'
                with open(json_file, 'w') as f:
                    json.dump(report, f, indent=2)
                output_files['json_report'] = str(json_file)
                logger.info(f"✓ JSON report: {json_file.name}")
            
            if 'markdown' in export_formats:
                markdown = intelligence.generate_markdown_report()
                md_file = self.output_dir / f'report_{timestamp}.md'
                with open(md_file, 'w') as f:
                    f.write(markdown)
                output_files['markdown_report'] = str(md_file)
                logger.info(f"✓ Markdown report: {md_file.name}")
            
            # Step 4: Print summary
            logger.info("\n" + "="*60)
            logger.info("RESULTS SUMMARY")
            logger.info("="*60)
            
            summary = report['summary']
            logger.info(f"📊 Past Editions: {summary['total_past_editions']}")
            logger.info(f"🏆 Winners Analyzed: {summary['total_winners_analyzed']}")
            
            if summary['total_winners_analyzed'] > 0:
                tech = report['tech_stack_analysis']['top_technologies'][0]
                logger.info(f"🔧 Top Tech: {tech['technology']} ({tech['percentage']}%)")
                
                if report['winning_themes']['top_themes']:
                    theme = report['winning_themes']['top_themes'][0]
                    logger.info(f"🎯 Trending Theme: {theme['theme']}")
            
            logger.info("\n💡 Key Insights:")
            for insight in report['actionable_insights'][:3]:
                logger.info(f"   {insight}")
            
            logger.info("\n" + "="*60)
            
            return {
                'status': 'success',
                'output_files': output_files,
                'statistics': summary,
                'report': report,
                'insights': report['actionable_insights']
            }
            
        except Exception as e:
            logger.error(f"❌ Pipeline failed: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }


def analyze_hackathon(url: str) -> dict:
    """
    Simple wrapper for analyzing a hackathon
    
    Args:
        url: Hackathon URL
        
    Returns:
        Analysis results with statistics and insights
    """
    engine = IntelligenceEngine()
    return engine.run_pipeline(url, max_past_editions=3)


if __name__ == "__main__":
    # Example usage
    url = "https://bevhacks-2026.devpost.com"
    result = analyze_hackathon(url)
    
    if result['status'] == 'success':
        print("\n✅ Analysis complete!")
        print(f"Check 'intelligence_reports' folder for detailed reports")
    else:
        print(f"❌ Analysis failed: {result.get('message', 'Unknown error')}")
