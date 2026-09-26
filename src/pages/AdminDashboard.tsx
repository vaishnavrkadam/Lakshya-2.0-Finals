import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import {
    Shield,
    CheckCircle2,
    Tv,
    UserPlus,
    Edit2,
    Trash2,
    AlertCircle,
    X,
    Save,
    RotateCcw,
    Upload,
    Check,
    Layers,
    Users
} from 'lucide-react';
import type { Discipline, Participant, AthleteResult } from '../types/shooting';
import AdminOverlaysTab from '../components/overlays/AdminOverlaysTab';

type AdminMainTab = 'finalists' | 'overlays' | 'stream';

export default function AdminDashboard() {
    const {
        liveState,
        updateLiveState,
        athleteResults,
        registerFinalist,
        updateFinalist,
        deleteFinalist,
        resetCompetitionScores
    } = useLiveData();

    // Active sub-tab inside Admin Panel
    const [activeAdminTab, setActiveAdminTab] = useState<AdminMainTab>('finalists');

    // YouTube Live settings state
    const [ytVideoIdInput, setYtVideoIdInput] = useState<string>(liveState.youtubeVideoId);
    const [ytTitleInput, setYtTitleInput] = useState<string>(liveState.streamTitle);
    const [ytCameraInput, setYtCameraInput] = useState<string>(liveState.cameraName);
    const [ytSavedMessage, setYtSavedMessage] = useState<boolean>(false);

    // Filter finalists tab in Admin
    const [adminVerticalTab, setAdminVerticalTab] = useState<'ALL' | Discipline>('ALL');

    // Registration / Edit Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAthleteId, setEditingAthleteId] = useState<string | null>(null);

    // Form fields
    const [formName, setFormName] = useState('');
    const [formUsn, setFormUsn] = useState('');
    const [formDepartment, setFormDepartment] = useState('');
    const [formVertical, setFormVertical] = useState<Discipline>('10m_rifle');
    const [formAchievements, setFormAchievements] = useState('');
    const [formInitialScore, setFormInitialScore] = useState<string>('620.0');
    const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');
    const [photoUploading, setPhotoUploading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // Reset confirmation modal
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

    // Counts
    const rifleAthletes = athleteResults.filter(a => a.discipline === '10m_rifle');
    const pistolAthletes = athleteResults.filter(a => a.discipline === '10m_pistol');

    const handleUpdateStreamSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateLiveState({
            youtubeVideoId: ytVideoIdInput.trim(),
            streamTitle: ytTitleInput.trim(),
            cameraName: ytCameraInput.trim(),
        });
        setYtSavedMessage(true);
        setTimeout(() => setYtSavedMessage(false), 3000);
    };

    const openRegisterModal = () => {
        setEditingAthleteId(null);
        setFormName('');
        setFormUsn('');
        setFormDepartment('');
        setFormVertical(rifleAthletes.length >= 8 ? '10m_pistol' : '10m_rifle');
        setFormAchievements('');
        setFormInitialScore('620.0');
        setFormPhotoUrl('');
        setFormError(null);
        setModalOpen(true);
    };

    const openEditModal = (ath: AthleteResult) => {
        setEditingAthleteId(ath.participantId);
        setFormName(ath.name);
        setFormUsn(ath.usn);
        setFormDepartment(ath.department);
        setFormVertical(ath.discipline);
        setFormAchievements(ath.achievements || '');
        setFormInitialScore(ath.initialScore !== undefined && ath.initialScore !== null ? String(ath.initialScore) : '600.0');
        setFormPhotoUrl(ath.photoUrl || '');
        setFormError(null);
        setModalOpen(true);
    };

    // Instant, reliable photo compression for production without hanging
    const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setFormError('Please select a valid image file (JPG, PNG, or WebP).');
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            setFormError('File too large. Please select an image under 15MB.');
            return;
        }

        setPhotoUploading(true);
        setFormError(null);

        try {
            // Compress into optimized 200x200 thumbnail base64 Data URL (runs in < 150ms)
            const compressedDataUrl = await compressImageFile(file, 200, 200);
            setFormPhotoUrl(compressedDataUrl);
        } catch (err: any) {
            console.error('Photo processing error:', err);
            setFormError('Failed to process image. Please try a different photo.');
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const initialScoreNum = parseFloat(formInitialScore);
        if (isNaN(initialScoreNum) || initialScoreNum < 0) {
            setFormError('Initial Round Score must be a valid positive decimal number.');
            return;
        }

        if (editingAthleteId) {
            const res = await updateFinalist(editingAthleteId, {
                name: formName.trim(),
                usn: formUsn.trim(),
                department: formDepartment.trim(),
                discipline: formVertical,
                photoUrl: formPhotoUrl.trim(),
                achievements: formAchievements.trim(),
                initialScore: initialScoreNum,
            });

            if (!res.success) {
                setFormError(res.message || 'Failed to update finalist.');
                return;
            }

            setFormSuccess('Finalist updated successfully.');
            setTimeout(() => {
                setFormSuccess(null);
                setModalOpen(false);
            }, 800);
        } else {
            const res = await registerFinalist({
                name: formName.trim(),
                usn: formUsn.trim(),
                department: formDepartment.trim(),
                discipline: formVertical,
                photoUrl: formPhotoUrl.trim(),
                achievements: formAchievements.trim(),
                initialScore: initialScoreNum,
            });

            if (!res.success) {
                setFormError(res.message || 'Failed to register finalist.');
                return;
            }

            setFormSuccess('Finalist registered successfully!');
            setTimeout(() => {
                setFormSuccess(null);
                setModalOpen(false);
            }, 800);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to remove finalist "${name}" from competition?`)) {
            const res = await deleteFinalist(id);
            if (!res.success) {
                alert(res.message || 'Failed to delete finalist from Firestore.');
            }
        }
    };

    const displayedAthletes = athleteResults.filter(a => {
        if (adminVerticalTab === 'ALL') return true;
        return a.discipline === adminVerticalTab;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">

            {/* Header Banner */}
            <div className="bg-[#12131A] p-5 rounded-2xl border border-[#282B3A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                        <Shield className="w-6 h-6 text-[#DC2626]" />
                    </div>
                    <div>
                        <span className="text-[10px] text-[#DC2626] font-bold tracking-widest uppercase block">
                            ADMINISTRATOR COMMAND PORTAL
                        </span>
                        <h1 className="font-headline-sm text-2xl text-[#F8FAFC] tracking-wider uppercase">
                            LAKSHYA 2.0 CONTROL CENTER
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setResetConfirmOpen(true)}
                        className="px-4 py-2 bg-[#1A1C26] hover:bg-[#DC2626]/20 border border-[#282B3A] hover:border-[#DC2626] text-[#EF4444] rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-colors cursor-pointer"
                        title="Clear 24 shots and restart finals round"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset Finals Scores
                    </button>
                </div>
            </div>

            {/* Admin Main Tabs: Finalists | Overlays | Broadcast Settings */}
            <div className="flex items-center gap-2 border-b border-[#282B3A] pb-2">
                <button
                    onClick={() => setActiveAdminTab('finalists')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'finalists'
                            ? 'bg-[#DC2626] text-[#F8FAFC] shadow-lg'
                            : 'bg-[#12131A] text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                >
                    <Users className="w-4 h-4" /> Finalists Management
                </button>

                <button
                    onClick={() => setActiveAdminTab('overlays')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'overlays'
                            ? 'bg-[#DC2626] text-[#F8FAFC] shadow-lg'
                            : 'bg-[#12131A] text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                >
                    <Layers className="w-4 h-4" /> OBS Overlays
                </button>

                <button
                    onClick={() => setActiveAdminTab('stream')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'stream'
                            ? 'bg-[#DC2626] text-[#F8FAFC] shadow-lg'
                            : 'bg-[#12131A] text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                >
                    <Tv className="w-4 h-4" /> Stream Broadcast
                </button>
            </div>

            {/* TAB 1: FINALISTS MANAGEMENT */}
            {activeAdminTab === 'finalists' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Capacity Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] space-y-1">
                            <div className="text-[10px] text-[#64748B] uppercase font-bold">10M AIR RIFLE FINALISTS</div>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold text-[#F8FAFC]">
                                    {rifleAthletes.length} <span className="text-sm text-[#64748B]">/ 8</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${rifleAthletes.length >= 8 ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'}`}>
                                    {rifleAthletes.length >= 8 ? 'FULL (8/8)' : `${8 - rifleAthletes.length} SLOTS OPEN`}
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] space-y-1">
                            <div className="text-[10px] text-[#64748B] uppercase font-bold">10M AIR PISTOL FINALISTS</div>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold text-[#F8FAFC]">
                                    {pistolAthletes.length} <span className="text-sm text-[#64748B]">/ 8</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${pistolAthletes.length >= 8 ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'}`}>
                                    {pistolAthletes.length >= 8 ? 'FULL (8/8)' : `${8 - pistolAthletes.length} SLOTS OPEN`}
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#12131A] p-4 rounded-xl border border-[#DC2626]/40 space-y-1">
                            <div className="text-[10px] text-[#DC2626] uppercase font-bold">TOTAL REGISTERED FINALISTS</div>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold text-[#F8FAFC]">
                                    {athleteResults.length} <span className="text-sm text-[#64748B]">/ 16</span>
                                </div>
                                <span className="text-[10px] text-[#94A3B8]">MAX 16 TOTAL</span>
                            </div>
                        </div>
                    </div>

                    {/* Finalists Table & Registration Button */}
                    <div className="bg-[#12131A] p-5 rounded-2xl border border-[#282B3A] space-y-4 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#282B3A]">
                            <div>
                                <h2 className="font-headline-sm text-lg text-[#F8FAFC] tracking-wider uppercase">
                                    REGISTERED FINALISTS ROSTER
                                </h2>
                                <p className="text-xs text-[#64748B]">
                                    Authoritative competition finalists stored in Cloud Firestore.
                                </p>
                            </div>

                            <button
                                onClick={openRegisterModal}
                                disabled={athleteResults.length >= 16}
                                className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#4B1B1B] text-[#F8FAFC] rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg transition-colors cursor-pointer self-start sm:self-auto"
                            >
                                <UserPlus className="w-4 h-4" /> Register Finalist
                            </button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={() => setAdminVerticalTab('ALL')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminVerticalTab === 'ALL' ? 'bg-[#DC2626] text-[#F8FAFC]' : 'bg-[#0B0C10] text-[#64748B] hover:text-[#F8FAFC]'}`}
                            >
                                ALL ({athleteResults.length})
                            </button>
                            <button
                                onClick={() => setAdminVerticalTab('10m_rifle')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminVerticalTab === '10m_rifle' ? 'bg-[#DC2626] text-[#F8FAFC]' : 'bg-[#0B0C10] text-[#64748B] hover:text-[#F8FAFC]'}`}
                            >
                                AIR RIFLE ({rifleAthletes.length}/8)
                            </button>
                            <button
                                onClick={() => setAdminVerticalTab('10m_pistol')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminVerticalTab === '10m_pistol' ? 'bg-[#DC2626] text-[#F8FAFC]' : 'bg-[#0B0C10] text-[#64748B] hover:text-[#F8FAFC]'}`}
                            >
                                AIR PISTOL ({pistolAthletes.length}/8)
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-[#282B3A] bg-[#0B0C10]">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-[#161822] text-[#64748B] uppercase text-[10px] border-b border-[#282B3A]">
                                        <th className="p-3">Athlete</th>
                                        <th className="p-3">USN</th>
                                        <th className="p-3">Dept</th>
                                        <th className="p-3">Vertical</th>
                                        <th className="p-3">Initial Score</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#282B3A]/60">
                                    {displayedAthletes.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-[#64748B]">
                                                No finalists registered in this category. Click "+ Register Finalist" above.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedAthletes.map(ath => (
                                            <tr key={ath.participantId} className="hover:bg-[#12131A] transition-colors">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full border border-[#282B3A] overflow-hidden bg-[#1A1C26] flex items-center justify-center shrink-0">
                                                            {ath.photoUrl ? (
                                                                <img src={ath.photoUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="font-bold text-[#F8FAFC] text-xs">
                                                                    {ath.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#F8FAFC]">{ath.name}</div>
                                                            {ath.achievements && (
                                                                <div className="text-[10px] text-[#F59E0B] truncate max-w-[160px]">
                                                                    {ath.achievements}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-3 text-[#F59E0B] font-bold">{ath.usn}</td>
                                                <td className="p-3 text-[#94A3B8]">{ath.department}</td>
                                                <td className="p-3">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${ath.discipline === '10m_rifle' ? 'bg-[#DC2626]/20 text-[#DC2626]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'}`}>
                                                        {ath.discipline === '10m_rifle' ? 'RIFLE' : 'PISTOL'}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-bold text-[#F8FAFC]">{ath.initialScore.toFixed(1)}</td>
                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => openEditModal(ath)}
                                                            className="p-1.5 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1A1C26] rounded transition-colors"
                                                            title="Edit Finalist"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ath.participantId, ath.name)}
                                                            className="p-1.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-colors"
                                                            title="Delete Finalist"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: OBS OVERLAYS SUITE */}
            {activeAdminTab === 'overlays' && (
                <div className="animate-fade-in">
                    <AdminOverlaysTab />
                </div>
            )}

            {/* TAB 3: STREAM BROADCAST CONFIG */}
            {activeAdminTab === 'stream' && (
                <div className="max-w-2xl bg-[#12131A] p-6 rounded-2xl border border-[#282B3A] space-y-4 shadow-xl animate-fade-in">
                    <h2 className="font-headline-sm text-lg text-[#F8FAFC] tracking-wider uppercase border-b border-[#282B3A] pb-2 flex items-center justify-between">
                        <span>YOUTUBE LIVE STREAM CONFIGURATION</span>
                        <Tv className="w-5 h-5 text-[#DC2626]" />
                    </h2>

                    {ytSavedMessage && (
                        <div className="p-3 bg-[#22C55E]/15 border border-[#22C55E] rounded-xl text-xs text-[#22C55E] flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Broadcast settings saved to Firestore! All viewers synced.</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdateStreamSettings} className="space-y-4 text-xs">
                        <div>
                            <label className="text-[#64748B] uppercase block mb-1 font-bold">YouTube Video ID</label>
                            <input
                                type="text"
                                placeholder="e.g. jfKfPfyJRdk"
                                value={ytVideoIdInput}
                                onChange={e => setYtVideoIdInput(e.target.value)}
                                className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-3 py-2.5 text-[#F59E0B] font-bold focus:outline-none"
                            />
                            <span className="text-[10px] text-[#64748B] mt-1 block">
                                From YouTube live URL: youtube.com/watch?v=<strong>ID</strong>
                            </span>
                        </div>

                        <div>
                            <label className="text-[#64748B] uppercase block mb-1 font-bold">Broadcast Title</label>
                            <input
                                type="text"
                                value={ytTitleInput}
                                onChange={e => setYtTitleInput(e.target.value)}
                                className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-3 py-2.5 text-[#F8FAFC] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[#64748B] uppercase block mb-1 font-bold">Camera Feed Label</label>
                            <input
                                type="text"
                                value={ytCameraInput}
                                onChange={e => setYtCameraInput(e.target.value)}
                                className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-3 py-2.5 text-[#F8FAFC] focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-[#F8FAFC] font-bold uppercase rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                            <Save className="w-4 h-4" /> Save Stream Config to Firestore
                        </button>
                    </form>
                </div>
            )}

            {/* MANUAL REGISTRATION / EDIT MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#12131A] border border-[#282B3A] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in font-mono">
                        <div className="flex items-center justify-between border-b border-[#282B3A] pb-3">
                            <h3 className="font-headline-sm text-lg text-[#F8FAFC] tracking-wider uppercase flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-[#DC2626]" />
                                {editingAthleteId ? 'EDIT FINALIST' : 'REGISTER NEW FINALIST'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-[#64748B] hover:text-[#F8FAFC]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/50 text-[#EF4444] text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        {formSuccess && (
                            <div className="p-3 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/50 text-[#22C55E] text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{formSuccess}</span>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                            {/* 1. Shooter Name */}
                            <div>
                                <label className="text-[#94A3B8] font-bold uppercase block mb-1">
                                    1. Shooter Name <span className="text-[#DC2626]">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Rahul Kumar"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-3.5 py-2 text-[#F8FAFC] focus:outline-none"
                                />
                            </div>

                            {/* 2. Photo Upload - Instant & 100% Free Plan Friendly */}
                            <div>
                                <label className="text-[#94A3B8] font-bold uppercase block mb-1">
                                    2. Athlete Photo
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border border-[#282B3A] overflow-hidden bg-[#0B0C10] flex items-center justify-center shrink-0">
                                        {formPhotoUrl ? (
                                            <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-[#64748B]">No pic</span>
                                        )}
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoFileChange}
                                            id="photo-file-upload"
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="photo-file-upload"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1C26] hover:bg-[#282B3A] border border-[#282B3A] text-[#CBD5E1] rounded-lg cursor-pointer text-xs font-bold transition-colors"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            {photoUploading ? 'Optimizing...' : 'Select Photo'}
                                        </label>
                                        {formPhotoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setFormPhotoUrl('')}
                                                className="text-[#EF4444] text-[11px] hover:underline"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 3. USN & 4. Department */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[#94A3B8] font-bold uppercase block mb-1">
                                        3. USN <span className="text-[#DC2626]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 1RV22CS045"
                                        value={formUsn}
                                        onChange={e => setFormUsn(e.target.value)}
                                        className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-3.5 py-2 text-[#F8FAFC] uppercase focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[#94A3B8] font-bold uppercase block mb-1">
                                        4. Department <span className="text-[#DC2626]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. CSE, ECE, ME"
                                        value={formDepartment}
                                        onChange={e => setFormDepartment(e.target.value)}
                                        className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-3.5 py-2 text-[#F8FAFC] focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* 5. Vertical: Air Rifle / Air Pistol */}
                            <div>
                                <label className="text-[#94A3B8] font-bold uppercase block mb-1">
                                    5. Vertical <span className="text-[#DC2626]">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label
                                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${formVertical === '10m_rifle'
                                                ? 'bg-[#DC2626]/20 border-[#DC2626] text-[#F8FAFC] font-bold'
                                                : 'bg-[#0B0C10] border-[#282B3A] text-[#64748B]'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="vertical"
                                            value="10m_rifle"
                                            checked={formVertical === '10m_rifle'}
                                            onChange={() => setFormVertical('10m_rifle')}
                                            className="hidden"
                                        />
                                        10M AIR RIFLE ({rifleAthletes.length}/8)
                                    </label>

                                    <label
                                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${formVertical === '10m_pistol'
                                                ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F8FAFC] font-bold'
                                                : 'bg-[#0B0C10] border-[#282B3A] text-[#64748B]'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="vertical"
                                            value="10m_pistol"
                                            checked={formVertical === '10m_pistol'}
                                            onChange={() => setFormVertical('10m_pistol')}
                                            className="hidden"
                                        />
                                        10M AIR PISTOL ({pistolAthletes.length}/8)
                                    </label>
                                </div>
                            </div>

                            {/* 6. Achievements (Optional) */}
                            <div>
                                <label className="text-[#94A3B8] font-bold uppercase block mb-1">
                                    6. Achievements (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. State Gold Medalist 2025, Nationals"
                                    value={formAchievements}
                                    onChange={e => setFormAchievements(e.target.value)}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-3.5 py-2 text-[#F8FAFC] focus:outline-none"
                                />
                            </div>

                            {/* 7. Initial Round Score */}
                            <div>
                                <label className="text-[#94A3B8] font-bold uppercase block mb-1">
                                    7. Initial Round Score <span className="text-[#DC2626]">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    required
                                    placeholder="e.g. 624.5"
                                    value={formInitialScore}
                                    onChange={e => setFormInitialScore(e.target.value)}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-3.5 py-2 text-[#F8FAFC] font-bold focus:outline-none"
                                />
                            </div>

                            {/* Submit & Cancel */}
                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-[#1A1C26] hover:bg-[#282B3A] text-[#64748B] hover:text-[#F8FAFC] rounded-xl uppercase font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-[#F8FAFC] font-bold rounded-xl uppercase flex items-center gap-2 shadow-lg"
                                >
                                    <Check className="w-4 h-4" />
                                    {editingAthleteId ? 'Save Changes' : 'Confirm Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RESET SCORES CONFIRMATION MODAL */}
            {resetConfirmOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#12131A] border border-[#EF4444] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono">
                        <div className="flex items-center gap-3 text-[#EF4444]">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="font-headline-sm text-lg uppercase tracking-wider text-[#F8FAFC]">
                                RESET FINALS SCORES?
                            </h3>
                        </div>

                        <p className="text-xs text-[#94A3B8]">
                            This will clear all 24 shots and reset competition scores for <strong>{liveState.discipline === '10m_rifle' ? '10M Air Rifle' : '10M Air Pistol'}</strong> in Firestore. Registered finalists will be preserved.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setResetConfirmOpen(false)}
                                className="px-4 py-2 bg-[#1A1C26] hover:bg-[#282B3A] text-[#64748B] hover:text-[#F8FAFC] rounded-xl text-xs uppercase font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await resetCompetitionScores();
                                    setResetConfirmOpen(false);
                                }}
                                className="px-5 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-[#F8FAFC] rounded-xl text-xs uppercase font-bold shadow-lg"
                            >
                                Yes, Reset Scores in Firestore
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// Fast, non-blocking client-side square compression
async function compressImageFile(file: File, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const minSide = Math.min(width, height);
                const sx = (width - minSide) / 2;
                const sy = (height - minSide) / 2;

                canvas.width = maxWidth;
                canvas.height = maxHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(event.target?.result as string);
                    return;
                }

                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxWidth, maxHeight);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error('Image decode error'));
        };
        reader.onerror = () => reject(new Error('File read error'));
    });
}
