# Vercel Deployment Guide

## Quick Deploy

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy (preview):
```bash
vercel
```

4. Deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect Next.js and configure build settings

## Environment Variables

Add these environment variables in Vercel Dashboard:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_PINATA_API_KEY` - Your Pinata API key
- `NEXT_PUBLIC_PINATA_GATEWAY` - Your Pinata gateway URL

### Setting Environment Variables:

1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable for Production, Preview, and Development environments

## Build Configuration

The project is already configured with:
- Framework: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

## Post-Deployment

1. Update your Supabase project settings with the Vercel domain
2. Configure CORS settings in Supabase if needed
3. Test all authentication flows
4. Verify environment variables are loaded correctly

## Troubleshooting

- If build fails, check environment variables are set
- Ensure all dependencies are in package.json
- Check build logs in Vercel Dashboard
- Verify Node.js version compatibility
