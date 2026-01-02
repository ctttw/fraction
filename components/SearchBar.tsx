import React from 'react';
import { Search, MapPin, Filter, X, Star } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  regionFilter: string;
  setRegionFilter: (region: string) => void;
  scoreFilter: string;
  setScoreFilter: (score: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  regionFilter,
  setRegionFilter,
  scoreFilter,
  setScoreFilter,
  showFavoritesOnly,
  setShowFavoritesOnly,
}) => {
  return (
    <div className="glass-card rounded-[2.5rem] p-3 shadow-xl shadow-indigo-100/40 ring-1 ring-white/60">
        <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-14 pr-5 py-4 bg-white/70 hover:bg-white/90 focus:bg-white border-none rounded-[2rem] text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none font-medium text-base shadow-sm"
                    placeholder="搜尋學校或科系 (例如: 台中一中)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
                )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {/* Region Filter */}
                <div className="relative group min-w-[150px]">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="block w-full pl-11 pr-10 py-4 bg-white/70 hover:bg-white/90 focus:bg-white border-none rounded-[2rem] text-slate-700 font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer shadow-sm text-sm"
                    >
                        <option value="all">所有地區</option>
                        <option value="Taichung">台中市</option>
                        <option value="Nantou">南投縣</option>
                    </select>
                </div>

                {/* Score Filter */}
                <div className="relative group min-w-[150px]">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <select
                        value={scoreFilter}
                        onChange={(e) => setScoreFilter(e.target.value)}
                        className="block w-full pl-11 pr-10 py-4 bg-white/70 hover:bg-white/90 focus:bg-white border-none rounded-[2rem] text-slate-700 font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer shadow-sm text-sm"
                    >
                        <option value="all">所有積分</option>
                        <option value="30">30分 (5A)</option>
                        <option value="25">25分以上</option>
                        <option value="20">20分以上</option>
                        <option value="15">15分以上</option>
                    </select>
                </div>

                {/* Favorites Toggle */}
                <button 
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex items-center justify-center p-4 aspect-square rounded-[2rem] transition-all duration-300 shadow-sm ${
                        showFavoritesOnly 
                        ? 'bg-amber-50 text-amber-500 ring-2 ring-amber-100' 
                        : 'bg-white/70 text-slate-400 hover:bg-white hover:text-slate-600 hover:scale-105'
                    }`}
                    title="只顯示收藏"
                >
                     <Star className={`h-5 w-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default SearchBar;