import React from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import type { Discipline } from '../../types/shooting';

interface LeaderboardOverlayProps {
    discipline?: Discipline;
}

export default function LeaderboardOverlay({ discipline = '10m_rifle' }: LeaderboardOverlayProps) {
    const { athleteResults } = useLiveData();

    // Filter finalists by discipline and sort by rank
    const finalists = athleteResults
        .filter(a => a.discipline === discipline)
        .sort((a, b) => a.finalRank - b.finalRank)
        .slice(0, 8);

    const leaderScore = finalists[0]?.finalTotal || 0;
    const maxShotsFired = Math.max(0, ...finalists.map(a => a.shots?.length || 0));

    return (
        <div
            className="w-screen h-screen overflow-hidden flex items-center justify-center p-6 sm:p-10 select-none font-sans"
            style={{ backgroundColor: '#00FF00' }} // Pure Chroma Key Green
        >
            {/* Main Broadcast Card Container (Matches LeadeboardOverlay.png reference) */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-5 border-4 border-gray-100">

                {/* Top Header: Logos (Left) + Competition Header Title (Right) */}
                <div className="flex items-center gap-6 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-3 shrink-0">
                        <img
                            src="/assets/logos/RVCE Logo.webp"
                            alt="RVCE"
                            className="h-12 sm:h-14 w-auto object-contain"
                        />
                        <img
                            src="/assets/logos/GARE Logo.webp"
                            alt="GARE"
                            className="h-10 sm:h-12 w-auto object-contain"
                        />
                        <img
                            src="/assets/logos/NCC Logo.webp"
                            alt="NCC"
                            className="h-11 sm:h-13 w-auto object-contain"
                        />
                    </div>

                    <div className="flex flex-col">
                        <h1 className="font-black text-xl sm:text-2xl text-slate-950 uppercase tracking-tight leading-tight">
                            LAKSHYA 2.0 FINALS 2026
                        </h1>
                        <span className="text-slate-700 font-bold text-sm sm:text-base">
                            Final
                        </span>
                        <span className="text-[#31006F] font-black text-base sm:text-lg">
                            {discipline === '10m_rifle' ? '10m Air Rifle' : '10m Air Pistol'}
                        </span>
                        <span className="text-slate-600 font-bold text-xs sm:text-sm">
                            {maxShotsFired >= 24
                                ? 'Final Results'
                                : maxShotsFired > 0
                                    ? `Standings after ${maxShotsFired} shots`
                                    : 'Starting Standings'}
                        </span>
                    </div>
                </div>

                {/* 8 Leaderboard Rows */}
                <div className="space-y-2">
                    {finalists.map((ath, idx) => {
                        const rank = ath.finalRank || idx + 1;
                        const isLeader = rank === 1;
                        const isEliminated = ath.finalStatus === 'ELIMINATED';

                        // Difference from leader
                        let diffText = '';
                        if (!isLeader && leaderScore > 0 && !isEliminated) {
                            const diff = ath.finalTotal - leaderScore;
                            diffText = diff === 0 ? '0.0' : diff.toFixed(1);
                        }

                        return (
                            <div key={ath.participantId} className="flex items-center gap-2 text-sm sm:text-base">

                                {/* Rank Pill (Deep Purple) */}
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#31006F] text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-sm">
                                    {rank}
                                </div>

                                {/* Main Athlete Name Bar (Dark Background) */}
                                <div className="bg-[#0B0C10] text-white rounded-xl px-4 py-2 sm:py-2.5 flex items-center justify-between flex-1 shadow-sm overflow-hidden">
                                    <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase truncate pr-3">
                                        {ath.name}
                                    </span>
                                    {/* Department tag (Flags omitted as requested) */}
                                    <span className="text-xs text-[#06B6D4] font-black tracking-wider uppercase shrink-0">
                                        {ath.department}
                                    </span>
                                </div>

                                {/* Score Capsule (Deep Purple) */}
                                <div className="bg-[#31006F] text-white font-black text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-center min-w-[70px] sm:min-w-[84px] shadow-sm">
                                    {ath.finalTotal.toFixed(1)}
                                </div>

                                {/* Right Diff / Place Capsule */}
                                <div className="bg-[#0B0C10] rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-center min-w-[80px] sm:min-w-[96px] shadow-sm flex items-center justify-center">
                                    {isLeader ? (
                                        <span className="text-transparent">—</span>
                                    ) : isEliminated ? (
                                        <div className="flex items-center gap-1.5 font-black text-white text-xs sm:text-sm">
                                            <span className="w-5 h-5 rounded-full bg-[#1E293B] text-white text-[10px] flex items-center justify-center">
                                                {rank}
                                            </span>
                                            <span className="uppercase text-[11px] text-gray-300">PLACE</span>
                                        </div>
                                    ) : (
                                        <span className="text-[#06B6D4] font-black text-xs sm:text-sm">
                                            {diffText || '—'}
                                        </span>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
