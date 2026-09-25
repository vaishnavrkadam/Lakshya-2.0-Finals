import React, { useState } from 'react';
import { Radio } from 'lucide-react';

interface YouTubeEmbedProps {
    videoId: string;
    streamTitle?: string;
    cameraName?: string;
}

export default function YouTubeEmbed({ videoId, streamTitle, cameraName }: YouTubeEmbedProps) {
    const [loaded, setLoaded] = useState(false);

    // Format valid YouTube URL for iframe
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&enablejsapi=1`;

    return (
        <div className="flex flex-col bg-[#12131A] rounded-xl border border-[#282B3A] overflow-hidden shadow-2xl group">

            {/* Top Stream Status Overlay Header */}
            <div className="px-4 py-2.5 bg-[#0E0F15] border-b border-[#282B3A] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#DC2626]/20 border border-[#DC2626]/60 text-[10px] font-mono text-[#F8FAFC] font-bold tracking-wider">
                        <Radio className="w-3 h-3 text-[#DC2626] animate-pulse" /> 🔴 YOUTUBE LIVE
                    </span>
                    <span className="font-mono text-xs text-[#F8FAFC] font-bold truncate max-w-[280px] sm:max-w-md">
                        {streamTitle || 'LAKSHYA 2.0 OFFICIAL FINALS LIVE STREAM'}
                    </span>
                </div>
                <span className="hidden sm:inline-flex font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
                    {cameraName || 'TARGET CAM 01'}
                </span>
            </div>

            {/* Responsive 16:9 YouTube iFrame Container */}
            <div className="relative w-full aspect-video bg-[#0B0C10] flex items-center justify-center overflow-hidden">

                {/* Placeholder overlay before loading / thumbnail frame */}
                {!loaded && (
                    <div className="absolute inset-0 bg-[#0B0C10] flex flex-col items-center justify-center gap-3 z-10">
                        <div className="w-12 h-12 rounded-full border-2 border-[#DC2626] border-t-transparent animate-spin" />
                        <span className="font-mono text-xs text-[#64748B] uppercase tracking-widest">
                            CONNECTING TO YOUTUBE LIVE...
                        </span>
                    </div>
                )}

                <iframe
                    src={embedUrl}
                    title={streamTitle || "YouTube Live Stream"}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={() => setLoaded(true)}
                />
            </div>

            {/* Bottom Stream Telemetry Bar (Cleaned, audio text removed) */}
            <div className="px-4 py-2 bg-[#0E0F15] border-t border-[#282B3A] flex items-center justify-between font-mono text-[11px] text-[#64748B]">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[#22C55E]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                        1080p60 HD STREAM
                    </span>
                </div>
                <span className="text-[#F59E0B]">
                    ID: {videoId}
                </span>
            </div>
        </div>
    );
}
