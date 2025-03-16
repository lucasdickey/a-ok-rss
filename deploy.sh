#!/bin/bash

# A-OK RSS Deployment Script
# This script deploys the podcast RSS hosting platform to production

# Exit on error
set -e

echo "🚀 Deploying A-OK RSS Podcast Platform..."

# Check if environment variables are set
if [ -z "$CONVEX_DEPLOY_KEY" ]; then
  echo "❌ Error: CONVEX_DEPLOY_KEY environment variable is not set."
  echo "Please set it with: export CONVEX_DEPLOY_KEY=your_deploy_key"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the Next.js application
echo "🏗️ Building the application..."
npm run build

# Deploy Convex functions
echo "🔄 Deploying Convex functions..."
npx convex deploy

# Deploy Next.js to Vercel (if Vercel CLI is installed)
if command -v vercel &> /dev/null; then
  echo "🌐 Deploying to Vercel..."
  vercel --prod
else
  echo "ℹ️ Vercel CLI not found. Skipping Vercel deployment."
  echo "To deploy to Vercel, install the Vercel CLI with: npm install -g vercel"
  echo "Then run: vercel --prod"
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Ensure your environment variables are set in your production environment"
echo "2. Test your RSS feeds with a podcast validator"
echo "3. Submit your podcast to directories like Apple Podcasts, Spotify, etc."
echo ""
echo "Thank you for using A-OK RSS Podcast Platform!"
