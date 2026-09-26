import type { Discipline, AthleteResult } from '../types/shooting';

export const CURRENT_ISSF_RULEBOOK_VERSION = '2024-2028 Edition (Effective Jan 2024) — Lakshya 2.0 Finals';

/**
 * Validates whether a single shot decimal score complies with ISSF standard (0.0 to 10.9)
 */
export function isValidISSFShot(score: number): boolean {
    if (isNaN(score)) return false;
    const rounded = Math.round(score * 10) / 10;
    return rounded >= 0.0 && rounded <= 10.9;
}

/**
 * Calculates sum of shots with exact single decimal rounding
 */
export function calculateRawScore(shots: number[]): number {
    const sum = shots.reduce((acc, curr) => acc + (isValidISSFShot(curr) ? curr : 0), 0);
    return Math.round(sum * 10) / 10;
}

/**
 * Calculates the official leaderboard score based on staged rules:
 * - Shots 1-4: 0.0 (in progress)
 * - Shots 5-9: sum of first 5 shots (Series 1 complete)
 * - Shot 10: sum of first 10 shots (Series 2 complete)
 * - Shots 11-24: sum of all shots taken (live update after each shot)
 */
export function calculateLeaderboardScore(shots: number[]): number {
    const count = shots.length;
    if (count < 5) {
        return 0.0;
    } else if (count < 10) {
        return calculateRawScore(shots.slice(0, 5));
    } else if (count === 10) {
        return calculateRawScore(shots.slice(0, 10));
    } else {
        // count >= 11
        return calculateRawScore(shots.slice(0, Math.min(24, count)));
    }
}

/**
 * Evaluates rankings, eliminations, and medal placements for a list of finalists in a vertical.
 *
 * Elimination thresholds:
 * - Shot 12: eliminate 8th position
 * - Shot 14: eliminate 7th position
 * - Shot 16: eliminate 6th position
 * - Shot 18: eliminate 5th position
 * - Shot 20: eliminate 4th position
 * - Shot 22: eliminate 3rd position (Bronze)
 * - Shot 24: finalize Gold (1st) and Silver (2nd)
 */
export function evaluateFinalsState(athletes: AthleteResult[]): AthleteResult[] {
    if (!athletes || athletes.length === 0) return [];

    // First, compute scores for all athletes
    const withScores = athletes.map(ath => {
        const shots = ath.shots ? [...ath.shots] : [];
        const liveTotal = calculateRawScore(shots);
        const officialScore = calculateLeaderboardScore(shots);
        const updatedAth: AthleteResult = {
            ...ath,
            shots,
            liveTotalScore: liveTotal,
            finalTotal: officialScore,
        };
        if (shots.length > 0) {
            updatedAth.lastShot = shots[shots.length - 1];
        } else {
            delete updatedAth.lastShot;
        }
        return updatedAth;
    });

    // Check elimination stages based on active shooters' shots.
    // If an athlete is already marked ELIMINATED, they retain their eliminated rank.
    // Active athletes are sorted by current official score (then last shot, then initial round score)
    const activeAthletes = withScores.filter(a => a.finalStatus !== 'ELIMINATED');
    const eliminatedAthletes = withScores.filter(a => a.finalStatus === 'ELIMINATED');

    // Sort active athletes descending
    activeAthletes.sort((a, b) => {
        // Compare official score
        if (b.finalTotal !== a.finalTotal) {
            return b.finalTotal - a.finalTotal;
        }
        // If tied, compare live total score
        if (b.liveTotalScore !== a.liveTotalScore) {
            return b.liveTotalScore - a.liveTotalScore;
        }
        // If tied, compare last shot
        const aLast = a.lastShot ?? -1;
        const bLast = b.lastShot ?? -1;
        if (bLast !== aLast) {
            return bLast - aLast;
        }
        // If still tied, break tie by initial round score
        return (b.initialScore || 0) - (a.initialScore || 0);
    });

    // Elimination schedule: [shotThreshold, eliminateRank]
    const eliminationThresholds: Array<{ shotIndex: number; eliminateRank: number }> = [
        { shotIndex: 12, eliminateRank: 8 },
        { shotIndex: 14, eliminateRank: 7 },
        { shotIndex: 16, eliminateRank: 6 },
        { shotIndex: 18, eliminateRank: 5 },
        { shotIndex: 20, eliminateRank: 4 },
        { shotIndex: 22, eliminateRank: 3 },
    ];

    // Check each threshold in sequence
    for (const { shotIndex, eliminateRank } of eliminationThresholds) {
        // If there are still enough active athletes and all active athletes have fired at least shotIndex shots
        if (activeAthletes.length >= eliminateRank) {
            const allReached = activeAthletes.every(a => a.shots.length >= shotIndex);
            if (allReached) {
                // The athlete at index (eliminateRank - 1) is eliminated
                const targetIdx = eliminateRank - 1;
                const eliminatedAthlete = activeAthletes[targetIdx];
                if (eliminatedAthlete) {
                    eliminatedAthlete.finalStatus = eliminateRank === 3 ? 'BRONZE' : 'ELIMINATED';
                    eliminatedAthlete.finalRank = eliminateRank;
                    eliminatedAthlete.eliminatedAtShot = shotIndex;

                    // Move to eliminated list
                    activeAthletes.splice(targetIdx, 1);
                    eliminatedAthletes.push(eliminatedAthlete);
                }
            }
        }
    }

    // Final shot (24) check: when top 2 have completed 24 shots
    if (activeAthletes.length === 2 && activeAthletes.every(a => a.shots.length >= 24)) {
        activeAthletes[0].finalStatus = 'GOLD';
        activeAthletes[0].finalRank = 1;
        activeAthletes[1].finalStatus = 'SILVER';
        activeAthletes[1].finalRank = 2;
    } else {
        // Assign provisional ranks to remaining active athletes
        activeAthletes.forEach((ath, idx) => {
            ath.finalRank = idx + 1;
            if (ath.finalStatus !== 'GOLD' && ath.finalStatus !== 'SILVER') {
                ath.finalStatus = 'LIVE';
            }
        });
    }

    // Combine all athletes and sort by finalRank ascending
    const allRanked = [...activeAthletes, ...eliminatedAthletes].sort(
        (a, b) => a.finalRank - b.finalRank
    );

    // Calculate "Lagging By" based on leader's score
    const leaderScore = allRanked[0]?.finalTotal || 0;

    return allRanked.map((ath, idx) => {
        let laggingBy = '—';
        if (idx === 0 || leaderScore === 0) {
            laggingBy = '—';
        } else {
            const diff = Math.max(0, leaderScore - ath.finalTotal);
            laggingBy = diff === 0 ? '—' : diff.toFixed(1);
        }

        return {
            ...ath,
            laggingBy,
        };
    });
}
