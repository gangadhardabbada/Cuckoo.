# Cuckoo — Private WhatsApp Broadcaster & Campaign Composer

Cuckoo is a professional 1-to-1 WhatsApp broadcasting platform that enables users to import contact lists, discover groupings, clean contact information, compose personalized messages, and run broadcast campaigns safely using their own WhatsApp session.

---

## 🌟 Key Features

### 1. Two-Column Campaign Composer Workspace

A fully redesigned step 4/5 editor layout providing a unified, dashboard-like workspace:

- **Smart Recipient Context**: Clear displays of list name, recipient counts, invalid contacts, and duplicates, with dynamic warnings if contacts will be skipped.
- **⚡ Spontaneous Templates**: Includes prebuilt template chips (Event Invitation, Reminder, Meeting Notice, Hackathon Update, Festival Greeting, Placement Drive) with instant load or preview overrides.
- **Personalization Variable helpers**: Clicking `{{name}}`, `{{first_name}}`, or `{{last_name}}` inserts formatting placeholders directly at the editor's cursor position.
- **Auto-Growing Textarea & Autosave**: Auto-adjusts height as you type with a live saving status (e.g. `✓ Draft saved (Last saved 10:42 AM)`).
- **Delivery Health Indicator**: Instantly checks messages for excessive capitalization, insecure links, suspicious url shorteners, or excessive emojis to ensure maximum deliverability and protect sender reputation.
- **Secondary AI Assistant toolbar**: Secondary chips (`Improve`, `Shorten`, `Expand`, `Formal`, `Professional`, `Friendly`, `Reminder`) that generate side-by-side comparison proposals (Before/After) without replacing the working editor.
- **Interactive Campaign Settings**: Set delays with custom recommendation alerts, toggle personalization, and toggle variable preview state.

### 2. Live WhatsApp Device Preview

- Displays real-time message text substitutions as they would look on a recipient's phone.
- Generates dynamic previews of personalized fields (`{{first_name}}` -> `Sample Contact`).
- Integrates realistic WhatsApp chat bubble styles, timestamp tags, and double checks (`✓✓`).
- Renders simple WhatsApp markdown tags (e.g. `*bold*`, `_italic_`, `~strikethrough~`, and `` `code` ``) natively inside the bubble.

### 3. Smart Discovery & Contact Cleaning

- Automatically reads imported Excel or CSV files.
- Generates a discovery quality score.
- Categorizes rows into logical groups, filters duplicates, and flags invalid numbers before drafting messages.

---

## 🏗️ Architecture & Technologies

The project is structured into three main modules:

1. **Frontend (`/frontend`)**:
   - Built on React 18, Vite, and Vanilla CSS.
   - Leverages HTML5 Semantic tags, real-time Socket.io feedback, and local drafts synchronization.
2. **Flask Backend (`/backend`)**:
   - Python-based Flask API managing parsing algorithms, data quality metrics, and business logic.
3. **WhatsApp Service (`/whatsapp-service`)**:
   - Node.js service running `whatsapp-web.js` to manage session QR generation, device linkages, webhook notifications, and automated message queues.

---

## 🚀 Getting Started & Local Setup

### Prerequisites

- Python 3.8+ (with pip)
- Node.js 18+ (with npm)
- Chrome or Chromium browser (for headless session automations)

### Quick Start

To launch the entire platform, run the starter batch script from the root directory:

```bash
start-all.bat
```

*Note: Ensure target paths in the script match your local repository configuration before execution.*

### Running Manually

#### 1. Start the Flask Backend

```bash
cd backend
python -m venv venv
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python run.py
```

#### 2. Start the WhatsApp Service

```bash
cd whatsapp-service
npm install
node server.js
```

#### 3. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📅 Recent Work & Feature Updates

Below is a summary of features and modules implemented recently:

### 1. WhatsApp Connection & Session Manager

- Added **Dual Connection Mode** allowing setups via both traditional **WhatsApp Web QR scan code** and **WhatsApp Cloud API** permanent credential authentication.
- Configured real-time WebSocket messaging connecting node-services and the React layout to report live connection states (`initializing`, `qr_ready`, `connected`, `disconnected`).
- Implemented headless session handling under the hood with local caching for persistent authentication states.

### 2. Smart List Uploads & Data Validation

- Created the Python Flask routing backend `/upload` using the `phonenumbers` package to normalize invalid numbers and extract duplicates.
- Integrated SQLite database schemas (`ContactList`, `Contact`) via SQLAlchemy to persist target audiences.
- Built a visual **Smart Discovery** audit screen with a contact list quality score metric (out of 10) and interactive tables filtering out invalid entries.

### 3. Redesigned Campaign Composer Workspace

- Replaced the simple form layout with a responsive, full-screen **two-column layout (60% / 40%)**.
- Implemented **Personalization variables helper chips** (`{{name}}`, `{{first_name}}`, `{{last_name}}`) inserting tokens directly into textarea focus cursors.
- Designed **Campaign Templates** selector supporting quick previews and insertion overrides.
- Configured **Deliverability Health checks** warning users of high capitalization ratios, unsecured links (`http://`), generic url shorteners (`bit.ly`), or emoji stuffing (>5).
- Reordered **AI Message Tools** according to frequency of use and integrated side-by-side **Before / After compact suggestion panels** allowing users to review AI proposals.
- Added a **Live WhatsApp Preview mockup** updating in real time, featuring chat bubble tails, timestamps, Blue read checkmarks, name substitutions, and native formatting parsing (`*bold*`, `_italic_`, `~strikethrough~`, `` `code` ``).
- Grouped delay and personalization variables toggles under a dedicated **Campaign Settings** card.
- Implemented dynamic **autosave draft feedback** showing live updating timestamps (e.g. `✓ Draft saved (Last saved 10:42 AM)`).
