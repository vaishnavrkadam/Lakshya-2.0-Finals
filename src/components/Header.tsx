import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    LogOut,
    X,
    Menu,
} from 'lucide-react';

interface HeaderProps {
    currentView: string;
    setView: (v: string) => void;
}

export default function Header({ currentView, setView }: HeaderProps) {
    const { userName, logout, isAdmin } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (viewId: string) => {
        setView(viewId);
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 left-0 w-full z-50 bg-[#0B0C10]/95 border-b border-[#282B3A]/80 shadow-[0_4px_25px_rgba(0,0,0,0.85)] backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-20 flex items-center justify-between relative">

                    {/* LEFT GROUP: RVCE Logo + Red Vertical Line (No redundant text) */}
                    <div className="flex items-center gap-3 shrink-0 z-20">
                        <button
                            onClick={() => handleNavClick('live')}
                            className="flex items-center text-left shrink-0 group focus:outline-none"
                            title="Lakshya 2.0 - Live Finals"
                        >
                            <img
                                src="/assets/logos/RVCE Logo.webp"
                                alt="RV College of Engineering"
                                className="h-10 sm:h-12 w-auto object-contain brightness-110 transition-transform group-hover:scale-105"
                            />
                        </button>

                        {/* Vertical Red Divider */}
                        <div className="h-8 w-[1px] bg-[#DC2626] shadow-[0_0_8px_rgba(220,38,38,0.6)] ml-1 shrink-0" />
                    </div>

                    {/* EXACT VISUAL CENTER GROUP: Leaderboard | GARE Logo | Score Cards */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-3 sm:gap-6 md:gap-8 z-10 pointer-events-auto">

                        {/* Leaderboard Link */}
                        <button
                            onClick={() => handleNavClick('live')}
                            className={`font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer ${currentView === 'live'
                                    ? 'text-[#F8FAFC] font-bold border-b-2 border-[#DC2626] pb-1 shadow-[0_4px_10px_rgba(220,38,38,0.3)]'
                                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                                }`}
                        >
                            LEADERBOARD
                        </button>

                        {/* Divider */}
                        <span className="text-[#282B3A] hidden sm:inline select-none">|</span>

                        {/* Exact Center GARE Crest Logo */}
                        <div className="flex items-center justify-center shrink-0">
                            <img
                                src="/assets/logos/GARE Logo.webp"
                                alt="GARE"
                                className="h-8 sm:h-9 w-auto object-contain brightness-110 opacity-95 transition-transform hover:scale-110"
                            />
                        </div>

                        {/* Divider */}
                        <span className="text-[#282B3A] hidden sm:inline select-none">|</span>

                        {/* Score Cards Link */}
                        <button
                            onClick={() => handleNavClick('search')}
                            className={`font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer ${currentView === 'search'
                                    ? 'text-[#F8FAFC] font-bold border-b-2 border-[#DC2626] pb-1 shadow-[0_4px_10px_rgba(220,38,38,0.3)]'
                                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                                }`}
                        >
                            SCORE CARDS
                        </button>
                    </div>

                    {/* RIGHT GROUP: NCC Logo + Admin Controls if Authenticated (No public Admin button) */}
                    <div className="flex items-center gap-3 shrink-0 z-20">

                        {/* NCC Logo */}
                        <div className="hidden sm:flex items-center shrink-0">
                            <img
                                src="/assets/logos/NCC Logo.webp"
                                alt="NCC"
                                className="h-10 w-auto object-contain brightness-110"
                            />
                        </div>

                        {/* Authenticated Admin Controls (Only rendered when authenticated) */}
                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleNavClick('admin')}
                                    className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${currentView === 'admin'
                                            ? 'bg-[#DC2626]/20 border-[#DC2626] text-[#F8FAFC] shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                                            : 'bg-[#12131A] border-[#282B3A] text-[#94A3B8] hover:text-[#F8FAFC]'
                                        }`}
                                >
                                    <Shield className="w-3.5 h-3.5 text-[#DC2626]" />
                                    <span className="hidden lg:inline">CONTROL CENTER</span>
                                </button>

                                <button
                                    onClick={() => handleNavClick('scorer')}
                                    className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${currentView === 'scorer'
                                            ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F8FAFC] shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                            : 'bg-[#12131A] border-[#282B3A] text-[#94A3B8] hover:text-[#F8FAFC]'
                                        }`}
                                >
                                    <span className="hidden lg:inline">SCORER</span>
                                </button>

                                <div
                                    className="w-8 h-8 rounded-full border border-[#DC2626] bg-[#12131A] text-[#F8FAFC] font-mono text-xs font-bold flex items-center justify-center shadow-md shrink-0"
                                    title={`Admin: ${userName}`}
                                >
                                    A
                                </div>

                                <button
                                    onClick={async () => {
                                        await logout();
                                        handleNavClick('live');
                                    }}
                                    className="p-1.5 text-[#64748B] hover:text-[#EF4444] transition-colors"
                                    title="Logout Admin Session"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Mobile Hamburger Menu Toggle */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1A1C26] rounded transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0E0F15] border-b border-[#282B3A] px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-fade-in font-mono text-xs">
                    <button
                        onClick={() => handleNavClick('live')}
                        className={`w-full text-left px-3 py-2 rounded font-bold uppercase ${currentView === 'live' ? 'bg-[#DC2626]/20 border border-[#DC2626] text-[#F8FAFC]' : 'text-[#94A3B8]'
                            }`}
                    >
                        LEADERBOARD
                    </button>

                    <button
                        onClick={() => handleNavClick('search')}
                        className={`w-full text-left px-3 py-2 rounded font-bold uppercase ${currentView === 'search' ? 'bg-[#DC2626]/20 border border-[#DC2626] text-[#F8FAFC]' : 'text-[#94A3B8]'
                            }`}
                    >
                        SCORE CARDS
                    </button>

                    {isAdmin && (
                        <>
                            <button
                                onClick={() => handleNavClick('scorer')}
                                className="w-full text-left px-3 py-2 rounded font-bold uppercase text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/40"
                            >
                                SCORER PANEL
                            </button>

                            <button
                                onClick={() => handleNavClick('admin')}
                                className="w-full text-left px-3 py-2 rounded font-bold uppercase text-[#DC2626] bg-[#DC2626]/10 border border-[#DC2626]/40"
                            >
                                CONTROL CENTER
                            </button>

                            <button
                                onClick={async () => {
                                    await logout();
                                    handleNavClick('live');
                                }}
                                className="w-full text-left px-3 py-2 rounded font-bold uppercase text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/40 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> LOGOUT ADMIN
                            </button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
