import React from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import TargetSheetGraphic from '../../components/overlays/TargetSheetGraphic';
import type { Discipline } from '../../types/shooting';

interface ScorecardsOverlayProps {
    discipline?: Discipline;
}

export default function ScorecardsOverlay({ discipline = '10m_rifle' }: ScorecardsOverlayProps) {
    const { athleteResults } = useLiveData();

    // Filter finalists by discipline and sort by rank (showing active finalists)
    const finalists = athleteResults
        .filter(a => a.discipline === discipline)
        .sort((a, b) => a.finalRank - b.finalRank)
        .slice(0, 8);

    return (
        <div
            className="w-screen h-screen overflow-hidden flex flex-col justify-end p-6 sm:p-10 select-none"
            style={{ backgroundColor: '#00FF00' }} // Pure Chroma Key Green
        >
            {/* Horizontal Cards Strip aligned at bottom (Matches ScorecardsOverlay.png reference) */}
            <div className="flex items-end justify-center gap-2.5 sm:gap-4 overflow-x-auto w-full pb-2">
                {finalists.map(ath => {
                    const shots = ath.shots || [];
                    const lastShot = ath.lastShot || (shots.length > 0 ? shots[shots.length - 1] : 0.0);
                    const isEliminated = ath.finalStatus === 'ELIMINATED';

                    return (
                        <div
                            key={ath.participantId}
                            className={`flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border-2 transition-all w-40 sm:w-48 shrink-0 ${isEliminated ? 'opacity-40 grayscale border-gray-400' : 'border-slate-300'
                                }`}
                        >
                            {/* Top Half: Target Sheet Graphic (Left) + Score & Total Box (Right) */}
                            <div className="flex items-center justify-between p-2.5 bg-gradient-to-b from-gray-100 to-white">

                                {/* Left: Target Graphic (8-10 Ring Black Section) */}
                                <div className="p-0.5">
                                    <TargetSheetGraphic score={lastShot} size={68} />
                                </div>

                                {/* Right: SCORE & TOTAL Boxes */}
                                <div className="flex flex-col items-end gap-1 flex-1 pl-2">
                                    {/* Score Box */}
                                    <div className="flex items-center gap-1.5 w-full justify-end">
                                        <span className="text-[9px] font-black italic text-slate-500 uppercase">SCORE</span>
                                        <div className="bg-[#00BCD4] text-slate-950 font-black text-sm sm:text-base px-2 py-0.5 rounded shadow-sm min-w-[42px] text-center">
                                            {lastShot > 0 ? lastShot.toFixed(1) : '—'}
                                        </div>
                                    </div>

                                    {/* Total Box */}
                                    <div className="flex items-center gap-1.5 w-full justify-end">
                                        <div className="bg-[#31006F] text-white font-black text-base sm:text-lg px-2.5 py-0.5 rounded shadow-sm w-full text-center">
                                            {ath.finalTotal.toFixed(1)}
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black italic text-[#31006F] uppercase -mt-0.5 mr-1">TOTAL</span>
                                </div>

                            </div>

                            {/* Middle Black Bar: Athlete Name */}
                            <div className="bg-black text-white font-black text-xs sm:text-sm text-center py-1.5 uppercase tracking-wide truncate px-2">
                                {ath.name}
                            </div>

                            {/* Bottom Row: Department & Shots Progress (e.g. 13/24) */}
                            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white text-black font-extrabold text-xs border-t border-gray-200">
                                <div className="flex items-center gap-1.5">
                                    <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-black">
                                        {ath.department}
                                    </span>
                                </div>

                                <div className="text-slate-950 font-black text-xs sm:text-sm">
                                    {shots.length}/24
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
