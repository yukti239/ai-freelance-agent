import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  X,
  Briefcase,
  Code,
  Palette,
  Globe,
  Smartphone,
  Database,
  Zap,
  Shield,
  Star
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  estimatedBudget: number;
  estimatedDuration: string;
  features: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const templates: ProjectTemplate[] = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Full-stack web application with modern UI/UX',
    category: 'Web Development',
    icon: Globe,
    estimatedBudget: 5000,
    estimatedDuration: '4-6 weeks',
    features: ['Responsive Design', 'User Authentication', 'Database Integration', 'API Development'],
    difficulty: 'Intermediate'
  },
  {
    id: 'mobile-app',
    name: 'Mobile Application',
    description: 'Cross-platform mobile app for iOS and Android',
    category: 'Mobile Development',
    icon: Smartphone,
    estimatedBudget: 8000,
    estimatedDuration: '6-8 weeks',
    features: ['Native Performance', 'Offline Support', 'Push Notifications', 'App Store Deployment'],
    difficulty: 'Advanced'
  },
  {
    id: 'api-backend',
    name: 'API Backend',
    description: 'RESTful API with comprehensive documentation',
    category: 'Backend Development',
    icon: Database,
    estimatedBudget: 3000,
    estimatedDuration: '2-4 weeks',
    features: ['RESTful Design', 'Authentication', 'Rate Limiting', 'API Documentation'],
    difficulty: 'Intermediate'
  },
  {
    id: 'ui-design',
    name: 'UI/UX Design',
    description: 'Complete user interface and experience design',
    category: 'Design',
    icon: Palette,
    estimatedBudget: 2000,
    estimatedDuration: '1-3 weeks',
    features: ['Wireframes', 'Mockups', 'Prototypes', 'Design System'],
    difficulty: 'Beginner'
  },
  {
    id: 'blockchain-dapp',
    name: 'Blockchain DApp',
    description: 'Decentralized application with smart contracts',
    category: 'Blockchain',
    icon: Shield,
    estimatedBudget: 10000,
    estimatedDuration: '8-12 weeks',
    features: ['Smart Contracts', 'Web3 Integration', 'Wallet Connection', 'Token Integration'],
    difficulty: 'Advanced'
  },
  {
    id: 'ai-integration',
    name: 'AI Integration',
    description: 'AI-powered features and machine learning integration',
    category: 'AI/ML',
    icon: Zap,
    estimatedBudget: 6000,
    estimatedDuration: '3-5 weeks',
    features: ['AI APIs', 'Machine Learning', 'Natural Language Processing', 'Data Analysis'],
    difficulty: 'Advanced'
  }
];

interface ProjectTemplatesProps {
  isOpen: boolean;
  onSelectTemplate: (template: ProjectTemplate) => void;
  onClose: () => void;
}

export default function ProjectTemplates({ onSelectTemplate, onClose }: ProjectTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/10';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10';
      case 'Advanced': return 'text-red-400 bg-red-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-[32px] max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">Project Templates</h2>
              <p className="text-zinc-500">Choose from pre-built templates to accelerate your project creation</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    selectedCategory === category
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                      <template.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                    {template.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {template.features.slice(0, 3).map(feature => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-zinc-400">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Budget</p>
                      <p className="text-sm font-bold text-emerald-400">${template.estimatedBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Duration</p>
                      <p className="text-sm font-bold text-zinc-300">{template.estimatedDuration}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">No templates found matching your criteria</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}