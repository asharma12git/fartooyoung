# Deployment & Pipeline Optimization

## Overview
Migrated CI/CD from single V1 polling pipeline to split V2 pipelines with CodeStar Connection, path-based triggers, and tightened IAM. Frontend and backend deploy independently based on which files changed.

## Prerequisites
- AWS account `538781441544` in `us-east-1`
- GitHub repo `asharma12git/fartooyoung`

## Cost
~$0.002/action (pay-per-execution). Down from ~$1/month flat with V1.

## Checklist
- [x] Step 1: Create CodeStar Connection
- [x] Step 2: Create Staging Frontend Pipeline V2
- [x] Step 3: Create Staging Backend Pipeline V2
- [x] Step 4: Test staging pipelines
- [x] Step 5: Create Production Frontend Pipeline V2
- [x] Step 6: Create Production Backend Pipeline V2
- [x] Step 7: Test production pipelines
- [x] Step 8: Delete old V1 production pipeline
- [x] Step 9: Tighten CodeBuild IAM roles
- [x] Step 10: Add build validation steps (lint, sam validate)
- [x] Step 11: Update documentation
- [x] Step 12: Lock down CORS (deferred — needs CloudFront non-www redirect first)

---

## Step 1: Create CodeStar Connection ✅

**Benefit:** CodeStar Connections is an AWS service that creates a secure, persistent link between AWS and GitHub. It replaces polling (checking every 1-5 min) with instant webhook triggers when code is pushed.

**Problem:** V1 pipeline polled GitHub every 1-5 minutes, causing delayed deployments and unnecessary API calls.

**Implementation:** Created CodeStar Connection linking AWS account `538781441544` to GitHub repo `asharma12git/fartooyoung`.

## Step 2: Create Staging Frontend Pipeline V2 ✅

**Benefit:** A dedicated frontend pipeline that only triggers when frontend files change (`src/**`, `public/**`, `vite.config.js`, `.env.production`).

**Problem:** V1 pipeline rebuilt both frontend and backend on every push, wasting build minutes.

**Implementation:** Pipeline: `fartooyoung-stg-frontend-pipeline`. Path-based trigger on `staging` branch.

## Step 3: Create Staging Backend Pipeline V2 ✅

**Benefit:** A dedicated backend pipeline that only triggers when backend files change (`backend/**`).

**Problem:** Same as Step 2 — unnecessary full rebuilds on every push.

**Implementation:** Pipeline: `fartooyoung-stg-backend-pipeline`. Path-based trigger on `staging` branch.

## Step 4: Test staging pipelines ✅

**Benefit:** Validates that path-based triggers work correctly before creating production pipelines.

**Problem:** Untested pipelines could silently fail or trigger incorrectly in production.

**Implementation:** Pushed frontend-only and backend-only changes to `staging` branch, verified only the correct pipeline triggered.

## Step 5: Create Production Frontend Pipeline V2 ✅

**Benefit:** Production frontend deploys independently from backend, reducing deployment risk.

**Problem:** Coupled deployments meant a backend change could delay a critical frontend fix.

**Implementation:** Pipeline: `fartooyoung-prod-frontend-pipeline`. Triggers on `main` branch, path filter `src/**`, `public/**`, `vite.config.js`, `.env.production`.

## Step 6: Create Production Backend Pipeline V2 ✅

**Benefit:** Production backend deploys independently with SAM build + deploy.

**Problem:** Same coupling issue as frontend.

**Implementation:** Pipeline: `fartooyoung-prod-backend-pipeline`. Triggers on `main` branch, path filter `backend/**`.

## Step 7: Test production pipelines ✅

**Benefit:** Confirms production pipelines work before deleting old V1 pipeline.

**Problem:** Deleting V1 without testing V2 could leave us with no working deployment.

**Implementation:** Pushed changes to `main`, verified correct pipeline triggered and deployed successfully.

## Step 8: Delete old V1 production pipeline ✅

**Benefit:** Removes the legacy polling pipeline to avoid confusion and stop the $1/month flat cost.

**Problem:** Two active pipelines for the same branch would cause duplicate deployments.

**Implementation:** Deleted V1 pipeline from AWS Console.

## Step 9: Tighten CodeBuild IAM roles ✅

**Benefit:** Least-privilege IAM ensures CodeBuild can only access what it needs (S3 buckets, CloudFront, SAM).

**Problem:** Default CodeBuild roles often have overly broad permissions, creating security risk.

**Implementation:** Scoped IAM policies to specific S3 buckets, CloudFront distribution, and SAM stack resources.

## Step 10: Add build validation steps ✅

**Benefit:** Running lint and `sam validate` in the pipeline catches errors before deployment.

**Problem:** Without validation, broken code could deploy to staging/production.

**Implementation:** Added lint step to frontend buildspec, `sam validate` to backend buildspec.

## Step 11: Update documentation ✅

**Benefit:** Keeps deployment docs accurate for future reference.

**Problem:** Outdated docs cause confusion when debugging pipeline issues.

**Implementation:** Updated deployment docs in `docs/3-deployments/`.

## Step 12: Lock down CORS (deferred) ⬜

**Benefit:** Restricting CORS preflight to specific origins prevents unauthorized cross-origin requests.

**Problem:** Current `AllowOrigin: "'*'"` for OPTIONS preflight is overly permissive (Lambda responses already enforce specific origins via `getAllowedOrigin()`).

**Implementation:** Deferred — requires CloudFront redirect `fartooyoung.org` → `www.fartooyoung.org` first, then lock preflight to specific origin per environment.

---

## Architecture (Before → After)

**Before (V1):**
```
GitHub → Polling (1-5 min delay) → Single pipeline → Both builds ALWAYS run
```

**After (V2):**
```
GitHub → Instant webhook (CodeStar) → Path-based filtering
  ├── Frontend pipeline (src/**, public/**, vite.config.js, .env.production)
  └── Backend pipeline (backend/**)
```

## Key Resource References

| Resource | Value |
|----------|-------|
| GitHub Repo | `asharma12git/fartooyoung` |
| AWS Account | `538781441544` |
| Region | `us-east-1` |
| Frontend S3 Bucket | `fartooyoung-prod-frontend` |
| Backend S3 Bucket | `fartooyoung-prod-backend` |
| CloudFront Distribution | `E2PHSH4ED2AIN5` |
| Backend Stack | `fartooyoung-production` |
| Secrets ARN | `fartooyoung-production-secrets-tEmB4i` |
| Frontend Pipeline | `fartooyoung-prod-frontend-pipeline` |
| Backend Pipeline | `fartooyoung-prod-backend-pipeline` |

## Remaining Items (Nice-to-Haves)

### Manual Approval Gate (Paused)
Add approval action to production backend pipeline between Source and Build stages. Frontend-only deploys are low-risk and can remain auto.

## Rollback Plan

Manual deploy always available:
```bash
# Frontend
npm run build -- --mode production
aws s3 sync dist/ s3://fartooyoung-prod-frontend --delete
aws cloudfront create-invalidation --distribution-id E2PHSH4ED2AIN5 --paths "/*"

# Backend
cd backend && sam build && sam deploy --config-env production
```

---

*Created: April 6, 2026*
*Updated: May 26, 2026*
