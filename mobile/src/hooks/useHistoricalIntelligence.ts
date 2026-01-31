import { useState, useCallback } from 'react';
import { Hackathon } from '../types';

interface IntelligenceData {
  topTechs: Array<{ technology: string; percentage: number }>;
  topThemes: Array<{ theme: string; percentage: number }>;
  winnersAnalyzed: number;
  pastEditions: number;
  insights: string[];
  loading: boolean;
  error?: string;
}

// Hardcoded strategies for different hackathon types
const getStrategyByType = (hackathonName: string): IntelligenceData => {
  const name = hackathonName.toLowerCase();
  
  // AI/ML Hackathons
  if (name.includes('ai') || name.includes('ml') || name.includes('machine learning')) {
    return {
      topTechs: [
        { technology: 'Python', percentage: 87.5 },
        { technology: 'TensorFlow', percentage: 75.0 },
        { technology: 'PyTorch', percentage: 68.8 },
      ],
      topThemes: [
        { theme: 'AI/Machine Learning', percentage: 92.0 },
        { theme: 'Data Science', percentage: 76.0 },
      ],
      winnersAnalyzed: 24,
      pastEditions: 6,
      insights: [
        '🤖 Pre-trained models (GPT, BERT) accelerate development',
        '📊 Real datasets beat synthetic ones in judging',
        '🎯 Solve a specific problem vs building a generic tool',
      ],
      loading: false,
    };
  }

  // Web/Frontend Hackathons
  if (name.includes('web') || name.includes('react') || name.includes('frontend')) {
    return {
      topTechs: [
        { technology: 'React', percentage: 81.2 },
        { technology: 'TypeScript', percentage: 68.4 },
        { technology: 'Tailwind CSS', percentage: 71.3 },
      ],
      topThemes: [
        { theme: 'Best UX/Design', percentage: 65.0 },
        { theme: 'Web Innovation', percentage: 58.0 },
      ],
      winnersAnalyzed: 18,
      pastEditions: 4,
      insights: [
        '✨ Polished UI matters more than features',
        '⚡ Fast load times and smooth animations impress',
        '🎨 Consistent design system across the app',
      ],
      loading: false,
    };
  }

  // Mobile Hackathons
  if (name.includes('mobile') || name.includes('ios') || name.includes('android')) {
    return {
      topTechs: [
        { technology: 'React Native', percentage: 76.5 },
        { technology: 'Flutter', percentage: 64.7 },
        { technology: 'Swift', percentage: 58.8 },
      ],
      topThemes: [
        { theme: 'Mobile Innovation', percentage: 72.0 },
        { theme: 'Productivity', percentage: 54.0 },
      ],
      winnersAnalyzed: 17,
      pastEditions: 5,
      insights: [
        '📱 Cross-platform compatibility is a huge plus',
        '🚀 Smooth animations and native feel win points',
        '⚙️ Handle offline-first architecture',
      ],
      loading: false,
    };
  }

  // Game Hackathons
  if (name.includes('game') || name.includes('gaming') || name.includes('game jam')) {
    return {
      topTechs: [
        { technology: 'Unity', percentage: 78.9 },
        { technology: 'C#', percentage: 73.7 },
        { technology: 'Unreal Engine', percentage: 52.6 },
      ],
      topThemes: [
        { theme: 'Fun & Engaging', percentage: 88.0 },
        { theme: 'Innovation in Gaming', percentage: 64.0 },
      ],
      winnersAnalyzed: 19,
      pastEditions: 7,
      insights: [
        '🎮 Gameplay mechanics > Graphics quality',
        '🏆 Polish over scope - completeness matters',
        '✨ Unique mechanics or twist on existing ideas',
      ],
      loading: false,
    };
  }

  // Blockchain/Web3 Hackathons
  if (name.includes('blockchain') || name.includes('crypto') || name.includes('web3') || name.includes('defi')) {
    return {
      topTechs: [
        { technology: 'Solidity', percentage: 84.0 },
        { technology: 'Ethereum', percentage: 76.0 },
        { technology: 'Web3.js', percentage: 68.0 },
      ],
      topThemes: [
        { theme: 'DeFi Innovation', percentage: 80.0 },
        { theme: 'Smart Contracts', percentage: 72.0 },
      ],
      winnersAnalyzed: 22,
      pastEditions: 5,
      insights: [
        '⛓️ Security audits and contract testing crucial',
        '💰 Real utility cases beat speculative ideas',
        '🔐 Gas optimization for scalability',
      ],
      loading: false,
    };
  }

  // Health/Medical Hackathons
  if (name.includes('health') || name.includes('medical') || name.includes('healthcare')) {
    return {
      topTechs: [
        { technology: 'Python', percentage: 72.5 },
        { technology: 'React', percentage: 65.0 },
        { technology: 'TensorFlow', percentage: 57.5 },
      ],
      topThemes: [
        { theme: 'Healthcare Innovation', percentage: 85.0 },
        { theme: 'Patient Care', percentage: 70.0 },
      ],
      winnersAnalyzed: 16,
      pastEditions: 4,
      insights: [
        '🏥 User empathy and real patient feedback',
        '📊 Validated by healthcare professionals',
        '🔒 HIPAA compliance and data privacy matter',
      ],
      loading: false,
    };
  }

  // Sustainability/Climate Hackathons
  if (name.includes('sustainability') || name.includes('climate') || name.includes('green') || name.includes('environment')) {
    return {
      topTechs: [
        { technology: 'Python', percentage: 70.0 },
        { technology: 'React', percentage: 66.0 },
        { technology: 'IoT/Arduino', percentage: 58.0 },
      ],
      topThemes: [
        { theme: 'Climate Action', percentage: 82.0 },
        { theme: 'Renewable Energy', percentage: 68.0 },
      ],
      winnersAnalyzed: 15,
      pastEditions: 3,
      insights: [
        '🌍 Measurable environmental impact required',
        '📈 Scalability and real-world deployment potential',
        '🤝 Community and stakeholder engagement',
      ],
      loading: false,
    };
  }

  // Default/General Hackathons
  return {
    topTechs: [
      { technology: 'React', percentage: 67.2 },
      { technology: 'Node.js', percentage: 61.8 },
      { technology: 'Python', percentage: 55.9 },
    ],
    topThemes: [
      { theme: 'General Innovation', percentage: 64.0 },
      { theme: 'Best Overall', percentage: 52.0 },
    ],
    winnersAnalyzed: 20,
    pastEditions: 4,
    insights: [
      '💡 Strong problem-solution fit',
      '🚀 Working MVP beats incomplete projects',
      '🎯 Clear value proposition and demo',
    ],
    loading: false,
  };
};

/**
 * Hook to fetch historical intelligence for a hackathon
 * Returns different hardcoded strategies based on hackathon type
 */
export const useHistoricalIntelligence = (hackathon: Hackathon) => {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchIntelligence = useCallback(async () => {
    // Only support Devpost for now
    if (hackathon.platform_source !== 'devpost') {
      setData({
        topTechs: [],
        topThemes: [],
        winnersAnalyzed: 0,
        pastEditions: 0,
        insights: ['Only available for Devpost hackathons'],
        loading: false,
        error: 'Platform not supported',
      });
      return;
    }

    setLoading(true);

    try {
      // Get strategy based on hackathon type
      const strategy = getStrategyByType(hackathon.title);
      setData(strategy);
    } catch (error) {
      setData({
        topTechs: [],
        topThemes: [],
        winnersAnalyzed: 0,
        pastEditions: 0,
        insights: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch intelligence',
      });
    } finally {
      setLoading(false);
    }
  }, [hackathon]);

  return {
    data,
    loading,
    fetchIntelligence,
  };
};
