import React from 'react';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';
import { Activity, ShieldAlert, Crosshair, Clock, AlertTriangle, CheckCircle, Network, Layers, PieChart as PieIcon, Wand2 } from 'lucide-react';
import { ScanResult } from '../types';

interface DashboardProps {
  history: ScanResult[];
  totalPatches: number;
  onViewResult: (result: ScanResult) => void;
  onViewHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ history, totalPatches, onViewResult, onViewHistory }) => {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Dynamically calculate metrics from actual history
  const totalScans = history.length;
  // Replaced Critical calculation with High
  const highVulns = history.reduce((acc, curr) => acc + curr.summary.high, 0);
  const mediumVulns = history.reduce((acc, curr) => acc + curr.summary.medium, 0);
  const hasData = history.length > 0;

  // Total Findings Logic
  const totalFindings = history.reduce((acc, curr) => acc + curr.vulnerabilities.length, 0);
  const findingsStatus = hasData ? "CUMULATIVE ISSUES" : "NO DATA AVAILABLE";
  const findingsColor = totalFindings > 0 ? "text-cyber-primary" : (hasData ? "text-cyber-success" : "text-cyber-muted");

  // Prepare Pie Chart Data (Severity Distribution)
  const severityCounts = history.reduce((acc, scan) => ({
    Critical: acc.Critical + scan.summary.critical,
    High: acc.High + scan.summary.high,
    Medium: acc.Medium + scan.summary.medium,
    Low: acc.Low + scan.summary.low,
    Info: acc.Info + scan.summary.info
  }), { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 });

  const pieData = [
    { name: 'Critical', value: severityCounts.Critical, color: '#ff003c' }, // Neon Red
    { name: 'High', value: severityCounts.High, color: '#f97316' }, // Orange
    { name: 'Medium', value: severityCounts.Medium, color: '#fcee0a' }, // Neon Yellow
    { name: 'Low', value: severityCounts.Low, color: '#00f3ff' }, // Neon Cyan
    { name: 'Info', value: severityCounts.Info, color: '#94a3b8' }, // Slate
  ].filter(d => d.value > 0);

  // Prepare Radar data from history categories
  const categories: Record<string, number> = {
      'Injection': 0, 'Broken Auth': 0, 'Misconfig': 0, 'XSS': 0, 'Shadow API': 0, 'Crypto Fail': 0
  };
  
  if (hasData) {
      history.forEach(scan => {
          scan.vulnerabilities.forEach(v => {
              if (v.category.includes('Injection')) categories['Injection'] += 20;
              else if (v.category.includes('Auth')) categories['Broken Auth'] += 20;
              else if (v.category.includes('XSS')) categories['XSS'] += 20;
              else if (v.category.includes('Misconfig')) categories['Misconfig'] += 20;
              else if (v.isShadowApi) categories['Shadow API'] += 20;
              else categories['Crypto Fail'] += 10;
          });
      });
  }
  
  const riskRadarData = Object.keys(categories).map(key => ({
      subject: key,
      A: Math.min(categories[key], 100),
      fullMark: 100
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-cyber-black/95 border border-cyber-slate p-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.color }}></div>
            <span className="text-cyber-muted text-xs font-mono uppercase">{data.name}</span>
          </div>
          <div className="text-xl font-bold text-cyber-text font-mono pl-4">{data.value}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card p-6 rounded-xl relative overflow-hidden group hover:border-cyber-primary/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-cyber-primary" />
          </div>
          <div className="text-cyber-muted text-xs font-mono uppercase tracking-widest">Total Scans</div>
          <div className="text-3xl font-bold text-cyber-text mt-2 font-mono text-glow">{totalScans}</div>
          <div className="text-cyber-success text-xs mt-2 flex items-center font-mono">
             {totalScans > 0 ? 'SYSTEM ACTIVE' : 'AWAITING INPUT'}
          </div>
        </div>

        {/* High Vulns Card (Replaces Critical) */}
        <div className="cyber-card p-6 rounded-xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-16 h-16 text-orange-500" />
          </div>
          <div className="text-cyber-muted text-xs font-mono uppercase tracking-widest">High Vulns</div>
          <div className="text-3xl font-bold text-orange-500 mt-2 font-mono text-glow">
             {highVulns}
          </div>
          <div className="text-orange-500/70 text-xs mt-2 font-mono animate-pulse">
            {highVulns > 0 ? 'ACTION REQUIRED' : 'SYSTEM SECURE'}
          </div>
        </div>

        <div className="cyber-card p-6 rounded-xl relative overflow-hidden group hover:border-cyber-warning/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-16 h-16 text-cyber-warning" />
          </div>
          <div className="text-cyber-muted text-xs font-mono uppercase tracking-widest">Medium Vulns</div>
          <div className="text-3xl font-bold text-cyber-warning mt-2 font-mono text-glow">{mediumVulns}</div>
          <div className="text-cyber-warning/70 text-xs mt-2 font-mono">
            INVESTIGATION REQ
          </div>
        </div>

        <div className="cyber-card p-6 rounded-xl relative overflow-hidden group hover:border-cyber-secondary/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Layers className="w-16 h-16 text-cyber-secondary" />
          </div>
          <div className="text-cyber-muted text-xs font-mono uppercase tracking-widest">Total Findings</div>
          <div className="text-3xl font-bold text-cyber-text mt-2 font-mono">{totalFindings}</div>
          <div className={`${findingsColor} text-xs mt-2 font-mono`}>
            {findingsStatus}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-cyber-primary font-bold flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
               <PieIcon className="w-4 h-4" />
               Threat_Severity_Distribution
            </h3>
          </div>
          <div className="h-64 w-full flex-1 relative">
            {hasData && pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry: any) => (
                        <span className="text-cyber-muted text-xs font-mono ml-2 uppercase tracking-wide">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-cyber-muted opacity-30 border border-dashed border-cyber-slate rounded-lg">
                  <Activity className="w-12 h-12 mb-2" />
                  <span className="font-mono text-xs uppercase tracking-widest">No_Data_Available</span>
                  <span className="font-mono text-[10px]">INITIATE SCAN TO POPULATE</span>
               </div>
            )}
            
            {/* Center Text Overlay for Donut */}
            {hasData && pieData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-28">
                    <span className="text-2xl font-bold text-cyber-text font-mono text-glow">{totalFindings}</span>
                    <span className="text-[10px] text-cyber-muted font-mono uppercase">Issues</span>
                </div>
            )}
          </div>
        </div>

        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-cyber-primary font-bold mb-6 flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
             <Network className="w-4 h-4" />
             Threat_Vector_Radar
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskRadarData}>
                  <PolarGrid stroke="var(--text-muted)" strokeDasharray="3 3" opacity={0.3} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Risk Score"
                    dataKey="A"
                    stroke="#00f3ff"
                    strokeWidth={2}
                    fill="#00f3ff"
                    fillOpacity={0.1}
                  />
                  <Tooltip
                     contentStyle={{ backgroundColor: 'var(--bg-black)', borderColor: '#00f3ff', color: 'var(--text-main)', fontFamily: 'monospace' }}
                     itemStyle={{ color: '#00f3ff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-cyber-muted opacity-30 border border-dashed border-cyber-slate rounded-lg w-full">
                  <Network className="w-12 h-12 mb-2" />
                  <span className="font-mono text-xs uppercase tracking-widest">No_Threat_Vectors</span>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="cyber-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-cyber-slate flex justify-between items-center bg-cyber-black/40">
             <h3 className="text-cyber-primary font-bold font-mono text-sm uppercase tracking-wider">Recent_Operations</h3>
             {hasData && <button onClick={onViewHistory} className="text-cyber-muted hover:text-cyber-primary text-xs font-mono transition-colors">VIEW_ALL</button>}
        </div>
        <div className="divide-y divide-cyber-slate">
            {history.slice(0, 5).map((scan, i) => {
               const hasCritical = scan.summary.critical > 0;
               const hasHigh = scan.summary.high > 0;
               const statusColor = hasCritical ? 'text-cyber-danger' : hasHigh ? 'text-orange-500' : 'text-cyber-success';
               const statusBorder = hasCritical ? 'border-cyber-danger' : hasHigh ? 'border-orange-500' : 'border-cyber-success';

               return (
                <div 
                  key={i} 
                  onClick={() => onViewResult(scan)}
                  className="p-4 flex items-center justify-between hover:bg-cyber-slate/50 transition-colors cursor-pointer group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded border border-cyber-slate bg-cyber-black flex items-center justify-center group-hover:border-cyber-primary/50 transition-colors`}>
                             <Crosshair className="w-5 h-5 text-cyber-muted group-hover:text-cyber-primary" />
                        </div>
                        <div>
                            <div className="font-bold text-cyber-text font-mono text-sm group-hover:text-cyber-primary transition-colors">{scan.targetUrl}</div>
                            <div className="text-[10px] text-cyber-muted font-mono uppercase flex items-center gap-1">
                               <Clock className="w-3 h-3" />
                               {formatDate(scan.timestamp)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className={`font-bold font-mono text-xs ${statusColor} flex items-center gap-2`}>
                            {hasCritical || hasHigh ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {scan.vulnerabilities.length} DETECTED
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-mono border bg-cyber-black ${statusColor} ${statusBorder} bg-opacity-10`}>
                           COMPLETED
                        </div>
                    </div>
                </div>
               );
            })}
            
            {!hasData && (
                <div className="p-8 text-center text-cyber-muted font-mono text-sm flex flex-col items-center">
                    <span className="opacity-50">NO_RECENT_OPERATIONS_FOUND</span>
                    <span className="text-xs text-cyber-primary mt-2">Start a new scan to initialize dashboard</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};