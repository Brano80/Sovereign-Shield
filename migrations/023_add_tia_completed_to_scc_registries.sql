-- Add tia_completed to scc_registries for DPO to mark Transfer Impact Assessment as done
ALTER TABLE scc_registries ADD COLUMN IF NOT EXISTS tia_completed BOOLEAN NOT NULL DEFAULT FALSE;
