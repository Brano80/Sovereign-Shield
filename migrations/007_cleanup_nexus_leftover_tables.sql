-- Cleanup: Drop leftover tables from veridion-nexus that are not used by veridion-api
-- These tables are not referenced in any veridion-api code and can be safely removed

DROP TABLE IF EXISTS adequacy_decisions CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS compliance_queries CASCADE;
DROP TABLE IF EXISTS erasure_requests CASCADE;
DROP TABLE IF EXISTS evidence_actors CASCADE;
DROP TABLE IF EXISTS evidence_artifacts CASCADE;
DROP TABLE IF EXISTS evidence_edges CASCADE;
DROP TABLE IF EXISTS human_review_queue CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS merkle_anchors CASCADE;
DROP TABLE IF EXISTS sealing_queue CASCADE;
DROP TABLE IF EXISTS sovereign_lock_blacklist CASCADE;
DROP TABLE IF EXISTS sovereign_lock_whitelist CASCADE;
DROP TABLE IF EXISTS system_enforcement_mode CASCADE;
