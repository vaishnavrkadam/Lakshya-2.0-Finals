import React from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import type { Discipline } from '../../types/shooting';

interface RankNameOverlayProps {
    discipline?: Discipline;
}

export default function RankNameOverlay({ discipline = '10m_rifle' }: RankNameOverlayProps) {
    const { athleteResults } = useLiveData();

    // Filter finalists by discipline and sort by rank
    const finalists = athleteResults
        .filter(a => a.discipline === discipline)
        .sort((a, b) => a.finalRank - b.finalRank)
        .slice(0, 8);

    const leaderScore = finalists[0]?.finalTotal || 0;

    return (
        <div
            className="w-screen h-screen overflow-hidden flex items-center justify-start p-8 sm:p-12 select-none"
            style={{ backgroundColor: '#00FF00' }} // Pure Chroma Key Green
        >
            {/* Vertical Pill Stack (Matches RanknName.png reference) */}
            <div className="flex flex-col gap-2.5 sm:gap-3.5 max-w-sm sm:max-w-md w-full font-sans">
                {finalists.map((ath, idx) => {
                    const rank = ath.finalRank || idx + 1;
                    const isLeader = rank === 1;
                    const isEliminated = ath.finalStatus === 'ELIMINATED';

                    // Compute difference from leader or previous
                    let diffText = '';
                    if (!isLeader && leaderScore > 0 && !isEliminated) {
                        const diff = ath.finalTotal - leaderScore;
                        diffText = diff === 0 ? '0.0' : diff.toFixed(1);
                    }

                    // Format name in bold uppercase surname style
                    const displayName = ath.name.toUpperCase().split(' ').slice(-1)[0] || ath.name.toUpperCase();

                    return (
                        <div key={ath.participantId} className="flex items-center drop-shadow-md">

                            {/* Left Rank Capsule (White pill with black rank number) */}
                            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-black font-extrabold text-lg sm:text-2xl flex items-center justify-center shadow-md z-20 shrink-0 border border-gray-200">
                                {rank}
                            </div>

                            {/* Main Name Pill */}
                            <div
                                className={`-ml-3 pl-5 pr-3 h-10 sm:h-12 flex items-center justify-between rounded-r-2xl z-10 min-w-[170px] sm:min-w-[200px] flex-1 transition-all ${isEliminated
                                        ? 'bg-black text-[#06B6D4] shadow-lg'
                                        : 'bg-[#E2E8F0] text-black shadow-md'
                                    }`}
                            >
                                <span className={`font-black text-sm sm:text-base tracking-wider truncate pr-2 ${isEliminated ? 'text-[#06B6D4]' : 'text-slate-900'}`}>
                                    {displayName}
                                </span>

                                {/* Right circle indicator (department badge) */}
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isEliminated ? 'bg-[#1E293B] text-[#06B6D4]' : 'bg-[#CBD5E1] text-slate-800'}`}>
                                    {ath.department.slice(0, 3).toUpperCase()}
                                </div>
                            </div>

                            {/* Right Deep Purple Pill Extension for Active Non-Leader Shooters */}
                            {!isLeader && !isEliminated && diffText && (
                                <div className="h-10 sm:h-12 px-3 sm:px-4 rounded-r-2xl bg-[#31006F] text-white font-black text-xs sm:text-sm flex items-center justify-center -ml-2 z-0 shadow-md">
                                    {diffText}
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
