# V.I.P.E.R.Scanner
Vulnerability Inspection &amp; Penetration Execution Radar
## 🛡️ About the Project
*V.I.P.E.R.* is an advanced, automated Web Application Vulnerability Scanner designed to close the gap between modern web development and security testing.

Traditional scanners often fail to crawl JavaScript-heavy *Single Page Applications (SPAs)* or maintain complex authentication states. V.I.P.E.R. solves this by using a *Headless Browser Engine* to render dynamic content and a *Logic-Based Detection Engine* to identify critical flaws like *Broken Object Level Authorization (BOLA)*.

It features a unique *Serverless Firebase Architecture* that allows for real-time command and control, streaming scan logs instantly to a "Live Terminal" on the dashboard.

---

## 🚀 Key Features
* *🔥 Real-Time "Live" Terminal:* Leverages Firestore listeners to stream scan logs from the Python engine to the React dashboard with zero latency.
* *🧠 Intelligent Crawling:* Uses *Playwright* to render client-side JavaScript (React/Vue/Angular), discovering API endpoints that standard tools miss.
* *🤖 AI Remediation:* Integrates with Generative AI (Gemini/OpenAI) to analyze found vulnerabilities and suggest secure code patches instantly.
* *🔐 BOLA Detection:* Specialized logic engine that creates dual user sessions (User A & User B) and replays requests to test for unauthorized data access.
* *👻 Shadow API Discovery:* Actively hunts for "Zombie APIs" (e.g., /api/v1) and exposed configuration files (.env, .git).

---

## 🏗️ System Architecture

*The Hybrid Model:*
Since vulnerability scanning engines cannot run directly in a browser, V.I.P.E.R. uses a hybrid approach:

1.  *Frontend (React):* User submits a Target URL.
2.  *Database (Firestore):* Creates a task in the scans collection with status PENDING.
3.  *The Worker Node (Python):* * Listens for PENDING scans using the *Firebase Admin SDK*.
    * Pick ups the job and launches *Playwright* & *Nuclei*.
    * Streams logs back to the Firestore logs sub-collection in real-time.
4.  *Notification:* Updates status to COMPLETED and triggers a frontend alert.

---

## 💻 Tech Stack

| Component | Technology |
| :--- | :--- |
| *Frontend* | React.js, Tailwind CSS,Vite |
| *Backend / DB* | *Google Firebase* (Firestore, Auth, Functions) |
| *Scanner Engine* | Python 3.10 + Firebase Admin SDK |
| *Tools* | Playwright (Crawling), Nuclei (Scanning) |
| *Deployment* | Firebase |

---

## ⚙️ Installation & Setup

Follow these steps to deploy V.I.P.E.R. locally for development or testing.

### Prerequisites
* *Node.js* (v18 or higher)
* *Python* (v3.10 or higher)
* *Git*

### Step 1: Firebase Configuration (The Cloud)
1.  Go to the [Firebase Console](https://console.firebase.google.com) and create a new project named Viper-Scanner.
2.  *Enable Firestore:*
    * Navigate to *Build > Firestore Database*.
    * Click *Create Database* (Select *Start in Test Mode* for Hackathon purposes).
3.  *Enable Authentication:*
    * Navigate to *Build > Authentication*.
    * Click *Get Started* and enable *Email/Password* and *Google* sign-in providers.
4.  *Get Service Account Key (For Python Worker):*
    * Go to *Project Settings* (Gear icon) > *Service accounts*.
    * Click *Generate new private key*.
    * *Save this file as serviceAccountKey.json*. You will need it for the backend.
5.  *Get Web Config (For React Frontend):*
    * Go to *Project Settings > General*.
    * Scroll down to "Your apps" and click the web icon (</>).
    * Register the app and copy the firebaseConfig object.

### Step 2: Frontend Setup (The Dashboard)
1.  Navigate to the frontend directory:
    bash
    cd frontend
    
2.  Install dependencies:
    bash
    npm install
    # If starting from scratch: npm install firebase @tremor/react lucide-react
    
3.  Configure Firebase:
    * Create a file src/firebase.js.
    * Paste your config from Step 1.5:
    javascript
    // src/firebase.js
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth } from "firebase/auth";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    export const db = getFirestore(app);
    export const auth = getAuth(app);
    
4.  Start the development server:
    bash
    npm run dev
    

### Step 3: Backend Worker Setup (The Engine)
1.  Open a new terminal and navigate to the backend directory:
    bash
    cd backend
    
2.  Create a virtual environment (optional but recommended):
    bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    
3.  Install Python dependencies:
    bash
    pip install firebase-admin playwright asyncio
    playwright install
    
4.  *Add Credentials:*
    * Move the serviceAccountKey.json file (downloaded in Step 1.4) into this backend/ folder.
5.  Start the Worker Node:
    bash
    python worker.py
    

---

## 🕹️ Usage

1.  Ensure your *Frontend* is running (usually http://localhost:5173) and your *Python Worker* is running in the terminal.
2.  Open the Dashboard in your browser.
3.  Enter a target URL (e.g., http://testphp.vulnweb.com) and click *"Start Scan"*.
4.  *Observe:*
    * The frontend creates a task in Firestore.
    * The Python terminal will print: [!] New Job Received: http://...
    * The Dashboard "Live Terminal" will begin showing logs streaming in real-time.
