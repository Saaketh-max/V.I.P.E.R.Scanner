import { GoogleGenAI, Type } from "@google/genai";
import { Vulnerability, Severity, NetworkInfo, SecurityPatch, AttackSimulation } from "../types";

// Helper to safely get client or null
const getClient = () => {
  try {
    const key = process.env.API_KEY;
    if (!key || key.trim() === '') return null;
    return new GoogleGenAI({ apiKey: key.trim() });
  } catch (e) {
    console.error("Failed to initialize Gemini client:", e);
    return null;
  }
};

// Helper to normalize severity from AI response
const normalizeSeverity = (severity: string): Severity => {
  if (!severity) return Severity.INFO;
  const s = String(severity).toLowerCase();
  
  if (s.includes('critical')) return Severity.CRITICAL;
  if (s.includes('high')) return Severity.HIGH;
  if (s.includes('medium')) return Severity.MEDIUM;
  if (s.includes('low')) return Severity.LOW;
  if (s.includes('info')) return Severity.INFO;
  
  // Default to INFO if unrecognized
  return Severity.INFO;
};

interface SimulationResult {
  vulnerabilities: Vulnerability[];
  networkInfo: NetworkInfo;
}

// FALLBACK DATA GENERATORS (Used when API fails or local dev)
const getFallbackVulnerabilities = (url: string, modules: string[]): Vulnerability[] => {
  return [
    {
      id: "vuln-sql-1",
      title: "SQL Injection in Search Parameter",
      severity: Severity.CRITICAL,
      description: "The 'q' parameter in the search endpoint matches user input directly to the database query without sanitization, allowing for full database compromise.",
      endpoint: "/api/products?q=",
      remediation: "Use parameterized queries (Prepared Statements) instead of string concatenation.",
      cvssScore: 9.8,
      category: "Injection",
      isShadowApi: false
    },
    {
      id: "vuln-xss-1",
      title: "Reflected Cross-Site Scripting (XSS)",
      severity: Severity.HIGH,
      description: "The application reflects the 'user' parameter in the welcome message without HTML encoding, allowing execution of malicious JavaScript.",
      endpoint: "/welcome?user=<script>alert(1)</script>",
      remediation: "Implement Context-Aware Output Encoding on all user-controlled data.",
      cvssScore: 7.5,
      category: "XSS",
      isShadowApi: false
    },
    {
      id: "vuln-shadow-1",
      title: "Shadow API: Unprotected Admin Endpoint",
      severity: Severity.HIGH,
      description: "An undocumented administrative endpoint '/api/v1/admin/users' was discovered which bypasses standard authentication checks.",
      endpoint: "/api/v1/admin/users",
      remediation: "Disable this endpoint or enforce strict Role-Based Access Control (RBAC).",
      cvssScore: 8.2,
      category: "Shadow API",
      isShadowApi: true
    },
    {
      id: "vuln-misconf-1",
      title: "Debug Mode Enabled",
      severity: Severity.MEDIUM,
      description: "The application stack trace is leaked in 500 Error responses, revealing file paths and server versions.",
      endpoint: "/api/crash",
      remediation: "Disable debug mode in production configuration.",
      cvssScore: 5.0,
      category: "Misconfiguration",
      isShadowApi: false
    }
  ];
};

