import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Briefcase,
  User,
  Star
} from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}

export interface FilterOptions {
  status: string[];
  budgetRange: [number, number];
  category: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const categories = [
  'All',
  'Web Development',
  'Mobile Development',
  'Backend Development',
  'Design',
  'Blockchain',
  'AI/ML',
  'Data Science',
  'DevOps',
  'Other'
];

const statusOptions = [
  { value: 'open', label: 'Open', icon: Play, color: 'text-emerald-400' },
  { value: 'active', label: 'Active', icon: Clock, color: 'text-blue-400' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-zinc-400' },
  { value: 'disputed', label: 'Disputed', icon: AlertCircle, color: 'text-red-400' }
];

export default function SearchFilters({ onSearch, onFilter, activeFilters }: SearchFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localFilters, setLocalFilters] = useState<FilterOptions>(activeFilters);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilter(newFilters);
  };

  const toggleStatus = (status: string) => {
    const currentStatuses = localFilters.status;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    updateFilter('status', newStatuses);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      status: [],
      budgetRange: [0, 50000],
      category: 'All',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setLocalFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  const activeFilterCount = localFilters.status.length +
    (localFilters.category !== 'All' ? 1 : 0) +
    (localFilters.budgetRange[0] > 0 || localFilters.budgetRange[1] < 50000 ? 1 : 0);

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects by title, description, or skills..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none text-white placeholder:text-zinc-600 font-medium"
          />
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            isFilterOpen || activeFilterCount > 0
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-900/50 border border-white/5 text-zinc-400 hover:bg-white/5'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-6 h-6 bg-black/20 rounded-full flex items-center justify-center text-sm">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <motion.div
        initial={false}
        animate={{ height: isFilterOpen ? 'auto' : 0, opacity: isFilterOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
                Project Status
              </label>
              <div className="space-y-2">
                {statusOptions.map(status => {
                  const Icon = status.icon;
                  const isActive = localFilters.status.includes(status.value);
                  return (
                    <button
                      key={status.value}
                      onClick={() => toggleStatus(status.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                      <span className={`text-sm font-bold ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {status.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
                Category
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-zinc-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
                Budget Range
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-600">Min: ${localFilters.budgetRange[0].toLocaleString()}</label>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={localFilters.budgetRange[0]}
                    onChange={(e) => updateFilter('budgetRange', [parseInt(e.target.value), localFilters.budgetRange[1]])}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Max: ${localFilters.budgetRange[1].toLocaleString()}</label>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={localFilters.budgetRange[1]}
                    onChange={(e) => updateFilter('budgetRange', [localFilters.budgetRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
                Sort By
              </label>
              <div className="space-y-3">
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none text-white"
                >
                  <option value="createdAt" className="bg-zinc-900">Date Created</option>
                  <option value="totalBudget" className="bg-zinc-900">Budget</option>
                  <option value="title" className="bg-zinc-900">Title</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateFilter('sortOrder', 'asc')}
                    className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                      localFilters.sortOrder === 'asc'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    ↑ Asc
                  </button>
                  <button
                    onClick={() => updateFilter('sortOrder', 'desc')}
                    className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                      localFilters.sortOrder === 'desc'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    ↓ Desc
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="flex justify-end mt-6 pt-6 border-t border-white/5">
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}