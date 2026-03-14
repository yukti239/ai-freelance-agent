import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Shield,
  Briefcase,
  Save,
  CheckCircle2,
  AlertCircle,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Award,
  Settings,
  Edit3,
  Plus,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  FileText,
  BarChart3,
  Users,
  Check,
  X,
  Eye,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

interface ProfileStats {
  totalProjects: number;
  completedProjects: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: string;
  successRate: number;
}

interface RecentActivity {
  id: string;
  type: 'project_created' | 'project_completed' | 'payment_received' | 'review_received';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
}

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verified: boolean;
}

export default function Profile() {
  const { profile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'activity' | 'settings'>('overview');
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    photoURL: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    hourlyRate: '',
    availability: 'available' as 'available' | 'busy' | 'unavailable',
    languages: [] as string[],
    timezone: ''
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || profile.name || '',
        bio: profile.bio || '',
        photoURL: profile.photoURL || '',
        location: (profile as any).location || '',
        website: (profile as any).website || '',
        github: (profile as any).github || '',
        linkedin: (profile as any).linkedin || '',
        hourlyRate: (profile as any).hourlyRate || '',
        availability: (profile as any).availability || 'available',
        languages: (profile as any).languages || [],
        timezone: (profile as any).timezone || ''
      });
    }
  }, [profile]);

  // Load profile statistics
  useEffect(() => {
    if (profile && user) {
      loadProfileStats();
      loadRecentActivity();
      loadSkills();
    }
  }, [profile, user]);

  const loadProfileStats = async () => {
    if (!profile) return;

    try {
      // Load projects based on role
      let projectsQuery;
      if (profile.role === 'employer') {
        projectsQuery = query(collection(db, 'projects'), where('employerId', '==', profile.uid));
      } else {
        projectsQuery = query(collection(db, 'projects'), where('freelancerId', '==', profile.uid));
      }

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

      // Load transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

      // Calculate stats
      const totalProjects = projects.length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalEarnings = transactions
        .filter(t => t.type === 'payment' || t.type === 'escrow_release')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        totalProjects,
        completedProjects,
        totalEarnings,
        averageRating: 4.8, // Mock data - would come from reviews
        responseTime: '< 2 hours', // Mock data
        successRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    if (!profile) return;

    try {
      // Mock recent activity - in real app, this would come from a dedicated activity collection
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'project_completed',
          title: 'Project Completed',
          description: 'Successfully completed "Website Redesign" project',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          amount: 2500
        },
        {
          id: '2',
          type: 'payment_received',
          title: 'Payment Received',
          description: 'Received payment for milestone completion',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          amount: 800
        },
        {
          id: '3',
          type: 'review_received',
          title: 'New Review',
          description: 'Received 5-star review from client',
          timestamp: new Date(Date.now() - 259200000).toISOString()
        }
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const loadSkills = async () => {
    if (!profile) return;

    // Mock skills - in real app, this would come from user skills collection
    const mockSkills: Skill[] = [
      { name: 'React', level: 'Expert', verified: true },
      { name: 'TypeScript', level: 'Advanced', verified: true },
      { name: 'Node.js', level: 'Advanced', verified: false },
      { name: 'Python', level: 'Intermediate', verified: true },
      { name: 'UI/UX Design', level: 'Intermediate', verified: false }
    ];

    setSkills(mockSkills);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skillName: string) => {
    if (skillName.trim() && !skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      setSkills([...skills, { name: skillName.trim(), level: 'Beginner', verified: false }]);
    }
  };

  const removeSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };

  if (!profile) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-400 mb-2">Profile Not Found</h2>
          <p className="text-zinc-600">Unable to load your profile. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold mb-2">User Profile</h1>
        <p className="text-zinc-500">Manage your identity, showcase your skills, and track your progress on TrustBridge.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
          { id: 'activity', label: 'Activity', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 text-center sticky top-8"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 overflow-hidden">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt={formData.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-12 h-12 text-emerald-500" />
                )}
              </div>
              <h2 className="text-xl font-bold mb-1">{formData.displayName || 'Anonymous User'}</h2>
              <p className="text-zinc-500 text-sm mb-2">{profile.email}</p>
              {(profile as any).location && (
                <p className="text-zinc-600 text-sm mb-6 flex items-center justify-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {(profile as any).location}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  {profile.role} Account
                </span>
              </div>

              {/* PFI Score */}
              <div className="p-4 bg-black/20 rounded-2xl border border-white/5 mb-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Trust Score</p>
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-xl font-bold text-white">{profile.pfiScore}</span>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="p-4 bg-black/20 rounded-2xl border border-white/5 mb-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Wallet Balance</p>
                <p className="text-xl font-bold text-white">${profile.walletBalance?.toLocaleString() || '0'}</p>
              </div>

              {/* Availability Status */}
              <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Availability</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                  formData.availability === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  formData.availability === 'busy' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    formData.availability === 'available' ? 'bg-emerald-400' :
                    formData.availability === 'busy' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  {formData.availability.toUpperCase()}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats and Bio */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8"
              >
                <h3 className="text-xl font-bold mb-6">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
                      <Briefcase className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Projects</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.completedProjects}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-yellow-500/20">
                      <DollarSign className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">${stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Earnings</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-purple-500/20">
                      <Star className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Avg Rating</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-orange-500/20">
                      <Clock className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.responseTime}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-green-500/20">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Success Rate</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bio Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">About</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {formData.bio ? (
                <p className="text-zinc-300 leading-relaxed">{formData.bio}</p>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500 mb-4">No bio added yet</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all"
                  >
                    Add Bio
                  </button>
                </div>
              )}

              {/* Skills Preview */}
              {skills.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill.name}
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          skill.verified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {skill.name}
                        {skill.verified && <Check className="w-3 h-3 inline ml-1" />}
                      </span>
                    ))}
                    {skills.length > 5 && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                        +{skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-8">
          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Skills & Expertise</h3>
              <button
                onClick={() => {
                  const skillName = prompt('Enter skill name:');
                  if (skillName) addSkill(skillName);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        skill.level === 'Expert' ? 'bg-emerald-400' :
                        skill.level === 'Advanced' ? 'bg-blue-400' :
                        skill.level === 'Intermediate' ? 'bg-yellow-400' : 'bg-zinc-400'
                      }`} />
                      <span className="font-bold text-white">{skill.name}</span>
                      {skill.verified && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{skill.level}</span>
                      <button
                        onClick={() => removeSkill(skill.name)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-zinc-400 mb-2">No Skills Added</h4>
                <p className="text-zinc-600 mb-6">Showcase your expertise by adding your skills</p>
                <button
                  onClick={() => {
                    const skillName = prompt('Enter skill name:');
                    if (skillName) addSkill(skillName);
                  }}
                  className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all"
                >
                  Add Your First Skill
                </button>
              </div>
            )}
          </motion.div>

          {/* Portfolio/Projects Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8"
          >
            <h3 className="text-xl font-bold mb-6">Portfolio & Projects</h3>
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-zinc-400 mb-2">Portfolio Coming Soon</h4>
              <p className="text-zinc-600">This feature will allow you to showcase your completed projects and work samples.</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8"
        >
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    activity.type === 'project_completed' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    activity.type === 'payment_received' ? 'bg-blue-500/10 border-blue-500/20' :
                    'bg-purple-500/10 border-purple-500/20'
                  }`}>
                    {activity.type === 'project_completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                     activity.type === 'payment_received' ? <DollarSign className="w-5 h-5 text-blue-400" /> :
                     <Star className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{activity.title}</h4>
                    <p className="text-sm text-zinc-400">{activity.description}</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">+${activity.amount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-zinc-400 mb-2">No Recent Activity</h4>
              <p className="text-zinc-600">Your recent activities will appear here once you start working on projects.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Account Settings</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all border border-white/10"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    disabled={!isEditing}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-zinc-500 focus:outline-none transition-all cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    disabled={!isEditing}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    disabled={!isEditing}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">GitHub</label>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({...formData, github: e.target.value})}
                    disabled={!isEditing}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    disabled={!isEditing}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">Profile Picture URL</label>
              <input
                type="text"
                value={formData.photoURL}
                onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
                disabled={!isEditing}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">Bio / Professional Summary</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                disabled={!isEditing}
                rows={4}
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black animate-spin rounded-full" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    if (profile) {
                      setFormData({
                        displayName: profile.displayName || profile.name || '',
                        bio: profile.bio || '',
                        photoURL: profile.photoURL || '',
                        location: (profile as any).location || '',
                        website: (profile as any).website || '',
                        github: (profile as any).github || '',
                        linkedin: (profile as any).linkedin || '',
                        hourlyRate: (profile as any).hourlyRate || '',
                        availability: (profile as any).availability || 'available',
                        languages: (profile as any).languages || [],
                        timezone: (profile as any).timezone || ''
                      });
                    }
                  }}
                  className="px-8 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all border border-white/10"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </motion.div>
      )}
    </div>
  );
}
