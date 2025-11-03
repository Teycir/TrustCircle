-- Add expiration column to capsules table
alter table capsules add column if not exists expires_at timestamp;

-- Create index for efficient expiration queries
create index if not exists idx_capsules_expires_at on capsules(expires_at) where expires_at is not null;
