#!/bin/bash

# Far Too Young - Staging Frontend Manual Deployment
# Deploys React frontend to S3 + CloudFront

set -e

echo "🚀 Starting staging frontend deployment..."

# Build frontend with staging config
echo "📦 Building frontend..."
npm run build -- --mode staging

# Upload to S3
echo "☁️  Uploading to S3..."
aws s3 sync dist/ s3://fartooyoung-frontend-staging --delete

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id EYHMCS1M0XJX1 --paths "/*"

echo ""
echo "✅ Staging frontend deployment complete!"
echo "🌐 URL: https://staging.fartooyoung.org"
echo "⏳ CloudFront cache invalidation in progress (2-3 minutes)"
