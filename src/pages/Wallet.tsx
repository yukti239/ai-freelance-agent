import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, ShieldCheck, Zap, CreditCard, Plus, Lock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { useNavigate } from 'react-router-dom';

export default function Wallet() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    if (!profile) return;

    const unsubscribe = onSnapshot(doc(db, 'users', profile.uid), (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().walletBalance || 0);
      }
    });

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', profile.uid)
    );

    const unsubscribeTrans = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(transData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return () => {
      unsubscribe();
      unsubscribeTrans();
    };
  }, [profile]);

  const handleDeposit = async () => {
    if (!profile || !depositAmount) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        walletBalance: balance + amount
      });

      await addDoc(collection(db, 'transactions'), {
        userId: profile.uid,
        amount,
        type: 'deposit',
        description: 'Funds deposited to wallet',
        createdAt: new Date().toISOString()
      });

      setIsDepositing(false);
      setDepositAmount('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <header className="mb-16">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] mb-8 hover:text-white transition-all group uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Terminal
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-4">Escrow Wallet</h1>
              <p className="text-zinc-500 font-light text-lg max-w-xl">Manage your liquidity with autonomous agent security protocols.</p>
            </div>
            <button 
              onClick={() => setIsDepositing(true)}
              className="px-10 py-5 bg-white text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/5 hover:bg-zinc-200"
            >
              <Plus className="w-5 h-5" />
              Deposit Funds
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 p-12 rounded-[48px] bg-[#0A0A0A] border border-white/5 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[120px] group-hover:bg-emerald-500/20 transition-all duration-1000" />
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <WalletIcon className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Secure AI Escrow Balance</span>
              </div>
              <div className="flex items-baseline gap-4 mb-12">
                <h2 className="text-8xl font-display font-bold tracking-tighter">
                  ₹{balance.toLocaleString()}
                </h2>
                <span className="text-xl text-zinc-600 font-bold uppercase tracking-widest">INR</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 text-zinc-400">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Instant Withdrawals Active
                </div>
                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 text-zinc-400">
                  <Lock className="w-4 h-4 text-blue-400" />
                  ₹0.00 Locked in Escrow
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            <div className="p-10 rounded-[40px] bg-[#0A0A0A] border border-white/5 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Total Earnings</p>
              <p className="text-4xl font-display font-bold">₹0.00</p>
            </div>
            <div className="p-10 rounded-[40px] bg-[#0A0A0A] border border-white/5 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Pending Clearance</p>
              <p className="text-4xl font-display font-bold text-yellow-400/80">₹0.00</p>
            </div>
            <div className="p-10 rounded-[40px] bg-[#0A0A0A] border border-white/5 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">PFI Bonus Earned</p>
              <p className="text-4xl font-display font-bold text-emerald-400/80">+₹0.00</p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <History className="w-4 h-4 text-emerald-400" />
              Transaction Ledger
            </h2>
            <span className="text-[10px] font-bold text-zinc-600 bg-white/5 px-4 py-2 rounded-full uppercase tracking-widest border border-white/5">
              {transactions.length} Records
            </span>
          </div>
          
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="p-20 text-center rounded-[48px] bg-[#0A0A0A] border border-white/5 text-zinc-600 border-dashed">
                <History className="w-12 h-12 mx-auto mb-6 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">No transactions detected in ledger</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <motion.div 
                  key={tx.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8 rounded-[32px] bg-[#0A0A0A] border border-white/5 flex items-center justify-between hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${
                      tx.type === 'deposit' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold text-white mb-1">{tx.description}</p>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-display font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Status: Finalized</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDepositing(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-md p-12 rounded-[48px] bg-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[80px]" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-white/5">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-display font-bold text-white mb-2">Deposit Liquidity</h3>
                <p className="text-zinc-500 font-light mb-10">Initialize funds for autonomous escrow allocation.</p>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-500 font-display font-bold text-2xl">₹</span>
                      <input 
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-8 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-4xl font-display font-bold text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsDepositing(false)}
                      className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-zinc-500 hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeposit}
                      className="flex-[2] py-5 bg-emerald-500 text-black font-bold rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400"
                    >
                      Confirm Deposit
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
