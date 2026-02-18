export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFO = 'Info'
}

export enum ScanStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  endpoint: string;
  remediation: string;
  cvssScore?: number;
  category: string;
  isShadowApi?: boolean; // New Flag for Zombie APIs
}

export interface SecurityPatch {
  vulnerabilityId: string;
  originalCode: string;
  secureCode: string;
  explanation: string;
}

export interface AttackSimulation {
  vulnerabilityId: string;
  request: string;
  response: string;
  description: string;
}

export interface PortService {
  port: number;
  protocol: string;
  service: string;
  version: string;
  state: 'open' | 'closed' | 'filtered';
}

export interface NetworkInfo {
  os: string;
  ip: string;
  mac: string;
  ports: PortService[];
}

export interface Packet {
  id: number;
  time: number;
  source: string;
  destination: string;
  protocol: string;
  length: number;
  info: string;
}

export interface ScanResult {
  targetUrl: string;
  timestamp: string;
  duration: number; // seconds
  vulnerabilities: Vulnerability[];
  networkInfo?: NetworkInfo;
  packets?: Packet[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  NEW_SCAN = 'NEW_SCAN',
  RESULTS = 'RESULTS',
  NETWORK = 'NETWORK',
  TRAFFIC = 'TRAFFIC',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}