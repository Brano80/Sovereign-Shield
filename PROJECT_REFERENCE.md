# Project Reference — Veridion Nexus / Sovereign Shield

This document describes what is built in this repository and matches the current codebase.

---

## 1. Overview

- **Backend**: Rust (Actix-web) API running on `http://localhost:8080`.
- **Frontend**: Next.js 14 dashboard (Sovereign Shield) in `dashboard/`, running on `http://localhost:3000`.
- **Theme**: Dark (slate-900/800/700), emerald accents for active states, no external UI libraries. Icons from `lucide-react`. Fonts: Inter, JetBrains Mono (via `next/font`).

---

## 2. Dashboard Structure

### 2.1 App layout and shell

- **`dashboard/app/layout.tsx`**: Root layout; metadata title "Sovereign Shield Dashboard"; fonts `Inter` and `JetBrains_Mono` with CSS variables `--font-geist-sans`, `--font-geist-mono`.
- **`dashboard/app/globals.css`**: Tailwind v3 directives; `:root` background `#0f172a`, foreground `#e2e8f0`; custom scrollbar (slate).
- **`dashboard/app/components/DashboardLayout.tsx`**: Wraps all pages with fixed sidebar + main content (`ml-64`, `p-8`), background `bg-slate-900`.
- **`dashboard/app/components/Sidebar.tsx`**: Fixed left nav (`w-64`, `bg-slate-800`, `border-slate-700`). Branding: "VERIDION NEXUS" / "Compliance Dashboard v1.0.0". Nav items (in order):
  1. **Sovereign Shield** → `/` (Globe)
  2. **Transfer Log** → `/transfer-log` (List)
  3. **Review Queue** → `/review-queue` (ClipboardCheck)
  4. **SCC Registry** → `/scc-registry` (FileText)
  5. **Adequate Countries** → `/adequate-countries` (MapPin)
  6. **Evidence Vault** → `/evidence-vault` (Shield)
  Active link: `bg-emerald-900/30 text-emerald-400 border border-emerald-800`.

---

## 3. Pages (routes and behaviour)

### 3.1 Sovereign Shield (home) — `dashboard/app/page.tsx`

- **Route**: `/`
- **Data**: `fetchEvidenceEvents()` from API; auto-refresh every 5s; manual Refresh button.
- **Header**: Title "SOVEREIGN SHIELD", subtitle "GDPR Art. 44-49 • International Data Transfers".
- **Status bar**: Single line with status (PROTECTED → "ENABLED", ATTENTION, AT_RISK), icons (CheckCircle / AlertTriangle), total transfers, Blocked, Allowed, Last scan. Derived from today’s events (blocked/allowed/review counts).
- **KPI cards (8)**:
  - Row 1: TRANSFERS (24H), ADEQUATE COUNTRIES (15), HIGH RISK DESTINATIONS (0), BLOCKED TODAY.
  - Row 2: SCC COVERAGE (0%), EXPIRING SCCs (0), PENDING APPROVALS (review count), ACTIVE AGENTS (0).
- **Thin separator**: Single `border-b border-slate-700` line (no tab menu).
- **Main content**:
  - **Left (7 cols)**: TRANSFER MAP — `SovereignMap` (wraps `WorldMap`). Height 400px; title "TRANSFER MAP"; legend: Adequate Protection (green), SCC Required (orange), Transfer Blocked (red); caption "Map will show transfer destinations and routes". Country borders: stroke `#64748b`, strokeWidth 0.5. Zoom/pan via `react-simple-maps` `ZoomableGroup`. TopoJSON from `world-atlas@2/countries-110m.json`.
  - **Right (5 cols)**: REQUIRES ATTENTION — Header "REQUIRES ATTENTION" (AlertTriangle), "View All →". List of events where `eventType === 'DATA_TRANSFER_BLOCKED' | 'DATA_TRANSFER_REVIEW'` or `verificationStatus === 'BLOCK' | 'REVIEW'` (up to 5). Each row: country name, badge "Blocked" (red) or "SCC Required" (yellow) next to name, timestamp, and for SCC Required an orange "Register SCC →" button linking to `/scc-registry`. Empty state: "All SCC-required transfers are covered".
  - **Below**: RECENT ACTIVITY — Table of last 10 events: timestamp + "Transfer to {country}" on left, status badge (BLOCK / REVIEW / ALLOW) on the right. Badges: red/yellow/green.

### 3.2 Transfer Log — `dashboard/app/transfer-log/page.tsx`

