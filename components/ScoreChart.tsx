import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  TooltipProps
} from 'recharts';
import { SchoolData } from '../types';

interface ScoreChartProps {
  data: SchoolData[];
}

// Custom Tooltip Component for Glass Effect
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-xl border border-white/60 shadow-lg !bg-white/90 backdrop-blur-md">
        <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{backgroundColor: payload[0].color}}></span>
            <p className="text-sm font-medium text-slate-600">
                {payload[0].name}: <span className="font-mono font-bold text-indigo-600">{payload[0].value}</span>
            </p>
        </div>
      </div>
    );
  }
  return null;
};

const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
  // 1. Prepare Data for "Top Schools by Points"
  const sortedByPoints = [...data]
    .filter(d => d.points !== '未知')
    .map(d => ({
        ...d,
        parsedPoints: parseInt(d.points, 10),
        fullName: `${d.school} ${d.department}`
    }))
    .sort((a, b) => b.parsedPoints - a.parsedPoints)
    .slice(0, 15);

  // 2. Prepare Data for "Score Distribution"
  const scoreDistribution = data.reduce((acc, curr) => {
    const scoreKey = curr.score.toString();
    if (!acc[scoreKey]) {
      acc[scoreKey] = { score: curr.score, count: 0 };
    }
    acc[scoreKey].count += 1;
    return acc;
  }, {} as Record<string, { score: number; count: number }>);
  
  const distributionData = Object.values(scoreDistribution).sort((a: { score: number }, b: { score: number }) => b.score - a.score);


  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      {/* Chart Card 1 */}
      <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-xl shadow-indigo-100/20 border border-white/60">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full shadow-sm"></div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">錄取積點排名 Top 15</h3>
                <p className="text-sm text-slate-500 mt-1">顯示積分最高的前 15 所科系（排除資料未知者）</p>
            </div>
        </div>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedByPoints}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
              <XAxis type="number" domain={[0, 115]} tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis 
                type="category" 
                dataKey="fullName" 
                width={150} 
                tick={{fill: '#475569', fontSize: 13, fontWeight: 600}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9', opacity: 0.5, radius: 8}} />
              <Bar 
                dataKey="parsedPoints" 
                name="積點" 
                fill="url(#colorPoints)" 
                radius={[0, 6, 6, 0]} 
                barSize={18} 
              >
                 <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                 </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Chart Card 2 */}
         <div className="glass-card p-6 rounded-[2rem] shadow-xl shadow-emerald-100/20 border border-white/60">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-bold text-slate-800">積分分布統計</h3>
            </div>
            <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="score" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9', opacity: 0.5, radius: 8}} />
                <Bar dataKey="count" name="科系數" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
            </ResponsiveContainer>
            </div>
         </div>

         {/* Chart Card 3 */}
         <div className="glass-card p-6 rounded-[2rem] shadow-xl shadow-violet-100/20 border border-white/60">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-violet-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-bold text-slate-800">積分 vs 積點 散佈圖</h3>
            </div>
            <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis type="number" dataKey="score" name="積分" unit="分" domain={['auto', 'auto']} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="parsedPoints" name="積點" unit="點" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
                <Scatter name="學校" data={sortedByPoints} fill="#8b5cf6" fillOpacity={0.6} shape="circle" />
                </ScatterChart>
            </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ScoreChart;