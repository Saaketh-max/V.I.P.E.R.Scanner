import React from 'react';
import { Bell, Shield, Eye, Database, Monitor, Key, Check, XCircle, AlertTriangle } from 'lucide-react';

export const Settings: React.FC = () => {
  const hasApiKey = !!process.env.API_KEY;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">System Configuration</h2>
        <p className="text-slate-400 text-sm">Manage engine preferences and notification channels.</p>
      </div>

      <div className="grid gap-6">
        {/* API Configuration */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">API Gateway</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Gemini API Connection</label>
              <div className={`flex items-center gap-4 border rounded-lg p-4 transition-colors ${hasApiKey ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className={`p-2 rounded-full ${hasApiKey ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {hasApiKey ? <Check className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <div className={`text-sm font-bold font-mono ${hasApiKey ? 'text-green-400' : 'text-red-400'}`}>
                        {hasApiKey ? 'SECURE_UPLINK_ESTABLISHED' : 'UPLINK_OFFLINE'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        {hasApiKey 
                            ? 'Gemini API key successfully loaded from environment variables.' 
                            : 'System running in simulation mode. Configure process.env.API_KEY to enable live AI intelligence.'}
                    </div>
                </div>
                {hasApiKey && (
                    <div className="text-[10px] font-mono text-green-500/50 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                        AES-256
                    </div>
                )}
              </div>
              
              {!hasApiKey && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-yellow-500/80 bg-yellow-500/5 p-3 rounded border border-yellow-500/10">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                          <strong>Simulation Mode Active:</strong> Vulnerability scans will use synthetic data patterns. AI-driven patch generation and attack replay will be simulated.
                      </span>
                  </div>
              )}
            </div>
          </div>
        </section>

        {/* Engine Preferences */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Scan Engine</h3>
          </div>

          <div className="space-y-4 divide-y divide-slate-800">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-slate-200 font-medium">Deep Packet Inspection</div>
                <div className="text-xs text-slate-500">Analyze raw HTTP traffic for hidden anomalies</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-slate-200 font-medium">Headless Browser Mode</div>
                <div className="text-xs text-slate-500">Render JavaScript heavy applications using Chromium</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-slate-200 font-medium">Auto-Generate Reports</div>
                <div className="text-xs text-slate-500">Automatically save PDF reports after scan completion</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Interface */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Monitor className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Interface</h3>
          </div>
          
           <div className="space-y-4 divide-y divide-slate-800">
             <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-slate-200 font-medium">Compact Mode</div>
                  <div className="text-xs text-slate-500">Reduce padding and font size for data density</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};