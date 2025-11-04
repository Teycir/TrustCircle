# TrustCircle Setup Guide

## Configuration Storage

TrustCircle now stores all API credentials in a Supabase table instead of using an admin panel. This provides better security and easier deployment.

## Setup Steps

### 1. Create the Configuration Table

Run the SQL schema in your Supabase SQL Editor:

```bash
supabase/sql/app-config-schema.sql
```

### 2. Populate Your Credentials

Run the setup script in Supabase SQL Editor:

```bash
scripts/setup-config.sql
```

Or manually update the values:

```sql
update app_config set value = 'your_supabase_url' where key = 'supabase_url';
update app_config set value = 'your_supabase_anon_key' where key = 'supabase_anon_key';
update app_config set value = 'your_pinata_jwt' where key = 'pinata_jwt';
```

### 3. Environment Variables

The app prioritizes environment variables over database config. Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials.

### 4. Deploy

The app will automatically read from:
1. Environment variables (priority)
2. Supabase app_config table (fallback)

## Security Notes

- The `app_config` table has RLS enabled with public read access
- Keep `.env.local` in `.gitignore`
- Use `.env.example` as a template for Git
- Database config provides fallback for deployments
