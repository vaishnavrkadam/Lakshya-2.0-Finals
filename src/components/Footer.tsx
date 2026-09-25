interface FooterProps {
    setView: (v: string) => void;
}

export default function Footer({ setView }: FooterProps) {
    return (
        <footer className="w-full bg-[#12131A] border-t border-[#282B3A] no-print mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <div className="flex items-center gap-3">
                            <span className="font-headline-sm text-xl text-[#F8FAFC] tracking-wider uppercase font-serif">
                                LAKSHYA <span className="text-[#DC2626]">2.0</span>
                            </span>
                            <span className="text-xs text-[#282B3A]">|</span>
                            <div className="flex items-center gap-2.5">
                                <img src="/assets/logos/RVCE Logo.webp" alt="RVCE" className="h-6 w-auto object-contain opacity-80" />
                                <img src="/assets/logos/NCC Logo.webp" alt="NCC" className="h-6 w-auto object-contain opacity-80" />
                                <img src="/assets/logos/GARE Logo.webp" alt="GARE" className="h-5 w-auto object-contain opacity-80" />
                            </div>
                        </div>
                        <span className="font-mono text-xs text-[#64748B]">
                            ISSF 10M RIFLE & PISTOL FINALS LIVE SCORING PLATFORM · RVCE × GARE
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <button
                            onClick={() => setView('live')}
                            className="font-mono text-xs uppercase tracking-wider text-[#64748B] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                        >
                            Leaderboard
                        </button>
                        <button
                            onClick={() => setView('search')}
                            className="font-mono text-xs uppercase tracking-wider text-[#64748B] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                        >
                            Score Cards
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#282B3A] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <span className="font-mono text-[10px] text-[#64748B]">
                        © 2026 LAKSHYA 2.0. GANDIVA AERO-PNEUMATIC RANGE & NCC RVCE. ALL RIGHTS RESERVED.
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-[#64748B]">ISSF 2024-2028 FINALS ENGINE</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                        <span className="font-mono text-[10px] text-[#64748B]">24-SHOT ELIMINATION PROTOCOL</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
