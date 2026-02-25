-- Crypto-Shredder: encrypted log keys (GDPR Art. 17 right to erasure)
-- Deleting the key makes ciphertext unrecoverable.

CREATE TABLE IF NOT EXISTS encrypted_log_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id VARCHAR(255) NOT NULL UNIQUE,
    wrapped_dek BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    shredded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_encrypted_log_keys_log_id ON encrypted_log_keys(log_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_log_keys_shredded_at ON encrypted_log_keys(shredded_at) WHERE shredded_at IS NULL;
