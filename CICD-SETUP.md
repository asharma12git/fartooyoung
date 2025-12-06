# CI/CD Setup for Far Too Young Production

## Overview
This CI/CD pipeline automatically deploys to production when code is merged to the `main` branch.

## Architecture
- **Source**: GitHub `main` branch
- **Build**: AWS CodeBuild (separate projects for frontend and backend)
- **Deploy**: Automatic deployment to production S3 and Lambda

## Prerequisites

1. **GitHub Personal Access Token**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a token with `repo` and `admin:repo_hook` permissions
   - Save it securely

2. **Production Environment**
   - S3 bucket: `fartooyoung-frontend-production`
   - CloudFront distribution for production
   - SAM configuration for production in `backend/samconfig.toml`

## Setup Instructions

### 1. Set GitHub Token
```bash
export GITHUB_TOKEN=your_github_personal_access_token
```

### 2. Deploy the Pipeline
```bash
./deploy-pipeline.sh
```

This will create:
- CodePipeline with 3 stages (Source, BuildFrontend, BuildBackend)
- CodeBuild projects for frontend and backend
- S3 bucket for pipeline artifacts
- IAM roles and permissions

### 3. Verify Pipeline
After deployment, the script will output a URL to view your pipeline in AWS Console.

## How It Works

### When you merge to `main`:

1. **Source Stage**
   - GitHub webhook triggers the pipeline
   - Code is pulled from `main` branch

2. **BuildFrontend Stage**
   - Runs `buildspec-frontend.yml`
   - Installs dependencies
   - Builds with `npm run build -- --mode production`
   - Deploys to S3: `fartooyoung-frontend-production`
   - Invalidates CloudFront cache

3. **BuildBackend Stage**
   - Runs `buildspec-backend.yml`
   - Installs SAM CLI
   - Builds with `sam build`
   - Deploys with `sam deploy --config-env production`

## Manual Deployment (Staging)

Staging remains manual:

### Frontend
```bash
npm run build -- --mode staging
aws s3 sync dist/ s3://fartooyoung-frontend-staging --delete
aws cloudfront create-invalidation --distribution-id EYHMCS1M0XJX1 --paths "/*"
```

### Backend
```bash
cd backend
sam build
sam deploy --config-env staging
```

## Monitoring

- **Pipeline Status**: AWS Console → CodePipeline
- **Build Logs**: AWS Console → CodeBuild → Build History
- **Deployment Logs**: CloudWatch Logs

## Troubleshooting

### Pipeline fails on first run
- Check IAM permissions for CodeBuild role
- Verify GitHub token has correct permissions
- Check CloudFormation events for detailed errors

### Frontend build fails
- Verify `.env.production` file exists
- Check Node.js version in buildspec (currently 18)

### Backend build fails
- Verify `samconfig.toml` has production configuration
- Check SAM CLI version compatibility
- Verify Lambda execution role permissions

## Cost Considerations

- CodePipeline: ~$1/month per active pipeline
- CodeBuild: Pay per build minute (~$0.005/minute for small instance)
- S3 storage for artifacts: Minimal cost

## Security

- GitHub token is stored securely in CloudFormation (NoEcho)
- IAM roles follow least privilege principle
- Artifacts bucket has versioning enabled
