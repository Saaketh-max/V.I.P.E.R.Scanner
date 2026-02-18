import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, History as HistoryIcon, Settings as SettingsIcon, Shield, Menu, X, LogOut, Code2, Network, Activity, Sun, Moon, UserCircle } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { NewScan } from './components/NewScan';
import { Results } from './components/Results';
import { Terminal } from './components/Terminal';
import { Login } from './components/Login';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { NetworkMap } from './components/NetworkMap';
import { TrafficMonitor } from './components/TrafficMonitor';
import { View, ScanResult, Severity, ScanStatus, Packet } from './types';
import { simulateVulnerabilityScan } from './services/geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  
  // Initialize with empty history for fresh user experience
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [totalPatches, setTotalPatches] = useState(0);
  
  const [isHistoryView, setIsHistoryView] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Traffic Simulation State
  const [packetStream, setPacketStream] = useState<Packet[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle Login
  const handleLogin = (name: string) => {
    setUsername(name);
    setIsAuthenticated(true);
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView(View.DASHBOARD);
    setScanStatus(ScanStatus.IDLE);
    setUsername('');
    setTotalPatches(0);
  };

  const handlePatchGenerated = () => {
    setTotalPatches(prev => prev + 1);
  };

  // Mock logging system
  const addLog = (msg: string) => {
    setScanLogs(prev => [...prev, msg]);
  };

  // Handle Export (Report Generation)
  const handleExport = (result: ScanResult) => {
    const now = new Date();
    // Calculate Fiscal Quarter
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const year = now.getFullYear();
    
    // Attempt to extract a clean entity name from the URL
    let entityName = "Unknown Entity";
    try {
        // Strip protocol
        const raw = result.targetUrl.replace(/(^\w+:|^)\/\//, '');
        // Get hostname part
        entityName = raw.split('/')[0];
    } catch (e) {
        entityName = result.targetUrl;
    }

    const reportLines = [
        "################################################################################",
        "                            VIPER SECURITY AUDIT REPORT                         ",
        "################################################################################",
        "",
        `ENTITY NAME     : ${entityName}`,
        `TARGET URL      : ${result.targetUrl}`,
        `FISCAL PERIOD   : Q${quarter} ${year}`,
        `REPORT DATE     : ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        `SCAN DURATION   : ${result.duration.toFixed(2)} seconds`,
        `STATUS          : COMPLETED`,
        "",
        "--------------------------------------------------------------------------------",
        "                                EXECUTIVE SUMMARY                               ",
        "--------------------------------------------------------------------------------",
        "",
        `TOTAL FINDINGS  : ${result.vulnerabilities.length}`,
        `CRITICAL RISKS  : ${result.summary.critical}`,
        `HIGH RISKS      : ${result.summary.high}`,
        `MEDIUM RISKS    : ${result.summary.medium}`,
        `LOW RISKS       : ${result.summary.low}`,
        "",
        "--------------------------------------------------------------------------------",
        "                                DETAILED FINDINGS                               ",
        "--------------------------------------------------------------------------------",
        ""
    ];

    result.vulnerabilities.forEach((vuln, index) => {
        reportLines.push(`ISSUE #${index + 1}: ${vuln.title.toUpperCase()}`);
        reportLines.push(`SEVERITY    : ${vuln.severity}`);
        reportLines.push(`CATEGORY    : ${vuln.category}`);
        reportLines.push(`LOCATION    : ${vuln.endpoint}`);
        reportLines.push("");
        reportLines.push("DESCRIPTION :");
        reportLines.push(vuln.description);
        reportLines.push("");
        reportLines.push("REMEDIATION STRATEGY :");
        reportLines.push(vuln.remediation);
        if (vuln.cvssScore) {
             reportLines.push("");
             reportLines.push(`CVSS SCORE  : ${vuln.cvssScore}`);
        }
        reportLines.push("________________________________________________________________________________");
        reportLines.push("");
    });

    reportLines.push("");
    reportLines.push("################################################################################");
    reportLines.push("                          END OF CONFIDENTIAL REPORT                            ");
    reportLines.push("################################################################################");

    const reportText = reportLines.join('\n');
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    // e.g. VIPER_Audit_Q1_2024_production-api.txt
    const safeFilename = `VIPER_Audit_Q${quarter}_${year}_${entityName.replace(/[^a-z0-9]/gi, '_')}.txt`;
    downloadAnchorNode.setAttribute("download", safeFilename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  };

  const handleStartScan = async (url: string, profile: string, modules: string[]) => {
    setScanStatus(ScanStatus.SCANNING);
    setCurrentView(View.NEW_SCAN); // Stay on new scan page but overlay terminal
    setScanLogs([]);
    setLastResult(null);
    setPacketStream([]); // Reset packets

    // Simulated initialization sequence
    addLog(`[INFO] Initializing VIPER Engine v4.2.0...`);
    addLog(`[INFO] Target: ${url}`);
    addLog(`[INFO] Profile: ${profile}`);
    addLog(`[INFO] Active Modules: ${modules.length > 0 ? modules.join(', ').toUpperCase() : 'ALL'}`);
    
    await new Promise(r => setTimeout(r, 800));
    addLog(`[INFO] Spawning headless Chromium worker...`);
    await new Promise(r => setTimeout(r, 800));
    addLog(`[SUCCESS] Worker connected (PID: 4821)`);
    addLog(`[INFO] Starting Nmap Reconnaissance module...`);
    
    const startTime = Date.now();
    
    // Start Gemini simulation in parallel
    // If local/offline, this will use the fallback data automatically
    const scanPromise = simulateVulnerabilityScan(url, profile, modules);
    const minTimePromise = new Promise(r => setTimeout(r, 8000)); // Minimum 8s animation for more packet data

    // Fake progress logs
    const logInterval = setInterval(() => {
        const msgs = [
            `[CRAWL] Discovered /login`,
            `[CRAWL] Discovered /api/v1/users`,
            `[CRAWL] Discovered /admin/dashboard (403 Forbidden)`,
            `[INFO] Analyzing JavaScript bundles...`,
            `[FUZZ] Injecting Polyglot payloads into 'id' parameter...`,
            `[FUZZ] Testing SQLi time-based blind...`,
            `[OAST] Checking Interactsh interactions...`,
            `[INFO] Analyzing HTTP headers...`,
            `[NMAP] Port 80/tcp open (http)`,
            `[NMAP] Port 443/tcp open (https)`,
            `[NMAP] OS Detection: Linux 5.4.x`,
        ];
        const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
        addLog(randomMsg);
    }, 1200);

    // Fake Packet Generator (Wireshark simulation)
    let pktId = 1;
    let timeOffset = 0;
    const packetInterval = setInterval(() => {
        timeOffset += Math.random() * 0.5;
        const protos = ['HTTP', 'TCP', 'TLSv1.3', 'DNS'];
        const methods = ['GET', 'POST', 'HEAD', 'OPTIONS'];
        const proto = protos[Math.floor(Math.random() * protos.length)];
        
        let info = '';
        if (proto === 'HTTP') {
            info = `${methods[Math.floor(Math.random() * methods.length)]} /api/v${Math.floor(Math.random()*3)}/data HTTP/1.1`;
        } else if (proto === 'TCP') {
            info = `${Math.floor(Math.random() * 60000)} → 443 [ACK] Seq=${pktId} Ack=${pktId} Win=502`;
        } else if (proto === 'TLSv1.3') {
            info = 'Application Data';
        } else {
            info = `Standard query 0x${Math.floor(Math.random()*9999)} A ${url}`;
        }

        const newPacket: Packet = {
            id: pktId++,
            time: timeOffset,
            source: Math.random() > 0.5 ? '192.168.1.105' : '10.0.0.1 (Target)',
            destination: Math.random() > 0.5 ? '10.0.0.1 (Target)' : '192.168.1.105',
            protocol: proto,
            length: Math.floor(Math.random() * 1500),
            info: info
        };
        
        setPacketStream(prev => [...prev.slice(-100), newPacket]); // Keep last 100 packets
    }, 300);

    try {
        const [simulationResult] = await Promise.all([scanPromise, minTimePromise]);
        
        clearInterval(logInterval);
        clearInterval(packetInterval);
        
        const { vulnerabilities, networkInfo } = simulationResult;
        
        const criticalCount = vulnerabilities.filter(v => v.severity === Severity.CRITICAL).length;
        const highCount = vulnerabilities.filter(v => v.severity === Severity.HIGH).length;
        const mediumCount = vulnerabilities.filter(v => v.severity === Severity.MEDIUM).length;
        const lowCount = vulnerabilities.filter(v => v.severity === Severity.LOW).length;
        const infoCount = vulnerabilities.filter(v => v.severity === Severity.INFO).length;

        addLog(`[SUCCESS] Scan completed in ${((Date.now() - startTime)/1000).toFixed(2)}s`);
        addLog(`[INFO] Found ${vulnerabilities.length} issues.`);
        
        const newResult: ScanResult = {
            targetUrl: url,
            timestamp: new Date().toISOString(),
            duration: (Date.now() - startTime) / 1000,
            vulnerabilities,
            networkInfo,
            packets: packetStream, // Save the captured packets
            summary: {
                critical: criticalCount,
                high: highCount,
                medium: mediumCount,
                low: lowCount,
                info: infoCount
            }
        };

        setLastResult(newResult);
        setScanHistory(prev => [newResult, ...prev]);
        
        setScanStatus(ScanStatus.COMPLETED);
        setIsHistoryView(false); // Validating that this is a FRESH scan
        
        // Delay switch to results slightly
        setTimeout(() => {
            setScanStatus(ScanStatus.IDLE);
            setCurrentView(View.RESULTS);
        }, 1500);

    } catch (e) {
        clearInterval(logInterval);
        clearInterval(packetInterval);
        addLog(`[ERROR] Scan failed: ${e}`);
        setScanStatus(ScanStatus.FAILED);
        setTimeout(() => setScanStatus(ScanStatus.IDLE), 3000);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen text-cyber-text overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar - Transparent Glass */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r border-cyber-slate/30 transition-all duration-300 flex flex-col z-20 shadow-[5px_0_30px_rgba(0,0,0,0.1)] backdrop-blur-md bg-black/40`}
      >
        <div className="h-16 flex items-center justify-center border-b border-cyber-slate/30 bg-black/20">
           {isSidebarOpen ? (
               <div className="flex items-center gap-2 font-bold text-xl tracking-wider font-mono">
                   <Shield className="text-cyber-primary w-6 h-6" />
                   <span className="text-cyber-text text-glow">VIPER</span>
               </div>
           ) : (
               <Shield className="text-cyber-primary w-8 h-8" />
           )}
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
           <SidebarItem 
             icon={<LayoutDashboard size={20} />} 
             label="DASHBOARD" 
             isOpen={isSidebarOpen} 
             active={currentView === View.DASHBOARD}
             onClick={() => setCurrentView(View.DASHBOARD)}
           />
           <SidebarItem 
             icon={<PlusCircle size={20} />} 
             label="NEW_SCAN" 
             isOpen={isSidebarOpen} 
             active={currentView === View.NEW_SCAN || scanStatus === ScanStatus.SCANNING}
             onClick={() => setCurrentView(View.NEW_SCAN)}
           />
           <div className="my-4 border-t border-cyber-slate/30"></div>
           <SidebarItem 
             icon={<Code2 size={20} />} 
             label="RESULTS" 
             isOpen={isSidebarOpen} 
             active={currentView === View.RESULTS}
             onClick={() => lastResult && setCurrentView(View.RESULTS)}
             disabled={!lastResult}
           />
           <SidebarItem 
             icon={<Network size={20} />} 
             label="NET_MAP" 
             isOpen={isSidebarOpen} 
             active={currentView === View.NETWORK}
             onClick={() => lastResult && setCurrentView(View.NETWORK)}
             disabled={!lastResult}
           />
           <SidebarItem 
             icon={<Activity size={20} />} 
             label="TRAFFIC" 
             isOpen={isSidebarOpen} 
             active={currentView === View.TRAFFIC}
             onClick={() => setCurrentView(View.TRAFFIC)}
           />
           <div className="my-4 border-t border-cyber-slate/30"></div>
           <SidebarItem 
             icon={<HistoryIcon size={20} />} 
             label="HISTORY" 
             isOpen={isSidebarOpen}
             active={currentView === View.HISTORY}
             onClick={() => setCurrentView(View.HISTORY)}
           />
           <SidebarItem 
             icon={<SettingsIcon size={20} />} 
             label="CONFIG" 
             isOpen={isSidebarOpen}
             active={currentView === View.SETTINGS}
             onClick={() => setCurrentView(View.SETTINGS)}
           />
        </nav>

        <div className="p-4 border-t border-cyber-slate/30 bg-black/20">
            <button 
                onClick={handleLogout}
                className={`flex items-center gap-3 w-full p-2 rounded hover:bg-cyber-slate/30 text-cyber-muted hover:text-cyber-danger transition-colors ${!isSidebarOpen && 'justify-center'}`}
            >
                <LogOut size={20} />
                {isSidebarOpen && <span className="font-mono text-xs uppercase tracking-wider">Terminate</span>}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - Glass */}
        <header className="h-16 bg-black/30 backdrop-blur-md border-b border-cyber-slate/30 flex items-center justify-between px-6 z-10 transition-colors duration-300">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-cyber-slate/30 rounded text-cyber-muted">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
           
           <div className="flex items-center gap-6">
              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-cyber-slate/30 text-cyber-muted hover:text-cyber-primary transition-all"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                 {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded border border-cyber-primary/30 text-[10px] font-mono text-cyber-primary shadow-[0_0_10px_rgba(0,243,255,0.1)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyber-primary animate-pulse"></div>
                    ONLINE
                  </div>
                  <div className="flex items-center gap-2 border-l border-cyber-slate/30 pl-4">
                      <div className="text-right hidden sm:block">
                          <div className="text-xs font-bold text-cyber-text font-mono uppercase tracking-widest">{username}</div>
                          <div className="text-[10px] text-cyber-muted">Level 5 Access</div>
                      </div>
                      <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyber-primary to-cyber-secondary border border-white/20 flex items-center justify-center text-black font-bold">
                        {username.charAt(0).toUpperCase()}
                      </div>
                  </div>
              </div>
           </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-auto p-6 relative">
          
          {/* Overlay Terminal when scanning */}
          {scanStatus === ScanStatus.SCANNING && (
             <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-12">
                 <div className="w-full max-w-3xl h-[500px]">
                    <Terminal logs={scanLogs} />
                 </div>
             </div>
          )}

          <div className="max-w-7xl mx-auto h-full">
            {currentView === View.DASHBOARD && (
              <Dashboard 
                history={scanHistory}
                totalPatches={totalPatches}
                onViewResult={(scan) => {
                  setLastResult(scan);
                  setIsHistoryView(true); // Viewing history
                  setCurrentView(View.RESULTS);
                }}
                onViewHistory={() => setCurrentView(View.HISTORY)}
              />
            )}
            {currentView === View.NEW_SCAN && <NewScan onStartScan={handleStartScan} isScanning={scanStatus === ScanStatus.SCANNING} />}
            {currentView === View.RESULTS && <Results 
                result={lastResult} 
                isHistory={isHistoryView} 
                onBack={() => setCurrentView(View.DASHBOARD)} 
                onExport={handleExport}
                onPatchGenerated={handlePatchGenerated}
            />}
            {currentView === View.NETWORK && <NetworkMap result={lastResult} />}
            {currentView === View.TRAFFIC && <TrafficMonitor packets={packetStream} status={scanStatus} />}
            {currentView === View.HISTORY && (
                <History 
                    history={scanHistory} 
                    onViewResult={(scan) => {
                        setLastResult(scan);
                        setIsHistoryView(true); // Viewing history
                        setCurrentView(View.RESULTS);
                    }} 
                />
            )}
            {currentView === View.SETTINGS && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, isOpen, active, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full flex items-center gap-3 p-3 transition-all duration-200 border-l-2
      ${active ? 'bg-cyber-primary/10 text-cyber-primary border-cyber-primary' : 'border-transparent text-cyber-muted hover:text-cyber-text hover:bg-cyber-slate/30'}
      ${!isOpen && 'justify-center'}
      ${disabled && 'opacity-50 cursor-not-allowed'}
    `}
  >
    {icon}
    {isOpen && <span className="font-mono text-xs tracking-wider">{label}</span>}
  </button>
);

export default App;