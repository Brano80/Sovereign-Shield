# Veridion API — Verification Report

**Date:** 2026-02-24  
**Scope:** New separate project with new database; Sovereign Shield, Evidence Vault, Crypto Shredder, Human Oversight.

---

## 1. Project separation and database

| Item | Status | Notes |
|------|--------|--------|
| Separate project | OK | `veridion-api` is its own crate (own `Cargo.toml`, `src/main.rs`). |
| Own database | OK | Uses `DATABASE_URL`; migrations live in `./migrations` (no dependency on veridion-nexus). |
| Migrations | OK | 001–005 run in order; no shared migration path with nexus. |

---

## 2. Four pillars — database schema

| Pillar | Status | Migration | Tables |
|--------|--------|-----------|--------|
| **Sovereign Shield** | OK | 005 | `evidence_events` (event_type e.g. `DATA_TRANSFER`, `DATA_TRANSFER_BLOCKED`, `DATA_TRANSFER_REVIEW`). |
| **Evidence Vault** | OK | 005 | Same `evidence_events` (append-only, sealed evidence search/export). |
| **Crypto Shredder** | OK | 004 | `encrypted_log_keys` (wrapped DEK + `shredded_at` for Art. 17 erasure). |
| **Human Oversight** | OK | 003 | `compliance_records` (human_oversight_status), `human_oversight` (queue, status, reviewer). |

---

## 3. Migrations summary

| # | File | Purpose |
|---|------|--------|
| 001 | `001_initial_schema.sql` | `users` (auth / dev-bypass). |
| 002 | `002_seed_admin.sql` | Seed admin user (admin / password). |
| 003 | `003_compliance_and_human_oversight.sql` | `compliance_records`, `human_oversight` (Human Oversight + sealing base). |
| 004 | `004_encrypted_log_keys_crypto_shredder.sql` | `encrypted_log_keys` (Crypto Shredder). |
| 005 | `005_evidence_vault_and_sovereign_shield.sql` | `evidence_events` (Evidence Vault + Sovereign Shield). |

---

## 4. Application layer (current state)

| Component | DB schema | API / services |
|-----------|-----------|-----------------|
| Auth | OK (users) | OK — `GET /health`, `GET /api/v1/auth/dev-bypass`. |
| Sovereign Shield | OK (evidence_events) | Not yet — no `/shield/ingest-logs`, no lens stats/requires-attention. |
| Evidence Vault | OK (evidence_events) | Not yet — no `/evidence/events` (create/list), no sealing service. |
| Crypto Shredder | OK (encrypted_log_keys) | Not yet — no key store, no shred/erasure API. |
| Human Oversight | OK (human_oversight, compliance_records) | Not yet — no `/human_oversight/pending`, approve/reject. |

So: **database is correct and complete** for all four pillars; **API and business logic** for Sovereign Shield, Evidence Vault, Crypto Shredder, and Human Oversight still need to be implemented in this repo (or delegated to another service).

---

## 5. How to run

1. Create a **new** PostgreSQL database (e.g. `veridion_api`).
2. Set `DATABASE_URL` in `.env` to that database.
3. Run:

   ```bash
   cargo run
   ```

   Migrations 001–005 will run automatically. Use `GET /api/v1/auth/dev-bypass` for developer login (admin / password after seed).

---

## 6. Conclusion

- **New separate project with new database:** Correct; migrations and config are self-contained.
- **Sovereign Shield + Evidence Vault + Crypto Shredder + Human Oversight:** **Schema is correct** for all four; application routes and services for these pillars are not yet implemented in veridion-api.
