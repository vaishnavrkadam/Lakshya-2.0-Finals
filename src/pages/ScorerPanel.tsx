import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';
import {
    Crosshair,
    CheckCircle2,
    AlertTriangle,
    History,
    Send,
    ShieldCheck,
    Check,
    Trophy,
    RotateCcw,
    X
} from 'lucide-react';
import DisciplineSwitcher from '../components/DisciplineSwitcher';

export default function ScorerPanel() {
    const {
        activeResults,
        addShot,
        correctShot,
        auditLogs,
        liveState,
        selectedShooterId,
        setSelectedShooterId
    } = useLiveData();
    const { userName } = useAuth();

    const [submittingScore, setSubmittingScore] = useState<number | null>(null);
    const [lastAckScore, setLastAckScore] = useState<number | null>(null);
    const [manualInput, setManualInput] = useState<string>('');

    // Score Correction Modal state
    const [correctionModalOpen, setCorrectionModalOpen] = useState<boolean>(false);
    const [correctionShotIndex, setCorrectionShotIndex] = useState<number>(1);
    const [correctionNewValue, setCorrectionNewValue] = useState<number>(10.5);
    const [correctionReason, setCorrectionReason] = useState<string>('Target verification / electronic scoring calibration');

    // Selected athlete derived from activeResults
    const activeAthlete = activeResults.find(a => a.participantId === selectedShooterId) || activeResults[0];

    const quickScores = [
        10.9, 10.8, 10.7, 10.6,
        10.5, 10.4, 10.3, 10.2,
        10.1, 10.0, 9.9, 9.8,
        9.7, 9.6, 9.5, 9.0,
        8.5, 8.0, 7.0, 0.0
    ];

    const shots = activeAthlete?.shots || [];
    const isEliminated = activeAthlete?.finalStatus === 'ELIMINATED';
    const isCompleted = shots.length >= 24;
    const canShoot = activeAthlete && !isEliminated && !isCompleted;

    const handleShotClick = async (val: number) => {
        if (!activeAthlete || !canShoot) return;
        setSubmittingScore(val);
        const success = await addShot(activeAthlete.participantId, val);
        if (success) {
            setLastAckScore(val);
            setTimeout(() => setLastAckScore(null), 2500);
        }
        setSubmittingScore(null);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(manualInput);
        if (!isNaN(val) && val >= 0.0 && val <= 10.9) {
            await handleShotClick(val);
            setManualInput('');
        }
    };

    const handleCorrectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeAthlete) return;
        await correctShot(
            activeAthlete.participantId,
            correctionShotIndex,
            correctionNewValue,
            correctionReason,
            userName
        );
        setCorrectionModalOpen(false);
    };

    // Staged scoring status message
    const getStageDescription = () => {
        const nextShot = shots.length + 1;
        if (isEliminated) return `Eliminated at Shot ${activeAthlete.eliminatedAtShot || 12} (Rank #${activeAthlete.finalRank})`;
        if (isCompleted) return '24 Shots Completed - Finals Finished';
        if (nextShot <= 5) return `Series 1 (Shot ${nextShot}/5) — Leaderboard updates after Shot 5`;
        if (nextShot <= 10) return `Series 2 (Shot ${nextShot}/10) — Leaderboard updates after Shot 10`;
        if (nextShot === 11) return 'Single Shot Stage — Shot 11 (Live score update)';
        if (nextShot === 12) return 'Single Shot Stage — Shot 12 (8th Position Eliminated)';
        if (nextShot === 13) return 'Single Shot Stage — Shot 13 (Live score update)';
        if (nextShot === 14) return 'Single Shot Stage — Shot 14 (7th Position Eliminated)';
        if (nextShot === 15) return 'Single Shot Stage — Shot 15 (Live score update)';
        if (nextShot === 16) return 'Single Shot Stage — Shot 16 (6th Position Eliminated)';
        if (nextShot === 17) return 'Single Shot Stage — Shot 17 (Live score update)';
        if (nextShot === 18) return 'Single Shot Stage — Shot 18 (5th Position Eliminated)';
        if (nextShot === 19) return 'Single Shot Stage — Shot 19 (Live score update)';
        if (nextShot === 20) return 'Single Shot Stage — Shot 20 (4th Position Eliminated)';
        if (nextShot === 21) return 'Medal Duel — Shot 21';
        if (nextShot === 22) return 'Bronze Medal Decider — Shot 22 (3rd Position Eliminated)';
        if (nextShot === 23) return 'Gold / Silver Duel — Shot 23';
        if (nextShot === 24) return 'Final Decider — Shot 24 (Gold Medalist Winner Crowned)';
        return '';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">

            {/* Header Info */}
            <div className="bg-[#12131A] p-5 rounded-2xl border border-[#282B3A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0">
                        <Crosshair className="w-5 h-5 text-[#DC2626]" />
                    </div>
                    <div>
                        <span className="text-[10px] text-[#DC2626] font-bold tracking-widest uppercase block">
                            TOUCH SCORING INTERFACE
                        </span>
                        <h1 className="font-headline-sm text-2xl text-[#F8FAFC] tracking-wider uppercase">
                            RANGE SCORER PANEL — {liveState.discipline === '10m_rifle' ? '10M AIR RIFLE' : '10M AIR PISTOL'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <DisciplineSwitcher />
                    <div className="flex items-center gap-2 bg-[#0B0C10] px-3.5 py-1.5 rounded-lg border border-[#282B3A] text-xs">
                        <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                        <span>SCORER: <strong className="text-[#F8FAFC]">{userName}</strong></span>
                    </div>
                </div>
            </div>

            {/* Main Grid: Left Athlete Selection & Keypad / Right Shot History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Col: Direct Athlete Selector & Score Keypad (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Finalists Selector Grid */}
                    <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] space-y-2">
                        <label className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                            SELECT FINALIST (8 FINALISTS IN ACTIVE VERTICAL)
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {activeResults.map(ath => {
                                const isSelected = activeAthlete?.participantId === ath.participantId;
                                const isOut = ath.finalStatus === 'ELIMINATED';
                                const athShots = ath.shots || [];

                                return (
                                    <button
                                        key={ath.participantId}
                                        onClick={() => setSelectedShooterId(ath.participantId)}
                                        className={`p-2.5 rounded-xl border text-left font-mono transition-all cursor-pointer ${isSelected
                                                ? 'bg-[#DC2626]/20 border-[#DC2626] text-[#F8FAFC] font-bold shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                                                : isOut
                                                    ? 'bg-[#0B0C10] border-[#282B3A] opacity-50 text-[#64748B]'
                                                    : 'bg-[#0B0C10] border-[#282B3A] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1C26]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-[#F59E0B]">#{ath.finalRank}</span>
                                            <span>{ath.department}</span>
                                        </div>
                                        <div className="text-xs truncate font-bold text-[#F8FAFC] mt-0.5">
                                            {ath.name}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-1 pt-1 border-t border-[#282B3A]/40">
                                            <span>S: {athShots.length}/24</span>
                                            <span className="font-bold text-[#F8FAFC]">{ath.finalTotal.toFixed(1)}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Shooter Scoring Card */}
                    {activeAthlete && (
                        <div className="bg-[#12131A] p-5 sm:p-6 rounded-2xl border border-[#282B3A] space-y-6">

                            {/* Shooter Summary Header (BIB, FP, and Club metadata removed) */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#282B3A] gap-4">
                                <div>
                                    <div className="text-xs text-[#F59E0B] font-bold uppercase">
                                        DEPT: {activeAthlete.department} · USN: {activeAthlete.usn}
                                    </div>
                                    <h2 className="font-headline-sm text-2xl text-[#F8FAFC] uppercase tracking-wider mt-0.5">
                                        {activeAthlete.name}
                                    </h2>
                                    <span className="text-xs text-[#22C55E] font-bold">
                                        {getStageDescription()}
                                    </span>
                                </div>

                                {/* Score Summary Telemetry */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#0B0C10] px-4 py-2 rounded-xl border border-[#282B3A] text-right">
                                        <div className="text-[9px] text-[#64748B] uppercase">SHOTS FIRED</div>
                                        <div className="text-lg font-bold text-[#F8FAFC]">
                                            {shots.length} <span className="text-xs text-[#64748B]">/ 24</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#0B0C10] px-4 py-2 rounded-xl border border-[#DC2626]/60 text-right">
                                        <div className="text-[9px] text-[#DC2626] font-bold uppercase">OFFICIAL SCORE</div>
                                        <div className="text-xl font-bold text-[#F8FAFC]">
                                            {activeAthlete.finalTotal.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Server Acknowledgement Indicator */}
                            {lastAckScore !== null && (
                                <div className="p-3 bg-[#22C55E]/15 border border-[#22C55E] rounded-xl text-[#22C55E] text-xs flex items-center justify-between animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        <span>SHOT RECORDED: <strong>{lastAckScore.toFixed(1)}</strong> — Leaderboard recalculated.</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold">ACK</span>
                                </div>
                            )}

                            {/* Elimination / Completion Notification if applicable */}
                            {isEliminated ? (
                                <div className="p-4 bg-[#EF4444]/15 border border-[#EF4444]/60 rounded-xl text-[#EF4444] text-xs flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 shrink-0" />
                                    <div>
                                        <div className="font-bold uppercase text-sm">FINALIST ELIMINATED</div>
                                        <div>
                                            {activeAthlete.name} was eliminated at Shot {activeAthlete.eliminatedAtShot || 12} with final rank #{activeAthlete.finalRank}. No additional shots can be submitted.
                                        </div>
                                    </div>
                                </div>
                            ) : isCompleted ? (
                                <div className="p-4 bg-[#F59E0B]/15 border border-[#F59E0B]/60 rounded-xl text-[#F59E0B] text-xs flex items-center gap-3">
                                    <Trophy className="w-6 h-6 shrink-0" />
                                    <div>
                                        <div className="font-bold uppercase text-sm">COMPETITION COMPLETED</div>
                                        <div>
                                            All 24 shots have been fired. Final Score: {activeAthlete.finalTotal.toFixed(1)}. Final Rank: #{activeAthlete.finalRank}.
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Touch Keypad - EXACTLY 24 SHOTS LIMIT */
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs text-[#F8FAFC] uppercase font-bold tracking-wider">
                                            ENTER SHOT #{shots.length + 1} OF 24 (0.0 — 10.9)
                                        </label>
                                        {shots.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setCorrectionShotIndex(shots.length);
                                                    setCorrectionNewValue(shots[shots.length - 1]);
                                                    setCorrectionModalOpen(true);
                                                }}
                                                className="text-xs text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <History className="w-3.5 h-3.5" /> Correct Previous Shot
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                                        {quickScores.map(score => (
                                            <button
                                                key={score}
                                                onClick={() => handleShotClick(score)}
                                                disabled={submittingScore !== null || !canShoot}
                                                className={`py-3 sm:py-3.5 rounded-xl text-base sm:text-lg font-bold transition-all border shadow-md active:scale-95 cursor-pointer ${submittingScore === score
                                                        ? 'bg-[#F59E0B] text-[#0B0C10] border-[#F59E0B] animate-pulse'
                                                        : score >= 10.4
                                                            ? 'bg-[#1A1C26] hover:bg-[#22C55E]/30 border-[#282B3A] hover:border-[#22C55E] text-[#F8FAFC]'
                                                            : score >= 10.0
                                                                ? 'bg-[#1A1C26] hover:bg-[#DC2626] border-[#282B3A] hover:border-[#DC2626] text-[#F8FAFC]'
                                                                : 'bg-[#0B0C10] hover:bg-[#1A1C26] border-[#282B3A] text-[#94A3B8]'
                                                    }`}
                                            >
                                                {score.toFixed(1)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Manual Decimal Entry Form */}
                                    <form onSubmit={handleManualSubmit} className="flex items-center gap-3 pt-2">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10.9"
                                            disabled={!canShoot}
                                            placeholder="Manual decimal score (e.g. 10.8)..."
                                            value={manualInput}
                                            onChange={e => setManualInput(e.target.value)}
                                            className="flex-1 bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!canShoot || !manualInput}
                                            className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#4B1B1B] text-[#F8FAFC] text-xs font-bold uppercase rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <Send className="w-4 h-4" /> Submit
                                        </button>
                                    </form>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Right Col: Active Shooter 24-Shot History & Corrections (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Active Shooter Shot Grid */}
                    <div className="bg-[#12131A] p-5 rounded-2xl border border-[#282B3A] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#282B3A] pb-2">
                            <h3 className="font-headline-sm text-sm text-[#F8FAFC] uppercase tracking-wider">
                                SHOT HISTORY ({shots.length}/24)
                            </h3>
                            <span className="text-[10px] text-[#F59E0B]">
                                {activeAthlete?.name}
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 text-xs max-h-60 overflow-y-auto">
                            {Array.from({ length: 24 }).map((_, i) => {
                                const shotNum = i + 1;
                                const val = shots[i];
                                return (
                                    <div
                                        key={shotNum}
                                        className={`p-1.5 rounded-lg text-center border ${val !== undefined
                                                ? val >= 10.4
                                                    ? 'bg-[#22C55E]/15 border-[#22C55E]/50 text-[#22C55E] font-bold'
                                                    : val >= 10.0
                                                        ? 'bg-[#0B0C10] border-[#282B3A] text-[#F8FAFC] font-bold'
                                                        : 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444] font-bold'
                                                : 'bg-[#0B0C10] border-[#282B3A]/40 text-[#475569]'
                                            }`}
                                    >
                                        <div className="text-[8px] text-[#64748B]">S{shotNum}</div>
                                        <div className="text-xs">{val !== undefined ? val.toFixed(1) : '—'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Audit Trail */}
                    <div className="bg-[#12131A] p-5 rounded-2xl border border-[#282B3A] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#282B3A] pb-2">
                            <h3 className="font-headline-sm text-sm text-[#F8FAFC] uppercase tracking-wider">
                                AUDIT TRAIL
                            </h3>
                            <span className="text-[10px] text-[#64748B]">{auditLogs.length} LOGS</span>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                            {auditLogs.length === 0 ? (
                                <div className="text-[#64748B] text-center py-4 text-xs">
                                    No correction logs recorded yet.
                                </div>
                            ) : (
                                auditLogs.slice(0, 8).map(log => (
                                    <div key={log.id} className="p-2.5 rounded-lg bg-[#0B0C10] border border-[#282B3A] space-y-1">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-[#DC2626] font-bold">{log.action}</span>
                                            <span className="text-[#64748B]">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[#F8FAFC]">
                                            {log.participantName || log.actorName}: {log.oldValue !== undefined ? `${log.oldValue} ➔ ${log.newValue}` : log.action}
                                        </div>
                                        {log.reason && (
                                            <div className="text-[10px] text-[#64748B] italic">"{log.reason}"</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* SCORE CORRECTION MODAL */}
            {correctionModalOpen && activeAthlete && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#12131A] border border-[#282B3A] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-[#282B3A] pb-3">
                            <h3 className="font-headline-sm text-base text-[#F8FAFC] tracking-wider uppercase flex items-center gap-2">
                                <History className="w-4 h-4 text-[#F59E0B]" />
                                CORRECT PREVIOUS SHOT
                            </h3>
                            <button
                                onClick={() => setCorrectionModalOpen(false)}
                                className="text-[#64748B] hover:text-[#F8FAFC]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCorrectionSubmit} className="space-y-4">
                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">Target Athlete</label>
                                <div className="p-2 rounded bg-[#0B0C10] border border-[#282B3A] font-bold text-[#F8FAFC]">
                                    {activeAthlete.name} ({activeAthlete.department})
                                </div>
                            </div>

                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">Select Shot Number</label>
                                <select
                                    value={correctionShotIndex}
                                    onChange={e => {
                                        const idx = parseInt(e.target.value);
                                        setCorrectionShotIndex(idx);
                                        setCorrectionNewValue(shots[idx - 1] || 10.0);
                                    }}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none"
                                >
                                    {shots.map((val, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Shot #{i + 1} (Current Value: {val.toFixed(1)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">New Decimal Score (0.0 — 10.9)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10.9"
                                    required
                                    value={correctionNewValue}
                                    onChange={e => setCorrectionNewValue(parseFloat(e.target.value))}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-[#F59E0B] font-bold text-base focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">Official Justification / Reason</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={correctionReason}
                                    onChange={e => setCorrectionReason(e.target.value)}
                                    placeholder="Enter reason for audit record..."
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl p-2.5 text-[#F8FAFC] focus:outline-none resize-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCorrectionModalOpen(false)}
                                    className="px-4 py-2 bg-[#1A1C26] hover:bg-[#282B3A] text-[#64748B] hover:text-[#F8FAFC] rounded-xl uppercase font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0C10] font-bold rounded-xl uppercase flex items-center gap-1.5 shadow-lg"
                                >
                                    <Check className="w-4 h-4" /> Apply Correction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
