# TrustCircle SQL Scripts

Run these scripts in order in your Supabase SQL Editor.

## Initial Setup

1. **schema.sql** - Create capsules table
2. **auth-schema.sql** - Create users and public_keys tables
3. **rls-policies.sql** - Set up Row Level Security policies

## Migrations

4. **add-expiration.sql** - Add expires_at column for capsule expiration feature
5. **cron-schedule.sql** - Schedule daily cleanup job for expired capsules

## Notes

- Run scripts in the Supabase Dashboard → SQL Editor
- Each script is idempotent (safe to run multiple times)
- Update cron-schedule.sql with your project URL and keys before running
