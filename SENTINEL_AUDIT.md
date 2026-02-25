# SENTINEL Audit: veridion-api — Standalone Project & Database

**Auditor:** SENTINEL  
**Date:** 2026-02-24  
**Scope:** Confirm new project + new database; no leftover code from veridion-nexus.

---

## 1. New project and new database

| Check | Result | Notes |
|-------|--------|--------|
| Own crate | **PASS** | `Cargo.toml`: single binary `veridion-api`, `path = "src/main.rs"`. |
| Own database | **PASS** | `DATABASE_URL` in `.env`; migrations in `./migrations` only (001–005). |
| No shared migration path | **PASS** | No reference to `../veridion-nexus/migrations` in code. |
| Migrations self-contained | **PASS** | 001 users, 002 seed_admin, 003 compliance+human_oversight, 004 encrypted_log_keys, 005 evidence_events. |

---

## 2. Leftover code from old project (veridion-nexus)

| Finding | Severity | Detail |
|---------|----------|--------|
| **Orphan Rust modules** | **HIGH** | **46** `.rs` files under `src/` besides `main.rs`: `routes/`, `core/`, `services/`, `models/`, `api_state.rs`, `database.rs`, `configuration.rs`, `error.rs`, `module_service.rs`, `middleware/`, `security/`, `mcp/`, `domain/`, `utils/`, `modules/`. None are referenced by `main.rs` (no `mod` or `use crate::`). Binary compiles only `main.rs`. These are **leftover from nexus** and should be removed. |
| **.cursor/rules** | **MEDIUM** | Rules refer to "Veridion Nexus", `VERIDION_NEXUS_PROJECT_REFERENCE_v3.md`, `COMPASS.md`, `src/domain/lens_finding.rs`, etc. Those files do not exist in veridion-api. Rules are nexus-specific and misleading. |
| **.env** | **LOW** | Contains `NEXUS_SEAL_SALT`, `SIGNICAT_*`, `REDIS_URL`, `CONFIG_DIR`. `main.rs` uses only `DATABASE_URL`, `SERVER_*`, `ALLOWED_ORIGINS`, `RUST_ENV`; optional `MIGRATIONS_PATH`, `RESET_MIGRATIONS`, `JWT_SECRET`. Rest are unused or for future use. |

---

## 3. Domain naming (not leftover)

| Term | Verdict |
|------|--------|
| `nexus_seal` column in `evidence_events` | **OK** | Domain term for integrity seal; does not imply dependency on veridion-nexus repo. |
| `VERIFICATION_REPORT.md` / `001_initial_schema.sql` comment "independent of veridion-nexus" | **OK** | Documentation only. |

---

## 4. Correctness of what is actually used

| Component | Status |
|-----------|--------|
| **main.rs** | Clean: health, dev-bypass, migrations, CORS; no `mod`/`use crate::`. |
| **Cargo.toml** | Clean: single bin, deps match main.rs (actix-web, sqlx, chrono, jsonwebtoken, etc.). |
| **migrations/** | Clean: 001–005; no paths or references to nexus. |

---

## 5. Actions taken (remediation)

1. **Removed orphan source files** — Deleted all `src/**` except `src/main.rs` (routes/, core/, services/, models/, api_state, database, configuration, error, module_service, middleware/, security/, mcp/, domain/, utils/, modules/). **Done.**
2. **Updated .cursor/rules** — Replaced nexus master and agent rules with Veridion API–specific versions; no references to missing nexus files. **Done.**
3. **Trimmed .env** — Kept DATABASE_URL, SERVER_*, ALLOWED_ORIGINS, RUST_ENV; optional JWT_SECRET, RESET_MIGRATIONS, MIGRATIONS_PATH; future-use vars commented. **Done.**

---

## 6. Conclusion

- **New project and new database:** Correct; no shared migration path or DB with nexus.
- **Leftover code:** **46 unused .rs files** and nexus-oriented **.cursor/rules** and **.env** entries. Remediation: delete orphan modules, update rules, optionally trim .env.

After remediation, veridion-api is a single-entrypoint service (health + dev-bypass + own migrations) with **no leftover nexus code**. Build verified with `cargo build`.
