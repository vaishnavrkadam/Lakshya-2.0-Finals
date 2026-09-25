import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
    Discipline,
    EventStage,
    Participant,
    AthleteResult,
    LiveState,
    CurrentShooterState,
    AuditLog,
} from '../types/shooting';
import {
    INITIAL_LIVE_STATE,
    INITIAL_FINALISTS,
    INITIAL_ATHLETE_RESULTS,
    INITIAL_AUDIT_LOGS,
} from '../config/initialData';
import { isValidISSFShot, evaluateFinalsState } from '../config/issfRules';
import { db, doc, onSnapshot, setDoc, auth } from '../config/firebase';

interface LiveDataContextType {
    liveState: LiveState;
    athleteResults: AthleteResult[];
    activeResults: AthleteResult[]; // Filtered by current active vertical, sorted by rank
    currentShooter: CurrentShooterState;
    auditLogs: AuditLog[];
    isRealtimeConnected: boolean;
    lastUpdatedMs: number;
    selectedShooterId: string | null;
    setSelectedShooterId: (id: string | null) => void;
    // Methods
    switchDiscipline: (d: Discipline) => void;
    updateLiveState: (partial: Partial<LiveState>) => void;
    addShot: (participantId: string, score: number) => Promise<boolean>;
    correctShot: (
        participantId: string,
        shotIndex: number,
        newScore: number,
        reason: string,
        officialName: string
    ) => Promise<boolean>;
    registerFinalist: (finalist: Omit<Participant, 'id'>) => { success: boolean; message?: string };
    updateFinalist: (id: string, updated: Partial<Participant>) => { success: boolean; message?: string };
    deleteFinalist: (id: string) => { success: boolean; message?: string };
    resetCompetitionScores: (discipline?: Discipline) => void;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

const LOCAL_STORAGE_RESULTS_KEY = 'lakshya_2_0_finals_results';
const LOCAL_STORAGE_STATE_KEY = 'lakshya_2_0_finals_live_state';
const LOCAL_STORAGE_AUDIT_KEY = 'lakshya_2_0_finals_audit';

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize results from local storage or defaults
    const [athleteResults, setAthleteResults] = useState<AthleteResult[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (_) { }
        return INITIAL_ATHLETE_RESULTS;
    });

    const [liveState, setLiveState] = useState<LiveState>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (_) { }
        return INITIAL_LIVE_STATE;
    });

    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
            if (saved) return JSON.parse(saved);
        } catch (_) { }
        return INITIAL_AUDIT_LOGS;
    });

    const [selectedShooterId, setSelectedShooterId] = useState<string | null>(null);
    const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);
    const [lastUpdatedMs, setLastUpdatedMs] = useState<number>(Date.now());

    // Save to localStorage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(athleteResults));
        } catch (_) { }
    }, [athleteResults]);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(liveState));
        } catch (_) { }
    }, [liveState]);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_AUDIT_KEY, JSON.stringify(auditLogs));
        } catch (_) { }
    }, [auditLogs]);

    // Sync state with Firestore if connected
    useEffect(() => {
        try {
            const docRef = doc(db, 'liveState', 'active_finals');
            const unsubscribe = onSnapshot(
                docRef,
                snapshot => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        if (data) {
                            if (data.liveState) setLiveState(prev => ({ ...prev, ...data.liveState }));
                            if (data.athleteResults && Array.isArray(data.athleteResults)) {
                                setAthleteResults(data.athleteResults);
                            }
                            setIsRealtimeConnected(true);
                            setLastUpdatedMs(Date.now());
                        }
                    }
                },
                err => {
                    console.log('Firestore offline fallback active:', err.message);
                    setIsRealtimeConnected(true); // rely smoothly on local state
                }
            );
            return () => unsubscribe();
        } catch (_) {
            // offline mode
        }
    }, []);

    // Broadcast state updates to Firestore if authenticated as admin
    const syncToFirestore = useCallback((newResults: AthleteResult[], newState: LiveState) => {
        try {
            if (auth.currentUser) {
                const docRef = doc(db, 'liveState', 'active_finals');
                setDoc(docRef, {
                    liveState: newState,
                    athleteResults: newResults,
                    updatedAt: Date.now()
                }, { merge: true }).catch(() => { });
            }
        } catch (_) { }
    }, []);

    // Active vertical results, evaluated and sorted by ISSF finals rank
    const activeResults = useMemo(() => {
        const matching = athleteResults.filter(r => r.discipline === liveState.discipline);
        return evaluateFinalsState(matching);
    }, [athleteResults, liveState.discipline]);

    // Current shooter derivation
    const activeShooter = useMemo(() => {
        if (selectedShooterId) {
            const found = activeResults.find(r => r.participantId === selectedShooterId);
            if (found) return found;
        }
        return activeResults[0] || null;
    }, [activeResults, selectedShooterId]);

    const currentShooter: CurrentShooterState = useMemo(() => {
        if (!activeShooter) {
            return {
                participantId: 'none',
                name: 'No Finalist Registered',
                usn: '—',
                department: '—',
                discipline: liveState.discipline,
                shotIndex: 0,
                totalShots: 24,
                lastShot: 0.0,
                currentScore: 0.0,
            };
        }

        const shots = activeShooter.shots || [];
        const lastShot = shots.length > 0 ? shots[shots.length - 1] : 0.0;

        return {
            participantId: activeShooter.participantId,
            name: activeShooter.name,
            usn: activeShooter.usn,
            department: activeShooter.department,
            discipline: activeShooter.discipline,
            photoUrl: activeShooter.photoUrl,
            shotIndex: shots.length,
            totalShots: 24,
            lastShot,
            currentScore: activeShooter.finalTotal,
        };
    }, [activeShooter, liveState.discipline]);

    const switchDiscipline = (d: Discipline) => {
        setLiveState(prev => {
            const updated = { ...prev, discipline: d, updatedAt: Date.now() };
            syncToFirestore(athleteResults, updated);
            return updated;
        });
        setSelectedShooterId(null);
        setLastUpdatedMs(Date.now());
    };

    const updateLiveState = (partial: Partial<LiveState>) => {
        setLiveState(prev => {
            const updated = { ...prev, ...partial, updatedAt: Date.now() };
            syncToFirestore(athleteResults, updated);
            return updated;
        });
        setLastUpdatedMs(Date.now());
    };

    const addShot = async (participantId: string, score: number): Promise<boolean> => {
        if (!isValidISSFShot(score)) return false;

        const target = athleteResults.find(a => a.participantId === participantId);
        if (!target) return false;

        // Prevent exceeding 24 shots
        if (target.shots.length >= 24) return false;

        // Prevent shot if already eliminated
        if (target.finalStatus === 'ELIMINATED') return false;

        // Update target athlete's shots
        const updatedRaw = athleteResults.map(ath => {
            if (ath.participantId !== participantId) return ath;
            const updatedShots = [...ath.shots, score];
            return {
                ...ath,
                shots: updatedShots,
                lastShot: score,
            };
        });

        // Re-evaluate entire vertical using ISSF finals elimination & tie-break engine
        const currentDisciplineAthletes = updatedRaw.filter(a => a.discipline === target.discipline);
        const evaluatedDiscipline = evaluateFinalsState(currentDisciplineAthletes);

        // Merge back into all results
        const finalResults = updatedRaw.map(ath => {
            if (ath.discipline !== target.discipline) return ath;
            const evaluated = evaluatedDiscipline.find(e => e.participantId === ath.participantId);
            return evaluated || ath;
        });

        setAthleteResults(finalResults);
        setLastUpdatedMs(Date.now());
        syncToFirestore(finalResults, liveState);

        return true;
    };

    const correctShot = async (
        participantId: string,
        shotIndex: number,
        newScore: number,
        reason: string,
        officialName: string
    ): Promise<boolean> => {
        if (!isValidISSFShot(newScore)) return false;

        let oldValue = 0;
        const target = athleteResults.find(a => a.participantId === participantId);
        if (!target) return false;

        const updatedRaw = athleteResults.map(ath => {
            if (ath.participantId !== participantId) return ath;
            const shots = [...ath.shots];
            if (shotIndex >= 1 && shotIndex <= shots.length) {
                oldValue = shots[shotIndex - 1];
                shots[shotIndex - 1] = newScore;
            }
            return {
                ...ath,
                shots,
                lastShot: shots.length > 0 ? shots[shots.length - 1] : undefined,
            };
        });

        const currentDisciplineAthletes = updatedRaw.filter(a => a.discipline === target.discipline);
        const evaluatedDiscipline = evaluateFinalsState(currentDisciplineAthletes);

        const finalResults = updatedRaw.map(ath => {
            if (ath.discipline !== target.discipline) return ath;
            const evaluated = evaluatedDiscipline.find(e => e.participantId === ath.participantId);
            return evaluated || ath;
        });

        setAthleteResults(finalResults);

        // Create Audit Log
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: Date.now(),
            actorName: officialName || 'Chief Scorer',
            actorRole: 'SCORER',
            action: 'SHOT_CORRECTION',
            participantId,
            participantName: target.name,
            shotIndex,
            oldValue,
            newValue: newScore,
            reason,
        };

        setAuditLogs(prev => [newLog, ...prev]);
        setLastUpdatedMs(Date.now());
        syncToFirestore(finalResults, liveState);

        return true;
    };

    const registerFinalist = (
        finalist: Omit<Participant, 'id'>
    ): { success: boolean; message?: string } => {
        // Validation 1: Required fields
        if (!finalist.name?.trim()) return { success: false, message: 'Shooter Name is required.' };
        if (!finalist.usn?.trim()) return { success: false, message: 'USN is required.' };
        if (!finalist.department?.trim()) return { success: false, message: 'Department is required.' };
        if (!finalist.discipline || (finalist.discipline !== '10m_rifle' && finalist.discipline !== '10m_pistol')) {
            return { success: false, message: 'Vertical must be either 10M Air Rifle or 10M Air Pistol.' };
        }
        if (typeof finalist.initialScore !== 'number' || isNaN(finalist.initialScore) || finalist.initialScore < 0) {
            return { success: false, message: 'A valid Initial Round Score is required.' };
        }

        // Validation 2: Maximum capacity enforcement (8 per vertical, 16 total)
        const verticalCount = athleteResults.filter(a => a.discipline === finalist.discipline).length;
        if (verticalCount >= 8) {
            const verticalName = finalist.discipline === '10m_rifle' ? 'Air Rifle' : 'Air Pistol';
            return {
                success: false,
                message: `Maximum capacity reached: Exactly 8 finalists allowed for ${verticalName}.`
            };
        }

        // Validation 3: Duplicate USN check
        const normalizedUsn = finalist.usn.trim().toUpperCase();
        const duplicate = athleteResults.some(a => a.usn.trim().toUpperCase() === normalizedUsn);
        if (duplicate) {
            return {
                success: false,
                message: `Duplicate registration: An athlete with USN "${normalizedUsn}" is already registered.`
            };
        }

        // Generate unique ID
        const newId = `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newAthlete: AthleteResult = {
            participantId: newId,
            name: finalist.name.trim(),
            usn: normalizedUsn,
            department: finalist.department.trim(),
            discipline: finalist.discipline,
            photoUrl: finalist.photoUrl,
            achievements: finalist.achievements?.trim(),
            initialScore: finalist.initialScore,
            shots: [],
            finalTotal: 0,
            liveTotalScore: 0,
            finalRank: verticalCount + 1,
            finalStatus: 'LIVE',
            laggingBy: '—',
        };

        const updated = [...athleteResults, newAthlete];
        setAthleteResults(updated);
        syncToFirestore(updated, liveState);

        return { success: true };
    };

    const updateFinalist = (
        id: string,
        updated: Partial<Participant>
    ): { success: boolean; message?: string } => {
        const target = athleteResults.find(a => a.participantId === id);
        if (!target) return { success: false, message: 'Finalist record not found.' };

        // If USN changed, check duplicates
        if (updated.usn) {
            const normalizedUsn = updated.usn.trim().toUpperCase();
            const duplicate = athleteResults.some(
                a => a.participantId !== id && a.usn.trim().toUpperCase() === normalizedUsn
            );
            if (duplicate) {
                return { success: false, message: `USN "${normalizedUsn}" is already in use by another athlete.` };
            }
        }

        const newResults = athleteResults.map(ath => {
            if (ath.participantId !== id) return ath;
            return {
                ...ath,
                name: updated.name !== undefined ? updated.name.trim() : ath.name,
                usn: updated.usn !== undefined ? updated.usn.trim().toUpperCase() : ath.usn,
                department: updated.department !== undefined ? updated.department.trim() : ath.department,
                discipline: updated.discipline || ath.discipline,
                photoUrl: updated.photoUrl !== undefined ? updated.photoUrl : ath.photoUrl,
                achievements: updated.achievements !== undefined ? updated.achievements.trim() : ath.achievements,
                initialScore: updated.initialScore !== undefined ? updated.initialScore : ath.initialScore,
            };
        });

        setAthleteResults(newResults);
        syncToFirestore(newResults, liveState);
        return { success: true };
    };

    const deleteFinalist = (id: string): { success: boolean; message?: string } => {
        const newResults = athleteResults.filter(a => a.participantId !== id);
        setAthleteResults(newResults);
        syncToFirestore(newResults, liveState);
        return { success: true };
    };

    const resetCompetitionScores = (discipline?: Discipline) => {
        const targetDiscipline = discipline || liveState.discipline;
        const newResults = athleteResults.map(ath => {
            if (ath.discipline !== targetDiscipline) return ath;
            return {
                ...ath,
                shots: [],
                finalTotal: 0,
                liveTotalScore: 0,
                finalRank: 1,
                finalStatus: 'LIVE' as const,
                laggingBy: '—',
                eliminatedAtShot: undefined,
                lastShot: undefined,
            };
        });

        // Re-evaluate rank
        const disciplineAthletes = newResults.filter(a => a.discipline === targetDiscipline);
        disciplineAthletes.sort((a, b) => (b.initialScore || 0) - (a.initialScore || 0));
        disciplineAthletes.forEach((ath, idx) => {
            ath.finalRank = idx + 1;
        });

        setAthleteResults(newResults);
        syncToFirestore(newResults, liveState);
    };

    return (
        <LiveDataContext.Provider
            value={{
                liveState,
                athleteResults,
                activeResults,
                currentShooter,
                auditLogs,
                isRealtimeConnected,
                lastUpdatedMs,
                selectedShooterId,
                setSelectedShooterId,
                switchDiscipline,
                updateLiveState,
                addShot,
                correctShot,
                registerFinalist,
                updateFinalist,
                deleteFinalist,
                resetCompetitionScores,
            }}
        >
            {children}
        </LiveDataContext.Provider>
    );
};

export function useLiveData() {
    const context = useContext(LiveDataContext);
    if (!context) {
        throw new Error('useLiveData must be used within a LiveDataProvider');
    }
    return context;
}
