-- Schedule the dead hand check function to run daily at midnight UTC
select cron.schedule(
  'check-dead-hand-daily',
  '0 0 * * *',
  $$
  select
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-dead-hand',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"}'::jsonb
    ) as request_id;
  $$
);
