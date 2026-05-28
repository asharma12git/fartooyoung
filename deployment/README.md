# Deployment

## Automated (CI/CD Pipelines)

Pipelines trigger automatically on push to the respective branch:

| Pipeline | Branch | Triggers On |
|----------|--------|-------------|
| `fartooyoung-stg-frontend-pipeline` | `staging` | `src/**`, `public/**`, `package.json`, `vite.config.js`, `.env.staging` |
| `fartooyoung-stg-backend-pipeline` | `staging` | `backend/lambda/**`, `backend/template.yaml`, `backend/samconfig.toml`, `backend/package.json` |
| `fartooyoung-prod-frontend-pipeline` | `main` | Same as staging frontend |
| `fartooyoung-prod-backend-pipeline` | `main` | Same as staging backend |

Changes to `docs/`, `deployment/`, `backend/scripts/`, or `README.md` do **not** trigger any pipeline.

## Manual (Emergency / Override)

Run from the project root:

```bash
# Staging
./deployment/stg-manual-deploy-frontend.sh
./deployment/stg-manual-deploy-backend.sh

# Production
./deployment/prod-manual-deploy-frontend.sh
./deployment/prod-manual-deploy-backend.sh
```

## Pipeline Infrastructure

To create/update the pipeline infrastructure itself:

```bash
# Staging
aws cloudformation deploy --template-file deployment/stg-frontend-pipeline.yml --stack-name fartooyoung-stg-frontend-pipeline --capabilities CAPABILITY_IAM --region us-east-1
aws cloudformation deploy --template-file deployment/stg-backend-pipeline.yml --stack-name fartooyoung-stg-backend-pipeline --capabilities CAPABILITY_IAM --region us-east-1

# Production
aws cloudformation deploy --template-file deployment/prod-frontend-pipeline.yml --stack-name fartooyoung-prod-frontend-pipeline --capabilities CAPABILITY_IAM --region us-east-1
aws cloudformation deploy --template-file deployment/prod-backend-pipeline.yml --stack-name fartooyoung-prod-backend-pipeline --capabilities CAPABILITY_IAM --region us-east-1
```

## CodeStar Connection

All pipelines share a single CodeStar Connection to GitHub:
- **Name**: `fartooyoung-github`
- **ARN**: `arn:aws:codestar-connections:us-east-1:538781441544:connection/9170dc7d-2d4f-4e58-a389-63acb8187a84`
- **Status**: Available
