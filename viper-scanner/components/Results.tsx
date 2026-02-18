import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Shield, 
  AlertOctagon,
  Info,
  Wrench,
  Wand2,
  Loader2,
  Zap,
  Terminal as TerminalIcon,
  X,
  Ghost,
  Filter,
  Layers,
  Archive,
  Eye,
  FileText
} from 'lucide-react';
import { Vulnerability, Severity, ScanResult, SecurityPatch, AttackSimulation } from '../types';
import { generateSecurityPatch, generateAttackSimulation } from '../services/geminiService';

interface ResultsProps {
  result: ScanResult | null;
  isHistory?: boolean;
  onBack: () => void;
  onExport: (result: ScanResult) => void;
  onPatchGenerated?: () => void;
}

export const Results: React.FC<ResultsProps> = ({ result, isHistory = false, onBack, onExport, onPatchGenerated }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [patches, setPatches] = useState<Record<string, SecurityPatch>>({});
  const [attacks, setAttacks] = useState<Record<string, AttackSimulation>>({});
  const [loadingAction, setLoadingAction] = useState<{id: string, type: 'patch' | 'attack'} | null>(null);
  const [showAttackModal, setShowAttackModal] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<Severity | null>(null);

  if (!result) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleGeneratePatch = async (vuln: Vulnerability, e: React.MouseEvent) => {
    e.stopPropagation();
    if (patches[vuln.id]) {
        setExpandedId(vuln.id);
        return;
    }

    setLoadingAction({ id: vuln.id, type: 'patch' });
    setExpandedId(vuln.id);

    try {
      const patch = await generateSecurityPatch(vuln);
      setPatches(prev => ({ ...prev, [vuln.id]: patch }));
      if (onPatchGenerated) onPatchGenerated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReplayAttack = async (vuln: Vulnerability, e: React.MouseEvent) => {
    e.stopPropagation();
    if (attacks[vuln.id]) {
        setShowAttackModal(vuln.id);
        return;
    }

    setLoadingAction({ id: vuln.id, type: 'attack' });
    
    try {
      const attack = await generateAttackSimulation(vuln);
      setAttacks(prev => ({ ...prev, [vuln.id]: attack }));
      setShowAttackModal(vuln.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL: return 'text-cyber-danger border-cyber-danger shadow-[0_0_10px_rgba(255,0,60,0.4)]';
      case Severity.HIGH: return 'text-orange-500 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]';
      case Severity.MEDIUM: return 'text-cyber-warning border-cyber-warning shadow-[0_0_10px_rgba(252,238,10,0.4)]';
      case Severity.LOW: return 'text-cyber-primary border-cyber-primary shadow-[0_0_10px_rgba(0,243,255,0.4)]';
      case Severity.INFO: return 'text-cyber-muted border-cyber-muted';
      default: return 'text-cyber-muted';
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL: return <AlertOctagon className="w-5 h-5" />;
      case Severity.HIGH: return <AlertTriangle className="w-5 h-5" />;
      case Severity.MEDIUM: return <AlertTriangle className="w-5 h-5" />;
      case Severity.LOW: return <Info className="w-5 h-5" />;
      case Severity.INFO: return <Info className="w-5 h-5" />;
    }
  };

  const filteredVulns = result.vulnerabilities.filter(v => 
    filterSeverity ? v.severity === filterSeverity : true
  );

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-500 pb-8">
      
      {/* Attack Replay Modal */}
      {showAttackModal && attacks[showAttackModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-4xl bg-cyber-dark border border-cyber-primary rounded-xl shadow-[0_0_50px_rgba(0,243,255,0.3)] overflow-hidden flex flex-col max-h-[80vh] relative">
                {/* CRT Scanline overlay for modal */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                
                <div className="bg-cyber-slate p-4 border-b border-cyber-primary/30 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2 text-cyber-primary font-mono font-bold">
                        <TerminalIcon className="w-5 h-5" />
                        ATTACK_REPLAY_CONSOLE_v1.0
                    </div>
                    <button onClick={() => setShowAttackModal(null)} className="text-cyber-muted hover:text-cyber-text transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto font-mono text-sm space-y-6 bg-cyber-black z-10">
                    <div className="space-y-2">
                        <div className="text-cyber-danger font-bold flex items-center gap-2">
                            <Zap className="w-4 h-4" /> OUTGOING REQUEST PAYLOAD
                        </div>
                        <div className="p-4 bg-cyber-slate/50 border-l-2 border-cyber-danger text-red-400 whitespace-pre-wrap font-mono">
                            {attacks[showAttackModal].request}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-px h-8 bg-cyber-slate"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-cyber-success font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4" /> SERVER RESPONSE (EVIDENCE)
                        </div>
                        <div className="p-4 bg-cyber-slate/50 border-l-2 border-cyber-success text-green-400 whitespace-pre-wrap font-mono">
                            {attacks[showAttackModal].response}
                        </div>
                    </div>
                    <div className="text-cyber-muted text-xs mt-4 pt-4 border-t border-cyber-slate">
                        {attacks[showAttackModal].description}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Stats & Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Target Info (Static) */}
        <div className="cyber-card p-6 rounded-xl flex flex-col justify-center group hover:bg-cyber-slate/30 transition-colors">
            <div className="text-cyber-muted text-xs font-mono mb-2 uppercase tracking-widest">Target Asset</div>
            <div className="text-xl font-bold text-cyber-primary truncate font-mono text-glow" title={result.targetUrl}>{result.targetUrl}</div>
            {isHistory && (
                <div className="flex items-center gap-2 mt-2">
                   <span className="px-2 py-0.5 rounded text-[10px] bg-cyber-slate text-cyber-muted border border-cyber-slate font-mono flex items-center gap-1">
                      <Archive className="w-3 h-3" /> ARCHIVED_REPORT
                   </span>
                </div>
            )}
        </div>

        {/* All Findings Filter Button */}
        <button 
            onClick={() => setFilterSeverity(null)}
            className={`cyber-card p-6 rounded-xl text-left transition-all duration-300 relative overflow-hidden group ${filterSeverity === null ? 'border-cyber-primary bg-cyber-primary/10 shadow-[0_0_15px_rgba(0,243,255,0.15)]' : 'hover:border-cyber-primary/50 hover:bg-cyber-slate/30'}`}
        >
            <div className="flex justify-between items-start">
               <div>
                 <div className={`text-xs font-mono mb-2 uppercase tracking-widest transition-colors ${filterSeverity === null ? 'text-cyber-primary' : 'text-cyber-muted group-hover:text-cyber-primary'}`}>Total Findings</div>
                 <div className="text-4xl font-bold text-cyber-text group-hover:scale-105 transition-transform origin-left">{result.vulnerabilities.length}</div>
               </div>
               <div className={`p-2 rounded-lg transition-colors ${filterSeverity === null ? 'bg-cyber-primary/20 text-cyber-primary' : 'bg-cyber-slate text-cyber-muted group-hover:text-cyber-primary'}`}>
                  <Layers className="w-5 h-5" />
               </div>
            </div>
            {filterSeverity === null && <div className="absolute inset-0 border-2 border-cyber-primary rounded-xl pointer-events-none opacity-50"></div>}
            {filterSeverity === null && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyber-primary shadow-[0_0_8px_rgba(0,243,255,1)]"></div>}
        </button>

        {/* Criticals Filter Button */}
        <button 
            onClick={() => setFilterSeverity(Severity.CRITICAL)}
            className={`cyber-card p-6 rounded-xl text-left transition-all duration-300 relative overflow-hidden group ${filterSeverity === Severity.CRITICAL ? 'border-cyber-danger bg-cyber-danger/10 shadow-[0_0_15px_rgba(255,0,60,0.15)]' : 'hover:border-cyber-danger/50 hover:bg-cyber-slate/30'}`}
        >
             {result.summary.critical > 0 && <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyber-danger/20 blur-2xl rounded-full pointer-events-none animate-pulse"></div>}
             <div className="flex justify-between items-start relative z-10">
               <div>
                 <div className={`text-xs font-mono mb-2 uppercase tracking-widest transition-colors ${filterSeverity === Severity.CRITICAL ? 'text-cyber-danger' : 'text-cyber-muted group-hover:text-cyber-danger'}`}>Critical Issues</div>
                 <div className={`text-4xl font-bold group-hover:scale-105 transition-transform origin-left ${filterSeverity === Severity.CRITICAL ? 'text-cyber-danger' : 'text-cyber-text group-hover:text-cyber-danger'}`}>{result.summary.critical}</div>
               </div>
               <div className={`p-2 rounded-lg transition-colors ${filterSeverity === Severity.CRITICAL ? 'bg-cyber-danger/20 text-cyber-danger' : 'bg-cyber-slate text-cyber-muted group-hover:text-cyber-danger'}`}>
                  <AlertOctagon className="w-5 h-5" />
               </div>
            </div>
            {filterSeverity === Severity.CRITICAL && <div className="absolute inset-0 border-2 border-cyber-danger rounded-xl pointer-events-none opacity-50"></div>}
            {filterSeverity === Severity.CRITICAL && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyber-danger shadow-[0_0_8px_rgba(255,0,60,1)]"></div>}
        </button>

        {/* Export Action */}
        <div className="cyber-card p-6 rounded-xl flex flex-col justify-center items-center gap-3">
             <button 
                onClick={() => onExport(result)}
                className="flex items-center justify-center gap-3 w-full py-3 bg-cyber-slate hover:bg-cyber-slate/80 text-cyber-primary border border-cyber-primary/50 rounded-lg transition-all active:scale-95 shadow-[0_0_10px_rgba(0,243,255,0.1)] hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] font-mono text-sm uppercase tracking-wider font-bold"
             >
                <Download className="w-5 h-5" /> Export Report
             </button>
        </div>
      </div>

      {/* Vulnerability Matrix List */}
      <div className="flex-1 cyber-card rounded-xl overflow-hidden flex flex-col border-opacity-50 min-h-[500px]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-cyber-slate/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <div className={`p-2.5 rounded-lg border shadow-[0_0_10px_rgba(0,243,255,0.1)] ${isHistory ? 'bg-cyber-slate border-cyber-muted' : 'bg-cyber-primary/10 border-cyber-primary/20'}`}>
                {isHistory ? <Archive className="w-6 h-6 text-cyber-muted" /> : <Shield className="w-6 h-6 text-cyber-primary" />}
             </div>
             <div>
                <h3 className="font-bold text-xl font-mono tracking-wide text-cyber-text flex items-center gap-3">
                    {isHistory ? 'HISTORICAL_FINDINGS_LOG' : 'DETECTED_VULNERABILITIES'}
                    {filterSeverity && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyber-slate text-cyber-muted border border-cyber-slate flex items-center gap-1">
                            <Filter className="w-3 h-3" /> FILTER: {filterSeverity.toUpperCase()}
                        </span>
                    )}
                </h3>
                <div className="text-xs text-cyber-muted font-mono mt-1">
                    Showing {filteredVulns.length} of {result.vulnerabilities.length} total findings
                </div>
             </div>
          </div>
          <span className="text-xs font-mono text-cyber-muted border border-cyber-slate px-3 py-1.5 rounded-full bg-cyber-black/50">SCAN_DURATION: {result.duration.toFixed(2)}s</span>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-cyber-black/20">
          {filteredVulns.map((vuln) => (
            <div 
              key={vuln.id} 
              className={`rounded-lg border transition-all duration-300 group ${expandedId === vuln.id ? 'bg-cyber-slate border-cyber-primary/50 shadow-[0_0_20px_rgba(0,243,255,0.15)]' : 'bg-cyber-slate/30 border-white/5 hover:border-white/20 hover:bg-cyber-slate/50'}`}
            >
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-6"
                onClick={() => toggleExpand(vuln.id)}
              >
                {/* Vuln Info */}
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  <div className={`p-3 rounded-lg border flex-shrink-0 mt-1 ${getSeverityColor(vuln.severity)}`}>
                    {getSeverityIcon(vuln.severity)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                         <h4 className="font-bold text-cyber-text font-mono text-lg">{vuln.title}</h4>
                         {vuln.isShadowApi && (
                             <span className="px-2 py-0.5 rounded text-[10px] bg-cyber-secondary/20 text-cyber-secondary border border-cyber-secondary/50 font-mono font-bold flex items-center gap-1 animate-pulse shadow-[0_0_10px_rgba(188,19,254,0.3)]">
                                 <Ghost className="w-3 h-3" /> ZOMBIE API
                             </span>
                         )}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-mono">
                      <span className="uppercase text-[10px] font-bold tracking-wider text-cyber-primary bg-cyber-primary/5 px-2 py-0.5 rounded border border-cyber-primary/20">{vuln.category}</span>
                      <span className="text-cyber-muted">|</span>
                      <span className="text-xs bg-cyber-black/50 px-2 py-0.5 rounded border border-white/10 truncate text-cyber-muted max-w-[300px]">{vuln.endpoint}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                   
                   {/* Action Buttons Group (Force visible if not in history view) */}
                   {!isHistory ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => handleReplayAttack(vuln, e)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-black/40 border border-cyber-danger/30 text-cyber-danger hover:bg-cyber-danger/10 hover:border-cyber-danger transition-all text-xs font-bold font-mono group hover:shadow-[0_0_15px_rgba(255,0,60,0.2)] animate-pulse hover:animate-none"
                            >
                                {loadingAction?.id === vuln.id && loadingAction.type === 'attack' ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Zap className="w-3 h-3 group-hover:fill-current transition-colors" />
                                )}
                                REPLAY
                            </button>

                            <button
                                onClick={(e) => handleGeneratePatch(vuln, e)}
                                className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all font-mono hover:shadow-[0_0_15px_currentColor]
                                ${patches[vuln.id] 
                                    ? 'bg-cyber-success/10 text-cyber-success border-cyber-success/30 hover:bg-cyber-success/20 shadow-[0_0_10px_rgba(0,255,159,0.1)]'
                                    : 'bg-cyber-primary/10 text-cyber-primary border-cyber-primary/30 hover:bg-cyber-primary/20 shadow-[0_0_10px_rgba(0,243,255,0.1)] animate-bounce hover:animate-none'}
                                `}
                            >
                                {loadingAction?.id === vuln.id && loadingAction.type === 'patch' ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                                ) : patches[vuln.id] ? (
                                <CheckCircle className="w-3 h-3" />
                                ) : (
                                <Wand2 className="w-3 h-3" />
                                )}
                                {patches[vuln.id] ? 'PATCHED' : 'FIX IT'}
                            </button>
                        </div>
                   ) : (
                      <div className="flex flex-col items-end gap-1">
                         <span className="text-[10px] font-mono text-cyber-muted uppercase tracking-widest">Status</span>
                         <span className="text-xs font-mono text-cyber-muted flex items-center gap-1.5 bg-cyber-slate px-2 py-1 rounded border border-cyber-slate">
                            <Eye className="w-3 h-3" /> READ_ONLY
                         </span>
                      </div>
                   )}

                  <div className="flex items-center gap-4 pl-4 border-l border-white/5">
                    {vuln.cvssScore && (
                      <div className="text-right hidden xl:block">
                         <div className="text-[10px] text-cyber-muted font-mono uppercase">Severity</div>
                         <div className={`font-bold font-mono text-lg ${vuln.cvssScore >= 9 ? 'text-cyber-danger' : vuln.cvssScore >= 7 ? 'text-orange-500' : 'text-cyber-warning'}`}>
                           {vuln.cvssScore.toFixed(1)}
                         </div>
                      </div>
                    )}
                    <div className={`p-1.5 rounded-full transition-colors ${expandedId === vuln.id ? 'bg-cyber-primary/20 text-cyber-primary' : 'bg-cyber-slate text-cyber-muted group-hover:bg-cyber-slate/80 group-hover:text-cyber-text'}`}>
                        {expandedId === vuln.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              {expandedId === vuln.id && (
                <div className="px-6 pb-6 pt-0 text-sm text-cyber-text animate-in slide-in-from-top-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent my-6"></div>
                  
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-3">
                      <h5 className="text-cyber-primary font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-3 h-3" /> Description
                      </h5>
                      <p className="leading-relaxed text-cyber-muted text-sm bg-cyber-black/30 p-4 rounded-lg border border-white/5">{vuln.description}</p>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-cyber-success font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Remediation Strategy
                      </h5>
                      <div className="bg-cyber-black/50 p-4 rounded-lg border border-cyber-success/20 font-mono text-xs text-cyber-success/90 leading-relaxed whitespace-pre-wrap shadow-inner h-full">
                        {vuln.remediation}
                      </div>
                    </div>
                  </div>

                  {/* AI Patch Diff View - Only shown if actively generating in fresh scan */}
                  {loadingAction?.id === vuln.id && loadingAction.type === 'patch' && !isHistory && (
                     <div className="bg-cyber-black/40 border border-cyber-primary/20 rounded-lg p-12 flex flex-col items-center justify-center text-cyber-primary gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyber-primary blur-xl opacity-20 animate-pulse"></div>
                            <Loader2 className="w-10 h-10 animate-spin relative z-10" />
                        </div>
                        <p className="animate-pulse font-mono text-xs tracking-widest uppercase">Initializing Neural Patch Generation...</p>
                     </div>
                  )}

                  {patches[vuln.id] && !isHistory && (
                    <div className="mt-4 border border-cyber-secondary/30 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 shadow-[0_0_30px_rgba(188,19,254,0.1)]">
                       <div className="bg-cyber-secondary/10 p-3 px-4 border-b border-cyber-secondary/30 flex items-center gap-3">
                          <Wrench className="w-4 h-4 text-cyber-secondary" />
                          <span className="font-bold text-cyber-secondary font-mono text-xs tracking-wider">AI_GENERATED_PATCH.diff</span>
                       </div>
                       
                       <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 bg-cyber-black">
                          {/* Vulnerable Code */}
                          <div className="p-0">
                             <div className="bg-cyber-danger/10 px-4 py-2 text-cyber-danger text-[10px] font-bold uppercase tracking-wider border-b border-cyber-danger/20 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" />
                                Vulnerable Source
                             </div>
                             <pre className="p-5 font-mono text-xs text-red-400 whitespace-pre-wrap overflow-x-auto custom-scrollbar bg-red-950/5 leading-relaxed">
                               {patches[vuln.id].originalCode}
                             </pre>
                          </div>

                          {/* Secure Code */}
                          <div className="p-0">
                             <div className="bg-cyber-success/10 px-4 py-2 text-cyber-success text-[10px] font-bold uppercase tracking-wider border-b border-cyber-success/20 flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" />
                                Secured Source
                             </div>
                             <pre className="p-5 font-mono text-xs text-green-400 whitespace-pre-wrap overflow-x-auto custom-scrollbar bg-green-950/5 leading-relaxed">
                               {patches[vuln.id].secureCode}
                             </pre>
                          </div>
                       </div>
                       <div className="bg-cyber-slate/50 p-4 text-xs text-cyber-muted border-t border-white/10 font-mono">
                          <span className="font-bold text-cyber-secondary mr-2">EXPLANATION:</span> {patches[vuln.id].explanation}
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredVulns.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-cyber-muted border-2 border-dashed border-white/5 rounded-xl bg-white/5">
              <CheckCircle className="w-16 h-16 mb-4 text-cyber-success/20" />
              <p className="font-mono text-lg mb-2">NO_VULNERABILITIES_MATCH_FILTER</p>
              {filterSeverity && (
                   <button onClick={() => setFilterSeverity(null)} className="text-cyber-primary hover:underline text-xs font-mono">
                       CLEAR FILTERS
                   </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
            onClick={onBack}
            className="px-8 py-3 rounded-lg bg-cyber-slate text-cyber-muted hover:text-cyber-text hover:bg-cyber-slate/80 transition-all border border-white/10 font-mono text-xs tracking-wider uppercase hover:border-cyber-primary/50"
        >
            RETURN_TO_DASHBOARD
        </button>
      </div>
    </div>
  );
};