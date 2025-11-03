-- Enable Supabase Auth (already enabled by default)

-- Public keys table for user discovery
create table if not exists user_public_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ed25519_public text not null,
  x25519_public text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for faster lookups
create index if not exists idx_user_public_keys_ed25519 on user_public_keys(ed25519_public);
create index if not exists idx_user_public_keys_x25519 on user_public_keys(x25519_public);

-- RLS policies for user_public_keys
alter table user_public_keys enable row level security;

-- Users can read all public keys for discovery
create policy "Public keys are viewable by everyone"
  on user_public_keys for select
  using (true);

-- Users can insert their own public keys
create policy "Users can insert their own public keys"
  on user_public_keys for insert
  with check (auth.uid() = user_id);

-- Users can update their own public keys
create policy "Users can update their own public keys"
  on user_public_keys for update
  using (auth.uid() = user_id);

-- Add user_id columns to capsules table
alter table capsules add column if not exists creator_user_id uuid references auth.users(id);
alter table capsules add column if not exists approver_user_id uuid references auth.users(id);

-- Create indexes for user_id lookups
create index if not exists idx_capsules_creator_user_id on capsules(creator_user_id);
create index if not exists idx_capsules_approver_user_id on capsules(approver_user_id);

-- Update RLS policies for capsules to work with auth
create policy "Users can view capsules where they are creator or approver by user_id"
  on capsules for select
  using (
    auth.uid() = creator_user_id 
    or auth.uid() = approver_user_id
    or creator_pubkey = (select ed25519_public from user_public_keys where user_id = auth.uid())
    or approver_pubkey = (select ed25519_public from user_public_keys where user_id = auth.uid())
  );

create policy "Authenticated users can insert capsules"
  on capsules for insert
  with check (auth.uid() = creator_user_id);

create policy "Approvers can update capsule status"
  on capsules for update
  using (
    auth.uid() = approver_user_id
    or approver_pubkey = (select ed25519_public from user_public_keys where user_id = auth.uid())
  );

create policy "Creators can delete their capsules"
  on capsules for delete
  using (
    auth.uid() = creator_user_id
    or creator_pubkey = (select ed25519_public from user_public_keys where user_id = auth.uid())
  );
