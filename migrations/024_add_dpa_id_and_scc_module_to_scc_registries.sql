-- Add dpa_id and scc_module to scc_registries for full SCC registration data
ALTER TABLE scc_registries ADD COLUMN IF NOT EXISTS dpa_id TEXT;
ALTER TABLE scc_registries ADD COLUMN IF NOT EXISTS scc_module TEXT;
