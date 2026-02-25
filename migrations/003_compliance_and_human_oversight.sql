-- Compliance records (Annex IV) and Human Oversight (EU AI Act Art. 14)
-- Required for: Human oversight queue, sealing, and compliance chain

CREATE TABLE IF NOT EXISTS compliance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    agent_id VARCHAR(255) NOT NULL,
    action_summary TEXT NOT NULL,
    seal_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(100) NOT NULL,
    user_notified BOOLEAN,
    notification_timestamp TIMESTAMPTZ,
    human_oversight_status VARCHAR(50),
    risk_level VARCHAR(20),
    user_id VARCHAR(255),
    tx_id VARCHAR(255) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS human_oversight (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seal_id VARCHAR(255) NOT NULL UNIQUE REFERENCES compliance_records(seal_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewer_id VARCHAR(255),
    decided_at TIMESTAMPTZ,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_records_seal_id ON compliance_records(seal_id);
CREATE INDEX IF NOT EXISTS idx_compliance_records_human_oversight ON compliance_records(human_oversight_status) WHERE human_oversight_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_human_oversight_status ON human_oversight(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_compliance_records_updated_at ON compliance_records;
CREATE TRIGGER update_compliance_records_updated_at
    BEFORE UPDATE ON compliance_records
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_human_oversight_updated_at ON human_oversight;
CREATE TRIGGER update_human_oversight_updated_at
    BEFORE UPDATE ON human_oversight
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
