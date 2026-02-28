-- Add evidence_event_id column to compliance_records to track which evidence event triggered the review
ALTER TABLE compliance_records ADD COLUMN IF NOT EXISTS evidence_event_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_compliance_records_evidence_event_id ON compliance_records(evidence_event_id) WHERE evidence_event_id IS NOT NULL;
