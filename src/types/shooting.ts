export type Discipline = '10m_rifle' | '10m_pistol';

export type EventStage =
    | 'UPCOMING'
    | 'PREPARATION'
    | 'SIGHTING'
    | 'FINAL_LIVE'
    | 'FINAL_COMPLETE'
    | 'RESULTS_APPROVED';

export type UserRole = 'ADMIN' | 'SCORER' | 'OFFICIAL' | 'JURY' | 'PUBLIC';

export interface Participant {
    id: string;
    bib?: string;
    name: string;
    usn: string;
    department: string;
    discipline: Discipline;
    photoUrl?: string;
    achievements?: string;
    initialScore: number;
    gender?: 'M' | 'F';
    category?: 'Youth' | 'Junior' | 'Senior' | 'Master';
    club?: string;
    noc?: string;
    relay?: number;
    firingPoint?: number;
}

export interface ShotRecord {
    shotIndex: number; // 1 to 24
    score: number; // 0.0 to 10.9
    timestamp: number;
    scorerId?: string;
}

export interface AthleteResult {
    participantId: string;
    name: string;
    usn: string;
    department: string;
    discipline: Discipline;
    photoUrl?: string;
    achievements?: string;
    initialScore: number;
    // Finals 24 shots
    shots: number[];
    finalTotal: number;
    liveTotalScore: number; // actual arithmetic sum of all shots taken
    finalRank: number;
    finalStatus: 'LIVE' | 'ELIMINATED' | 'GOLD' | 'SILVER' | 'BRONZE';
    laggingBy?: string;
    eliminatedAtShot?: number;
    rankDelta?: number;
    lastShot?: number;
    bib?: string;
    firingPoint?: number;
    relay?: number;
    club?: string;
    noc?: string;
    qualificationShots?: number[];
    qualificationTotal?: number;
    qualificationRank?: number;
    qualificationStatus?: 'SHOOTING' | 'COMPLETED' | 'DNS' | 'DSQ';
}

export interface CurrentShooterState {
    participantId: string;
    name: string;
    usn: string;
    department: string;
    discipline: Discipline;
    shotIndex: number;
    totalShots: number; // 24
    lastShot: number;
    currentScore: number;
    photoUrl?: string;
    bib?: string;
    firingPoint?: number;
    relay?: number;
}

export interface LiveState {
    eventId: string;
    eventName: string;
    discipline: Discipline;
    stage: EventStage;
    relay: number;
    youtubeVideoId: string;
    streamTitle: string;
    streamStatus: string;
    cameraName: string;
    timerTargetEpoch: number | null;
    timerDurationSeconds: number;
    isTimerRunning: boolean;
    updatedAt: number;
}

export interface AuditLog {
    id: string;
    timestamp: number;
    actorName: string;
    actorRole: UserRole;
    action: string;
    participantId?: string;
    participantName?: string;
    bib?: string;
    shotIndex?: number;
    oldValue?: number | string;
    newValue?: number | string;
    reason?: string;
}
