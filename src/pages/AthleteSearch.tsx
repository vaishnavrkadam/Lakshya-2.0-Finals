import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Search, Trophy, Medal, Award, Crosshair } from 'lucide-react';
import type { Discipline, AthleteResult } from '../types/shooting';

export default function AthleteSearch() {
    const { athleteResults } = useLiveData();
    const [query, setQuery] = useState('');
    const [verticalFilter, setVerticalFilter] = useState<'ALL' | Discipline>('ALL');

    const rifleAthletes = athleteResults.filter(a => a.discipline === '10m_rifle');
    const pistolAthletes = athleteResults.filter(a => a.discipline === '10m_pistol');

    const filterList = (list: AthleteResult[]) => {
        if (!query.trim()) return list;
        const q = query.toLowerCase().trim();
        return list.filter(
            a =>
                a.name.toLowerCase().includes(q) ||
                a.usn.toLowerCase().includes(q) ||
                a.department.toLowerCase().includes(q)
        );
    };

    const filteredRifle = filterList(rifleAthletes);
    const filteredPistol = filterList(pistolAthletes);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-mono">

            {/* Header & Search Bar */}
            <div className="bg-[#12131A] p-6 rounded-2xl border border-[#282B3A] space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0">
                            <Crosshair className="w-5 h-5 text-[#DC2626]" />
                        </div>
                        <div>
                            <span className="text-[10px] text-[#DC2626] font-bold uppercase tracking-widest block">
                                LAKSHYA 2.0 FINALS
                            </span>
                            <h1 className="font-headline-sm text-2xl text-[#F8FAFC] uppercase tracking-wider">
                                FINALISTS SCORE CARDS
                            </h1>
                        </div>
                    </div>

                    {/* Vertical Switcher Tabs */}
                    <div className="flex items-center gap-2 bg-[#0B0C10] p-1 rounded-xl border border-[#282B3A] self-start md:self-auto">
                        <button
                            onClick={() => setVerticalFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${verticalFilter === 'ALL'
                                    ? 'bg-[#DC2626] text-[#F8FAFC] shadow-md'
                                    : 'text-[#64748B] hover:text-[#F8FAFC]'
                                }`}
                        >
                            ALL (16)
                        </button>
                        <button
                            onClick={() => setVerticalFilter('10m_rifle')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${verticalFilter === '10m_rifle'
                                    ? 'bg-[#DC2626] text-[#F8FAFC] shadow-md'
                                    : 'text-[#64748B] hover:text-[#F8FAFC]'
                                }`}
                        >
                            10M AIR RIFLE ({rifleAthletes.length})
                        </button>
                        <button
                            onClick={() => setVerticalFilter('10m_pistol')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${verticalFilter === '10m_pistol'
                                    ? 'bg-[#DC2626] text-[#F8FAFC] shadow-md'
                                    : 'text-[#64748B] hover:text-[#F8FAFC]'
                                }`}
                        >
                            10M AIR PISTOL ({pistolAthletes.length})
                        </button>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative max-w-xl">
                    <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by shooter name, USN, or department..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#475569] focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* VERTICAL 1: 10M AIR RIFLE SCORE CARDS */}
            {(verticalFilter === 'ALL' || verticalFilter === '10m_rifle') && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#282B3A]">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
                            <h2 className="font-headline-sm text-lg text-[#F8FAFC] uppercase tracking-wider">
                                10M AIR RIFLE FINALISTS
                            </h2>
                        </div>
                        <span className="text-xs text-[#64748B]">
                            {filteredRifle.length} OF {rifleAthletes.length} FINALISTS
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredRifle.length === 0 ? (
                            <div className="bg-[#12131A] p-6 rounded-xl border border-[#282B3A] text-center text-[#64748B] text-xs">
                                No Rifle finalists match "{query}".
                            </div>
                        ) : (
                            filteredRifle.map(ath => <AthleteCard key={ath.participantId} athlete={ath} />)
                        )}
                    </div>
                </div>
            )}

            {/* VERTICAL 2: 10M AIR PISTOL SCORE CARDS */}
            {(verticalFilter === 'ALL' || verticalFilter === '10m_pistol') && (
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#282B3A]">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                            <h2 className="font-headline-sm text-lg text-[#F8FAFC] uppercase tracking-wider">
                                10M AIR PISTOL FINALISTS
                            </h2>
                        </div>
                        <span className="text-xs text-[#64748B]">
                            {filteredPistol.length} OF {pistolAthletes.length} FINALISTS
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredPistol.length === 0 ? (
                            <div className="bg-[#12131A] p-6 rounded-xl border border-[#282B3A] text-center text-[#64748B] text-xs">
                                No Pistol finalists match "{query}".
                            </div>
                        ) : (
                            filteredPistol.map(ath => <AthleteCard key={ath.participantId} athlete={ath} />)
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

function AthleteCard({ athlete }: { athlete: AthleteResult }) {
    const shots = athlete.shots || [];
    const isGold = athlete.finalStatus === 'GOLD';
    const isSilver = athlete.finalStatus === 'SILVER';
    const isBronze = athlete.finalStatus === 'BRONZE';
    const isEliminated = athlete.finalStatus === 'ELIMINATED';

    // Grouping shots: Series 1 (1-5), Series 2 (6-10), Single Shots (11-24)
    const series1 = shots.slice(0, 5);
    const series2 = shots.slice(5, 10);
    const singleShots = shots.slice(10, 24);

    const s1Total = series1.reduce((a, b) => a + b, 0);
    const s2Total = series2.reduce((a, b) => a + b, 0);

    return (
        <div
            className={`bg-[#12131A] p-5 sm:p-6 rounded-2xl border transition-all ${isGold
                    ? 'border-[#F59E0B] shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                    : isSilver
                        ? 'border-[#CBD5E1]/60'
                        : isBronze
                            ? 'border-[#CD7F32]/60'
                            : isEliminated
                                ? 'border-[#282B3A] opacity-70'
                                : 'border-[#282B3A] hover:border-[#DC2626]/50'
                } space-y-4`}
        >
            {/* Top Identity & Rank Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#282B3A]">

                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-4">
                    {/* Athlete Photo or Avatar */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#DC2626]/60 overflow-hidden bg-[#0B0C10] flex items-center justify-center shrink-0 shadow-md">
                        {athlete.photoUrl ? (
                            <img
                                src={athlete.photoUrl}
                                alt={athlete.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-[#F8FAFC]">
                                {athlete.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h3 className="font-headline-sm text-xl sm:text-2xl text-[#F8FAFC] uppercase tracking-wider">
                                {athlete.name}
                            </h3>
                            {isGold && (
                                <span className="px-2 py-0.5 rounded bg-[#F59E0B] text-[#0B0C10] font-bold text-[10px] flex items-center gap-1 shadow-sm">
                                    <Trophy className="w-3 h-3" /> GOLD
                                </span>
                            )}
                            {isSilver && (
                                <span className="px-2 py-0.5 rounded bg-[#CBD5E1] text-[#0B0C10] font-bold text-[10px]">
                                    SILVER
                                </span>
                            )}
                            {isBronze && (
                                <span className="px-2 py-0.5 rounded bg-[#CD7F32] text-[#0B0C10] font-bold text-[10px]">
                                    BRONZE
                                </span>
                            )}
                        </div>

                        <div className="text-xs text-[#94A3B8]">
                            <span>DEPT: <strong className="text-[#F8FAFC]">{athlete.department}</strong></span>
                            <span className="mx-2 text-[#282B3A]">|</span>
                            <span>USN: <strong className="text-[#F59E0B]">{athlete.usn}</strong></span>
                        </div>

                        {athlete.achievements && (
                            <div className="text-[11px] text-[#F59E0B] flex items-center gap-1 pt-0.5">
                                <Award className="w-3 h-3 shrink-0" />
                                <span>{athlete.achievements}</span>
                            </div>
                        )}

                        <div className="text-[10px] text-[#64748B]">
                            Initial Round Score: <strong className="text-[#94A3B8]">{athlete.initialScore.toFixed(1)}</strong>
                        </div>
                    </div>
                </div>

                {/* Right: Rank and Score Badges */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="bg-[#0B0C10] px-4 py-2 rounded-xl border border-[#282B3A] text-right">
                        <div className="text-[9px] text-[#64748B] uppercase">CURRENT RANK</div>
                        <div className="text-xl font-bold text-[#F59E0B]">
                            #{athlete.finalRank || '—'}
                        </div>
                    </div>

                    <div className="bg-[#0B0C10] px-4 py-2 rounded-xl border border-[#DC2626]/60 text-right">
                        <div className="text-[9px] text-[#DC2626] uppercase font-bold">TOTAL SCORE</div>
                        <div className="text-xl font-bold text-[#F8FAFC]">
                            {athlete.finalTotal.toFixed(1)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 24 Shots Breakdown Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-bold uppercase">
                        24-SHOT FINALS PROGRESS ({shots.length} / 24 SHOTS FIRED)
                    </span>
                    {isEliminated && (
                        <span className="text-[#EF4444] font-bold">
                            ELIMINATED AT SHOT {athlete.eliminatedAtShot || 12}
                        </span>
                    )}
                </div>

                {/* Series 1, Series 2, and Single Shots */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">

                    {/* Series 1 (Shots 1-5) */}
                    <div className="md:col-span-4 bg-[#0B0C10] p-2.5 rounded-xl border border-[#282B3A] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-[#94A3B8] uppercase font-bold">
                            <span>SERIES 1 (S1–S5)</span>
                            <span className="text-[#F8FAFC]">SUBTOTAL: {s1Total > 0 ? s1Total.toFixed(1) : '—'}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                            {[0, 1, 2, 3, 4].map(idx => {
                                const val = series1[idx];
                                return <ShotSlot key={idx} shotNum={idx + 1} score={val} />;
                            })}
                        </div>
                    </div>

                    {/* Series 2 (Shots 6-10) */}
                    <div className="md:col-span-4 bg-[#0B0C10] p-2.5 rounded-xl border border-[#282B3A] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-[#94A3B8] uppercase font-bold">
                            <span>SERIES 2 (S6–S10)</span>
                            <span className="text-[#F8FAFC]">SUBTOTAL: {s2Total > 0 ? s2Total.toFixed(1) : '—'}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                            {[5, 6, 7, 8, 9].map(idx => {
                                const val = shots[idx];
                                return <ShotSlot key={idx} shotNum={idx + 1} score={val} />;
                            })}
                        </div>
                    </div>

                    {/* Single Elimination Shots (Shots 11-24) */}
                    <div className="md:col-span-4 bg-[#0B0C10] p-2.5 rounded-xl border border-[#282B3A] space-y-1.5">
                        <div className="text-[10px] text-[#94A3B8] uppercase font-bold">
                            SINGLE SHOTS (S11–S24)
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 14 }).map((_, i) => {
                                const shotNum = 11 + i;
                                const val = shots[shotNum - 1];
                                return <ShotSlot key={shotNum} shotNum={shotNum} score={val} />;
                            })}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

function ShotSlot({ shotNum, score }: { shotNum: number; score?: number }) {
    if (score === undefined) {
        return (
            <div className="p-1 rounded bg-[#12131A] border border-[#282B3A]/40 text-center">
                <div className="text-[8px] text-[#475569]">#{shotNum}</div>
                <div className="text-[10px] text-[#475569] font-bold">—</div>
            </div>
        );
    }

    const isHigh = score >= 10.4;
    const isMedium = score >= 10.0;

    return (
        <div
            className={`p-1 rounded text-center border ${isHigh
                    ? 'bg-[#22C55E]/15 border-[#22C55E]/60 text-[#22C55E]'
                    : isMedium
                        ? 'bg-[#F8FAFC]/10 border-[#282B3A] text-[#F8FAFC]'
                        : 'bg-[#EF4444]/15 border-[#EF4444]/60 text-[#EF4444]'
                }`}
        >
            <div className="text-[8px] opacity-70">#{shotNum}</div>
            <div className="text-[10px] font-bold">{score.toFixed(1)}</div>
        </div>
    );
}
