# 🧊 POLARIS — Integrated Polar Expedition Logistics & Asset Management System
### Problem Statement ID: 26062 | Ministry of Earth Sciences (MoES) / NCPOR

> **One Command Center. Every Expedition. Every Asset.**
> Real-time logistics, cold-chain IoT tracking, multi-station inventory optimization, crew muster, and Search & Rescue (SAR) incident response for Indian Antarctic (*Bharati*, *Maitri*) and Arctic (*Himadri*, *IndARC*) scientific expeditions.

---

## 🚀 Key Highlights & Architecture

- **Command Dashboard**: Live sub-zero station meteorological feeds (Larsemann Hills, Schirmacher Oasis, Svalbard), active expedition charter tracking, critical stock alarms, and SAR incident alerts.
- **Polar Geospatial Intelligence (GIS Map)**: Custom stereographic polar Leaflet map rendering station waypoints, chartered icebreakers (*MV Vasiliy Golovnin*), Kamov helicopters, PistenBully convoys, and SOS distress locations.
- **Cold-Chain IoT & Cargo 2D Matrix / QR**: End-to-end multimodal transit tracking from Mormugao Port (Goa) to Station Cryo-Vaults with continuous -80°C threshold compliance monitoring and simulated optical QR/barcode scanner.
- **Multi-Station Inventory Ledger & AI Fuel Burn Optimization**: Real-time stock ledgers for Polar Fuel (D-10/ATF), emergency MRE rations, and machinery spares with wintering autonomy burn forecasting.
- **Personnel Tracking & Biometric Muster Roll**: Roster of scientists, engineers, and defense logistics crew with Class-A polar medical certifications, tactical callsigns, and 100% headcount muster verification.
- **Emergency SAR & Blizzard Incident Commander**: 3-Stage whiteout alert triggers, automatic sortie recall directives, SAR unit dispatching, and chronological radio action logs.
- **Digital Twin Simulation Mode**: 4-Stage deterministic walkthrough (Blizzard lockdown -> SAR dispatch -> Cryo-sample alert -> Relief air-drop) designed for high-impact live demonstration.

---

## 🔐 1-Click Demo Accounts (Evaluator Quick Access)

The platform comes pre-seeded with 6 role-based accounts. On the `/login` page, you can click any of the 1-click role badges or enter credentials manually:

**Default Security Password for all demo accounts:** `Polaris2026!`

| Role | Email | Name / Designation | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@polaris.gov.in` | Dr. Arvind Swaminathan (Director NCPOR) | Unrestricted system-wide command & audit log access |
| **Expedition Manager** | `expedition@polaris.gov.in` | Dr. Meera Nambiar (Mission Director) | Charter expeditions, approve budgets, allocate cargo quotas |
| **Logistics Officer** | `logistics@polaris.gov.in` | Wg Cdr Tarun Jaswal (Logistics Chief) | Cargo manifest QR scan, cold-chain monitoring, fleet dispatch |
| **Station Manager** | `station@polaris.gov.in` | Er. Sandeep Bopche (Station Commander) | Inventory ledger, stock adjustments, blizzard lockdown control |
| **Emergency Coordinator** | `emergency@polaris.gov.in` | Capt. R. Deshmukh (SAR Commander) | Broadcast SOS alerts, assign rescue units, manage action logs |
| **Viewer / Analyst** | `viewer@polaris.gov.in` | Aditi Sharma (MoES Analyst) | Read-only access to GIS maps, telemetry charts, and analytics |

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11+ / FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, Python-Jose JWT Auth, Bcrypt, SQLite (production ready for PostgreSQL).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack React Query, React Router v6, Leaflet & React-Leaflet GIS, Recharts, Lucide Icons.
- **DevOps**: Docker, Docker Compose, Nginx reverse proxy.

---

## ⚡ Quick Start & Local Execution

### Option 1: Run Locally (Fastest)

#### 1. Backend Setup:
```bash
# Navigate to backend and install requirements
cd backend
pip install -r requirements.txt

# Seed the database with realistic polar data & demo users
python -m app.db.seed

# Start the FastAPI server
uvicorn app.main:app --port 8000 --reload
```
*Backend API docs available at `http://localhost:8000/docs`*

#### 2. Frontend Setup:
```bash
# In another terminal, navigate to client
cd client
npm install
npm run dev
```
*Frontend Command Center available at `http://localhost:5173`*

---

### Option 2: Docker Compose
```bash
docker-compose up --build
```
*Access frontend at `http://localhost:5173` and backend at `http://localhost:8000`*

---

## 🧪 Automated Testing

To run the backend test suite:
```bash
python -m pytest backend/app/tests -v
```

---

## 🏛️ Government Compliance & Security
- **RBAC**: Strict role-based permission guards on all sensitive mutations.
- **Audit Logging**: Every cargo status change, stock adjustment, and emergency directive creates an immutable record in `audit_logs`.
- **Sub-Zero Reliability**: Designed for low-bandwidth satellite networks with local state buffering.

*Developed for the Smart India Hackathon (SIH 2026) | National Centre for Polar and Ocean Research (NCPOR)*
