import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdminAuthScreenProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AdminAuthScreen({ onSuccess, onCancel }: AdminAuthScreenProps) {
    const { loginWithPassword } = useAuth();
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordInput.trim()) {
            setErrorMsg('Please enter the admin security password.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg(null);

        const res = await loginWithPassword(passwordInput);
        setIsSubmitting(false);

        if (res.success) {
            onSuccess();
        } else {
            setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-[#12131A] border border-[#282B3A] hover:border-[#DC2626]/60 rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors font-mono space-y-6">

                {/* Header Icon & Title */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626] mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.25)]">
                        <Lock className="w-8 h-8 text-[#DC2626]" />
                    </div>

                    <div>
                        <span className="text-[10px] text-[#DC2626] font-bold tracking-widest uppercase block">
                            RESTRICTED ACCESS PORTAL
                        </span>
                        <h1 className="font-headline-sm text-2xl text-[#F8FAFC] tracking-wider uppercase mt-1">
                            LAKSHYA 2.0 ADMIN
                        </h1>
                        <p className="text-xs text-[#64748B] mt-1">
                            Authentication required to access competition controls & scoring.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-[#94A3B8] font-bold uppercase block mb-1.5">
                            Admin Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={passwordInput}
                                onChange={e => {
                                    setPasswordInput(e.target.value);
                                    if (errorMsg) setErrorMsg(null);
                                }}
                                placeholder="Enter administrator password..."
                                autoFocus
                                className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl px-4 py-3 pr-11 text-sm text-[#F8FAFC] placeholder-[#475569] font-mono tracking-wider focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F8FAFC] transition-colors"
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Error display */}
                    {errorMsg && (
                        <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/40 text-[#EF4444] text-xs flex items-center gap-2 animate-shake">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 space-y-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#4B1B1B] text-[#F8FAFC] font-bold uppercase rounded-xl tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#DC2626]/20 transition-all cursor-pointer"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-[#F8FAFC] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" /> Authenticate & Access
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full py-2.5 bg-transparent hover:bg-[#1A1C26] text-[#64748B] hover:text-[#94A3B8] font-bold uppercase rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Leaderboard
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
