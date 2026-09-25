import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Radio } from 'lucide-react';

export default function CurrentShooterCard() {
    const { currentShooter } = useLiveData();

    return (
        <div className="w-full bg-[#12131A] rounded-xl border border-[#DC2626]/60 p-4 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left Section: Pulsing Badge + Shooter Identity */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-lg bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0">
                        <Radio className="w-6 h-6 text-[#DC2626] animate-pulse" />
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] sm:text-xs text-[#DC2626] uppercase font-bold tracking-wider flex items-center gap-1.5">
                                🔴 NOW SHOOTING — ALL SHOOTERS ARE SHOOTING SIMULTANEOUSLY
                            </span>
                        </div>

                        <h3 className="font-headline-sm text-xl sm:text-2xl text-[#F8FAFC] tracking-wider uppercase mt-0.5">
                            {currentShooter.name}
                        </h3>

                        <div className="flex items-center gap-3 text-xs font-mono text-[#94A3B8]">
                            <span>DEPT: <strong className="text-[#F8FAFC]">{currentShooter.department}</strong></span>
                            <span>•</span>
                            <span>USN: <strong className="text-[#F59E0B]">{currentShooter.usn}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Right Telemetry Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#282B3A]">

                    {/* Progress (Shot X of 24) */}
                    <div className="bg-[#0B0C10] px-3.5 py-2 rounded-lg border border-[#282B3A] text-center flex flex-col justify-center">
                        <span className="font-mono text-[9px] sm:text-[10px] text-[#64748B] uppercase tracking-wider">
                            PROGRESS
                        </span>
                        <span className="font-mono text-base sm:text-lg font-bold text-[#F8FAFC]">
                            SHOT {currentShooter.shotIndex} / 24
                        </span>
                    </div>

                    {/* Last Shot */}
                    <div className="bg-[#0B0C10] px-3.5 py-2 rounded-lg border border-[#282B3A] text-center flex flex-col justify-center">
                        <span className="font-mono text-[9px] sm:text-[10px] text-[#64748B] uppercase tracking-wider">
                            LAST SHOT
                        </span>
                        <span className="font-mono text-base sm:text-lg font-bold text-[#F59E0B] animate-score-change">
                            {currentShooter.lastShot > 0 ? currentShooter.lastShot.toFixed(1) : '—'}
                        </span>
                    </div>

                    {/* Current Total Score */}
                    <div className="bg-[#0B0C10] px-3.5 py-2 rounded-lg border border-[#DC2626]/40 text-center flex flex-col justify-center">
                        <span className="font-mono text-[9px] sm:text-[10px] text-[#DC2626] uppercase tracking-wider font-bold">
                            CURRENT SCORE
                        </span>
                        <span className="font-mono text-lg sm:text-xl font-bold text-[#F8FAFC]">
                            {currentShooter.currentScore.toFixed(1)}
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
}
