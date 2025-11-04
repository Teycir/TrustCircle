create table if not exists app_config (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

insert into app_config (key, value) values
  ('pinata_jwt', 'your_pinata_jwt_here'),
  ('supabase_url', 'your_supabase_url_here'),
  ('supabase_anon_key', 'your_supabase_anon_key_here')
on conflict (key) do nothing;

alter table app_config enable row level security;

create policy "Allow public read access to config"
  on app_config for select
  to anon, authenticated
  using (true);

create index if not exists idx_app_config_key on app_config(key);

update app_config set value = 'https://ooihmwfsxvinrgeuapfl.supabase.co' where key = 'supabase_url';
update app_config set value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaWhtd2ZzeHZpbnJnZXVhcGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTY5ODMsImV4cCI6MjA3NzU5Mjk4M30.12uLdklgbMwl7OkVmlCc_3ywOwVWcbpaO-vWGnCl_hU' where key = 'supabase_anon_key';
update app_config set value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0ZDA4NGQ2NC1mOWNmLTQ4ODItODNmMi0xOWJjYTdlZjNjOTUiLCJlbWFpbCI6Inhpbmd5YW5nMjkzQHByb3Rvbi5tZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlY2NjYTgyNTY2NTNhYmE0NzE2MCIsInNjb3BlZEtleVNlY3JldCI6IjEwYTZiZDk5ZTdlNzJiYzM5NzgzYThmNzcxNzlmNTJkZmFjOGQxNGNlNjkyY2UwOWFkOTA2NTlhYzg1ZjNhMGIiLCJleHAiOjE3OTExMTkzMzB9.T_Za8Cck8lrMDk0SzNpxuIM2dzgFkEwf-4PeARnyYgw' where key = 'pinata_jwt';

select * from app_config;
