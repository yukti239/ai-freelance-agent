import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { geminiService } from '../services/geminiService';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { Shield, Sparkles, ArrowLeft, Loader2, CheckCircle2, Zap, Layout, DollarSign, FileText, PartyPopper, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import ProjectTemplates from '../components/ProjectTemplates';

export default function ProjectCreation() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !budget) {
      alert('Please fill in all fields.');
      return;
    }
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      alert('Please enter a valid budget.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const generatedMilestones = await geminiService.analyzeRequirements(title, description, budgetNum);
      setMilestones(generatedMilestones);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert('AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setTitle(template.title);
    setDescription(template.description);
    setBudget(template.budget.toString());
    setMilestones(template.milestones);
    setStep(2);
    setShowTemplates(false);
  };

  const handleCreate = async () => {
    if (!profile) return;
    
    const budgetNum = parseFloat(budget);
    if (profile.walletBalance < budgetNum) {
      alert(`Insufficient funds. You need $${budgetNum.toLocaleString()} to initialize this project escrow.`);
      navigate('/wallet');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Deduct from employer wallet
      const userRef = doc(db, 'users', profile.uid);
      try {
        await updateDoc(userRef, {
          walletBalance: profile.walletBalance - budgetNum
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
        throw error;
      }

      // 2. Add transaction record
      try {
        await addDoc(collection(db, 'transactions'), {
          userId: profile.uid,
          amount: budgetNum,
          type: 'escrow_lock',
          description: `Escrow locked for project: ${title}`,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'transactions');
      }

      const projectData = {
        title,
        description,
        employerId: profile.uid,
        totalBudget: budgetNum,
        remainingBudget: budgetNum,
        status: 'open',
        escrowStatus: 'funded',
        createdAt: new Date().toISOString()
      };

      let projectRef;
      try {
        projectRef = await addDoc(collection(db, 'projects'), projectData);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'projects');
      }

      if (!projectRef) return;

      // Add milestones
      for (let i = 0; i < milestones.length; i++) {
        const milestoneData = {
          projectId: projectRef.id,
          title: milestones[i].title,
          description: milestones[i].description,
          budget: milestones[i].budget,
          status: 'pending',
          order: i
        };
        try {
          await addDoc(collection(db, `projects/${projectRef.id}/milestones`), milestoneData);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `projects/${projectRef.id}/milestones`);
        }
      }

      // Add notification
      const notificationData = {
        userId: profile.uid,
        title: 'Project Deployed',
        message: `Your project "${title}" is now live and awaiting talent.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      };
      try {
        await addDoc(collection(db, 'notifications'), notificationData);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'notifications');
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#ffffff']
      });

      setTimeout(() => {
        navigate(`/projects/${projectRef.id}`);
      }, 2000);
    } catch (error: any) {
      console.error(error);
      try {
        const errInfo = JSON.parse(error.message);
        alert(`Failed to create project: ${errInfo.error}`);
      } catch {
        alert('Failed to create project. Please check your connection and try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans py-16 px-6 text-white">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] mb-10 hover:text-white transition-all group uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Terminal
        </button>

        <div className="bg-[#0A0A0A] rounded-[48px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-zinc-900 to-black p-12 text-white relative overflow-hidden border-b border-white/5">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Layout className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-emerald-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Sparkles className="text-emerald-400 w-8 h-8" />
                </div>
                <h1 className="text-4xl font-display font-bold tracking-tight">Autonomous Project Architect</h1>
              </div>
              <p className="text-zinc-400 text-lg max-w-xl leading-relaxed font-light">
                Decompose your requirements into actionable, verifiable milestones using our neural project engine.
              </p>
            </div>
          </div>

          <div className="p-12">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowTemplates(true)}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                    >
                      <Lightbulb className="w-5 h-5" />
                      Use Project Template
                    </button>
                  </div>

                  <motion.form 
                    onSubmit={handleAnalyze} 
                    className="space-y-10"
                  >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Layout className="w-3 h-3 text-emerald-400" />
                          Project Title
                        </label>
                        <input 
                          type="text" 
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all text-xl font-bold placeholder:text-zinc-700"
                          placeholder="e.g. Smart Contract Audit"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          Total Escrow Budget ($)
                        </label>
                        <input 
                          type="number" 
                          required
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all text-2xl font-bold placeholder:text-zinc-700"
                          placeholder="5000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        Detailed Brief
                      </label>
                      <textarea 
                        required
                        rows={9}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[32px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all resize-none leading-relaxed text-zinc-300 placeholder:text-zinc-700 font-light"
                        placeholder="Describe the scope, technical stack, and expected deliverables..."
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full py-6 bg-emerald-500 text-black rounded-[32px] font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-emerald-500/20 disabled:opacity-50 text-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Neural Analysis in Progress...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        Generate AI Roadmap
                      </>
                    )}
                  </button>
                </motion.form>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-white tracking-tight">AI-Generated Roadmap</h2>
                      <p className="text-zinc-500 text-sm mt-1 font-light">Optimized for autonomous verification protocols.</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full flex items-center gap-2 uppercase tracking-widest border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Verified Logic
                    </span>
                  </div>

                  <div className="space-y-6">
                    {milestones.map((m, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-white/5 border border-white/10 rounded-[32px] relative group hover:border-emerald-500/30 transition-all"
                      >
                        <div className="absolute -left-4 top-8 w-10 h-10 bg-emerald-500 text-black text-xs font-bold flex items-center justify-center rounded-2xl shadow-xl shadow-emerald-500/20">
                          {idx + 1}
                        </div>
                        <div className="flex justify-between items-start mb-4 pl-8">
                          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{m.title}</h3>
                          <span className="font-display font-bold text-white text-xl">${m.budget}</span>
                        </div>
                        <p className="text-zinc-400 pl-8 leading-relaxed font-light">{m.description}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 pt-6">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-5 bg-white/5 border border-white/10 rounded-[32px] font-bold text-zinc-400 hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px]"
                    >
                      Refine Requirements
                    </button>
                    <button 
                      onClick={handleCreate}
                      disabled={isAnalyzing}
                      className="flex-[2] py-5 bg-emerald-500 text-black rounded-[32px] font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 text-lg"
                    >
                      {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
                      Deploy Project & Escrow
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ProjectTemplates 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)} 
        onSelectTemplate={handleTemplateSelect} 
      />
    </div>
  );
}
