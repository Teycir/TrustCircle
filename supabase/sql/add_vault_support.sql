-- Add Professional Vault Support to TrustCircle
-- Separate table for better performance and security

-- Create vaults table
CREATE TABLE vaults (
  id uuid primary key default gen_random_uuid(),
  creator_pubkey text not null,
  title text not null,
  notes text,
  document_type text not null,
  issuer text not null,
  document_id text,
  payload_cid text not null,
  metadata jsonb not null,
  file_name text,
  file_size bigint,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_vaults_creator ON vaults(creator_pubkey);
CREATE INDEX idx_vaults_document_type ON vaults(document_type);
CREATE INDEX idx_vaults_issuer ON vaults(issuer);
CREATE INDEX idx_vaults_created_at ON vaults(created_at DESC);

-- RLS Policies

-- Users can read their own vaults
CREATE POLICY "Users can read own vaults"
ON vaults FOR SELECT
USING (
  creator_pubkey = current_setting('app.user_pubkey', true)
);

-- Users can create vaults
CREATE POLICY "Users can create vaults"
ON vaults FOR INSERT
WITH CHECK (
  creator_pubkey = current_setting('app.user_pubkey', true)
);

-- Users can update their own vaults
CREATE POLICY "Users can update own vaults"
ON vaults FOR UPDATE
USING (
  creator_pubkey = current_setting('app.user_pubkey', true)
)
WITH CHECK (
  creator_pubkey = current_setting('app.user_pubkey', true)
);

-- Users can delete their own vaults
CREATE POLICY "Users can delete own vaults"
ON vaults FOR DELETE
USING (
  creator_pubkey = current_setting('app.user_pubkey', true)
);

-- Public can read vault metadata for verification
CREATE POLICY "Public can read vault metadata for verification"
ON vaults FOR SELECT
USING (true);

-- Comments
COMMENT ON TABLE vaults IS 'Professional document vault with cryptographic proof';
COMMENT ON COLUMN vaults.document_type IS 'Type of document: certification contract diploma transcript license other';
COMMENT ON COLUMN vaults.issuer IS 'Organization or person who issued the document';
COMMENT ON COLUMN vaults.document_id IS 'Reference number or ID for the document';
COMMENT ON COLUMN vaults.payload_cid IS 'IPFS CID of encrypted document';
COMMENT ON COLUMN vaults.metadata IS 'Encrypted metadata and cryptographic details';
