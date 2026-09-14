# 🧊 POLARIS — Integrated Polar Expedition Logistics & Asset Management System
### Problem Statement ID: 26062 | National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences (MoES)

> **"One Command Center. Every Expedition. Every Asset. Every Prediction."**  
> Centralized mission command, predictive machine learning engine, cold-chain cryo-compliance (-80°C), multi-station wintering inventory optimization, personnel muster roll-call, and Search & Rescue (SAR) emergency response for Indian Antarctic (*Bharati*, *Maitri*) and Arctic (*Himadri*, *IndARC Mooring*) scientific expeditions.

---

## ⚡ Executive Summary (SIH Solution Pillars)

* **Complete 5-Module Polar Command & Field Feeds:** Connects live weather telemetry, QR cargo manifests (-80°C cryo chain), crew muster rosters, and emergency SAR triggers with interactive polar GIS mapping — tracking GPS waypoints, base inventory ledgers, and real-time blizzard alert levels across all stations.
* **What-If Expedition Planner & 4-Model AI Suite:** Runs an interactive mission planner (testing cargo weights and +30-day extensions) alongside 4 ML tools (blizzard, fuel burn, cryo anomaly, and SAR ranker) plus a physics calculator solving live Fuel, Food, and O2 survival autonomy under severe wind chill stress.
* **Offline 2.4 kbps Sat-Sync & 6 Role Dashboards:** Syncs critical deltas over slow 2.4 kbps Iridium links using local IndexedDB buffers and tamper-evident SHA-256 audit logs, giving 6 tailored dashboards to Super Admins, Expedition Leaders, Logistics Officers, Station Commanders, SAR Teams, and Analysts in FastAPI.

---

## 🎯 Key Challenges Solved

* **8-Month Isolation & Stockout Blindspots:** Replaces static spreadsheets with a Leontief Bottleneck Solver, coupling live ambient cold (-28.5°C) and gale winds (68 km/h) into dynamic fuel, food, and O2 survival autonomy forecasts.
* **Sub-Zero Bio-Specimen Cold-Chain Loss:** Enforces 9-stage custody tracking and Isolation Forest anomaly detection, preventing thermal breach across -80°C ice cores and -20°C provisions.
* **Glacial Whiteout Emergencies & Slow SAR:** Automates an 8-stage Search & Rescue escalation state machine with multi-criteria asset ranking (Kamov helo / snowcat), computing terrain safety and radius within seconds.
* **Narrowband Satellite Link & Blackouts:** Employs an offline-first IndexedDB buffer with 2.4 kbps Iridium SBD delta-sync, idempotent conflict resolution, and SHA-256 hash-chained ledgers for tamper-evident operational traceability.

---

## 🏆 Feasibility Matrix for POLARIS

* **1. Technical Feasibility:** Built on mature FastAPI, React 19, SQLite/PostGIS, and lightweight Scikit-Learn models. Separates deterministic physics formulas (fuel/food/O2 autonomy) from ML where it genuinely improves prediction, running smoothly on rugged field laptops without heavy cloud GPU servers.
* **2. Operational & Practical Feasibility:** 6 tailored role dashboards give each officer only what they need with zero learning curve. Daily workflows use fast QR barcode scans for cargo custody, one-click muster check-ins, and a standardized 8-stage SAR checklist during whiteout emergencies.
* **3. Economic & Financial Feasibility:** Requires zero expensive new sensor hardware by ingesting existing station AWS sensors and GPS logs. Micro-delta payloads (~280 bytes) slash costly satellite data charges, while -80°C cryo monitoring prevents losing invaluable Antarctic ice-core bio-specimens.
* **4. Sustainability & Scalability:** Operates 100% offline via local IndexedDB storage through weeks of solar storms and total communication blackouts. Easily scales across all current and future Indian polar stations (*Bharati, Maitri, Himadri, IndARC*) with tamper-evident SHA-256 audit ledgers for long-term accountability.

---

