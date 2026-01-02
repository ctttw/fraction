import React, { useState, useMemo, useEffect } from 'react';
import { SchoolData, SortField, SortOrder } from './types';
import ScoreTable from './components/ScoreTable';
import SearchBar from './components/SearchBar';
import ScoreChart from './components/ScoreChart';
import ReportModal from './components/ReportModal';
import { 
  GraduationCap, 
  BarChart2, 
  Table as TableIcon, 
  MessageSquarePlus, 
  Menu, 
  X, 
  Home, 
  History, 
  TrendingUp, 
  Sparkles,
  Loader2,
  ChevronRight,
  Search,
  School
} from 'lucide-react';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5KAEceBBZpV6dCfB1U00MPUVyoJvnvqplhZH2pbWtd01Kp5KRZ3khGgJ-xHZLi7jWzw/exec"; 

const App: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  // State
  const [data, setData] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeTab, setActiveTab] = useState<'list' | 'chart'>('list');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // New Features State
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem('ctttw_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Initialize search from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('search');
    if (query) {
      setSearchTerm(query);
    }
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavs = prev.includes(id) 
        ? prev.filter(fid => fid !== id)
        : [...prev, id];
      localStorage.setItem('ctttw_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!GOOGLE_SCRIPT_URL) {
          setData([]); 
          return;
        }
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        const fetchedData = Array.isArray(result) ? result : (result.data || []);
        setData(fetchedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = 
        item.school.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = 
        regionFilter === 'all' ? true : item.region === regionFilter;

      let matchesScore = true;
      if (scoreFilter !== 'all') {
          const scoreNum = parseInt(scoreFilter);
          if (scoreNum === 30) matchesScore = item.score === 30;
          else matchesScore = item.score >= scoreNum;
      }

      const matchesFavorites = showFavoritesOnly ? favorites.includes(item.id) : true;

      return matchesSearch && matchesRegion && matchesScore && matchesFavorites;
    });
  }, [data, searchTerm, regionFilter, scoreFilter, showFavoritesOnly, favorites]);

  // Sorting Logic
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valA: number | string = a[sortField];
      let valB: number | string = b[sortField];

      if (sortField === 'points') {
        const numA = valA === '未知' ? -1 : parseInt(valA as string, 10);
        const numB = valB === '未知' ? -1 : parseInt(valB as string, 10);
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      if (sortField === 'score') {
           return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, 'zh-Hant') 
          : valB.localeCompare(valA, 'zh-Hant');
      }
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const navLinks = [
    { name: '首頁', url: 'https://sites.google.com/view/ctttw', icon: Home },
    { name: '落點分析', url: 'https://ctttw.github.io/', icon: TrendingUp },
    { name: '歷年分數', url: 'https://ctttw.github.io/cttw/', icon: History },
  ];

  return (
    <div className="min-h-screen pb-12 font-sans overflow-x-hidden">
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        apiUrl={GOOGLE_SCRIPT_URL}
      />
      
      {/* Floating Island Navbar (Desktop) */}
      <nav className={`fixed top-6 left-0 right-0 z-50 transition-all duration-500 pointer-events-none hidden md:block ${scrolled ? 'transform -translate-y-2' : ''}`}>
        <div className="max-w-5xl mx-auto pointer-events-auto">
            <div className={`
                flex justify-between items-center px-6 py-3.5 rounded-[2rem] 
                transition-all duration-300 border
                ${scrolled 
                    ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-500/10 border-white/40' 
                    : 'bg-white/40 backdrop-blur-md shadow-sm border-white/20'
                }
            `}>
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="text-slate-800 font-bold tracking-tight text-lg">
                        中投區<span className="text-indigo-600">錄取分數</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-white/20">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.url} 
                            target="_blank"
                            className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-300"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="group bg-slate-900 hover:bg-indigo-600 text-white pl-4 pr-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md hover:shadow-indigo-500/30 flex items-center gap-2"
                >
                    <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                        <MessageSquarePlus className="h-4 w-4" />
                    </div>
                    協助回報
                </button>
            </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/20 px-4 py-4 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                    <GraduationCap className="h-5 w-5" />
                </div>
                <span className={`font-bold text-lg ${scrolled ? 'text-slate-800' : 'text-slate-800'}`}>中投區錄取分數</span>
             </div>
             <button onClick={() => setIsMenuOpen(true)} className="p-2.5 bg-white/50 backdrop-blur-md rounded-full text-slate-600 shadow-sm border border-white/50 active:scale-95 transition-transform">
                <Menu className="h-6 w-6" />
             </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[60] transform transition-all duration-300 md:hidden ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-900/60 transition-opacity duration-300 backdrop-blur-sm ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <span className="font-bold text-xl text-slate-800">選單</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                    <X className="h-6 w-6" />
                </button>
             </div>
             <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
                {navLinks.map((link) => (
                    <a key={link.name} href={link.url} target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold transition-colors group">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform text-indigo-500">
                             <link.icon className="h-5 w-5" />
                        </div>
                        {link.name}
                    </a>
                ))}
             </div>
             <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button onClick={() => {setIsMenuOpen(false); setIsReportModalOpen(true);}} className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-200 active:scale-95 transition-transform">
                    <MessageSquarePlus className="h-5 w-5" />
                    回報分數與錯誤
                </button>
             </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/60 shadow-sm backdrop-blur-md text-indigo-600 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <Sparkles className="h-3 w-3" />
                    {currentYear} 年度最新資料庫
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1] animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    探索你的 <br className="md:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">理想志願</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed animate-fade-in-up max-w-2xl mx-auto" style={{animationDelay: '0.2s'}}>
                    中投區最完整的錄取分數查詢平台。
                    <span className="hidden md:inline">整合歷年數據與落點分析，協助你做出最佳的升學選擇。</span>
                </p>
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mb-20 animate-fade-in-up px-2" style={{animationDelay: '0.3s'}}>
                <div className="glass-card p-6 md:p-8 rounded-[2.5rem] col-span-2 md:col-span-2 flex flex-col justify-between group hover:border-indigo-300 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-500 font-bold text-sm mb-2 uppercase tracking-wide">總資料筆數</p>
                            <h3 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter">
                                {loading ? <span className="animate-pulse bg-slate-200 text-transparent rounded-lg">000</span> : data.length}
                            </h3>
                        </div>
                        <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl text-indigo-600 shadow-sm border border-white group-hover:scale-110 transition-transform duration-300">
                            <TableIcon className="h-8 w-8" />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-400">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-3/4 rounded-full"></div>
                        </div>
                        <span>100%</span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between group hover:border-rose-300 transition-colors relative overflow-hidden">
                     <div className="absolute bottom-0 left-0 p-16 bg-rose-500/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>
                    <div className="mb-4 p-3 w-fit bg-rose-50 rounded-2xl text-rose-500 group-hover:bg-rose-100 transition-colors">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wide mb-1">最高積分門檻</p>
                        <p className="text-3xl font-black text-slate-800">30 <span className="text-base text-slate-400 font-bold">分</span></p>
                    </div>
                </div>

                <div 
                    className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between group hover:border-amber-300 transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-100 hover:-translate-y-1" 
                    onClick={() => setActiveTab('chart')}
                >
                    <div className="mb-4 p-3 w-fit bg-amber-50 rounded-2xl text-amber-500 group-hover:bg-amber-100 transition-colors">
                        <BarChart2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wide mb-1">數據分析</p>
                        <p className="text-lg font-bold text-slate-800 flex items-center gap-2 group-hover:text-amber-600 transition-colors">
                            查看圖表 <ChevronRight className="h-4 w-4" />
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Application Area */}
            <div className="max-w-6xl mx-auto">
                <div className="sticky top-24 z-30 mb-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <SearchBar 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm}
                        regionFilter={regionFilter}
                        setRegionFilter={setRegionFilter}
                        scoreFilter={scoreFilter}
                        setScoreFilter={setScoreFilter}
                        showFavoritesOnly={showFavoritesOnly}
                        setShowFavoritesOnly={setShowFavoritesOnly}
                    />
                </div>

                <div className="flex items-center justify-between mb-6 px-4 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-800">查詢結果</h2>
                        <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold border border-white/50">
                            {filteredData.length}
                        </span>
                    </div>
                    
                    <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 flex">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                                activeTab === 'list' 
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}
                        >
                            <TableIcon className="h-4 w-4" />
                            <span className="hidden md:inline">列表</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('chart')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                                activeTab === 'chart' 
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}
                        >
                            <BarChart2 className="h-4 w-4" />
                            <span className="hidden md:inline">圖表</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[600px] animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                    {loading ? (
                        <div className="w-full">
                            <div className="md:hidden space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm skeleton-shimmer h-40"></div>
                                ))}
                            </div>
                            <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 skeleton-shimmer h-[700px]"></div>
                            <div className="mt-10 flex justify-center">
                                <div className="flex items-center gap-3 text-indigo-600 font-bold bg-white/80 backdrop-blur px-6 py-3 rounded-full border border-white shadow-lg shadow-indigo-100">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">正在從雲端同步數據...</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'list' ? (
                                <ScoreTable 
                                    data={sortedData} 
                                    sortField={sortField} 
                                    sortOrder={sortOrder} 
                                    onSort={handleSort}
                                    favorites={favorites}
                                    toggleFavorite={toggleFavorite}
                                />
                            ) : (
                                <ScoreChart data={sortedData} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>

      <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-xl pt-16 pb-12 mt-20">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-8 opacity-80">
                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                    <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-800 text-lg">中投區錄取分數</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-sm font-bold text-slate-500">
                <a href="https://sites.google.com/view/ctttw" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">關於我們</a>
                <a href="https://ctttw.github.io/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">落點分析</a>
                <button onClick={() => setIsReportModalOpen(true)} className="hover:text-indigo-600 transition-colors">回報問題</button>
            </div>

            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-md mx-auto">
                本平台資料由社群熱心提供，僅供參考。實際錄取標準請以各校官方公告及當年度簡章為準。
                <br />&copy; {currentYear} CTTTW. Designed with <span className="text-red-400">❤</span> for Students.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default App;