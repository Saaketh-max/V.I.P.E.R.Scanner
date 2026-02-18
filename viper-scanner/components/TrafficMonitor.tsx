import React, { useRef, useEffect } from 'react';
import { Activity, Pause, Play, Filter, Download } from 'lucide-react';
import { Packet, ScanStatus } from '../types';

interface TrafficMonitorProps {
  packets: Packet[];
  status: ScanStatus;
}

export const TrafficMonitor: React.FC<TrafficMonitorProps> = ({ packets, status }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom if scanning
  useEffect(() => {
    if (status === ScanStatus.SCANNING && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [packets, status]);

  const getProtocolColor = (proto: string) => {
    switch (proto) {
      case 'HTTP': return 'bg-green-500/10 text-green-400';
      case 'TCP': return 'bg-blue-500/10 text-blue-400';
      case 'TLSv1.3': return 'bg-purple-500/10 text-purple-400';
      case 'DNS': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <Activity className="w-8 h-8 text-primary" />
             Live Traffic Monitor
           </h2>
           <p className="text-slate-400 text-sm mt-1">Packet Capture & Protocol Analysis (PCAP)</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors">
              <Filter className="w-4 h-4 text-slate-300" />
           </button>
           <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4 text-slate-300" />
           </button>
           <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors text-xs font-mono flex items-center gap-2">
              {status === ScanStatus.SCANNING ? <Pause className="w-3 h-3 text-red-400" /> : <Play className="w-3 h-3 text-green-400" />}
              {status === ScanStatus.SCANNING ? 'CAPTURING' : 'PAUSED'}
           </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {/* Toolbar */}
        <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-2 gap-2 text-xs font-mono">
            <input type="text" placeholder="Apply a display filter ... <Ctrl-/>" className="flex-1 bg-slate-950 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:border-green-500 focus:outline-none" />
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">Apply</button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-950 text-slate-400 text-xs font-semibold py-2 px-4 border-b border-slate-800 uppercase tracking-wider">
            <div className="col-span-1">No.</div>
            <div className="col-span-1">Time</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-2">Destination</div>
            <div className="col-span-1">Protocol</div>
            <div className="col-span-1">Length</div>
            <div className="col-span-4">Info</div>
        </div>

        {/* Table Body */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto font-mono text-xs"
        >
          {packets.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-600">
                <Activity className="w-12 h-12 mb-2 opacity-20" />
                <p>Waiting for traffic...</p>
             </div>
          ) : (
             packets.map((pkt) => (
                <div 
                  key={pkt.id} 
                  className={`grid grid-cols-12 py-1 px-4 hover:bg-slate-800/80 cursor-pointer border-b border-slate-800/30 ${
                     pkt.info.includes('404') || pkt.info.includes('500') || pkt.info.includes('RST') ? 'text-red-400' : 'text-slate-300'
                  }`}
                >
                    <div className="col-span-1 opacity-50">{pkt.id}</div>
                    <div className="col-span-1 opacity-70">{pkt.time.toFixed(4)}</div>
                    <div className="col-span-2 truncate pr-2">{pkt.source}</div>
                    <div className="col-span-2 truncate pr-2">{pkt.destination}</div>
                    <div className="col-span-1">
                        <span className={`px-1.5 py-0.5 rounded-[2px] ${getProtocolColor(pkt.protocol)}`}>
                            {pkt.protocol}
                        </span>
                    </div>
                    <div className="col-span-1 opacity-50">{pkt.length}</div>
                    <div className="col-span-4 truncate">{pkt.info}</div>
                </div>
             ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-2 text-xs flex justify-between text-slate-500">
             <div>Packets: {packets.length}</div>
             <div>Profile: Ethernet</div>
        </div>
      </div>
    </div>
  );
};