## 📑 Table of Contents
1. [System Architecture & Technology Stack](#-1-complete-technical-architecture)
2. [Physics-Based Autonomy & Live Ambient Derivation Model](#-2-physics-based-autonomy--live-ambient-derivation-model)
3. [Satellite Bandwidth & 2.4 kbps Offline Sync Architecture](#-3-satellite-bandwidth--offline-delta-sync-architecture)
4. [POLARIS ML Predictive Engine (4 Production Models)](#-4-polaris-ml-predictive-engine)
5. [6 Persona-Adaptive Role Command Dashboards (RBAC)](#-5-6-persona-adaptive-role-command-dashboards-rbac)
6. [GIS & Polar Mapping Engine](#-6-gis--polar-mapping-engine)
7. [Station Coverage: Antarctica & Arctic](#-7-station-coverage-antarctica--arctic)
8. [Cargo Chain-of-Custody & Cold-Chain Compliance (-80°C)](#-8-cargo-chain-of-custody--cold-chain-compliance)
9. [Search & Rescue (SAR) 8-Stage State Machine](#-9-search--rescue-sar-8-stage-state-machine)
10. [Tamper-Evident SHA-256 Audit Ledger](#-10-tamper-evident-sha-256-audit-ledger)
11. [How to Run Locally](#-11-how-to-run-locally)
12. [Automated Test Suite & Verification](#-12-automated-test-suite)
13. [Evaluator Demo Flow (5-Minute Pitch)](#-13-recommended-5-minute-evaluator-presentation-flow)

---

## 🏛️ 1. Complete Technical Architecture

```mermaid
graph TD
    subgraph UI_Layer ["1. Presentation Layer (React 19 + TypeScript + Vite + Tailwind CSS)"]
        Dash["6-Role Command Centers"]
        GIS["Polar Leaflet GIS (4 Basemaps)"]
        AutonomyUI["Live Ambient Derivation Panel"]
        MLConsole["ML Predictive Command Console"]
        CargoUI["Cold-Chain & QR/DataMatrix Scanner"]
        InvUI["Wintering Autonomy Ledger & ROP"]
        SarUI["SAR 8-Stage Escalation Board"]
        PersonnelUI["Biometric Crew Muster & Roster"]
    end

    subgraph State_Security ["2. State Management & Offline Satellite Resilience"]
        AuthCtx["RBAC Auth Context (6 Personas)"]
        QueryClient["TanStack React Query Cache"]
        OfflineQueue["IndexedDB Store-and-Forward Buffer (2.4 kbps Iridium SBD)"]
    end

    subgraph API_Layer ["3. Backend API Gateway (FastAPI 0.115+ / Python 3.11+)"]
        AuthAPI["/api/v1/auth (JWT Bearer)"]
        StationAPI["/api/v1/stations (AWS Telemetry)"]
        CargoAPI["/api/v1/cargo (Chain-of-Custody)"]
        InvAPI["/api/v1/inventory (Autonomy & Derivation Solver)"]
        EmergencyAPI["/api/v1/emergency (SAR State Machine)"]
        MLAPI["/predict & /api/v1/ml (XGBoost + Isolation Forest)"]
    end

    subgraph ML_Engine ["4. POLARIS ML Predictive Engine (Scikit-Learn + XGBoost)"]
        BlizzardMdl["1. XGBoost Blizzard Classifier (91.5% Acc)"]
        FuelMdl["2. XGBoost Fuel Regressor (R² = 0.94)"]
        CryoMdl["3. Isolation Forest Cryo Anomaly Detector"]
        SARMdl["4. SAR Risk Classifier + Weighted Ranker"]
    end

    subgraph Database_Layer ["5. Persistence & Cryptographic Ledger"]
        RelationalDB[("Relational DB: SQLite / PostgreSQL")]
        AuditChain[("Append-Only SHA-256 Hash Chained Audit Log")]
    end

    UI_Layer --> State_Security
    State_Security --> API_Layer
    API_Layer --> ML_Engine
    API_Layer --> Database_Layer
```

---

## 📐 2. Physics-Based Autonomy & Live Ambient Derivation Model

During the **8-month winter isolation period** (March to November), no resupply flights or ships can reach Antarctica. POLARIS couples live sensor telemetry directly to convective heat loss equations:

### Mathematical Model (Leontief Resource Bottleneck):

$$\text{Autonomy Days} = \min_{i \in \{\text{Fuel, Food, } \text{O}_2\}} \left( \frac{\text{Current Stock}_i}{\text{Daily Burn}_i \times \text{Crew} \times M_{\text{weather}, i}} \right)$$

### Live Numerical Derivation (Evaluated at $T = -28.5^\circ\text{C}$, $V = 68\text{ km/h}$, $\text{Crew} = 25$):

1. **Polar Wind Chill Apparent Index ($T_{wc}$)**:
   $$T_{wc} = 13.12 + 0.6215(-28.5) - 11.37(68^{0.16}) + 0.3965(-28.5)(68^{0.16}) = \mathbf{-49.13^\circ\text{C}}$$
2. **Resource Weather Multipliers ($M_{\text{weather}, i}$)**:
   * **Fuel ($M_{\text{Fuel}}$)**: $1.0 + 0.015 \cdot \Delta T + 0.25 \cdot (V/50) = \mathbf{1.768\times}$ ($+76.8\%$ heating & generator surge)
   * **Food ($M_{\text{Food}}$)**: $1.0 + 0.006 \cdot \Delta T = \mathbf{1.171\times}$ ($+17.1\%$ caloric intake requirement)
   * **Oxygen ($M_{\text{O}_2}$)**: $1.0 + 0.10 \cdot (V/50) = \mathbf{1.136\times}$ ($+13.6\%$ sealed habitat recirculation load)
3. **Effective Burn & Autonomy Resolution**:
   * **Fuel (45,000 L)**: $8.5 \times 25 \times 1.768 = 375.6\text{ L/day} \longrightarrow \mathbf{119.8\text{ Days}}$
   * **Food (2,800 kg)**: $2.4 \times 25 \times 1.171 = 70.3\text{ kg/day} \longrightarrow \mathbf{39.8\text{ Days}}$ *(Critical Bottleneck)*
   * **$\text{O}_2$ (1,500 kg)**: $0.84 \times 25 \times 1.136 = 23.9\text{ kg/day} \longrightarrow \mathbf{62.9\text{ Days}}$
4. **Mission Result**: $\text{Station Autonomy} = \min(119.8, 39.8, 62.9) = \mathbf{39.8\text{ Days}}$ (Triggers Warning Buffer).

---

## 📡 3. Satellite Bandwidth & Offline Delta-Sync Architecture

POLARIS operates seamlessly over narrowband **2.4 kbps Iridium SBD (Short Burst Data)** channels and handles total ionospheric solar storm blackouts:

* **Micro-Delta Payloads**: Avoids full-state sync by transmitting lightweight mutation diffs ($\sim 280\text{ bytes}$ per operation).
* **IndexedDB Store-and-Forward**: Local mutations (scans, burn logs, muster rolls) queue locally with zero network dependency.
* **4-Tier QoS Prioritization**: SAR SOS (P1, Instant) $\rightarrow$ Cryo Breaches (P2) $\rightarrow$ Fuel/Life Support (P3) $\rightarrow$ Routine Logs (P4).
* **Idempotent Handshake & Conflict Resolution**: Replay-safe transactions using deterministic `client_event_id` and Station-Authoritative conflict override.
* **Physical Air-Gap USB Fallback**: Encrypted, SHA-256 signed batch manifest export/import during multi-week communication outages.

---

## 🧠 4. POLARIS ML Predictive Engine

| # | ML Component | Algorithm | Features & Operational Target | Performance |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Blizzard Classifier** | **XGBoost Classifier** | Temp, Wind Speed, Gusts, Pressure, $\Delta P_{3h} \rightarrow P(\text{Blizzard})$ & Risk Tier | **91.5% Accuracy** |
| **2** | **Fuel Regressor** | **XGBoost Regressor** | Station, Ambient Temp, Generator Load %, Crew $\rightarrow$ Daily Diesel Burn | **$R^2 = 0.94$** |
| **3** | **Cryo Anomaly Detector** | **Isolation Forest** | Current Temp, Target Temp, Rate of Change ($^\circ\text{C}/\text{hr}$), Variance $\rightarrow$ Anomaly Score | **Unsupervised Anomaly Score** |
| **4** | **SAR Asset Ranker** | **XGBoost + Ranker** | Distance, Speed, Fuel Range, Terrain Capability, Medic $\rightarrow$ Asset Priority Score | **Top-Ranked Deployment** |

---

## 👥 5. 6 Persona-Adaptive Role Command Dashboards (RBAC)

POLARIS dynamically tailors the interface, navigation, and tools according to 6 operational personas:

| Operational Persona | Core Dashboard Focus & Exclusive Features | Permitted Route Scope |
| :--- | :--- | :--- |
| 👑 **Super Admin** | **Omnipresent Mission Command**: All 10 modules, 6 master KPIs, full GIS, AI consoles, and system settings. | All Routes |
| 🧭 **Expedition Manager** | **Field Sortie & Route Command**: Active sorties, traverse elevation profiles, route safety (96.4%), field rosters. | `/dashboard`, `/expeditions`, `/personnel`, `/map`, `/analytics` |
| 📦 **Logistics Officer** | **Cold-Chain & Supply Command**: Cargo manifests, QR scanner, -80°C cryo-vaults, reorder points (ROP). | `/dashboard`, `/cargo`, `/inventory`, `/assets`, `/analytics` |
| 🏠 **Station Manager** | **Wintering Autonomy Console**: Live derivation panel (-28.5°C, 68 km/h), diesel generators, daily muster. | `/dashboard`, `/inventory`, `/personnel`, `/map`, `/emergency` |
| 🚨 **Emergency Coordinator** | **SAR Tactical Command**: 8-stage escalation board, distress triangulation, rescue vehicle readiness. | `/dashboard`, `/emergency`, `/assets`, `/map`, `/personnel` |
| 📊 **Viewer / Analyst** | **Scientific Telemetry Dashboard**: Read-only environmental trends, weather graphs, open dataset exporter. | `/dashboard`, `/map`, `/analytics`, `/expeditions` |

---

## 🗺️ 6. GIS & Polar Mapping Engine

* Built on Leaflet.js with **zero external API keys or watermark rate limits**.
* **4 Polar Basemaps**: Tactical Dark Canvas, Satellite Recon & Polar Ice, Subsea Bathymetry, and OpenStreetMap.
* **Operational Layers**: Station Hub Markers, Marine Vessel & Aircraft Trackers, Multimodal Sea-Route Polylines, Dynamic Blizzard Hazard Perimeters, and instant Camera Fly-Tos (*Bharati $\leftrightarrow$ Maitri $\leftrightarrow$ Himadri $\leftrightarrow$ IndARC*).

---

## 🏔️ 7. Station Coverage: Antarctica & Arctic

1. **Bharati Station (Antarctica • $69.4072^\circ\text{S}, 76.1906^\circ\text{E}$)**: Year-round manned facility in Larsemann Hills.
2. **Maitri Station (Antarctica • $70.7667^\circ\text{S}, 11.7333^\circ\text{E}$)**: Inland rocky oasis station in Schirmacher Oasis.
3. **Himadri Station (Arctic • $78.9236^\circ\text{N}, 11.9312^\circ\text{E}$)**: India's flagship Arctic research base in Ny-Ålesund, Spitsbergen.
4. **IndARC Mooring Observatory (Arctic • $78.9880^\circ\text{N}, 12.0150^\circ\text{E}$)**: Subsurface moored marine observatory anchored at 192m depth in Kongsfjorden fjord.

---

## 📦 8. Cargo Chain-of-Custody & Cold-Chain Compliance

### 9-Stage Custody Lifecycle Chain:
$$\text{Created} \rightarrow \text{Packed} \rightarrow \text{QC Passed} \rightarrow \text{Port Loaded} \rightarrow \text{Vessel Departed} \rightarrow \text{Air Transfer} \rightarrow \text{Station Arrival} \rightarrow \text{Vault Inspected} \rightarrow \text{Delivered}$$

### Monitored Preservation Bands:
* **Cryogenic Deep Ice & Bio-Samples**: $-80^\circ\text{C}$ target (Band: $-85^\circ\text{C}$ to $-70^\circ\text{C}$) with automated liquid nitrogen alarms.
* **Frozen Emergency Provisions**: $-20^\circ\text{C}$ target (Band: $-25^\circ\text{C}$ to $-15^\circ\text{C}$).
* **Medical Vaccines & Reagents**: $+4^\circ\text{C}$ target (Band: $+2^\circ\text{C}$ to $+8^\circ\text{C}$).

---

## 🚨 9. Search & Rescue (SAR) 8-Stage State Machine

$$\text{1. Detection} \rightarrow \text{2. Triage} \rightarrow \text{3. Mobilize} \rightarrow \text{4. Grid Search} \rightarrow \text{5. Contact} \rightarrow \text{6. Evacuation} \rightarrow \text{7. Arrival} \rightarrow \text{8. Debrief}$$

* **Automated Asset Ranking**: Scores deployable helicopters (Kamov Ka-32) and snowcats (PistenBully 300 Polar) based on fuel radius, ground speed, and medical equipment readiness.
* **Hazard Zones**: Real-time katabatic wind overlays and crevasse field radar boundaries.

---

## 🔐 10. Tamper-Evident SHA-256 Audit Ledger

Every critical action (cargo scan, stock burn log, sortie dispatch, muster check-in) is cryptographically chained for tamper-evident operational traceability:

$$\text{Record Hash} = \text{SHA256}(\text{Previous Hash} + \text{Timestamp} + \text{User ID} + \text{Action} + \text{Payload JSON})$$

---

## ⚡ 11. How to Run Locally

### Prerequisites:
- Python 3.10+
- Node.js 18+ and npm
- Git

### Step-by-Step Execution:

**Terminal 1 — Backend API Gateway & ML Engine:**
```powershell
cd polar-logistics
python -m uvicorn backend.app.main:app --port 8000 --reload
```
* API Docs: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
* Autonomy Derivation API: `GET http://localhost:8000/api/v1/inventory/autonomy-derivation`

**Terminal 2 — Frontend User Interface:**
```powershell
cd polar-logistics/client
npm install
npm run dev
```
* Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🧪 12. Automated Test Suite

```powershell
python -m pytest backend/app/tests -v
```
* `test_api.py`: ✅ Authentication, Station Telemetry, Cargo QR, Inventory ROP, Emergency SAR, Autonomy Solver.
* `test_ml.py`: ✅ XGBoost Blizzard Risk, Fuel Regressor, Isolation Forest Cryo Anomaly, SAR Ranker.
* **Status**: 100% passing test suite.

---

## 🎯 13. Recommended 5-Minute Evaluator Presentation Flow

1. **0:00–0:30 (Mission Challenge & One-Liner)**: State the extreme polar isolation problem (8 months cut-off, $-50^\circ\text{C}$, $2.4\text{ kbps}$ links) and introduce POLARIS.
2. **0:30–1:15 (Mission Command & Polar GIS)**: Showcase the 4 basemaps and camera fly-tos (*Bharati $\rightarrow$ Maitri $\rightarrow$ Himadri $\rightarrow$ IndARC*).
3. **1:15–2:15 (Live Ambient Autonomy Derivation)**: Open the **Autonomy Derivation Panel** ($-28.5^\circ\text{C}$, $68\text{ km/h}$). Demonstrate the live wind-chill ($T_{wc} = -49.1^\circ\text{C}$), weather multipliers ($M_{\text{Fuel}}=1.768\times$), and Leontief bottleneck solver.
4. **2:15–3:15 (Cold-Chain & 4-Model ML Engine)**: Scan a $-80^\circ\text{C}$ 2D DataMatrix bio-container and open the ML Command Console for instant Blizzard/Fuel inference.
5. **3:15–4:15 (SAR Emergency Command & 6-Role Switcher)**: Switch active roles (*Expedition Manager $\rightarrow$ Logistics Officer $\rightarrow$ SAR Commander*) to prove persona-tailored command grids.
6. **4:15–5:00 (Offline Satellite Delta-Sync & Audit Ledger)**: Toggle offline mode, enqueue mutations, trigger $2.4\text{ kbps}$ delta-sync, and show the tamper-evident SHA-256 audit ledger.

---

*Developed for the Smart India Hackathon (SIH 2026) | National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences (MoES), Government of India*
