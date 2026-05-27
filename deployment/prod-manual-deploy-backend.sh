#!/bin/bash

# Far Too Young - Production Backend Manual Deployment
# Deploys Lambda functions and API Gateway using SAM

set -e

echo "🚀 Starting production backend deployment..."

cd backend

echo "📦 Building SAM application..."
sam build

echo "☁️  Deploying to AWS..."
sam deploy --config-env production --no-confirm-changeset

echo ""
echo "✅ Production backend deployment complete!"
echo "🌐 API URL: https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/Prod/"