- **Route**: `/transfer-log`
- **Data**: Same `fetchEvidenceEvents()`; filter state `ALL | ALLOWED | BLOCKED | PENDING`.
- **UI**: Title "Transfer Log", subtitle "Complete history of all data transfer decisions". Filter buttons (ALL, ALLOWED, BLOCKED, PENDING). Table: Timestamp, Destination, Status (ALLOWED / BLOCKED / REVIEW). Filtering by eventType and verificationStatus.

### 3.3 Review Queue — `dashboard/app/review-queue/page.tsx`

- **Route**: `/review-queue`
- **Data**: `fetchReviewQueuePending()` (GET `/api/v1/human_oversight/pending`). Approve: `approveReviewQueueItem(sealId)`; Reject: `rejectReviewQueueItem(sealId)`.
- **UI**: Title "Review Queue", subtitle "Pending REVIEW decisions requiring human oversight". Table: Transfer Details, Reason Flagged, Suggested Decision, Actions (Approve / Reject). Auto-refresh every 5s.

### 3.4 SCC Registry — `dashboard/app/scc-registry/page.tsx`

- **Route**: `/scc-registry`
- **Data**: `fetchSCCRegistries()`, `createSCCRegistry({ partnerName, destinationCountry, expiryDate })`. Country options from `SCC_REQUIRED_COUNTRIES` (US, IN, BR, MX, SG, KR, ZA); partner suggestions (e.g. AWS, Google Cloud, Microsoft Azure).
- **UI**:
  - **Registration wizard** (3 steps): Step 1 — Partner name (with suggestions), country (dropdown with flags); Step 2 — SCC Module (Module1–4), DPA ID, Signed date, Expiry date, TIA completed; Step 3 — Summary and submit. Submitting sends `partner_name`, `destination_country_code` (2-letter), `expires_at` (RFC3339).
  - **Filters**: Search term, status filter (All Status, ACTIVE, EXPIRING, EXPIRED). Status derived from expiry date (e.g. &lt;=0 days → EXPIRED, &lt;=14 → EXPIRING).
  - **Summary bar**: Total, Critical (expired), Warning (expiring), Active counts.
  - **Table**: Expandable rows; columns Partner, Country (flag + code), Contract Type (SCC), Signed/Expiry dates, DPA ID, Days until expiry, TIA Status; actions View, Edit, Renew, Revoke. Expand shows extra details.

### 3.5 Adequate Countries — `dashboard/app/adequate-countries/page.tsx`

- **Route**: `/adequate-countries`
- **UI**: Page title "Country Classifications", subtitle "EU adequacy, SCC-required, and blocked destinations". Three side-by-side sections (same card design):
  1. **EU-Recognised Adequate Countries**: Title + "Valid EU Commission adequacy decisions". Grid of country cards (flag, name, code, badge "Adequate Protection" green). Countries: Andorra, Argentina, Canada, Faroe Islands, Guernsey, Israel, Isle of Man, Japan, Jersey, New Zealand, Republic of Korea, Switzerland, United Kingdom, Uruguay.
  2. **SCC Required Countries**: Title + "Transfers allowed with Standard Contractual Clauses". Same card layout, badge "SCC Required" (orange). Countries: United States, India, Brazil, South Africa, Mexico, Indonesia, Turkey, Philippines, Vietnam, Egypt, Nigeria, Pakistan, Bangladesh, Thailand, Malaysia.
  3. **Blocked Countries**: Title + "No transfer permitted under policy". Badge "Blocked" (red). Countries: China, Russia, Iran, North Korea, Syria, Belarus.
- **Footer note**: Explains adequate vs SCC-required vs blocked. All data is static (no API).

### 3.6 Evidence Vault — `dashboard/app/evidence-vault/page.tsx`

- **Route**: `/evidence-vault`
- **Query**: `eventId` in URL highlights that row (and can pre-fill search).
- **Data**: `fetchEvidenceEvents()`, `verifyIntegrity()` (POST verify-integrity). Filters: riskLevel (severity), destinationCountry, search (id/eventId/eventType/payloadHash). Listens for `refresh-evidence-vault` custom event.
- **UI**:
  - **Header**: Title "EVIDENCE VAULT" (no icon), subtitle "GDPR Art. 32 • Audit Archive & Evidence Chain". Buttons: Export for Audit (PDF) — placeholder; Export (JSON) — downloads JSON; Refresh.
  - **Status bar**: "Status: ACTIVE" (Shield icon), Last scan, event count, Chain integrity badge (VALID/TAMPERED), "Verify Chain Integrity" button.
  - **Filters**: Risk Level dropdown, Destination Country input, Search input; quick chips L1–L4.
  - **Table**: Event (type + eventId + seq), Risk Level (severity + icon), Destination (country, code, endpoint), Data (data_category, records), Source (sourceSystem, sourceIp), Time (relative + full), Verification (VERIFIED/PENDING/UNVERIFIED), Actions (Eye). Row click and Eye open detail (currently console.log). Highlighted row by `eventId` query: `bg-blue-500/10 border-l-2 border-blue-500`.
