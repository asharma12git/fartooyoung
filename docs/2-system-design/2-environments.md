# Far Too Young - Environment Configuration Guide

## Overview
The system design (architecture, components, Lambda functions, database schemas) is identical across all environments. The only differences are **where things run** and **which credentials they use**.

---

## Environment Comparison

| | Local | Staging | Production |
|---|---|---|---|
| **Frontend URL** | `localhost:5173` | `staging.fartooyoung.org` | `www.fartooyoung.org` |
| **Backend API URL** | `localhost:3001` | `https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod` | `https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/Prod` |
| **Database** | DynamoDB Local (Docker `:8000`) | AWS DynamoDB (`fartooyoung-staging-*`) | AWS DynamoDB (`fartooyoung-production-*`) |
| **Stripe Keys** | Test (`sk_test_...`, `pk_test_...`) | Test (`sk_test_...`, `pk_test_...`) | Live (`sk_live_...`, `pk_live_...`) |
| **Payments** | Fake (test cards) | Fake (test cards) | Real money |
| **Emails (SES)** | Not available locally | Real emails via SES | Real emails via SES |
| **Secrets Manager** | Not used (empty ARN) | `fartooyoung-staging-secrets-BjIpQD` | `fartooyoung-production-secrets-tEmB4i` |
| **CloudFront** | N/A | `EYHMCS1M0XJX1` | `E2PHSH4ED2AIN5` |
| **S3 Bucket** | N/A | `fartooyoung-frontend-staging` | `fartooyoung-frontend-production` |
| **SAM Stack** | `fartooyoung-local` | `fartooyoung-staging` | `fartooyoung-production` |

---

## Git Branch Strategy

| Branch | Deploys To | How |
|---|---|---|
| `staging` | Staging (`staging.fartooyoung.org`) | Auto via V2 pipeline on push |
| `main` | Production (`www.fartooyoung.org`) | Auto via V2 pipeline on push |

**Pipelines (4 total, all V2 with instant webhook triggers):**

| Pipeline | Branch | Triggers On |
|----------|--------|-------------|
| `fartooyoung-staging-frontend-pipeline` | `staging` | `src/**`, `public/**`, `package.json`, `vite.config.js` |
| `fartooyoung-staging-backend-pipeline` | `staging` | `backend/lambda/**`, `backend/template.yaml`, `backend/samconfig.toml` |
| `fartooyoung-production-frontend-pipeline` | `main` | Same as staging frontend |
| `fartooyoung-production-backend-pipeline` | `main` | Same as staging backend |

Changes to `docs/`, `deployment/`, `backend/scripts/`, or `README.md` do **not** trigger any pipeline.

**⚠️ Important: Always test on staging first before merging to main.**

> 🚨 **WARNING:** Merging to `main` immediately deploys to the LIVE production site (`www.fartooyoung.org`) with real users and real payments. There is no approval step.

**Workflow:**
1. Work on `staging` branch → test locally with `npm run dev`
2. Push to `staging` → pipeline auto-deploys to staging → verify on `staging.fartooyoung.org`
3. Once verified, merge `staging` into `main` → pipeline auto-deploys to production

---

## How to Run Each Environment

### Local
```bash
# Terminal 1: Database
docker run -p 8000:8000 amazon/dynamodb-local

# Terminal 2: Backend
cd backend
sam local start-api --port 3001

# Terminal 3: Frontend
npm run dev
```
- Uses `.env.local` → `VITE_API_BASE_URL=http://localhost:3001`
- Everything runs on your machine, no AWS costs, fully isolated

### Staging
```bash
# Deploy backend
cd backend
sam build && sam deploy --config-env staging

# Deploy frontend
npm run build -- --mode staging
aws s3 sync dist/ s3://fartooyoung-frontend-staging --delete
aws cloudfront create-invalidation --distribution-id EYHMCS1M0XJX1 --paths "/*"
```
- Uses `.env.staging` → points to staging API Gateway
- Full AWS stack with test Stripe keys

### Production
```bash
# Automated: just push to main
git push origin main
# CI/CD pipeline handles both frontend and backend deployment
```
- Uses `.env.production` → points to production API Gateway
- Live Stripe keys, real data, real users

---

## Hybrid Development (Recommended for Frontend Changes)

Run the frontend locally but point it at the staging backend — no need to run SAM or Docker:

Update `.env.local`:
```
VITE_API_BASE_URL=https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod
```
Then just:
```bash
npm run dev
```
You get Vite hot-reload locally with a real AWS backend. Use this when you're only changing frontend code.

---

## Configuration Files Per Environment

All paths relative to project root (`fartooyoung/`):

| File | Environment | Purpose |
|---|---|---|
| `.env.local` | Local | Frontend API URL + test Stripe key |
| `.env.staging` | Staging | Frontend API URL for staging |
| `.env.production` | Production | Frontend API URL + live Stripe key |
| `backend/samconfig.toml` | All | SAM deploy targets (`[default]`, `[staging]`, `[production]`) |
| `backend/template.yaml` | All | Shared infrastructure definition (same for all environments) |
| `deployment/stg-frontend-pipeline.yml` | Staging | V2 pipeline for staging frontend |
| `deployment/stg-backend-pipeline.yml` | Staging | V2 pipeline for staging backend |
| `deployment/prod-frontend-pipeline.yml` | Production | V2 pipeline for production frontend |
| `deployment/prod-backend-pipeline.yml` | Production | V2 pipeline for production backend |
| `deployment/stg-manual-deploy-frontend.sh` | Staging | Emergency manual frontend deploy |
| `deployment/stg-manual-deploy-backend.sh` | Staging | Emergency manual backend deploy |
| `deployment/prod-manual-deploy-frontend.sh` | Production | Emergency manual frontend deploy |
| `deployment/prod-manual-deploy-backend.sh` | Production | Emergency manual backend deploy |

---

## What's Shared vs Different

**Shared across all environments (same code, same design):**
- React components and pages (`src/`)
- Lambda function code (`backend/lambda/`)
- Infrastructure template (`backend/template.yaml`)
- Database table schemas (same fields, same keys)
- API endpoint structure (same 17 endpoints)

**Different per environment (configuration only):**
- API URLs and resource names
- Stripe keys (test vs live)
- Secrets Manager ARNs
- S3 bucket names and CloudFront distribution IDs
- DynamoDB table name prefixes

---

*For detailed design of each layer, see:*
- `1-architecture.md` — High-level system overview
- `3-frontend-design.md` — React components and state management
- `4-backend-design.md` — Lambda functions and API endpoints
- `5-database-design.md` — DynamoDB table schemas

*Last Updated: May 27, 2026*
