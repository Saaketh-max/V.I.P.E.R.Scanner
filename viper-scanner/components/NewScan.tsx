import React, { useState } from 'react';
import { Play, Globe, Settings, Lock, FileCode, Database, AlertCircle, Loader2 } from 'lucide-react';

interface NewScanProps {
  onStartScan: (target: string, profile: string, modules: string[]) => void;
  isScanning: boolean;
}

export const NewScan: React.FC<NewScanProps> = ({ onStartScan, isScanning }) => {
  const [url, setUrl] = useState('');
  const [profile, setProfile] = useState('Full Scan');
  const [activeModules, setActiveModules] = useState<string[]>(['sqli', 'xss', 'misconf']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isScanning || isVerifying) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a target URL");
      return;
    }

    try {
      // 1. Basic Protocol Check
      if (!trimmedUrl.match(/^https?:\/\//)) {
        setError("URL must start with http:// or https://");
        return;
      }

      const urlObj = new URL(trimmedUrl);
      const hostname = urlObj.hostname;

      // 2. Hostname Validation
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
         // Check if it's an IP address
         const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
         
         if (!isIp) {
             // Strict Domain Regex: 
             // - Start with alphanumeric
             // - Parts separated by dots
             // - No consecutive dots or hyphens at start/end of parts
             // - Valid TLD (2+ chars)
             const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
             
             if (!domainRegex.test(hostname)) {
                  setError("Invalid domain name structure. Check for typos.");
                  return;
             }
         }
      }

      // 3. Connectivity Verification (Active Probe)
      setIsVerifying(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      try {
        // We use mode: 'no-cors' to attempt a connection. 
        // If the domain doesn't exist (DNS error) or connection is refused, fetch will throw.
        // If it exists but returns 404/500, it resolves (which is fine, the server exists).
        await fetch(trimmedUrl, { 
            mode: 'no-cors', 
            method: 'GET',
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        setIsVerifying(false);
        onStartScan(trimmedUrl, profile, activeModules);

      } catch (networkErr: any) {
          clearTimeout(timeoutId);
          setIsVerifying(false);
          
          if (networkErr.name === 'AbortError') {
              setError("Connection timed out. Target is unresponsive.");
          } else {
              // This catches DNS errors (domain not found) and Connection Refused
              setError("Target unreachable. Verify the URL exists and is accessible.");
          }
      }

    } catch (e) {
      setError("Invalid URL format.");
    }
  };

  const toggleModule = (id: string) => {
    setActiveModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-100">Initiate Security Audit</h2>
        <p className="text-slate-400">Configure target parameters and audit depth for the VIPER engine.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-8 shadow-2xl">
        
        {/* Target Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Target URL</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              required
              placeholder="https://example.com"
              className={`block w-full pl-10 pr-3 py-3 bg-slate-950 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-slate-200 placeholder-slate-600 transition-all ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-700'}`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm animate-in slide-in-from-top-1 bg-red-500/5 p-2 rounded border border-red-500/10 border-l-4 border-l-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Profiles */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Scan Profile</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Light Scan', 'Full Scan', 'Deep Audit'].map((p) => (
              <div 
                key={p}
                onClick={() => setProfile(p)}
                className={`cursor-pointer border rounded-lg p-4 transition-all ${
                  profile === p 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold">{p}</div>
                <div className="text-xs opacity-75 mt-1">
                  {p === 'Light' ? 'Fast surface mapping' : p === 'Full' ? 'Standard vulnerability check' : 'Comprehensive fuzzing & logic testing'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Toggles */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Active Modules</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div 
                onClick={() => toggleModule('sqli')}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${activeModules.includes('sqli') ? 'bg-slate-800 border-slate-600' : 'border-transparent opacity-50'}`}
             >
                <div className="p-2 rounded bg-purple-500/10 text-purple-400"><Database className="w-4 h-4" /></div>
                <div>
                    <div className="text-sm font-medium text-slate-200">SQL Injection</div>
                    <div className="text-xs text-slate-500">Union, Error, Blind checks</div>
                </div>
             </div>

             <div 
                onClick={() => toggleModule('xss')}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${activeModules.includes('xss') ? 'bg-slate-800 border-slate-600' : 'border-transparent opacity-50'}`}
             >
                <div className="p-2 rounded bg-yellow-500/10 text-yellow-400"><FileCode className="w-4 h-4" /></div>
                <div>
                    <div className="text-sm font-medium text-slate-200">XSS & Injection</div>
                    <div className="text-xs text-slate-500">Reflected, Stored, DOM</div>
                </div>
             </div>

             <div 
                onClick={() => toggleModule('auth')}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${activeModules.includes('auth') ? 'bg-slate-800 border-slate-600' : 'border-transparent opacity-50'}`}
             >
                <div className="p-2 rounded bg-red-500/10 text-red-400"><Lock className="w-4 h-4" /></div>
                <div>
                    <div className="text-sm font-medium text-slate-200">Auth & Sessions</div>
                    <div className="text-xs text-slate-500">Broken Auth, JWT, OAuth</div>
                </div>
             </div>

             <div 
                onClick={() => toggleModule('misconf')}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${activeModules.includes('misconf') ? 'bg-slate-800 border-slate-600' : 'border-transparent opacity-50'}`}
             >
                <div className="p-2 rounded bg-blue-500/10 text-blue-400"><Settings className="w-4 h-4" /></div>
                <div>
                    <div className="text-sm font-medium text-slate-200">Misconfiguration</div>
                    <div className="text-xs text-slate-500">Headers, Leaks, Git</div>
                </div>
             </div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isScanning || !url || isVerifying}
            className={`
                flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary/20
                ${isScanning || !url || isVerifying
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-hover text-white transform hover:scale-105 active:scale-95'}
            `}
          >
            {isVerifying ? (
               <>
                 <Loader2 className="w-5 h-5 animate-spin" />
                 Verifying...
               </>
            ) : isScanning ? (
               <>
                 <Loader2 className="w-5 h-5 animate-spin" />
                 Initializing...
               </>
            ) : (
               <>
                 <Play className="w-5 h-5 fill-current" />
                 Launch Scanner
               </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};