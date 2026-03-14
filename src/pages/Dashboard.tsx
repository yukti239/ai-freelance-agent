import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Project } from '../types';
import SearchFilters, { FilterOptions } from '../components/SearchFilters';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  Shield,
  Bell,
  Wallet,
  BarChart3,
  ChevronRight,
  Sparkles,
  User as UserIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [isSwitching, setIsSwitching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    budgetRange: [0, 50000],
    category: 'All',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const toggleRole = async () => {
    if (!profile) return;
    setIsSwitching(true);
    try {
      const newRole = profile.role === 'employer' ? 'freelancer' : 'employer';
      await updateDoc(doc(db, 'users', profile.uid), {
        role: newRole
      });
    } catch (error) {
      console.error("Error switching role:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  useEffect(() => {
    if (!profile) return;

    // Fetch Projects
    let q;
    if (profile.role === 'employer') {
      q = query(collection(db, 'projects'), where('employerId', '==', profile.uid), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'projects'), where('status', 'in', ['open', 'active']), orderBy('createdAt', 'desc'));
    }

    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projectData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Project));
      setAllProjects(projectData);
      setLoading(false);
    });

    // Fetch Notifications
    const notifQ = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribeNotifs = onSnapshot(notifQ, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeProjects();
      unsubscribeNotifs();
    };
  }, [profile]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = allProjects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(project => filters.status.includes(project.status));
    }

    // Budget range filter
    filtered = filtered.filter(project =>
      project.totalBudget >= filters.budgetRange[0] &&
      project.totalBudget <= filters.budgetRange[1]
    );

    // Category filter (mock implementation - would need category field in projects)
    // For now, we'll skip this as projects don't have categories yet

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'totalBudget':
          aValue = a.totalBudget;
          bValue = b.totalBudget;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allProjects, searchQuery, filters]);

  const tabFilteredProjects = filteredProjects.filter(p => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'open': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Autonomous Escrow Active
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-4">
              Hello, {profile?.displayName?.split(' ')[0]}
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl leading-relaxed font-light">
              Your AI agent is currently monitoring <span className="text-white font-medium">{projects.length} projects</span>. 
              Escrow liquidity is <span className="text-emerald-400 font-medium">Verified</span>.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={toggleRole}
              disabled={isSwitching}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all disabled:opacity-50 backdrop-blur-xl"
            >
              {isSwitching ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <RefreshCw className="w-4 h-4" />}
              Switch to {profile?.role === 'employer' ? 'Freelancer' : 'Employer'}
            </button>
            {profile?.role === 'employer' && (
              <Link 
                to="/create-project"
                className="group flex items-center gap-3 px-8 py-3 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20"
              >
                <Plus className="w-5 h-5" />
                Deploy Project
              </Link>
            )}
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* PFI Score Card */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 bg-[#0A0A0A] rounded-[40px] border border-white/5 p-10 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Professional Fidelity Index
                </h3>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Elite Tier</span>
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <p className="text-9xl font-display font-bold text-white tracking-tighter leading-none">
                  {profile?.pfiScore || 500}
                </p>
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-bold text-xl">/ 1000</span>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +12.5%
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(profile?.pfiScore || 500) / 10}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Reliability</p>
                    <p className="text-lg font-bold text-white">99.4%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">AI Trust Score</p>
                    <p className="text-lg font-bold text-white">High</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

            {/* Ecosystem Stats */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="bg-[#0A0A0A] rounded-[40px] border border-white/5 p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8">Ecosystem Value</h3>
                  <p className="text-sm font-medium text-zinc-500 mb-2">Total Escrow Managed</p>
                  <p className="text-5xl font-display font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                    ${projects.reduce((acc, p) => acc + p.totalBudget, 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-zinc-800 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i + 10}/32/32`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    +12 Active Partners
                  </span>
                </div>
              </div>

              {/* AI Agent Activity */}
              <div className="bg-[#0A0A0A] rounded-[40px] border border-white/5 p-8 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Agent Activity</h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                
                <div className="space-y-6">
                  {[
                    { icon: Clock, text: "Verifying Milestone 3", sub: "Project: AI Dashboard", time: "2m ago" },
                    { icon: Shield, text: "Escrow Locked", sub: "Project: Smart Contract", time: "15m ago" },
                    { icon: Zap, text: "PFI Score Updated", sub: "System Event", time: "1h ago" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                        <item.icon className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.text}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{item.sub}</p>
                      </div>
                      <span className="text-[10px] text-zinc-600 font-medium">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
        </div>

        {/* Project Section */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2 p-1.5 bg-[#0A0A0A] rounded-2xl w-fit border border-white/5">
              {(['all', 'active', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-white text-black shadow-xl'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Link
              to="/create-project"
              className="px-6 py-3 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          <SearchFilters
            onSearch={setSearchQuery}
            onFilter={setFilters}
            activeFilters={filters}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest animate-pulse">Synchronizing with Agent...</p>
            </div>
          ) : tabFilteredProjects.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0A0A0A] border border-dashed border-white/10 rounded-[48px] p-32 text-center"
            >
              <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-zinc-800" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">No active deployments</h3>
              <p className="text-zinc-500 max-w-xs mx-auto mb-10 font-light">
                Your autonomous agent is ready. Deploy your first project to begin the escrow cycle.
              </p>
              {profile?.role === 'employer' && (
                <Link 
                  to="/create-project"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5"
                >
                  <Plus className="w-5 h-5" />
                  Initialize Project
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {tabFilteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                  >
                    <Link 
                      to={`/projects/${project.id}`}
                      className="group block bg-[#0A0A0A] border border-white/5 p-10 rounded-[48px] hover:border-emerald-500/30 transition-all duration-500 hover:bg-[#0F0F0F] relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-10 transition-opacity">
                        <ArrowRight className="w-24 h-24 -rotate-45" />
                      </div>

                      <div className="flex justify-between items-start mb-10">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${getStatusStyles(project.status)}`}>
                          {project.status}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Escrow Value</p>
                          <p className="text-3xl font-display font-bold text-white tracking-tight">${project.totalBudget.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <h3 className="text-3xl font-display font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-zinc-500 text-base line-clamp-2 mb-10 leading-relaxed font-light">
                        {project.description}
                      </p>
                      
                      <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                            <UserIcon className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Assignment</p>
                            <p className="text-xs font-bold text-white">
                              {project.freelancerId ? 'Freelancer Assigned' : 'Open for Proposals'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 group-hover:text-white transition-all">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Analyze</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
}

