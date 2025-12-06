#!/bin/bash

# Deploy CI/CD Pipeline for Far Too Young Production
# This script creates the CodePipeline infrastructure

set -e

echo "🚀 Deploying CI/CD Pipeline for Production..."

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is required"
    echo "Please set it with: export GITHUB_TOKEN=your_github_token"
    exit 1
fi

# Get CloudFront distribution ID for production
CLOUDFRONT_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, 'fartooyoung-frontend-production')].Id" \
    --output text)

if [ -z "$CLOUDFRONT_ID" ]; then
    echo "❌ Error: Could not find CloudFront distribution for production"
    exit 1
fi

echo "✅ Found CloudFront Distribution: $CLOUDFRONT_ID"

# Deploy the pipeline stack
echo "📦 Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file pipeline.yml \
    --stack-name fartooyoung-production-pipeline \
    --parameter-overrides \
        GitHubToken=$GITHUB_TOKEN \
        CloudFrontDistributionId=$CLOUDFRONT_ID \
    --capabilities CAPABILITY_IAM \
    --region us-east-1

echo "✅ Pipeline deployed successfully!"
echo ""
echo "🔗 View your pipeline at:"
aws cloudformation describe-stacks \
    --stack-name fartooyoung-production-pipeline \
    --query 'Stacks[0].Outputs[?OutputKey==`PipelineUrl`].OutputValue' \
    --output text
