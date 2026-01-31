import { useMemo } from 'react';
import { Hackathon } from '../types';

interface RecommendationScore {
  hackathonId: string;
  matchPercentage: number;
  matchedSkills: string[];
}

/**
 * Maps hackathon types/themes to their typical tech stacks
 */
const getHackathonTechStack = (hackathonTitle: string, themes: string[] = []): string[] => {
  const title = hackathonTitle.toLowerCase();
  const themesLower = themes.map(t => t.toLowerCase());

  const stacks: { [key: string]: string[] } = {
    ai: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'Machine Learning', 'Data Science', 'Scikit-learn'],
    ml: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science', 'Pandas', 'NumPy'],
    blockchain: ['Solidity', 'Ethereum', 'Web3.js', 'Hardhat', 'Smart Contracts', 'Blockchain', 'Crypto'],
    web: ['React', 'TypeScript', 'Node.js', 'HTML', 'CSS', 'JavaScript', 'Next.js', 'GraphQL'],
    frontend: ['React', 'Vue', 'Angular', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Tailwind'],
    mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Dart'],
    ios: ['Swift', 'Objective-C', 'iOS', 'Xcode', 'React Native'],
    android: ['Kotlin', 'Java', 'Android', 'React Native', 'Flutter'],
    game: ['Unity', 'C#', 'Unreal Engine', 'C++', 'Godot', 'Game Development'],
    health: ['Python', 'React', 'Data Science', 'Healthcare', 'Machine Learning', 'Medical'],
    data: ['Python', 'SQL', 'Data Science', 'Analytics', 'Pandas', 'Spark', 'BigQuery'],
    cyber: ['Security', 'Python', 'C++', 'Networking', 'Cryptography', 'Penetration Testing'],
    iot: ['Python', 'Arduino', 'IoT', 'Embedded', 'C++', 'Microcontrollers'],
    cloud: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Cloud Computing'],
    fintech: ['Python', 'JavaScript', 'Financial', 'API', 'Banking', 'Blockchain'],
    sustainability: ['Python', 'React', 'Environmental', 'Data Analysis', 'IoT'],
  };

  let techStack: Set<string> = new Set();

  // Check title
  for (const [key, techs] of Object.entries(stacks)) {
    if (title.includes(key)) {
      techs.forEach(t => techStack.add(t));
    }
  }

  // Check themes
  themesLower.forEach(theme => {
    for (const [key, techs] of Object.entries(stacks)) {
      if (theme.includes(key)) {
        techs.forEach(t => techStack.add(t));
      }
    }
  });

  // Default general stack if no match found
  if (techStack.size === 0) {
    techStack = new Set(['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript']);
  }

  return Array.from(techStack);
};

/**
 * Calculates skill match percentage between user skills and hackathon requirements
 */
export const calculateSkillMatch = (userSkills: string[] = [], hackathon: Hackathon): RecommendationScore => {
  if (!userSkills || userSkills.length === 0) {
    return {
      hackathonId: hackathon.id,
      matchPercentage: 0,
      matchedSkills: [],
    };
  }

  const hackathonTechs = getHackathonTechStack(hackathon.title, hackathon.themes);
  const userSkillsLower = userSkills.map(s => s.toLowerCase());

  const matchedSkills = hackathonTechs.filter(tech =>
    userSkillsLower.some(userSkill => 
      tech.toLowerCase().includes(userSkill) || userSkill.includes(tech.toLowerCase())
    )
  );

  const matchPercentage = hackathonTechs.length > 0
    ? Math.round((matchedSkills.length / hackathonTechs.length) * 100)
    : 0;

  return {
    hackathonId: hackathon.id,
    matchPercentage,
    matchedSkills: matchedSkills.slice(0, 3), // Top 3 matched skills
  };
};

/**
 * Hook to get skill-based recommendations for hackathons
 */
export const useSkillBasedRecommendation = (userSkills: string[] = [], hackathons: Hackathon[]) => {
  const recommendations = useMemo(() => {
    if (!hackathons || hackathons.length === 0) return {};

    const scoredHackathons: { [key: string]: RecommendationScore } = {};
    
    hackathons.forEach(hackathon => {
      scoredHackathons[hackathon.id] = calculateSkillMatch(userSkills, hackathon);
    });

    return scoredHackathons;
  }, [userSkills, hackathons]);

  // Sort hackathons by match percentage
  const sortedByRecommendation = useMemo(() => {
    return [...hackathons].sort((a, b) => {
      const scoreA = recommendations[a.id]?.matchPercentage || 0;
      const scoreB = recommendations[b.id]?.matchPercentage || 0;
      return scoreB - scoreA;
    });
  }, [hackathons, recommendations]);

  return {
    recommendations,
    sortedByRecommendation,
  };
};
