# Critical Deployment & Pipeline Optimization Plan

## Overview
Optimize the CI/CD pipeline and deployment configuration for improved security, reliability, and maintainability.

**Status:** 📋 Planned  
**Priority:** High (security items), Medium (pipeline restructuring)

---

## Changes (Priority Order)

### 1. Tighten CodeBuild IAM Role ⚠️ Security
**File:** `deployment/production/pipeline.yml`

Current role uses `PowerUserAccess` + `IAMFullAccess` — effectively admin. Replace with scoped permissions:
- S3 write to frontend bucket + artifacts bucket
- CloudFront invalidation
- CloudFormation/SAM deploy permissions
- Secrets Manager read
- CloudWatch Logs

Scope to specific resource ARNs where possible.

### 2. Lock Down CORS ⚠️ Security
**File:** `backend/template.yaml`

Current: `AllowOrigin: "'*'"` — any website can call the API from a browser.

Change to:
- Production: `https://www.fartooyoung.org`
- Staging: `https://staging.fartooyoung.org`

### 3. Add Manual Approval Gate
**File:** `deployment/production/pipeline.yml`

Currently any push to `main` auto-deploys to production with real payments and no approval step. Add either:
- A manual approval action in the pipeline between build and deploy
- Or trigger production pipeline only from a GitHub release/tag

### 4. Split Into Two Pipelines
**Files:** `deployment/production/pipeline.yml`, new buildspec files

Current single pipeline runs Source → BuildFrontend → BuildBackend sequentially. Problems:
- A CSS change triggers a full SAM deploy
- Failed frontend build blocks backend and vice versa
- Can't roll back layers independently

Split into:
- **Frontend pipeline:** Source → Build → S3 sync → CloudFront invalidation
- **Backend pipeline:** Source → SAM build → SAM deploy

Use path-based triggers so each pipeline only fires on relevant changes. Cost increase: $1/month.

### 5. Migrate to CodeStar Connections (v2)
**File:** `deployment/production/pipeline.yml`

Current source action uses deprecated `ThirdParty` GitHub provider (v1) with OAuth token. Migrate to `CodeStarSourceConnection` which:
- Eliminates token management
- Supports path-based triggers (needed for split pipelines)
- Is the current AWS-recommended approach

### 6. Add Build Validation Steps
**Files:** `buildspec-frontend.yml`, `buildspec-backend.yml`

Neither buildspec has testing or linting. Add:
- Frontend: `npm run lint` before build
- Backend: `sam validate` before `sam build`
- Unit tests for payment Lambda functions (when available)

### 7. Scope CORS Per Environment
**File:** `backend/template.yaml`

Use the existing `IsProduction`/`IsStaging` conditions to set `AllowOrigin` dynamically per environment instead of hardcoding `*`.

---

## Estimated Effort
| Change | Time | Risk |
|--------|------|------|
| IAM role scoping | 30 min | Low |
| CORS lockdown | 10 min | Low |
| Approval gate | 30 min | Low |
| Pipeline split | 2-3 hours | Medium |
| CodeStar migration | 1 hour | Medium |
| Build validation | 1 hour | Low |

**Total:** ~5-6 hours

---

*Created: April 6, 2026*
