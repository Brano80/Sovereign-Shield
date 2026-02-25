-- SCC Registries: Store Standard Contractual Clauses (SCCs) for GDPR Art. 46 transfers
-- Used by Sovereign Shield to check if transfers to SCC-required countries are allowed

CREATE TABLE IF NOT EXISTS scc_registries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name VARCHAR(255) NOT NULL,
    destination_country_code VARCHAR(2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    registered_by VARCHAR(255),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scc_registries_partner_country ON scc_registries(partner_name, destination_country_code);
CREATE INDEX IF NOT EXISTS idx_scc_registries_status ON scc_registries(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_scc_registries_expires_at ON scc_registries(expires_at) WHERE expires_at IS NOT NULL;

DROP TRIGGER IF EXISTS update_scc_registries_updated_at ON scc_registries;
CREATE TRIGGER update_scc_registries_updated_at
    BEFORE UPDATE ON scc_registries
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
