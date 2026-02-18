import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Zap } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('Agent_001');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      onLogin(username);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid Animation removed to let body 3D BG show */}
      <div className="absolute inset-0 z-0 bg-cyber-grid pointer-events-none opacity-5"></div>
      
      <div className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-cyber-dark/80 border-2 border-cyber-primary mb-6 shadow-[0_0_30px_rgba(0,243,255,0.3)] relative group backdrop-blur-sm">
            <div className="absolute inset-0 rounded-full border border-cyber-primary animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-cyber-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <Shield className="w-12 h-12 text-cyber-primary transition-transform group-hover:scale-110 duration-300" />
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tighter mb-2 font-mono text-glow">VIPER<span className="text-cyber-primary">.SCAN</span></h1>
          <p className="text-cyber-primary/70 font-mono text-xs tracking-[0.3em] uppercase">Vulnerability Inspection Radar</p>
        </div>

        <form onSubmit={handleSubmit} className="cyber-card p-8 rounded-xl shadow-2xl space-y-6 relative overflow-hidden group">
          {/* Scanline decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-primary to-transparent opacity-50 animate-scanline"></div>
          <div className="absolute -left-10 top-0 bottom-0 w-1 bg-cyber-primary/20 blur-sm"></div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-cyber-primary uppercase tracking-wider font-mono flex items-center gap-2">
                <User className="w-3 h-3" /> Identity
            </label>
            <div className="relative group/input">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-slate-700/50 rounded-lg py-3 pl-4 pr-4 text-slate-200 focus:ring-1 focus:ring-cyber-primary focus:border-cyber-primary transition-all font-mono text-sm placeholder-slate-600 hover:border-cyber-primary/50 backdrop-blur-sm"
                placeholder="Enter Codename"
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-cyber-primary w-0 group-focus-within/input:w-full transition-all duration-500"></div>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-cyber-primary uppercase tracking-wider font-mono flex items-center gap-2">
                <Lock className="w-3 h-3" /> Access Key
            </label>
            <div className="relative group/input">
              <input 
                type="password" 
                defaultValue="password"
                className="w-full bg-black/50 border border-slate-700/50 rounded-lg py-3 pl-4 pr-4 text-slate-200 focus:ring-1 focus:ring-cyber-primary focus:border-cyber-primary transition-all font-mono text-sm hover:border-cyber-primary/50 backdrop-blur-sm"
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-cyber-primary w-0 group-focus-within/input:w-full transition-all duration-500"></div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm font-mono border relative overflow-hidden ${
              loading 
                ? 'bg-slate-900/80 border-slate-700 text-slate-500 cursor-wait' 
                : 'bg-cyber-primary/10 border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] group/btn'
            }`}
          >
            {loading ? (
              <span className="animate-pulse flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-primary rounded-full animate-bounce"></div>
                  Establishing Uplink...
              </span>
            ) : (
              <>
                <span className="relative z-10">Initialize System</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-cyber-primary/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
              </>
            )}
          </button>

          <div className="text-center text-[10px] text-slate-500 mt-4 font-mono flex justify-center gap-4">
            <span>AES-256-GCM</span>
            <span>::</span>
            <span>NO LOGS</span>
          </div>
        </form>
      </div>
    </div>
  );
};