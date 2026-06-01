# Deployment & Pipeline Optimization

## Overview
Migrated CI/CD from single V1 polling pipeline to split V2 pipelines with CodeStar Connection, path-based triggers, and tightened IAM. Frontend and backend deploy independently based on which files changed.

**Status:** ✅ Core complete (pipeline split + CodeStar + IAM tightening + build validation + docs)  
**Remaining:** Manual approval gate for production backend pipeline (paused — nice-to-have)  
**Cost savings:** ~$1/month flat → ~$0.002/action (pay-per-execution)

## Prerequisites
- AWS account `538781441544` in `us-east-1`
- GitHub repo `asharma12git/fartooyoung`

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

### CORS Lock-Down
Current: `AllowOrigin: "'*'"` for OPTIONS preflight (Lambda responses already enforce specific origins via `getAllowedOrigin()`). Proper fix requires CloudFront redirect `fartooyoung.org` → `www.fartooyoung.org` first, then lock preflight to specific origin per environment.

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
