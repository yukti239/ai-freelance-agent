import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserRole } from '../types';
import { Shield, Briefcase, User as UserIcon, LogIn, Sparkles, ArrowRight, Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<UserRole>('freelancer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
          role: role,
          pfiScore: 500,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Google authentication is not configured for this domain. To fix it, add the running hostname to your Firebase Authorized domains:\n\n1. Go to Firebase Console: https://console.firebase.google.com/\n2. Select your project (trustbridge-378cd)\n3. Go to Authentication > Sign-in method > Google\n4. Add the domain you are running on (e.g., "localhost", "127.0.0.1")\n5. Save changes\n\nThen refresh this page and try again.\n\nAlternatively, use email/password authentication for now.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Authentication was cancelled. Please try again.');
      } else {
        setError(`Authentication failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: displayName,
          role: role,
          pfiScore: 500,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col lg:flex-row font-sans text-white">
      {/* Left Side: Branding & Info */}
      <div className="lg:w-1/2 bg-[#0A0A0A] p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
              <Lock className="text-black w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">TrustBridge AI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-7xl md:text-8xl font-display font-bold tracking-tighter leading-[0.85] mb-12 uppercase">
              The AI <br />
              <span className="text-zinc-600">Protocol</span> <br />
              for Work.
            </h1>
            <p className="text-zinc-500 text-xl max-w-md leading-relaxed mb-16 font-light">
              Remove human bias from the payment cycle. Protect capital through automated escrow and reward talent with instant liquidity.
            </p>

            <div className="space-y-8">
              {[
                { icon: <Zap className="w-5 h-5 text-emerald-400" />, text: "AI-Driven Escrow & Liquidity" },
                { icon: <Shield className="w-5 h-5 text-emerald-400" />, text: "Automated Quality Assurance" },
                { icon: <Sparkles className="w-5 h-5 text-emerald-400" />, text: "Professional Fidelity Index (PFI)" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    {item.icon}
                  </div>
                  <span className="font-bold text-zinc-400 uppercase tracking-[0.2em] text-[10px]">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 pt-12">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
            Global Autonomous Node Network Active
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-[#050505]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="mb-12">
            <h2 className="text-4xl font-display font-bold tracking-tight mb-4">
              {isRegistering ? 'Initialize Identity' : 'Welcome back'}
            </h2>
            <p className="text-zinc-500 font-light">
              {isRegistering ? 'Join the future of frictionless work.' : 'Your autonomous agent is waiting.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all text-white placeholder:text-zinc-700"
                    placeholder="John Doe"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all text-white placeholder:text-zinc-700"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all text-white placeholder:text-zinc-700"
                placeholder="••••••••"
              />
            </div>

            {isRegistering && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${role === 'employer' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 hover:border-white/20 text-zinc-500'}`}
                >
                  <Briefcase className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Employer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${role === 'freelancer' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 hover:border-white/20 text-zinc-500'}`}
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Freelancer</span>
                </button>
              </div>
            )}

            {error && <p className="text-red-400 text-[10px] font-bold bg-red-500/10 border border-red-500/20 p-4 rounded-xl uppercase tracking-widest">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/5 disabled:opacity-50"
            >
              {loading ? <LogIn className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {isRegistering ? 'Initialize Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em]"><span className="bg-[#050505] px-6 text-zinc-700">Or continue with</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-[0.1em] disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Google Account
            <span className="text-[8px] text-zinc-500 ml-auto">(Requires domain auth)</span>
          </button>

          <div className="text-center mt-4">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              For development: Use email/password authentication above
            </p>
          </div>

          <p className="mt-12 text-center text-sm text-zinc-600 font-medium">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-white font-bold hover:underline ml-2"
            >
              {isRegistering ? 'Sign In' : 'Register Now'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
