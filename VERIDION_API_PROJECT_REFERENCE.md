# Veridion API — Project Reference

**Version:** 1.0  
**Last updated:** 2026-02-25

This is the **definitive project reference** for Veridion API. Use it to onboard, scope work, and align with vision and tech stack.

**Recent updates (2026-02-25):** Sovereign Shield dashboard: BLOCKED (24H) KPI includes human rejections (`HUMAN_OVERSIGHT_REJECTED`); PENDING APPROVALS = SCC-required without valid SCC; Requires Attention shows only those and links to Transfer Detail; Transfer Detail page with Reject/Approve (Approve hidden when SCC required) and Add SCC; SCC registration auto-approves pending reviews for that destination; Evidence Vault KPIs and paginated archive; review queue creation with `evidence_event_id` (migration 022). See `PROJECT_REFERENCE.md` for full dashboard and API behaviour.

---

## 1. Vision

**Veridion API** is a **standalone HTTP API and database** for EU-focused compliance tooling. It is built to:

- Provide a **separate service and database** from any other Veridion product (e.g. veridion-nexus), with no shared code or migration path.
- Expose **health, auth, and (over time) compliance endpoints** that frontends and other services can call.
- Support **four compliance pillars** at the data layer from day one:
  - **Sovereign Shield** — international transfer monitoring and blocking (GDPR Art. 44–49).
  - **Evidence Vault** — append-only, sealed evidence for audits and export.
  - **Crypto Shredder** — key storage and shredding for GDPR Art. 17 (right to erasure).
  - **Human Oversight** — queue and status for human review (e.g. EU AI Act Art. 14).

The vision is a **single, deployable API** that owns its schema and can grow from a minimal service (health + dev auth) into a full compliance API without depending on another codebase.

---

## 2. What This Project Is

| Aspect | Description |
|--------|-------------|
| **Product** | Standalone REST API service. Own PostgreSQL database. Own migrations. |
| **Boundary** | No shared migrations, shared DB, or shared Rust crates with veridion-nexus or other repos. |
| **Current scope** | Health check, developer auth bypass (JWT), CORS, and five migrations that create the schema for users and the four pillars. |
| **Planned scope** | Routes and services for Sovereign Shield, Evidence Vault, Crypto Shredder, and Human Oversight (to be added incrementally). |

**What it is not:**

- Not a fork or subset of veridion-nexus.
- Not a monorepo member that shares `migrations/` or `src/` with another project.
- Not a frontend or dashboard (consumers call this API).

---

## 3. Tech Stack

### Runtime & language

- **Rust** (edition 2021)
- **Tokio** — async runtime
- **Actix-web** — HTTP server (with gzip compression)

### Database

- **PostgreSQL** — single database per deployment
- **SQLx** — async driver, migrations, compile-time optional
  - Features: `runtime-tokio-rustls`, `postgres`, `chrono`, `uuid`, `migrate`

### Auth & API

- **jsonwebtoken** — JWT for dev-bypass (and future auth)
- **bcrypt** — password hashing (e.g. seeded admin)
- **actix-cors** — configurable CORS (e.g. from `ALLOWED_ORIGINS`)
- **actix-web-httpauth** — dependency available for future Bearer auth

### Serialization & time

- **serde** / **serde_json** — request/response and config
- **chrono** — timestamps and durations
- **uuid** — IDs and correlation identifiers

### Config & logging

- **dotenv** — load `.env` (e.g. `DATABASE_URL`, `SERVER_PORT`)
- **log** + **env_logger** — logging

### Summary table

| Layer        | Technology        |
|-------------|-------------------|
| Language    | Rust 2021         |
| Async       | Tokio             |
| HTTP        | Actix-web 4       |
| Database    | PostgreSQL + SQLx |
| Auth        | JWT, bcrypt       |
| Config      | `.env` / env vars |
| Logging     | log, env_logger   |

---

## 4. Project Structure

