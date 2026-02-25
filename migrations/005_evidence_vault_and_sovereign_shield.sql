-- Evidence Vault + Sovereign Shield: immutable append-only evidence events
-- Used by: Evidence Vault (search/export), Sovereign Shield (DATA_TRANSFER events), sealing

CREATE TABLE IF NOT EXISTS evidence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(64) NOT NULL,
    correlation_id VARCHAR(64),
    causation_id VARCHAR(64),
    sequence_number BIGINT NOT NULL DEFAULT 0,
    occurred_at TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    source_system VARCHAR(255) NOT NULL,
    source_ip INET,
    source_user_agent TEXT,
    regulatory_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    articles JSONB NOT NULL DEFAULT '[]'::jsonb,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    payload_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    company_id UUID,
    nexus_seal TEXT,
    regulatory_framework VARCHAR(100),
    verification_status VARCHAR(50),
    last_verification TIMESTAMPTZ,
    scope_snapshot_hash VARCHAR(64),
    processing_duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_events_event_type ON evidence_events(event_type);
CREATE INDEX IF NOT EXISTS idx_evidence_events_source_system ON evidence_events(source_system);
CREATE INDEX IF NOT EXISTS idx_evidence_events_created_at ON evidence_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_events_company_id ON evidence_events(company_id) WHERE company_id IS NOT NULL;

DROP TRIGGER IF EXISTS update_evidence_events_updated_at ON evidence_events;
CREATE TRIGGER update_evidence_events_updated_at
    BEFORE UPDATE ON evidence_events
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
