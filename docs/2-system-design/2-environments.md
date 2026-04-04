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
| **S3 Bucket** | N/A | `fartooyoung-staging-frontend` | `fartooyoung-frontend-production` |
| **SAM Stack** | `fartooyoung-local` | `fartooyoung-staging` | `fartooyoung-production` |

---

## Git Branch Strategy

| Branch | Deploys To | How |
|---|---|---|
| `main` | Production (`www.fartooyoung.org`) | Auto via CI/CD on push |
| `staging` | Staging (`staging.fartooyoung.org`) | Manual deploy |

**⚠️ Important: Always deploy to staging first before production.**
Production has CI/CD — any push to `main` auto-deploys to the live site. Never push untested changes directly to `main`.

> 🚨 **WARNING:** Pushing to `main` immediately deploys to the LIVE production site (`www.fartooyoung.org`) with real users and real payments. There is no approval step. Always test on staging first.

**Workflow:**
1. Work on `staging` branch → test locally with `npm run dev`
2. Deploy to staging → verify on `staging.fartooyoung.org`
3. Once verified, merge `staging` into `main` → CI/CD auto-deploys to production

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
aws s3 sync dist/ s3://fartooyoung-staging-frontend --delete
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
| `deployment/staging/deploy-frontend.sh` | Staging | Script to build and deploy frontend to staging |
| `deployment/staging/deploy-backend.sh` | Staging | Script to build and deploy backend to staging |
| `deployment/production/pipeline.yml` | Production | CloudFormation template that creates the CI/CD pipeline |
| `deployment/production/deploy-pipeline.sh` | Production | Script to create/update the CI/CD pipeline |

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

*Last Updated: April 4, 2026*
