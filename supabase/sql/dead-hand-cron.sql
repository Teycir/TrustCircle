-- Schedule the dead hand check function to run daily at midnight UTC
select cron.schedule(
  'check-dead-hand-daily',
  '0 0 * * *',
  $$
  select
    net.http_post(
      url:='https://ooihmwfsxvinrgeuapfl.supabase.co/functions/v1/check-dead-hand',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaWhtd2ZzeHZpbnJnZXVhcGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTY5ODMsImV4cCI6MjA3NzU5Mjk4M30.12uLdklgbMwl7OkVmlCc_3ywOwVWcbpaO-vWGnCl_hU"}'::jsonb
    ) as request_id;
  $$
);