export const simulateVulnerabilityScan = async (url: string, profile: string, modules: string[] = []): Promise<SimulationResult> => {
  const ai = getClient();
  
  // If no AI client available, return fallback immediately
  if (!ai) {
    console.warn("No API Key found. Using fallback simulation data.");
    await new Promise(r => setTimeout(r, 2000)); // Simulate delay
    return {
        vulnerabilities: getFallbackVulnerabilities(url, modules),
        networkInfo: {
            os: "Ubuntu 22.04 LTS",
            ip: "192.168.1.42",
            mac: "AA:BB:CC:DD:EE:FF",
            ports: [
                { port: 80, protocol: "tcp", service: "http", version: "nginx/1.18.0", state: "open" },
                { port: 443, protocol: "tcp", service: "https", version: "nginx/1.18.0", state: "open" },
                { port: 22, protocol: "tcp", service: "ssh", version: "OpenSSH 8.9p1", state: "open" }
            ]
        }
    };
  }

  const activeModulesText = modules.length > 0 
    ? modules.join(', ') 
    : "General Web Vulnerabilities";

  const systemInstruction = `
    You are "VIPER", a vulnerability scanner. Simulate a scan for: ${url}.
    
    1. VULNERABILITIES:
    Generate 3-5 realistic vulnerabilities.
    PRIORITIZE: ${activeModulesText}.
    MUST include 1 "Shadow API" or "Zombie API" finding.
    
    2. NETWORK:
    Generate plausible Nmap style port data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `Target: ${url}. Profile: ${profile}` }]
        }
      ],
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vulnerabilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low", "Info"] },
                  description: { type: Type.STRING },
                  endpoint: { type: Type.STRING },
                  remediation: { type: Type.STRING },
                  cvssScore: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  isShadowApi: { type: Type.BOOLEAN }
                },
                required: ["id", "title", "severity", "description", "endpoint", "remediation", "category"],
              },
            },
            networkInfo: {
              type: Type.OBJECT,
              properties: {
                os: { type: Type.STRING },
                ip: { type: Type.STRING },
                mac: { type: Type.STRING },
                ports: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      port: { type: Type.INTEGER },
                      protocol: { type: Type.STRING },
                      service: { type: Type.STRING },
                      version: { type: Type.STRING },
                      state: { type: Type.STRING },
                    }
                  }
                }
              },
              required: ["os", "ip", "ports"]
            }
          },
          required: ["vulnerabilities", "networkInfo"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text received from API");
    
    const data = JSON.parse(text);
    const mappedVulns = data.vulnerabilities.map((item: any) => {
      // Normalize severity to ensure enum match (handles AI casing variance)
      const severity = normalizeSeverity(item.severity);
      
      // Determine default CVSS if missing
      let defaultCvss = 5.0;
      if (severity === Severity.CRITICAL) defaultCvss = 9.5;
      else if (severity === Severity.HIGH) defaultCvss = 8.0;
      else if (severity === Severity.MEDIUM) defaultCvss = 6.5;
      else if (severity === Severity.LOW) defaultCvss = 3.5;

      return {
        ...item,
        severity: severity,
        cvssScore: item.cvssScore || defaultCvss
      };
    });

    return {
      vulnerabilities: mappedVulns,
      networkInfo: data.networkInfo
    };

  } catch (error) {
    console.error("Gemini Scan Failed, using fallback:", error);
    // Return fallback data silently so the UI doesn't crash on network/proxy errors
    return {
      vulnerabilities: getFallbackVulnerabilities(url, modules),
      networkInfo: {
        os: "Unknown (Simulated)",
        ip: "10.0.0.5",
        mac: "00:00:00:00:00:00",
        ports: [{ port: 80, protocol: "tcp", service: "http", version: "apache", state: "open" }]
      }
    };
  }
};

export const generateSecurityPatch = async (vulnerability: Vulnerability): Promise<SecurityPatch> => {
  const ai = getClient();
  
  // Fallback for missing AI
  if (!ai) {
    await new Promise(r => setTimeout(r, 1500));
    return {
        vulnerabilityId: vulnerability.id,
        originalCode: `// Vulnerable Code detected at ${vulnerability.endpoint}\nconst query = "SELECT * FROM users WHERE name = '" + req.query.name + "'";\ndb.execute(query);`,
        secureCode: `// Patched Code\nconst query = "SELECT * FROM users WHERE name = ?";\ndb.execute(query, [req.query.name]);`,
        explanation: "Replaced insecure string concatenation with a parameterized query to prevent SQL injection."
    };
  }
  
  const systemInstruction = `
    You are a Security Engineer. 
    Generate a code fix for: ${vulnerability.title}.
    Language: Javascript/Python/Java (infer from context).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `Fix vulnerability: ${vulnerability.description}` }]
        }
      ],
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vulnerabilityId: { type: Type.STRING },
            originalCode: { type: Type.STRING },
            secureCode: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["originalCode", "secureCode", "explanation"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);

  } catch (error) {
    console.error("Patch Gen Failed:", error);
    return {
        vulnerabilityId: vulnerability.id,
        originalCode: "// Could not retrieve original source",
        secureCode: "// Apply input validation manually",
        explanation: "AI service unavailable. Please refer to OWASP cheat sheets."
    };
  }
};

export const generateAttackSimulation = async (vulnerability: Vulnerability): Promise<AttackSimulation> => {
  const ai = getClient();
  
  if (!ai) {
    await new Promise(r => setTimeout(r, 1500));
    return {
        vulnerabilityId: vulnerability.id,
        request: `GET ${vulnerability.endpoint}' OR '1'='1 HTTP/1.1\nHost: target.com\nUser-Agent: Viper-Scanner/1.0`,
        response: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n[{"id":1,"user":"admin","password":"hashed_secret"}]`,
        description: "Simulated SQL Injection attack revealing database dump."
    };
  }

  const systemInstruction = `Generate a raw HTTP request/response pair demonstrating exploitation of: ${vulnerability.title}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: "Generate attack vector." }]
        }
      ],
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vulnerabilityId: { type: Type.STRING },
            request: { type: Type.STRING },
            response: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["request", "response", "description"]
        },
      },
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text);

  } catch (error) {
     return {
        vulnerabilityId: vulnerability.id,
        request: "GET / HTTP/1.1",
        response: "HTTP/1.1 500 Simulation Failed",
        description: "AI generation failed."
    };
  }
};