/**
 * Advanced Team Filtering Utility
 * Provides filtering logic for teammate finder
 */

import { TeamSeeker } from '../types';

export interface FilterCriteria {
    skills?: string[];
    college?: string;
    hasOpenSpots?: boolean;
    lookingFor?: string;
}

/**
 * Filter teams based on multiple criteria
 */
export function filterTeammates(
    teammates: TeamSeeker[],
    criteria: FilterCriteria
): TeamSeeker[] {
    return teammates.filter((teammate) => {
        // Skills filter - check if teammate has any of the selected skills
        if (criteria.skills && criteria.skills.length > 0) {
            const hasMatchingSkill = teammate.skills?.some((skill) =>
                criteria.skills!.some(
                    (filterSkill) =>
                        skill.toLowerCase().includes(filterSkill.toLowerCase()) ||
                        filterSkill.toLowerCase().includes(skill.toLowerCase())
                )
            );
            if (!hasMatchingSkill) return false;
        }

        // College filter - check if teammate's college matches
        if (criteria.college && criteria.college.trim()) {
            const collegeMatch =
                teammate.profile?.college
                    ?.toLowerCase()
                    .includes(criteria.college.toLowerCase()) ||
                teammate.profile?.university
                    ?.toLowerCase()
                    .includes(criteria.college.toLowerCase());
            if (!collegeMatch) return false;
        }

        // Looking for filter - check if teammate is looking for specific roles
        if (criteria.lookingFor && criteria.lookingFor.trim()) {
            const lookingForMatch = teammate.looking_for
                ?.toLowerCase()
                .includes(criteria.lookingFor.toLowerCase());
            if (!lookingForMatch) return false;
        }

        // Open spots filter - check if teammate is actively looking
        if (criteria.hasOpenSpots) {
            if (!teammate.looking_for || teammate.looking_for.trim() === '') {
                return false;
            }
        }

        return true;
    });
}

/**
 * Get unique skills from all teammates
 */
export function getUniqueSkills(teammates: TeamSeeker[]): string[] {
    const skillsSet = new Set<string>();
    teammates.forEach((teammate) => {
        teammate.skills?.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
}

/**
 * Get unique colleges from all teammates
 */
export function getUniqueColleges(teammates: TeamSeeker[]): string[] {
    const collegesSet = new Set<string>();
    teammates.forEach((teammate) => {
        if (teammate.profile?.college) {
            collegesSet.add(teammate.profile.college);
        }
        if (teammate.profile?.university) {
            collegesSet.add(teammate.profile.university);
        }
    });
    return Array.from(collegesSet).sort();
}

/**
 * Check if teammate has open spots (is looking for team members)
 */
export function hasOpenSpots(teammate: TeamSeeker): boolean {
    return !!(teammate.looking_for && teammate.looking_for.trim() !== '');
}

/**
 * Get badge text for teammate's looking for status
 */
export function getLookingForBadge(teammate: TeamSeeker): string | null {
    if (!teammate.looking_for || teammate.looking_for.trim() === '') {
        return null;
    }
    return `Looking for: ${teammate.looking_for}`;
}