- **Export**: JSON export; PDF shows "coming soon".

---

## 4. Shared components

- **`dashboard/app/components/SovereignMap.tsx`**: Consumes `EvidenceEvent[]`; maps destination country from payload to country status using sets `ADEQUATE_COUNTRIES`, `SCC_REQUIRED_COUNTRIES`, `BLOCKED_COUNTRIES` and transfer counts (e.g. last 7 days). Outputs `CountryData[]` (code, name, status, transfers) for `WorldMap`. Handles loading state.
- **`dashboard/app/components/WorldMap.tsx`**: Uses `react-simple-maps` (ComposableMap, Geographies, Geography, ZoomableGroup). Props: `countries`, `isLoading`, `onCountryClick`. Renders "TRANSFER MAP" title, 400px-tall map, legend, caption. Tooltips on hover (country, status, transfers, mechanisms). Country fill by status (adequate/scc_required/blocked) and transfer count (muted if 0).

---

## 5. API client — `dashboard/app/utils/api.ts`

- **Base URL**: `http://localhost:8080`
- **Types**: `EvidenceEvent`, `SCCRegistry`, `ReviewQueueItem`.
- **Endpoints used**:
  - `GET /api/v1/evidence/events` → `fetchEvidenceEvents()`; normalises `data.events` or `data` to array.
  - `GET /api/v1/scc-registries` → `fetchSCCRegistries()`; maps backend snake_case/camelCase to frontend `SCCRegistry`.
  - `POST /api/v1/scc-registries` → `createSCCRegistry()`; body `partner_name`, `destination_country_code`, `expires_at`; country name→code mapping for known names.
  - `GET /api/v1/human_oversight/pending` → `fetchReviewQueuePending()`.
  - `POST /api/v1/action/{sealId}/approve` → `approveReviewQueueItem()`; body decision, reason, reviewerId.
  - `POST /api/v1/action/{sealId}/reject` → `rejectReviewQueueItem()`.
  - `POST /api/v1/evidence/verify-integrity` → `verifyIntegrity()`; returns `{ status: 'VALID' | 'TAMPERED' }`.

---

## 6. Backend (Rust) — relevant for dashboard

- Evidence: `GET /api/v1/evidence/events`, `POST /api/v1/evidence/verify-integrity` (see `src/routes_evidence.rs`).
- SCC: `GET /api/v1/scc-registries`, `POST /api/v1/scc-registries`, `DELETE /api/v1/scc-registries/{id}` (see `src/routes_shield.rs`).
- Review queue: `GET /api/v1/human_oversight/pending`, `POST /api/v1/action/{seal_id}/approve`, `POST /api/v1/action/{seal_id}/reject` (see `src/routes_review_queue.rs`).

Dashboard does not call: `/api/v1/review-queue`, `/api/v1/shield/*`, `/api/v1/lenses/*`, auth, or other backend routes.

---

## 7. Tech stack (dashboard)

- **Next**: 14.x (App Router).
- **React**: 18.
- **Styling**: Tailwind CSS 3.x.
- **Icons**: lucide-react.
- **Maps**: react-simple-maps, d3 (types); TopoJSON from cdn.jsdelivr.net (world-atlas@2).
- **Scripts**: `npm run dev` (port 3000), `build`, `start`, `lint`.

---

## 8. File map (dashboard)

| Path | Purpose |
|------|--------|
| `app/layout.tsx` | Root layout, fonts, metadata |
| `app/globals.css` | Tailwind, theme variables, scrollbar |
| `app/page.tsx` | Sovereign Shield home |
| `app/transfer-log/page.tsx` | Transfer Log |
| `app/review-queue/page.tsx` | Review Queue |
| `app/scc-registry/page.tsx` | SCC Registry |
| `app/adequate-countries/page.tsx` | Adequate / SCC Required / Blocked countries |
| `app/evidence-vault/page.tsx` | Evidence Vault |
| `app/components/DashboardLayout.tsx` | Sidebar + main wrapper |
| `app/components/Sidebar.tsx` | Nav links |
| `app/components/SovereignMap.tsx` | Map data from events |
| `app/components/WorldMap.tsx` | Interactive world map |
| `app/utils/api.ts` | API client and types |

This reference reflects the code as of the last review. When changing behaviour or routes, update this file to keep it accurate.
