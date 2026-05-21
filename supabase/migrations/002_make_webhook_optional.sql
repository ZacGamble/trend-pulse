-- Make Discord webhook URL optional
ALTER TABLE public.keywords ALTER COLUMN discord_webhook_url DROP NOT NULL;
