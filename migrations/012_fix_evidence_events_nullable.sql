-- Fix: ensure company_id is nullable and source_ip is TEXT (not INET) for flexibility
ALTER TABLE evidence_events ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE evidence_events ALTER COLUMN company_id SET DEFAULT NULL;
ALTER TABLE evidence_events ALTER COLUMN source_ip TYPE TEXT USING source_ip::TEXT;
