import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../App';
import { Project, Transaction } from '../types';
import { db } from '../firebase';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Star,
  Calendar,
  Target,
  Zap,
  Briefcase
} from 'lucide-react';

interface AnalyticsData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
  averageProjectValue: number;
  successRate: number;
  averageCompletionTime: number;
  topCategories: { category: string; count: number }[];
  monthlyStats: { month: string; projects: number; earnings: number }[];
}

export default function AnalyticsDashboard() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');

  useEffect(() => {
    if (!profile) return;
    loadAnalytics();
  }, [profile, timeRange]);

  const loadAnalytics = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      // Get projects based on role
      let projectsQuery;
      if (profile.role === 'employer') {
        projectsQuery = query(collection(db, 'projects'), where('employerId', '==', profile.uid));
      } else {
        // For freelancers, get projects they've worked on
        projectsQuery = query(collection(db, 'projects'), where('freelancerId', '==', profile.uid));
      }

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Project) }));

      // Get transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Transaction) }));

      // Calculate analytics
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;

      const totalEarnings = transactions
        .filter(t => t.type === 'payment' || t.type === 'escrow_release')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const averageProjectValue = totalProjects > 0 ? totalEarnings / totalProjects : 0;
      const successRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

      // Calculate average completion time (mock data for now)
      const averageCompletionTime = completedProjects > 0 ? 21 : 0; // days

      // Top categories (mock data based on project analysis)
      const topCategories = [
        { category: 'Web Development', count: Math.floor(totalProjects * 0.4) },
        { category: 'Mobile Development', count: Math.floor(totalProjects * 0.3) },
        { category: 'Design', count: Math.floor(totalProjects * 0.2) },
        { category: 'Backend Development', count: Math.floor(totalProjects * 0.1) }
      ].filter(cat => cat.count > 0);

      // Monthly stats (mock data)
      const monthlyStats = [
        { month: 'Jan', projects: 2, earnings: 1200 },
        { month: 'Feb', projects: 3, earnings: 1800 },
        { month: 'Mar', projects: 1, earnings: 800 },
        { month: 'Apr', projects: 4, earnings: 2400 },
        { month: 'May', projects: 2, earnings: 1600 },
        { month: 'Jun', projects: 3, earnings: 2100 }
      ];

      setAnalytics({
        totalProjects,
        activeProjects,
        completedProjects,
        totalEarnings,
        averageProjectValue,
        successRate,
        averageCompletionTime,
        topCategories,
        monthlyStats
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      title: 'Total Projects',
      value: analytics.totalProjects,
      icon: Briefcase,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Active Projects',
      value: analytics.activeProjects,
      icon: Clock,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Completed Projects',
      value: analytics.completedProjects,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Earnings',
      value: `₹${analytics.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Success Rate',
      value: `${analytics.successRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Avg. Project Value',
      value: `₹${analytics.averageProjectValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-zinc-500">Insights into your project performance and earnings</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-8">
        {(['30d', '90d', '1y'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              timeRange === range
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-900/50 border border-white/5 text-zinc-400 hover:bg-white/5'
            }`}
          >
            {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <h3 className="text-zinc-400 font-bold">{stat.title}</h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Performance Chart */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6">Monthly Performance</h3>
          <div className="space-y-4">
            {analytics.monthlyStats.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-400">{month.month}</span>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">{month.projects} projects</p>
                    <p className="text-sm text-zinc-500">${month.earnings.toLocaleString()} earned</p>
                  </div>
                </div>
                <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(month.earnings / Math.max(...analytics.monthlyStats.map(m => m.earnings))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6">Top Categories</h3>
          <div className="space-y-4">
            {analytics.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-400">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">{category.category}</p>
                    <p className="text-sm text-zinc-500">{category.count} projects</p>
                  </div>
                </div>
                <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(category.count / Math.max(...analytics.topCategories.map(c => c.count))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-12 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-zinc-400 mb-2">Completion Rate</p>
                <p className="text-2xl font-bold text-emerald-400">{analytics.successRate.toFixed(1)}%</p>
                <p className="text-sm text-zinc-500">Above average performance</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-2">Average Completion Time</p>
                <p className="text-2xl font-bold text-blue-400">{analytics.averageCompletionTime} days</p>
                <p className="text-sm text-zinc-500">Faster than industry average</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}