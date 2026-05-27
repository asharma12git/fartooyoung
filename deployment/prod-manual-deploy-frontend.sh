#!/bin/bash

# Far Too Young - Production Frontend Manual Deployment
# Deploys React frontend to S3 + CloudFront

set -e

echo "🚀 Starting production frontend deployment..."

# Build frontend with production config
echo "📦 Building frontend..."
npm run build -- --mode production

# Upload to S3
echo "☁️  Uploading to S3..."
aws s3 sync dist/ s3://fartooyoung-frontend-production --delete

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E2PHSH4ED2AIN5 --paths "/*"

echo ""
echo "✅ Production frontend deployment complete!"
echo "🌐 URL: https://www.fartooyoung.org"
echo "⏳ CloudFront cache invalidation in progress (2-3 minutes)"
