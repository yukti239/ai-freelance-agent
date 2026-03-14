import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Project, Milestone, Submission } from '../types';
import { geminiService } from '../services/geminiService';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Send, 
  FileText, 
  DollarSign,
  User,
  Zap,
  Loader2,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Activity,
  Wallet,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import confetti from 'canvas-confetti';

export default function ProjectDetails() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const unsubscribeProject = onSnapshot(doc(db, 'projects', id), (doc) => {
      if (doc.exists()) {
        setProject({ id: doc.id, ...(doc.data() as any) } as Project);
      }
    });

    const unsubscribeMilestones = onSnapshot(
      query(collection(db, `projects/${id}/milestones`), orderBy('order')),
      (snapshot) => {
        setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Milestone)));
        setLoading(false);
      }
    );

    return () => {
      unsubscribeProject();
      unsubscribeMilestones();
    };
  }, [id]);

  const handleApply = async () => {
    if (!project || !profile || !id) return;
    try {
      try {
        await updateDoc(doc(db, 'projects', id), {
          freelancerId: profile.uid,
          status: 'active'
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
      }
      
      // Add notification for employer
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: project.employerId,
          title: 'Project Accepted',
          message: `${profile.displayName} has accepted your project: ${project.title}`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'notifications');
      }
    } catch (error: any) {
      console.error(error);
      try {
        const errInfo = JSON.parse(error.message);
        alert(`Failed to accept project: ${errInfo.error}`);
      } catch {
        alert('Failed to accept project. Please try again.');
      }
    }
  };

  const handleSubmitWork = async (milestone: Milestone) => {
    if (!project || !profile || !id) return;
    setSubmitting(milestone.id);
    try {
      // 1. Save submission
      try {
        await addDoc(collection(db, 'submissions'), {
          milestoneId: milestone.id,
          projectId: id,
          freelancerId: profile.uid,
          content: submissionContent,
          submittedAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'submissions');
      }

      // 2. AI Evaluation
      const evaluation = await geminiService.evaluateSubmission(milestone.title, milestone.description, submissionContent);
      
      // 3. Update Milestone Status
      try {
        await updateDoc(doc(db, `projects/${id}/milestones`, milestone.id), {
          status: evaluation.status,
          aiFeedback: evaluation.feedback
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `projects/${id}/milestones/${milestone.id}`);
      }

      // 4. Add notification for both
      const notifData = {
        title: `Milestone ${evaluation.status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `AI Agent has reviewed the submission for ${milestone.title}.`,
        type: evaluation.status === 'approved' ? 'success' : 'warning',
        read: false,
        createdAt: new Date().toISOString()
      };
      
      try {
        await addDoc(collection(db, 'notifications'), { ...notifData, userId: project.employerId });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'notifications');
      }
      
      try {
        await addDoc(collection(db, 'notifications'), { ...notifData, userId: profile.uid });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'notifications');
      }

      // 5. Update PFI and Release Payment if approved
      if (evaluation.status === 'approved') {
        // Update Freelancer PFI
        const userRef = doc(db, 'users', profile.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentPfi = userSnap.data().pfiScore || 500;
          const currentBalance = userSnap.data().walletBalance || 0;
          const newPfi = Math.min(1000, currentPfi + (evaluation.score / 10));
          
          try {
            await updateDoc(userRef, { 
              pfiScore: newPfi,
              walletBalance: currentBalance + milestone.budget
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
          }
        }

        // Add transaction for freelancer
        try {
          await addDoc(collection(db, 'transactions'), {
            userId: profile.uid,
            amount: milestone.budget,
            type: 'payment_received',
            description: `Payment released for milestone: ${milestone.title}`,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'transactions');
        }

        // Update Project Remaining Budget
        try {
          await updateDoc(doc(db, 'projects', id), {
            remainingBudget: (project.remainingBudget || project.totalBudget) - milestone.budget
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
        }

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#ffffff']
        });
      }

      setSubmissionContent('');
      setActiveMilestone(null);
    } catch (error: any) {
      console.error(error);
      try {
        const errInfo = JSON.parse(error.message);
        alert(`Submission failed: ${errInfo.error}`);
      } catch {
        alert('AI evaluation failed. Please try again.');
      }
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDFDFC]"><Loader2 className="animate-spin text-stone-200" /></div>;
  if (!project) return <div>Project not found</div>;

  const isEmployer = profile?.uid === project.employerId;
  const isFreelancer = profile?.uid === project.freelancerId;
  const canApply = !project.freelancerId && profile?.role === 'freelancer';

  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-20 text-white">
      {/* Soft Header */}
      <div className="bg-[#0A0A0A] border-b border-white/5 pt-10 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] mb-8 hover:text-white transition-all group uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Terminal
          </button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
                  project.status === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {project.status}
                </span>
                <span className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">
                  Deployment ID: {project.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight mb-8 leading-tight">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-8 text-sm text-zinc-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <User className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1.5">Employer</p>
                    <p className="font-bold text-white leading-none">Verified Identity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Clock className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1.5">Initialized</p>
                    <p className="font-bold text-white leading-none">{formatDistanceToNow(new Date(project.createdAt))} ago</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0A0A0A] p-10 rounded-[40px] text-white min-w-[360px] border border-white/5 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700" />
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wallet className="w-32 h-32" />
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 relative z-10">Remaining Escrow Liquidity</p>
              <div className="flex items-baseline gap-2 relative z-10 mb-8">
                <span className="text-6xl font-display font-bold text-white tracking-tighter">${(project.remainingBudget ?? project.totalBudget).toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">USD</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 relative z-10">
                <span>Total Budget</span>
                <span>${project.totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-emerald-400 relative z-10 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 uppercase tracking-widest">
                <Shield className="w-4 h-4" />
                Autonomous Agent Secured
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Project Brief
            </h2>
            <div className="bg-[#0A0A0A] p-10 rounded-[40px] border border-white/5 leading-relaxed text-zinc-400 text-lg font-light">
              {project.description}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Milestones & AI Verification
              </h2>
              <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-4 py-2 rounded-full uppercase tracking-widest border border-white/5">
                {milestones.length} Phases
              </span>
            </div>
            
            <div className="space-y-6">
              {milestones.map((milestone, idx) => (
                <motion.div 
                  key={milestone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 group"
                >
                  <div className="p-10 flex flex-col md:flex-row items-start justify-between gap-10">
                    <div className="flex gap-8">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-zinc-500 shrink-0 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{milestone.title}</h3>
                        <p className="text-zinc-500 mb-8 leading-relaxed font-light">{milestone.description}</p>
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <span className="font-display font-bold text-white text-xl">${milestone.budget}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
                            milestone.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            milestone.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-white/5 text-zinc-500 border-white/10'
                          }`}>
                            {milestone.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isFreelancer && milestone.status !== 'approved' && (
                      <button 
                        onClick={() => setActiveMilestone(milestone)}
                        className="px-10 py-4 bg-white text-black text-sm font-bold rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 shrink-0"
                      >
                        Submit Work
                      </button>
                    )}
                  </div>

                  {milestone.aiFeedback && (
                    <div className="bg-emerald-500/[0.02] border-t border-white/5 p-10 flex gap-6">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] block mb-3">AI Agent Feedback:</span>
                        <p className="text-base text-zinc-400 leading-relaxed italic font-light">"{milestone.aiFeedback}"</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {canApply && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-emerald-500 p-12 rounded-[48px] text-black shadow-2xl shadow-emerald-500/20"
            >
              <h3 className="text-3xl font-display font-bold mb-6">Accept Project</h3>
              <p className="text-emerald-950 text-base mb-10 leading-relaxed font-medium">
                By accepting, you authorize the TrustBridge AI agent to manage your payouts based on quality verification protocols.
              </p>
              <button 
                onClick={handleApply}
                className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                <CheckCircle2 className="w-5 h-5" />
                Initialize Work
              </button>
            </motion.div>
          )}

          <div className="bg-[#0A0A0A] p-10 rounded-[48px] border border-white/5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Agent Live Status
            </h3>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-sm font-bold text-zinc-300">Escrow Vault Secured</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-sm font-bold text-zinc-300">QA Protocol Ready</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                <span className="text-sm font-bold text-zinc-600">Awaiting Submission</span>
              </div>
            </div>
            
            <div className="mt-10 pt-10 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">PFI Impact</span>
                <span className="text-xs font-bold text-emerald-400">+15 Points</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-2/3 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] p-10 rounded-[48px] border border-white/5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Project Participants
            </h3>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <User className="w-6 h-6 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Employer</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Verified Identity</p>
                </div>
              </div>
              {project.freelancerId ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <User className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Freelancer</p>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">PFI: {profile?.pfiScore || '...'}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white/[0.02] rounded-[32px] border border-dashed border-white/10 text-center">
                  <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Awaiting Talent</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {activeMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMilestone(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-[#0A0A0A] rounded-[48px] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl shadow-white/5">
                    <Send className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-display font-bold text-white tracking-tight">Submit Milestone Work</h3>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-2">{activeMilestone.title}</p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Work Deliverables / Proof of Work</label>
                    <textarea 
                      rows={10}
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[32px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all resize-none text-zinc-300 leading-relaxed font-light"
                      placeholder="Paste your code snippets, documentation links, or completed content here for AI agent verification..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={() => setActiveMilestone(null)}
                      className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-zinc-500 hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSubmitWork(activeMilestone)}
                      disabled={!submissionContent || !!submitting}
                      className="flex-[2] py-5 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      Submit for AI Agent Review
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
