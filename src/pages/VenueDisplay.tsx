import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Maximize2, Minimize2, Radio, Trophy } from 'lucide-react';

export default function VenueDisplay() {
    const { activeResults, liveState } = useLiveData();
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
        }
    };

    const topFinalists = activeResults.slice(0, 8);

    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#F8FAFC] p-6 lg:p-10 flex flex-col justify-between font-mono selection:bg-[#DC2626]">

            {/* Top LED Wall Banner */}
            <div className="flex items-center justify-between border-b-2 border-[#DC2626] pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#DC2626] flex items-center justify-center text-[#F8FAFC] shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse">
                        <Radio className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-xs text-[#DC2626] font-bold tracking-widest uppercase flex items-center gap-2">
                            <span>🔴 LAKSHYA 2.0 LIVE VENUE BROADCAST</span>
                            <span>•</span>
                            <span className="text-[#F59E0B]">24-SHOT FINALS</span>
                        </div>
                        <h1 className="font-headline-sm text-3xl sm:text-5xl lg:text-6xl text-[#F8FAFC] uppercase tracking-wider">
                            {liveState.discipline === '10m_rifle' ? '10M AIR RIFLE' : '10M AIR PISTOL'}
                        </h1>
                    </div>
                </div>

                <button
                    onClick={toggleFullscreen}
                    className="p-3 bg-[#12131A] border border-[#282B3A] hover:border-[#DC2626] rounded-xl text-[#F8FAFC] hover:scale-105 transition-all shadow-lg cursor-pointer"
                    title="Toggle Fullscreen Projector Mode"
                >
                    {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                </button>
            </div>

            {/* Main Leaderboard Big Table (Optimized for Projector / LED Wall) */}
            <div className="my-8 flex-1 flex flex-col justify-center">
                <div className="bg-[#12131A] rounded-2xl border border-[#282B3A] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)]">
                    <div className="grid grid-cols-12 bg-[#0B0C10] py-4 px-6 border-b border-[#282B3A] text-xs text-[#64748B] font-bold uppercase tracking-widest">
                        <div className="col-span-1 text-center">POS</div>
                        <div className="col-span-5">ATHLETE NAME</div>
                        <div className="col-span-2 text-center">DEPARTMENT</div>
                        <div className="col-span-2 text-right">LAGGING BY</div>
                        <div className="col-span-2 text-right">TOTAL SCORE</div>
                    </div>

                    <div className="divide-y divide-[#282B3A]/80">
                        {topFinalists.map((ath, idx) => {
                            const pos = ath.finalRank || (idx + 1);
                            const isLead = pos === 1;
                            const isEliminated = ath.finalStatus === 'ELIMINATED';
                            const isGold = ath.finalStatus === 'GOLD';

                            return (
                                <div
                                    key={ath.participantId}
                                    className={`grid grid-cols-12 items-center py-4 sm:py-5 px-6 transition-all ${isGold
                                            ? 'bg-[#F59E0B]/20 font-bold border-l-8 border-[#F59E0B]'
                                            : isEliminated
                                                ? 'opacity-30 bg-[#0B0C10] line-through'
                                                : isLead
                                                    ? 'bg-[#DC2626]/20 font-bold border-l-8 border-[#DC2626]'
                                                    : pos % 2 === 0
                                                        ? 'bg-[#12131A]'
                                                        : 'bg-[#1A1C26]/50'
                                        }`}
                                >
                                    {/* Position */}
                                    <div className="col-span-1 text-center font-bold">
                                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-lg sm:text-2xl font-bold ${isGold
                                                ? 'bg-[#F59E0B] text-[#0B0C10]'
                                                : isLead
                                                    ? 'bg-[#F59E0B] text-[#0B0C10]'
                                                    : pos <= 3
                                                        ? 'bg-[#282B3A] text-[#F8FAFC]'
                                                        : 'text-[#64748B]'
                                            }`}>
                                            {pos}
                                        </span>
                                    </div>

                                    {/* Athlete Name (ONLY athlete name) */}
                                    <div className="col-span-5 flex items-center gap-3">
                                        <span className="font-headline-sm text-2xl sm:text-3xl text-[#F8FAFC] uppercase tracking-wide truncate">
                                            {ath.name}
                                        </span>
                                        {isGold && (
                                            <span className="px-2.5 py-1 rounded bg-[#F59E0B] text-[#0B0C10] text-xs font-bold flex items-center gap-1">
                                                <Trophy className="w-3.5 h-3.5" /> WINNER
                                            </span>
                                        )}
                                    </div>

                                    {/* Department (Replaced NOC) */}
                                    <div className="col-span-2 text-center font-mono text-xl sm:text-2xl text-[#94A3B8] font-bold">
                                        {ath.department}
                                    </div>

                                    {/* Lagging By */}
                                    <div className="col-span-2 text-right font-mono text-2xl sm:text-3xl font-bold text-[#F59E0B]">
                                        {ath.laggingBy ?? '—'}
                                    </div>

                                    {/* Total Score */}
                                    <div className="col-span-2 text-right font-mono text-3xl sm:text-4xl font-bold text-[#F8FAFC]">
                                        {ath.finalTotal.toFixed(1)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Telemetry Footer Bar */}
            <div className="flex items-center justify-between border-t border-[#282B3A] pt-4 text-xs text-[#64748B] font-mono">
                <div className="flex items-center gap-4">
                    <span className="text-[#22C55E] flex items-center gap-1.5 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping" />
                        LIVE VENUE SCORE STREAMING
                    </span>
                    <span>|</span>
                    <span>ISSF 24-SHOT FINALS ENGINE</span>
                </div>

                <div className="text-[#F8FAFC] font-bold">
                    LAKSHYA 2.0 CHAMPIONSHIP FINALS
                </div>
            </div>

        </div>
    );
}
