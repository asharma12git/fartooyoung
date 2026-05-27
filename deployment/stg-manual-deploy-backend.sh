#!/bin/bash

# Far Too Young - Staging Backend Manual Deployment
# Deploys Lambda functions and API Gateway using SAM

set -e

echo "🚀 Starting staging backend deployment..."

cd backend

echo "📦 Building SAM application..."
sam build

echo "☁️  Deploying to AWS..."
sam deploy --config-env staging --no-confirm-changeset

echo ""
echo "✅ Staging backend deployment complete!"
echo "🌐 API URL: https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod/"
