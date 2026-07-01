
DO $$
DECLARE
  cron_secret text := current_setting('app.settings.cron_secret', true);
BEGIN
  -- We can't read env from SQL; the actual secret is set in the app runtime.
  -- Just unschedule the old apikey-based jobs so they stop returning 401.
  PERFORM cron.unschedule(jobname) FROM cron.job WHERE jobname IN
    ('okjobs-gmail-sync','okjobs-scrape-jobs','okjobs-daily-briefing','okjobs-queue-worker');
END $$;
