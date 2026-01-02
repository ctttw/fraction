import React, { useState } from 'react';
import { SchoolData, SortField, SortOrder } from '../types';
import { schoolDirectory } from '../data';
import { ArrowUp, ArrowDown, HelpCircle, School, GraduationCap, ExternalLink, Star, Share2, Check } from 'lucide-react';

interface ScoreTableProps {
  data: SchoolData[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
}

const ScoreTable: React.FC<ScoreTableProps> = ({ 
    data, 
    sortField, 
    sortOrder, 
    onSort, 
    favorites, 
    toggleFavorite,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <div className="h-4 w-4 rounded-full bg-slate-100/50"></div>;
    return sortOrder === 'asc' ? 
      <div className="bg-indigo-100 p-0.5 rounded-full shadow-sm"><ArrowUp className="h-3 w-3 text-indigo-600" /></div> : 
      <div className="bg-indigo-100 p-0.5 rounded-full shadow-sm"><ArrowDown className="h-3 w-3 text-indigo-600" /></div>;
  };

  const getScoreBadge = (score: number) => {
      let styles = "bg-slate-100 text-slate-500 border border-slate-200";
      if (score === 30) styles = "bg-rose-50 text-rose-600 border border-rose-100 ring-2 ring-rose-500/10 shadow-sm";
      else if (score >= 25) styles = "bg-orange-50 text-orange-600 border border-orange-100 ring-1 ring-orange-500/10";
      else if (score >= 20) styles = "bg-indigo-50 text-indigo-600 border border-indigo-100 ring-1 ring-indigo-500/10";
      else if (score >= 15) styles = "bg-emerald-50 text-emerald-600 border border-emerald-100 ring-1 ring-emerald-500/10";
      
      return (
          <span className={`inline-flex items-center justify-center w-12 py-1.5 rounded-xl text-sm font-bold ${styles}`}>
              {score}
          </span>
      );
  }

  const getSchoolInfo = (schoolName: string) => {
      const normalize = (name: string) => name.replace(/(國立|市立|私立|財團法人|臺中|台中)/g, '').replace(/臺/g, '台').trim();
      const target = normalize(schoolName);
      if (target.includes('中科實中') || target.includes('中科實驗')) {
           return schoolDirectory.find(s => s.name.includes('中科實驗'));
      }
      return schoolDirectory.find(s => {
          const dirName = normalize(s.name);
          return dirName.includes(target) || target.includes(dirName);
      });
  };

  const handleShare = (schoolName: string, id: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('search', schoolName);
    navigator.clipboard.writeText(url.toString()).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (data.length === 0) {
      return (
          <div className="glass-card rounded-3xl p-16 text-center text-slate-500 animate-fade-in-up">
              <div className="w-20 h-20 bg-slate-50/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                <HelpCircle className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">沒有找到符合的結果</h3>
              <p className="text-slate-400">請嘗試調整搜尋關鍵字或篩選條件</p>
          </div>
      )
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 pb-8">
          {data.map((row, index) => {
              const schoolInfo = getSchoolInfo(row.school);
              const isFavorite = favorites.includes(row.id);
              // Stagger animation based on index (up to 20 items to avoid lag)
              const delay = Math.min(index * 0.05, 1.0);
              
              return (
                  <div 
                    key={row.id} 
                    className="bg-white/80 backdrop-blur-md rounded-[1.5rem] shadow-sm border border-white/60 overflow-hidden relative animate-fade-in-up"
                    style={{ animationDelay: `${delay}s` }}
                  >
                      {/* Top Section */}
                      <div className="p-5 pb-4 bg-gradient-to-b from-white to-transparent">
                          <div className="flex justify-between items-start mb-3">
                               <div className="flex items-center gap-3.5">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border border-white/50 ${row.score === 30 ? 'bg-gradient-to-br from-rose-50 to-white text-rose-600' : 'bg-gradient-to-br from-indigo-50 to-white text-indigo-600'}`}>
                                        {row.school.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-slate-800 text-lg leading-tight tracking-tight">{row.school}</span>
                                            {schoolInfo && <ExternalLink className="h-3.5 w-3.5 text-slate-300" />}
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 mt-0.5">{row.department}</div>
                                    </div>
                               </div>
                               <div className="flex gap-1 -mt-2 -mr-2">
                                    <button 
                                        onClick={() => handleShare(row.school, row.id)}
                                        className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-300 hover:text-indigo-500"
                                        title="分享連結"
                                    >
                                        {copiedId === row.id ? <Check className="h-6 w-6 text-emerald-500" /> : <Share2 className="h-6 w-6" />}
                                    </button>
                                    <button 
                                        onClick={() => toggleFavorite(row.id)}
                                        className="p-2 rounded-full active:bg-slate-100 transition-colors"
                                    >
                                        <Star className={`h-6 w-6 transition-all ${isFavorite ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-200'}`} />
                                    </button>
                               </div>
                          </div>
                      </div>
                      
                      {/* Ticket Cutout Effect */}
                      <div className="relative flex items-center opacity-70">
                          <div className="w-3 h-6 bg-slate-50 rounded-r-full absolute left-0 border-y border-r border-slate-200/60 shadow-inner"></div>
                          <div className="w-full border-t-2 border-dashed border-slate-200 mx-3"></div>
                          <div className="w-3 h-6 bg-slate-50 rounded-l-full absolute right-0 border-y border-l border-slate-200/60 shadow-inner"></div>
                      </div>

                      {/* Bottom Metrics */}
                      <div className="px-5 py-4 grid grid-cols-2 gap-4">
                          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">最低積分</span>
                              {getScoreBadge(row.score)}
                          </div>
                          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">最低積點</span>
                              <div className="font-mono font-bold text-slate-700 text-lg">
                                  {row.points === '未知' ? <span className="text-slate-300 font-sans text-sm">--</span> : row.points}
                              </div>
                          </div>
                      </div>
                  </div>
              )
          })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-card rounded-[2rem] shadow-xl shadow-indigo-100/20 overflow-hidden ring-1 ring-white/60 animate-fade-in-up">
        <div className="overflow-x-auto max-h-[800px] custom-scrollbar">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-white/80 backdrop-blur-md border-b border-indigo-50">
                <th className="px-6 py-5 w-24 text-center">
                    <span className="sr-only">操作</span>
                </th>
                <th onClick={() => onSort('school')} className="group px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" /> 
                    <span>學校名稱</span>
                    {getSortIcon('school')}
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400" /> 
                    <span>科系組別</span>
                  </div>
                </th>
                <th onClick={() => onSort('score')} className="group px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span>錄取積分</span>
                    {getSortIcon('score')}
                  </div>
                </th>
                <th onClick={() => onSort('points')} className="group px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span>錄取積點</span>
                    {getSortIcon('points')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/80 bg-white/40">
              {data.map((row, index) => {
                const schoolInfo = getSchoolInfo(row.school);
                const isFavorite = favorites.includes(row.id);
                // Stagger desktop rows too
                const delay = Math.min(index * 0.03, 0.8);

                return (
                <tr 
                    key={row.id} 
                    className="hover:bg-white/80 transition-all duration-200 group animate-fade-in-up"
                    style={{ animationDelay: `${delay}s` }}
                >
                  <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                            onClick={() => handleShare(row.school, row.id)}
                            className="p-1.5 rounded-full hover:bg-slate-100 transition-all hover:scale-110 focus:outline-none"
                            title="分享連結"
                        >
                             {copiedId === row.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4 text-slate-300 group-hover:text-indigo-400" />}
                        </button>
                        <button 
                            onClick={() => toggleFavorite(row.id)} 
                            className="p-1.5 rounded-full hover:bg-slate-100 transition-all hover:scale-110 focus:outline-none"
                            title="收藏"
                        >
                            <Star className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300 group-hover:text-amber-300'}`} />
                        </button>
                      </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm mr-4 shadow-sm border border-white/50 ${row.score === 30 ? 'bg-rose-50 text-rose-600' : 'bg-white text-indigo-600'}`}>
                          {row.school.charAt(0)}
                      </div>
                      <div className="font-bold text-slate-700 text-base">
                          {schoolInfo ? (
                              <a href={schoolInfo.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-2">
                                  {row.school}
                                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                              </a>
                          ) : row.school}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-50/80 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-colors">
                      {row.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getScoreBadge(row.score)}
                  </td>
                  <td className="px-6 py-4">
                    {row.points === '未知' ? (
                        <span className="text-slate-300 text-xs font-medium px-2">--</span>
                    ) : (
                        <span className="font-mono font-bold text-slate-700 text-base">{row.points}</span>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-white/60 backdrop-blur-sm border-t border-indigo-50 text-xs text-slate-400 flex justify-between items-center font-medium">
            <span>顯示 {data.length} 筆資料</span>
            <span className="text-slate-300">最後更新：{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </>
  );
};

export default ScoreTable;