```
veridion-api/
├── Cargo.toml              # Single binary, dependencies
├── src/
│   └── main.rs            # Only Rust entrypoint (health, dev-bypass, migrations, CORS)
├── migrations/            # Self-contained schema (no external path)
│   ├── 001_initial_schema.sql
│   ├── 002_seed_admin.sql
│   ├── 003_compliance_and_human_oversight.sql
│   ├── 004_encrypted_log_keys_crypto_shredder.sql
│   └── 005_evidence_vault_and_sovereign_shield.sql
├── .env                   # DATABASE_URL, SERVER_*, ALLOWED_ORIGINS, RUST_ENV, optional vars
├── VERIDION_API_PROJECT_REFERENCE.md   # This file
├── VERIFICATION_REPORT.md             # Schema vs pillars verification
└── SENTINEL_AUDIT.md                  # Standalone audit and remediation log
```

**Migrations (what they create):**

- **001** — `users` (auth / dev-bypass).
- **002** — Seed admin user (admin / password).
- **003** — `compliance_records`, `human_oversight` (Human Oversight + sealing base).
- **004** — `encrypted_log_keys` (Crypto Shredder).
- **005** — `evidence_events` (Evidence Vault + Sovereign Shield).

---

## 5. Configuration

| Variable           | Required | Purpose |
|--------------------|----------|---------|
| `DATABASE_URL`      | Yes      | PostgreSQL connection string (e.g. `postgresql://user:password@host:port/dbname`) |
| `SERVER_HOST`       | No       | Bind host (default `0.0.0.0`) |
| `SERVER_PORT`       | No       | Bind port (default `8080`) |
| `ALLOWED_ORIGINS`   | No       | CORS origins, comma-separated (default includes localhost:3000) |
| `RUST_ENV`          | No       | e.g. `development`; production disables dev-bypass |
| `JWT_SECRET`        | No       | Secret for JWT; dev default if unset |
| `MIGRATIONS_PATH`   | No       | Override migrations directory (default `./migrations`) |
| `RESET_MIGRATIONS`   | No       | If set, drop `_sqlx_migrations` and re-run all migrations (one-time fix) |

---

## 6. Endpoints (current)

| Method + path                      | Purpose |
|------------------------------------|--------|
| `GET /health`                      | Liveness; returns service name and version. |
| `GET /api/v1/auth/dev-bypass`      | Developer login: returns JWT + user (admin) when not in production. |
| `GET /api/v1/evidence/events`      | List evidence events (Evidence Vault). |
| `GET /api/v1/scc-registries`       | List SCC registries. |
| `POST /api/v1/scc-registries`     | Register SCC; **auto-approves** pending review items for that destination. |
| `GET /api/v1/review-queue`        | List all review queue items. |
| `GET /api/v1/human_oversight/pending` | List pending review items. |
| `POST /api/v1/review-queue`       | Create review item (with `evidence_event_id`). |
| `POST /api/v1/action/{seal_id}/approve` | Approve review (human oversight). |
| `POST /api/v1/action/{seal_id}/reject` | Reject review; creates `HUMAN_OVERSIGHT_REJECTED` (counted in BLOCKED 24H). |

For full route list and dashboard behaviour see `PROJECT_REFERENCE.md` and `src/main.rs` startup log.

---

## 7. How to Run

1. Create a dedicated PostgreSQL database (e.g. `veridion_api`).
2. Set `DATABASE_URL` in `.env` to that database.
3. From the project root:

   ```bash
   cargo run
   ```

4. Migrations run on startup. Use `GET /api/v1/auth/dev-bypass` for developer login (admin / password after seed).

---

## 8. Design Principles

- **Single entrypoint** — One binary, one `main.rs`; add modules only when adding features.
- **Own database** — All schema in `./migrations`; no references to other projects’ migrations.
- **Pillar-ready schema** — Tables for Sovereign Shield, Evidence Vault, Crypto Shredder, and Human Oversight exist; API and business logic are added incrementally.
- **No leftover nexus code** — No shared paths, no copy-paste from veridion-nexus; this project is standalone.

This document is the **single source of truth** for vision, scope, and tech stack for Veridion API.
