-- App Configuration Table
-- Stores API credentials and configuration

create table if not exists app_config (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Insert default configuration
insert into app_config (key, value) values
  ('pinata_jwt', 'your_pinata_jwt_here'),
  ('vault_pinata_jwt', 'your_vault_pinata_jwt_here'),
  ('supabase_url', 'your_supabase_url_here'),
  ('supabase_anon_key', 'your_supabase_anon_key_here')
on conflict (key) do nothing;

-- Enable RLS
alter table app_config enable row level security;

-- Allow public read access to config
create policy "Allow public read access to config"
  on app_config for select
  to anon, authenticated
  using (true);

-- Create index for faster lookups
create index if not exists idx_app_config_key on app_config(key);
