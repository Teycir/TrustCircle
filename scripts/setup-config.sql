create table if not exists app_config (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

insert into app_config (key, value) values
  ('pinata_jwt', 'your_pinata_jwt_here'),
  ('pinata_vault_jwt', 'your_pinata_vault_jwt_here'),
  ('supabase_url', 'your_supabase_url_here'),
  ('supabase_anon_key', 'your_supabase_anon_key_here')
on conflict (key) do nothing;

alter table app_config enable row level security;

create policy "Allow public read access to config"
  on app_config for select
  to anon, authenticated
  using (true);

create index if not exists idx_app_config_key on app_config(key);

-- Replace these with your actual values:
-- update app_config set value = 'YOUR_SUPABASE_URL' where key = 'supabase_url';
-- update app_config set value = 'YOUR_SUPABASE_ANON_KEY' where key = 'supabase_anon_key';
-- update app_config set value = 'YOUR_PINATA_JWT' where key = 'pinata_jwt';
-- update app_config set value = 'YOUR_PINATA_VAULT_JWT' where key = 'pinata_vault_jwt';

select * from app_config;
