import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiveDataProvider } from './context/LiveDataContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PublicLivePage from './pages/PublicLivePage';
import ScorerPanel from './pages/ScorerPanel';
import AdminDashboard from './pages/AdminDashboard';
import AthleteSearch from './pages/AthleteSearch';
import AdminAuthScreen from './pages/AdminAuthScreen';
import RankNameOverlay from './pages/overlays/RankNameOverlay';
import ScorecardsOverlay from './pages/overlays/ScorecardsOverlay';
import LeaderboardOverlay from './pages/overlays/LeaderboardOverlay';
import type { Discipline } from './types/shooting';

const VALID_VIEWS = ['live', 'scorer', 'admin', 'search'];

function getViewFromUrl(): string {
  if (typeof window === 'undefined') return 'live';
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hash.startsWith('overlay/') || VALID_VIEWS.includes(hash)) return hash;
  const path = window.location.pathname.replace(/^\//, '').trim().toLowerCase();
  if (path.startsWith('overlay/') || VALID_VIEWS.includes(path)) return path;
  return 'live';
}

function MainContent() {
  const [currentView, setCurrentView] = useState<string>(getViewFromUrl);
  const { isAdmin, isScorer } = useAuth();

  const setView = (newView: string) => {
    if (newView === currentView) return;
    setCurrentView(newView);
    if (window.location.hash.replace(/^#\/?/, '') !== newView) {
      window.location.hash = newView;
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentView(getViewFromUrl());
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Broadcast Overlays: Render standalone with pure Chroma Key without header or footer
  if (currentView.startsWith('overlay/')) {
    const parts = currentView.split('/');
    const overlayType = parts[1];
    const discipline: Discipline = parts[2]?.includes('pistol') ? '10m_pistol' : '10m_rifle';

    if (overlayType === 'rank-name') {
      return <RankNameOverlay discipline={discipline} />;
    }
    if (overlayType === 'score-card') {
      return <ScorecardsOverlay discipline={discipline} />;
    }
    if (overlayType === 'leaderboard') {
      return <LeaderboardOverlay discipline={discipline} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#F8FAFC]">
      <Header currentView={currentView} setView={setView} />

      <main className="flex-1 w-full">
        {currentView === 'live' && <PublicLivePage />}
        {currentView === 'search' && <AthleteSearch />}

        {/* Admin route: If not authenticated, render AdminAuthScreen. Never render dashboard prematurely */}
        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <AdminAuthScreen
              onSuccess={() => { }}
              onCancel={() => setView('live')}
            />
          )
        )}

        {/* Scorer route: Protected */}
        {currentView === 'scorer' && (
          isScorer ? (
            <ScorerPanel />
          ) : (
            <AdminAuthScreen
              onSuccess={() => { }}
              onCancel={() => setView('live')}
            />
          )
        )}
      </main>

      <Footer setView={setView} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LiveDataProvider>
        <MainContent />
      </LiveDataProvider>
    </AuthProvider>
  );
}
