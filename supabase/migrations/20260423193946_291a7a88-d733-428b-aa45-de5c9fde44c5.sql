SELECT cron.unschedule('sgmetadata-poll-88nine-0') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sgmetadata-poll-88nine-0');
SELECT cron.unschedule('sgmetadata-poll-88nine-30') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sgmetadata-poll-88nine-30');

SELECT cron.schedule(
  'sgmetadata-poll-88nine-0',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ftrivovjultfayttemce.supabase.co/functions/v1/sgmetadata-poll',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cml2b3ZqdWx0ZmF5dHRlbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU3NjYsImV4cCI6MjA2NTYwMTc2Nn0.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'sgmetadata-poll-88nine-30',
  '* * * * *',
  $$
  SELECT pg_sleep(30);
  SELECT net.http_post(
    url := 'https://ftrivovjultfayttemce.supabase.co/functions/v1/sgmetadata-poll',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBdGZheXR0ZW1jZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUwMDI1NzY2LCJleHAiOjIwNjU2MDE3NjZ9.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);