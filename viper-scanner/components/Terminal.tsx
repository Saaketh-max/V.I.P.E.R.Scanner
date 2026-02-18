import React, { useEffect, useState, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, Wifi, Database, Lock } from 'lucide-react';

interface TerminalProps {
  logs: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-mono text-sm relative">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 font-semibold">VIPER CLI Output</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 text-slate-300"
      >
        {logs.map((log, index) => {
          const isError = log.includes('[ERROR]') || log.includes('Vulnerability Found');
          const isSuccess = log.includes('[SUCCESS]') || log.includes('Completed');
          const isInfo = log.includes('[INFO]');
          
          let colorClass = 'text-slate-300';
          if (isError) colorClass = 'text-red-400';
          if (isSuccess) colorClass = 'text-green-400';
          if (isInfo) colorClass = 'text-blue-400';

          return (
            <div key={index} className={`${colorClass} break-all`}>
              <span className="opacity-50 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
              {log}
            </div>
          );
        })}
        <div className="animate-pulse text-primary">_</div>
      </div>

      {/* Status Footer */}
      <div className="bg-slate-950/50 border-t border-slate-800 p-2 text-xs flex gap-4 text-slate-500">
         <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Connected</span>
         <span className="flex items-center gap-1"><Database className="w-3 h-3" /> Logging to DB</span>
         <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted Tunnel</span>
      </div>
    </div>
  );
};