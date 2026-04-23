-- Remove existing 30s jobs
SELECT cron.unschedule('sgmetadata-poll-88nine-0') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sgmetadata-poll-88nine-0');
SELECT cron.unschedule('sgmetadata-poll-88nine-30') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sgmetadata-poll-88nine-30');

-- Schedule 6 jobs offset by 10s each = poll every 10s
DO $$
DECLARE
  offsets INT[] := ARRAY[0, 10, 20, 30, 40, 50];
  o INT;
  job_name TEXT;
  cmd TEXT;
BEGIN
  FOREACH o IN ARRAY offsets LOOP
    job_name := 'sgmetadata-poll-88nine-' || o;

    -- Drop if exists
    PERFORM cron.unschedule(job_name) WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = job_name);

    IF o = 0 THEN
      cmd := $cmd$
        SELECT net.http_post(
          url := 'https://ftrivovjultfayttemce.supabase.co/functions/v1/sgmetadata-poll',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cml2b3ZqdWx0ZmF5dHRlbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU3NjYsImV4cCI6MjA2NTYwMTc2Nn0.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o"}'::jsonb,
          body := '{}'::jsonb
        );
      $cmd$;
    ELSE
      cmd := format($cmd$
        SELECT pg_sleep(%s);
        SELECT net.http_post(
          url := 'https://ftrivovjultfayttemce.supabase.co/functions/v1/sgmetadata-poll',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cml2b3ZqdWx0ZmF5dHRlbWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjU3NjYsImV4cCI6MjA2NTYwMTc2Nn0.OUZf7nDHHrEBPXmfgX88UBtPd0YV88l-fXme_13nm8o"}'::jsonb,
          body := '{}'::jsonb
        );
      $cmd$, o);
    END IF;

    PERFORM cron.schedule(job_name, '* * * * *', cmd);
  END LOOP;
END $$;