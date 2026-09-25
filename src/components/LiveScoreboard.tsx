import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Trophy, TrendingUp, TrendingDown, Award } from 'lucide-react';

interface LiveScoreboardProps {
    onSelectAthlete?: (participantId: string) => void;
}

export default function LiveScoreboard({ onSelectAthlete }: LiveScoreboardProps) {
    const { activeResults, liveState, currentShooter } = useLiveData();

    return (
        <div className="flex flex-col bg-[#12131A] rounded-xl border border-[#282B3A] overflow-hidden shadow-2xl h-full font-mono">

            {/* Header bar */}
            <div className="px-4 py-3 bg-[#0E0F15] border-b border-[#282B3A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#F59E0B]" />
                    <span className="font-headline-sm text-sm text-[#F8FAFC] tracking-wider uppercase">
                        LIVE FINALS LEADERBOARD
                    </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1C26] border border-[#282B3A] text-[#F59E0B] font-bold uppercase">
                    {liveState.discipline === '10m_rifle' ? '10M RIFLE' : '10M PISTOL'}
                </span>
            </div>

            {/* Table Container - Strict NO Horizontal Scrolling */}
            <div className="w-full overflow-x-hidden">
                <table className="w-full table-fixed text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0B0C10] border-b border-[#282B3A] text-[10px] text-[#64748B] uppercase tracking-wider sticky top-0 z-10">
                            <th className="py-2.5 px-2 w-[12%] text-center">POS</th>
                            <th className="py-2.5 px-2 w-[34%]">ATHLETE</th>
                            <th className="py-2.5 px-1.5 w-[14%] text-center">DEPT</th>
                            <th className="py-2.5 px-2 w-[18%] text-right">SCORE</th>
                            <th className="py-2.5 px-1.5 w-[18%] text-right">LAGGING</th>
                            <th className="py-2.5 px-1.5 w-[16%] text-center hidden sm:table-cell">STATUS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#282B3A]/50 text-xs">
                        {activeResults.map((ath, idx) => {
                            const pos = ath.finalRank || (idx + 1);
                            const isLead = pos === 1;
                            const isPodium = pos <= 3;
                            const isEliminated = ath.finalStatus === 'ELIMINATED';
                            const isGold = ath.finalStatus === 'GOLD';
                            const isSilver = ath.finalStatus === 'SILVER';
                            const isBronze = ath.finalStatus === 'BRONZE';
                            const isCurrentSelected = ath.participantId === currentShooter.participantId;

                            return (
                                <tr
                                    key={ath.participantId}
                                    onClick={() => onSelectAthlete?.(ath.participantId)}
                                    className={`group hover:bg-[#1A1C26]/80 transition-colors cursor-pointer ${isGold
                                            ? 'bg-[#F59E0B]/10 font-bold'
                                            : isSilver
                                                ? 'bg-[#94A3B8]/10'
                                                : isBronze
                                                    ? 'bg-[#D97706]/10'
                                                    : isEliminated
                                                        ? 'opacity-40 bg-[#12131A] line-through'
                                                        : isCurrentSelected
                                                            ? 'bg-[#DC2626]/10 border-l-2 border-[#DC2626]'
                                                            : 'bg-transparent'
                                        }`}
                                >
                                    {/* Position Badge */}
                                    <td className="py-2.5 px-2 text-center font-bold">
                                        <div className="flex items-center justify-center gap-1">
                                            <span
                                                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 ${isGold
                                                        ? 'bg-[#F59E0B] text-[#0B0C10] shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                                        : isSilver
                                                            ? 'bg-[#CBD5E1] text-[#0B0C10]'
                                                            : isBronze
                                                                ? 'bg-[#CD7F32] text-[#0B0C10]'
                                                                : isLead
                                                                    ? 'bg-[#F59E0B] text-[#0B0C10]'
                                                                    : isPodium
                                                                        ? 'bg-[#282B3A] text-[#F8FAFC]'
                                                                        : 'text-[#64748B]'
                                                    }`}
                                            >
                                                {pos}
                                            </span>
                                            {ath.rankDelta && ath.rankDelta > 0 ? (
                                                <span className="text-[9px] text-[#22C55E] hidden md:flex items-center">
                                                    <TrendingUp className="w-2.5 h-2.5" />+{ath.rankDelta}
                                                </span>
                                            ) : ath.rankDelta && ath.rankDelta < 0 ? (
                                                <span className="text-[9px] text-[#EF4444] hidden md:flex items-center">
                                                    <TrendingDown className="w-2.5 h-2.5" />{ath.rankDelta}
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>

                                    {/* Athlete Name (ONLY athlete name, no club or subtitle) */}
                                    <td className="py-2.5 px-2 overflow-hidden">
                                        <div className="font-bold text-[#F8FAFC] group-hover:text-[#DC2626] transition-colors truncate text-xs sm:text-sm">
                                            {ath.name}
                                        </div>
                                    </td>

                                    {/* Department (Replaced NOC) */}
                                    <td className="py-2.5 px-1.5 text-center text-[#94A3B8] font-bold text-[11px] sm:text-xs">
                                        {ath.department}
                                    </td>

                                    {/* Current Score (Fully visible, never clipped) */}
                                    <td className="py-2.5 px-2 text-right font-mono font-bold text-xs sm:text-sm text-[#F8FAFC] whitespace-nowrap">
                                        {ath.finalTotal.toFixed(1)}
                                    </td>

                                    {/* Lagging By */}
                                    <td className="py-2.5 px-1.5 text-right font-mono font-bold text-xs text-[#F59E0B] whitespace-nowrap">
                                        {ath.laggingBy ?? '—'}
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-2.5 px-1.5 text-center hidden sm:table-cell">
                                        {isGold ? (
                                            <span className="px-1.5 py-0.5 rounded bg-[#F59E0B]/20 border border-[#F59E0B] text-[9px] text-[#F59E0B] font-bold">
                                                GOLD
                                            </span>
                                        ) : isSilver ? (
                                            <span className="px-1.5 py-0.5 rounded bg-[#94A3B8]/20 border border-[#94A3B8] text-[9px] text-[#CBD5E1] font-bold">
                                                SILVER
                                            </span>
                                        ) : isBronze ? (
                                            <span className="px-1.5 py-0.5 rounded bg-[#CD7F32]/20 border border-[#CD7F32] text-[9px] text-[#CD7F32] font-bold">
                                                BRONZE
                                            </span>
                                        ) : isEliminated ? (
                                            <span className="px-1.5 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/60 text-[9px] text-[#EF4444] font-bold">
                                                OUT (S{ath.eliminatedAtShot || 12})
                                            </span>
                                        ) : (
                                            <span className="px-1.5 py-0.5 rounded bg-[#22C55E]/20 border border-[#22C55E]/60 text-[9px] text-[#22C55E] font-bold">
                                                LIVE
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary */}
            <div className="px-4 py-2 bg-[#0E0F15] border-t border-[#282B3A] flex items-center justify-between text-[10px] text-[#64748B]">
                <span>24-SHOT FINALS PROTOCOL</span>
                <span className="text-[#F59E0B] font-bold">STAGED SCORING ACTIVE</span>
            </div>
        </div>
    );
}
