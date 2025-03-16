#!/bin/bash

# A-OK RSS Deployment Script
# This script automates the deployment process for both Convex and Vercel

echo "🎙️ A-OK RSS Deployment Script 🎙️"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "⚠️ Warning: .env.local file not found."
  echo "You may need to set up environment variables manually in Vercel."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Deploy to Convex
echo "📦 Deploying to Convex..."
echo "-------------------------"

# Check if user is logged in to Convex
npx convex status > /dev/null 2>&1
CONVEX_STATUS=$?

if [ $CONVEX_STATUS -ne 0 ]; then
  echo "🔑 You need to log in to Convex first."
  npx convex login
fi

# Initialize Convex project if needed
if [ ! -f convex/_generated/api.d.ts ]; then
  echo "🚀 Initializing Convex project..."
  npx convex init
fi

# Deploy to Convex
echo "🚀 Deploying Convex functions..."
npx convex deploy

# Get Convex URL
CONVEX_URL=$(npx convex deployment list | grep -o 'https://.*\.convex\.cloud' | head -1)
if [ -n "$CONVEX_URL" ]; then
  echo "✅ Convex deployment successful!"
  echo "📝 Convex URL: $CONVEX_URL"
else
  echo "⚠️ Couldn't retrieve Convex URL. You'll need to set NEXT_PUBLIC_CONVEX_URL manually in Vercel."
fi

echo ""
echo "📦 Deploying to Vercel..."
echo "-------------------------"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "🔧 Installing Vercel CLI..."
  npm install -g vercel
fi

# Check if user is logged in to Vercel
vercel whoami > /dev/null 2>&1
VERCEL_STATUS=$?

if [ $VERCEL_STATUS -ne 0 ]; then
  echo "🔑 You need to log in to Vercel first."
  vercel login
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
if [ -n "$CONVEX_URL" ]; then
  # If we have the Convex URL, set it as an environment variable
  vercel --build-env NEXT_PUBLIC_CONVEX_URL=$CONVEX_URL
else
  vercel
fi

echo ""
echo "🎉 Deployment process completed!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Set up environment variables in the Vercel dashboard if not already done."
echo "2. For production deployment, run: vercel --prod"
echo "3. Visit your Vercel deployment URL to see your application."
echo ""
echo "Happy podcasting! 🎙️"
