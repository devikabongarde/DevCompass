"""
Historical Intelligence Engine - Data Aggregator
Processes raw scraped data into actionable intelligence
"""

import json
from typing import Dict, List, Any
from collections import Counter
import re
from statistics import mean, median


class HackathonIntelligence:
    """Aggregates and analyzes hackathon historical data"""
    
    def __init__(self, raw_data: Dict[str, Any]):
        """
        Args:
            raw_data: Output from scraper (JSON with past_hackathons)
        """
        self.raw_data = raw_data
        self.all_winners = []
        self.platform = raw_data.get('platform', 'devpost')
        
        # Collect all winners
        for hackathon in raw_data.get('past_hackathons', []):
            winners = hackathon.get('winners', [])
            
            for winner in winners:
                winner['hackathon_name'] = hackathon.get('hackathon_name', '')
                winner['hackathon_year'] = hackathon.get('year', '')
                
            self.all_winners.extend(winners)
    
    def analyze(self) -> Dict[str, Any]:
        """Generate comprehensive intelligence report"""
        report = {
            'summary': self._generate_summary(),
            'tech_stack_analysis': self._analyze_tech_stack(),
            'team_size_trends': self._analyze_team_size(),
            'winning_themes': self._analyze_themes(),
            'prize_distribution': self._analyze_prizes(),
            'actionable_insights': self._generate_insights()
        }
        
        return report
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate high-level summary"""
        return {
            'total_past_editions': len(self.raw_data.get('past_hackathons', [])),
            'total_winners_analyzed': len(self.all_winners),
            'platform': self.platform,
            'organizer': self.raw_data.get('organizer_url', 'N/A')
        }
    
    def _analyze_tech_stack(self) -> Dict[str, Any]:
        """Analyze technology stack dominance"""
        tech_counter = Counter()
        total_projects = len(self.all_winners)
        
        for winner in self.all_winners:
            technologies = winner.get('technologies', [])
            for tech in technologies:
                tech_clean = tech.strip().lower()
                tech_counter[tech_clean] += 1
        
        tech_stats = []
        for tech, count in tech_counter.most_common(20):
            percentage = (count / total_projects * 100) if total_projects > 0 else 0
            tech_stats.append({
                'technology': tech.title(),
                'count': count,
                'percentage': round(percentage, 1)
            })
        
        return {
            'top_technologies': tech_stats[:10],
            'all_technologies': tech_stats
        }
    
    def _analyze_team_size(self) -> Dict[str, Any]:
        """Analyze team size trends"""
        team_sizes = []
        
        for winner in self.all_winners:
            team_size = winner.get('team_size')
            
            if team_size and team_size > 0:
                team_sizes.append(team_size)
        
        if not team_sizes:
            return {
                'data_available': False,
                'message': 'Team size data not available'
            }
        
        avg_size = mean(team_sizes)
        med_size = median(team_sizes)
        
        return {
            'data_available': True,
            'average_team_size': round(avg_size, 1),
            'median_team_size': med_size,
            'recommendation': f"Winning teams average {round(avg_size, 1)} members"
        }
    
    def _analyze_themes(self) -> Dict[str, Any]:
        """Analyze winning themes and keywords"""
        all_text = []
        for winner in self.all_winners:
            title = winner.get('title', '')
            tagline = winner.get('tagline', '')
            all_text.append(f"{title} {tagline}".lower())
        
        combined_text = ' '.join(all_text)
        
        theme_keywords = {
            'AI/Machine Learning': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'chatbot'],
            'Sustainability': ['sustainable', 'eco', 'environment', 'climate', 'green', 'renewable'],
            'Healthcare': ['health', 'medical', 'patient', 'diagnosis', 'fitness', 'wellness'],
            'Education': ['education', 'learning', 'student', 'teach', 'study', 'course'],
            'Finance': ['finance', 'payment', 'banking', 'crypto', 'defi', 'wallet'],
            'Social Impact': ['community', 'social', 'accessibility', 'inclusive', 'equity'],
            'Productivity': ['productivity', 'automation', 'workflow', 'tool', 'efficiency'],
            'Gaming': ['game', 'gaming', 'play', 'vr', 'ar', 'metaverse'],
        }
        
        theme_counts = {}
        for theme, keywords in theme_keywords.items():
            count = sum(combined_text.count(keyword) for keyword in keywords)
            if count > 0:
                theme_counts[theme] = count
        
        sorted_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'top_themes': [
                {
                    'theme': theme,
                    'mentions': count,
                    'percentage': round(count / len(self.all_winners) * 100, 1) if self.all_winners else 0
                }
                for theme, count in sorted_themes[:5]
            ],
            'all_themes': dict(sorted_themes)
        }
    
    def _analyze_prizes(self) -> Dict[str, Any]:
        """Analyze prize distribution patterns"""
        prize_categories = Counter()
        
        for winner in self.all_winners:
            prize = winner.get('prize', '').lower()
            
            if prize:
                if 'grand' in prize or 'overall' in prize or '1st' in prize:
                    prize_categories['Grand Prize / 1st Place'] += 1
                elif '2nd' in prize:
                    prize_categories['2nd Place'] += 1
                elif '3rd' in prize:
                    prize_categories['3rd Place'] += 1
                elif 'best' in prize:
                    prize_categories['Category Prize'] += 1
                elif 'sponsor' in prize or 'track' in prize:
                    prize_categories['Sponsor/Track Prize'] += 1
                else:
                    prize_categories['Other'] += 1
        
        return {
            'prize_breakdown': dict(prize_categories),
            'total_prizes_awarded': sum(prize_categories.values())
        }
    
    def _generate_insights(self) -> List[str]:
        """Generate actionable strategic insights"""
        insights = []
        
        tech_analysis = self._analyze_tech_stack()
        if tech_analysis.get('top_technologies'):
            top_tech = tech_analysis['top_technologies'][0]
            insights.append(
                f"🔧 {top_tech['technology']} used in {top_tech['percentage']}% of winners"
            )
        
        theme_analysis = self._analyze_themes()
        if theme_analysis.get('top_themes'):
            top_theme = theme_analysis['top_themes'][0]
            insights.append(
                f"🎯 {top_theme['theme']} is the trending theme"
            )
        
        insights.append("💡 Study past winners to identify winning patterns")
        insights.append("⏱️ Focus on shipping a polished MVP over ambitious features")
        
        return insights
    
    def generate_markdown_report(self) -> str:
        """Generate a human-readable markdown report"""
        report = self.analyze()
        
        md = f"""# Hackathon Intelligence Report

## Summary
- **Platform**: {report['summary']['platform']}
- **Past Editions**: {report['summary']['total_past_editions']}
- **Winners Analyzed**: {report['summary']['total_winners_analyzed']}

---

## 🔧 Top Technologies

"""
        
        for tech in report['tech_stack_analysis']['top_technologies'][:5]:
            md += f"- **{tech['technology']}**: {tech['percentage']}% ({tech['count']} projects)\n"
        
        md += "\n## 🎯 Winning Themes\n\n"
        
        for theme in report['winning_themes']['top_themes']:
            md += f"- **{theme['theme']}**: {theme['mentions']} mentions ({theme['percentage']}%)\n"
        
        md += "\n## 💡 Strategic Insights\n\n"
        
        for insight in report['actionable_insights']:
            md += f"- {insight}\n"
        
        md += "\n---\n\n*Report generated by Historical Intelligence Engine*\n"
        
        return md
