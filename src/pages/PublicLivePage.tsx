import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import YouTubeEmbed from '../components/YouTubeEmbed';
import LiveScoreboard from '../components/LiveScoreboard';
import CurrentShooterCard from '../components/CurrentShooterCard';
import DisciplineSwitcher from '../components/DisciplineSwitcher';
import { Radio } from 'lucide-react';

export default function PublicLivePage() {
    const { liveState, setSelectedShooterId } = useLiveData();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

            {/* Broadcast Sub-Header Telemetry Bar (Cleaned, Relay 4 & Qualification Time removed) */}
            <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Event Title & Status */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0">
                        <Radio className="w-5 h-5 text-[#DC2626] animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#DC2626] tracking-widest uppercase">
                                🔴 LIVE BROADCAST
                            </span>
                        </div>
                        <h1 className="font-headline-sm text-2xl text-[#F8FAFC] tracking-wider uppercase">
                            {liveState.discipline === '10m_rifle' ? '10M Air Rifle' : '10M Air Pistol'}
                        </h1>
                    </div>
                </div>

                {/* Right Controls: Vertical / Discipline Switcher */}
                <div className="flex items-center gap-3 flex-wrap">
                    <DisciplineSwitcher />
                </div>
            </div>

            {/* Main Split Layout: Left YouTube Live Stream / Right Live Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column: YouTube Embed Container + Current Shooter Banner */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    <YouTubeEmbed
                        videoId={liveState.youtubeVideoId}
                        streamTitle={liveState.streamTitle}
                        cameraName={liveState.cameraName}
                    />

                    {/* Current Shooter Banner on Desktop */}
                    <div className="hidden lg:block">
                        <CurrentShooterCard />
                    </div>
                </div>

                {/* Right Column: Live Leaderboard (Full table with Lagging By, Department, no horizontal scroll) */}
                <div className="lg:col-span-5 xl:col-span-4 h-full">
                    <LiveScoreboard onSelectAthlete={(id) => setSelectedShooterId(id)} />
                </div>

            </div>

            {/* Mobile Stacked Current Shooter Card (Appears after YouTube stream on mobile) */}
            <div className="block lg:hidden">
                <CurrentShooterCard />
            </div>

        </div>
    );
}
