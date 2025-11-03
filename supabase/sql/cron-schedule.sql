-- Schedule the cleanup function to run daily at midnight
-- This requires pg_cron extension to be enabled in Supabase

select cron.schedule(
  'cleanup-expired-capsules',
  '0 0 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-expired',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
