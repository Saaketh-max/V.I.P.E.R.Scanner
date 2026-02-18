import React from 'react';
import { Calendar, Search, ArrowRight, Server, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ScanResult, Severity } from '../types';

interface HistoryProps {
  history: ScanResult[];
  onViewResult: (result: ScanResult) => void;
}

export const History: React.FC<HistoryProps> = ({ history, onViewResult }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Audit Logs</h2>
          <p className="text-slate-400 text-sm">Historical record of security assessments.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-200 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Findings</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Clock className="w-8 h-8 opacity-50" />
                      <span>No scan history available.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((scan, index) => (
                  <tr key={index} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200 transition-colors">
                          <Server className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-200">{scan.targetUrl}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 opacity-70" />
                        {new Date(scan.timestamp).toLocaleDateString()}
                        <span className="text-xs opacity-50">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {scan.duration.toFixed(2)}s
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {scan.summary.critical > 0 && (
                          <div className="flex items-center gap-1 text-red-400" title="Critical">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            {scan.summary.critical}
                          </div>
                        )}
                        {scan.summary.high > 0 && (
                          <div className="flex items-center gap-1 text-orange-400" title="High">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            {scan.summary.high}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-slate-500" title="Total">
                          <span>{scan.vulnerabilities.length} Total</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onViewResult(scan)}
                        className="text-primary hover:text-white transition-colors p-2 hover:bg-primary/20 rounded-lg"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};