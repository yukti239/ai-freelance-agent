import React, { useState, useEffect, createContext, useContext, Suspense, lazy } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate 
} from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';
import { Loader2, Layout, Wallet as WalletIcon, PlusCircle, LogOut, Home, Zap, User as UserIcon, Settings as SettingsIcon, Bell, BarChart3 } from 'lucide-react';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Wallet = lazy(() => import('./pages/Wallet'));
const ProjectCreation = lazy(() => import('./pages/ProjectCreation'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

function Sidebar() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  return (
    <div className="w-20 lg:w-64 h-screen bg-[#050505] border-r border-white/5 flex flex-col p-4 fixed left-0 top-0 z-40">
      <div className="flex items-center gap-3 px-4 py-8 mb-8">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Zap className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl hidden lg:block tracking-tight">TrustBridge</span>
      </div>

      <nav className="flex-1 space-y-2">
        <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
          <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden lg:block">Dashboard</span>
        </button>
        <button onClick={() => navigate('/wallet')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
          <WalletIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden lg:block">Escrow Wallet</span>
        </button>
        {profile?.role === 'employer' && (
          <button onClick={() => navigate('/create-project')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
            <PlusCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-medium hidden lg:block">Post Project</span>
          </button>
        )}
        <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
          <UserIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden lg:block">Profile</span>
        </button>
        <button onClick={() => navigate('/notifications')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
          <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden lg:block">Notifications</span>
        </button>
        <button onClick={() => navigate('/analytics')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
          <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden lg:block">Analytics</span>
        </button>
        <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
          <SettingsIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden lg:block">Settings</span>
        </button>
      </nav>

      <div className="pt-8 border-t border-white/5 space-y-4">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="w-5 h-5 text-emerald-500" />
            )}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{profile?.displayName || 'User'}</p>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{profile?.role}</p>
          </div>
        </div>
        <button onClick={signOut} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-zinc-400 hover:text-red-400 group">
          <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden lg:block">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-[#050505] min-h-screen text-white">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Set up profile listener when user is authenticated
        const unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create default profile if it doesn't exist
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              role: 'freelancer',
              pfiScore: 500,
              walletBalance: 0
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile fetch error:", error);
          setLoading(false);
        });

        return unsubscribeProfile;
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  const signOut = async () => {
    await auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      <Router>
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        }>
          <Routes>
            <Route path="/landing" element={!user ? <Landing /> : <Navigate to="/" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <LayoutWrapper><Dashboard /></LayoutWrapper> : <Navigate to="/landing" />} />
            <Route path="/wallet" element={user ? <LayoutWrapper><Wallet /></LayoutWrapper> : <Navigate to="/landing" />} />
            <Route path="/create-project" element={user && profile?.role === 'employer' ? <LayoutWrapper><ProjectCreation /></LayoutWrapper> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <LayoutWrapper><Profile /></LayoutWrapper> : <Navigate to="/landing" />} />
            <Route path="/notifications" element={user ? <LayoutWrapper><Notifications /></LayoutWrapper> : <Navigate to="/landing" />} />
            <Route path="/settings" element={user ? <LayoutWrapper><Settings /></LayoutWrapper> : <Navigate to="/landing" />} />
            <Route path="/analytics" element={user ? <LayoutWrapper><AnalyticsDashboard /></LayoutWrapper> : <Navigate to="/landing" />} />
            <Route path="/projects/:id" element={user ? <LayoutWrapper><ProjectDetails /></LayoutWrapper> : <Navigate to="/landing" />} />
          </Routes>
          {user && <AIAssistant />}
        </Suspense>
      </Router>
    </AuthContext.Provider>
  );
}
