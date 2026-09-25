import React, { useState } from 'react';
import { Tv, ExternalLink, Copy, Check, Info } from 'lucide-react';
import type { Discipline } from '../../types/shooting';

interface OverlayCardProps {
    title: string;
    description: string;
    routePath: string;
    discipline: Discipline;
}

function OverlayCard({ title, description, routePath }: OverlayCardProps) {
    const [copied, setCopied] = useState(false);

    const fullUrl = `${window.location.origin}/#${routePath.replace(/^\//, '')}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="bg-[#12131A] p-5 rounded-2xl border border-[#282B3A] hover:border-[#DC2626]/50 transition-all space-y-4 font-mono shadow-xl">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-headline-sm text-base text-[#F8FAFC] uppercase tracking-wider">
                        {title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                        {description}
                    </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#00FF00]/15 border border-[#00FF00]/40 text-[#22C55E] text-[10px] font-bold uppercase shrink-0">
                    CHROMA GREEN
                </span>
            </div>

            {/* URL Display */}
            <div className="p-2.5 rounded-xl bg-[#0B0C10] border border-[#282B3A] flex items-center justify-between gap-2 text-xs">
                <span className="text-[#F59E0B] truncate font-mono text-[11px] select-all">
                    {fullUrl}
                </span>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-[#1A1C26] hover:bg-[#282B3A] text-[#F8FAFC] transition-colors shrink-0"
                    title="Copy OBS Browser Source URL"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
                <a
                    href={`#${routePath.replace(/^\//, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-[#F8FAFC] text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Overlay
                </a>

                <button
                    onClick={handleCopy}
                    className="py-2 px-3 rounded-xl bg-[#1A1C26] hover:bg-[#282B3A] border border-[#282B3A] text-[#CBD5E1] text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors"
                >
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
            </div>
        </div>
    );
}

export default function AdminOverlaysTab() {
    const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline>('10m_rifle');

    return (
        <div className="space-y-6 font-mono">

            {/* Header info */}
            <div className="bg-[#12131A] p-5 rounded-2xl border border-[#282B3A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0">
                        <Tv className="w-5 h-5 text-[#DC2626]" />
                    </div>
                    <div>
                        <span className="text-[10px] text-[#DC2626] font-bold tracking-widest uppercase block">
                            OBS STUDIO BROADCAST SUITE
                        </span>
                        <h2 className="font-headline-sm text-xl text-[#F8FAFC] tracking-wider uppercase">
                            LIVE STREAM OVERLAY GRAPHICS
                        </h2>
                    </div>
                </div>

                {/* Discipline Filter */}
                <div className="flex items-center gap-2 bg-[#0B0C10] p-1 rounded-xl border border-[#282B3A]">
                    <button
                        onClick={() => setSelectedDiscipline('10m_rifle')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiscipline === '10m_rifle'
                                ? 'bg-[#DC2626] text-[#F8FAFC] shadow-md'
                                : 'text-[#64748B] hover:text-[#F8FAFC]'
                            }`}
                    >
                        10M AIR RIFLE OVERLAYS
                    </button>
                    <button
                        onClick={() => setSelectedDiscipline('10m_pistol')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiscipline === '10m_pistol'
                                ? 'bg-[#DC2626] text-[#F8FAFC] shadow-md'
                                : 'text-[#64748B] hover:text-[#F8FAFC]'
                            }`}
                    >
                        10M AIR PISTOL OVERLAYS
                    </button>
                </div>
            </div>

            {/* OBS Chroma Key Instructions */}
            <div className="p-4 rounded-xl bg-[#0B0C10] border border-[#282B3A] text-xs text-[#94A3B8] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                    <Info className="w-4 h-4 text-[#F59E0B]" />
                    <span>How to use in OBS Studio with Chroma Key:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-[#CBD5E1]">
                    <li>In OBS Studio, click <strong>+</strong> under Sources and choose <strong>Browser</strong>.</li>
                    <li>Paste the copied Overlay URL and set Width: <strong>1920</strong> and Height: <strong>1080</strong>.</li>
                    <li>Right-click the Browser source in OBS &gt; <strong>Filters</strong> &gt; Add <strong>Chroma Key</strong> (Key Color Type: <strong>Green</strong> #00FF00).</li>
                    <li>The graphic will appear overlaid seamlessly on your live range stream with real-time Firestore updates!</li>
                </ol>
            </div>

            {/* Overlays Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Overlay 1: Rank & Name */}
                <OverlayCard
                    title="1. Rank & Name Overlay"
                    description="Vertical stack showing shooter rank, name, and live gap. Eliminated shooters marked in black & cyan."
                    routePath={selectedDiscipline === '10m_rifle' ? '/overlay/rank-name/rifle' : '/overlay/rank-name/pistol'}
                    discipline={selectedDiscipline}
                />

                {/* Overlay 2: Bottom Scorecards */}
                <OverlayCard
                    title="2. Bottom Scorecards Overlay"
                    description="Horizontal lower-third bar with target sheet hit dots, cyan last-shot box, and purple total score."
                    routePath={selectedDiscipline === '10m_rifle' ? '/overlay/score-card/rifle' : '/overlay/score-card/pistol'}
                    discipline={selectedDiscipline}
                />

                {/* Overlay 3: Leaderboard */}
                <OverlayCard
                    title="3. Leaderboard Overlay"
                    description="Full-screen official standings card with logos, rank pills, scores, and place badges for eliminated shooters."
                    routePath={selectedDiscipline === '10m_rifle' ? '/overlay/leaderboard/rifle' : '/overlay/leaderboard/pistol'}
                    discipline={selectedDiscipline}
                />

            </div>

        </div>
    );
}
