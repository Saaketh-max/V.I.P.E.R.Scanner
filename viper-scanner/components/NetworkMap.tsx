import React from 'react';
import { Network, Server, Globe, Cpu, Hash, Activity, Lock } from 'lucide-react';
import { ScanResult } from '../types';

interface NetworkMapProps {
  result: ScanResult | null;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ result }) => {
  if (!result || !result.networkInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in">
        <Network className="w-16 h-16 mb-4 opacity-20" />
        <p>No network topology data available. Run a scan to populate.</p>
      </div>
    );
  }

  const { os, ip, ports, mac } = result.networkInfo;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <Network className="w-8 h-8 text-primary" />
             Network Discovery
           </h2>
           <p className="text-slate-400 text-sm mt-1">Nmap Service Detection & OS Fingerprinting Results</p>
        </div>
        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-sm text-green-400">
          STATUS: HOST UP
        </div>
      </div>

      {/* Host Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Globe className="w-24 h-24 text-blue-500" />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Target IP</div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{ip}</div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Hash className="w-3 h-3" /> MAC: {mac || 'XX:XX:XX:XX:XX:XX'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
            <Cpu className="w-24 h-24 text-purple-500" />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Operating System</div>
          <div className="text-xl font-bold text-slate-100">{os}</div>
          <div className="mt-4 flex items-center gap-2 text-xs text-green-500">
            <Activity className="w-3 h-3" /> 98% Confidence Match
          </div>
        </div>

         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
            <Server className="w-24 h-24 text-orange-500" />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Ports Scanned</div>
          <div className="text-2xl font-bold text-slate-100">1000</div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3 h-3" /> {ports.length} Open Ports Found
          </div>
        </div>
      </div>

      {/* Port Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-semibold text-slate-200">Port Scan Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-200 uppercase font-mono text-xs border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Port</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Version Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {ports.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-200">{p.port}/{p.protocol}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                      p.state === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {p.state}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-primary">{p.service}</td>
                  <td className="px-6 py-4 text-slate-500">{p.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};