# ⚡ FestFlow — JSPM University Pune

FestFlow is a premium, lightweight campus event discovery and automated skill-matching ecosystem built exclusively for the students, departments, and clubs of **JSPM University, Pune**. 

The platform bridges the gap between chaotic campus notice boards and eager student participants by implementing a single-page dashboard architecture featuring **dynamic tag-intersection matching algorithms** alongside a sleek, responsive **Midnight & Gold / Bright corporate user interface**.

---

## 🚀 Key Functional Features

- **👤 Smart Profile Hub:** Secured data input leveraging official student parameters including Full Name, Department/Branch, current Year of Study, and verified **JSPM PRN** tracking tags.
- **🧠 Automated Tag-Matching Engine:** Eliminates chronological sorting. Evaluates the student's matrix of active interest skill-badges (e.g., `#Coding`, `#WebDev`, `#AI`, `#Dance`) and instantly sorts incoming campus events, ranking the highest-scoring skill matches at the very top of their live personalized feed.
- **⚡ 1-Minute Event Posting:** A frictionless single-card submission architecture enabling student council heads, department coordinators, or faculty hosts to instantly list fests, categorize tracks, assign skill tags, and deploy external application redirects.
- **🛡️ Integrated Authentication Gateway:** An elegant splash gateway requiring a valid university student credential profile mapping to instantly unroll the student dashboard space.
- **🔄 Session Toggles & Profile Controls:** Native structural features providing an intuitive "Edit Profile" pop-up modal overlay and a robust "Exit Account" logout command link to securely handle UI states without breaking the application engine memory.

---

## 🛠️ Technology Stack & Architecture

### Backend Core Engine
- **Node.js & Express:** Configured as a headless API pipeline managing routing architectures, cross-origin resources (CORS), and data handling.
- **Mongoose & MongoDB Atlas:** Remote cloud database mapping secure relational schemas for Student arrays and Event records using highly available shared document clusters.
- **Dotenv Environment Security:** Strict isolation handling of remote Atlas connection keys, forcing absolute structural separation of operational source code from secret credentials.

### Frontend Presentation Layer
- **Tailwind CSS (via CDN):** High-fidelity component layouts rendering clean layered visual depth through optimized drop shadows, glassmorphism boundaries, and strict responsive flex/grid layouts.
- **Vanilla JavaScript:** High-performance, lightweight execution layer handling dynamic DOM node injection, client-side data binding states, real-time tag intersection loops, and seamless backend communication via asynchronous `fetch()` operations.

---

## 📁 Repository Directory Structure

```text
festflow/
├── public/
│   ├── index.html       # Single-Page Premium Application User Interface
│   └── jspm_logo.svg    # Official University Branded Vector Graphic Logo
├── .env.example         # Open Environment Key Template for Developers
├── .gitignore           # Crucial Guardrail Restricting Security Key Leaks
├── package.json         # Automated Package Specifications and Script Tasks
└── server.js            # Node.js Core Backend Connection and API Engine
```

---

## ⚙️ Local Machine Installation and Setup

### 1. Prerequisite Installations
Ensure you have downloaded and installed **Node.js** (which bundles the package manager `npm`) on your physical computer workspace environment.

### 2. Project Archive Setup
```bash
# Clone the online source code directory
git clone https://github.com

# Enter the root execution path directory
cd FestFlow

# Download dependencies safely bypassing potential lock discrepancies
npm install --legacy-peer-deps
```

### 3. Establish Local Environments Configuration
Create an environment file named exactly `.env` in the project root root block next to `server.js` and structure it with your remote cloud connection addresses:
```env
PORT=5001
MONGODB_URI=mongodb://[username]:[password]@ac-nr43wf8-shard-00-00.elu2m73.mongodb.net:27017/festflow?ssl=true&authSource=admin&appName=Cluster0
```

### 4. Turn On The Engine
Fire up your backend system server by running the launch command within your terminal workspace:
```bash
node server.js
```
Open your internet browser program and navigate straight to the live environment address:  
👉 **http://localhost:5001**

---

## 📜 Development Status & Future Scope
FestFlow is currently fully functional in a highly robust locally simulated state, successfully validating active cross-origin communication models, dynamic profile changes, and array sorting loops. 

Future production scales target full hosting deployments on platforms like **Render / Vercel** alongside automated notification modules integrated into messaging systems like **WhatsApp / Telegram API bots** to prompt real-time matching alerts directly to the students.
