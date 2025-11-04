#!/bin/bash

# Dead Hand Feature - Deploy Secrets to Supabase
# Run this script to configure the Edge Function secrets

echo "🔐 Setting up Dead Hand secrets for production..."
echo ""

# Login to Supabase
echo "Step 1: Authenticating with Supabase..."
npx supabase login

echo ""
echo "Step 2: Setting RESEND_API_KEY..."
npx supabase secrets set RESEND_API_KEY=re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe --project-ref ooihmwfsxvinrgeuapfl

echo ""
echo "Step 3: Setting APP_URL..."
npx supabase secrets set APP_URL=https://thetrustcircle.vercel.app --project-ref ooihmwfsxvinrgeuapfl

echo ""
echo "✅ Secrets configured successfully!"
echo ""
echo "Verify with:"
echo "npx supabase secrets list --project-ref ooihmwfsxvinrgeuapfl"
