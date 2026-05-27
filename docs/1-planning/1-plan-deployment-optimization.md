# Critical Deployment & Pipeline Optimization Plan

## Overview
Optimize the CI/CD pipeline and deployment configuration for improved security, reliability, and maintainability.

**Status:** ✅ Core complete (pipeline split + CodeStar done), remaining items are enhancements  
**Priority:** Low (remaining items are nice-to-haves)

---

## Changes (Priority Order)

### 1. Tighten CodeBuild IAM Role ⚠️ Security
**File:** `deployment/production/pipeline.yml`

Current role uses `PowerUserAccess` + `IAMFullAccess` — effectively admin. Replace with scoped permissions:
- S3 write to `fartooyoung-frontend-production` + artifacts bucket
- CloudFront invalidation for `E2PHSH4ED2AIN5`
- CloudFormation/SAM deploy permissions
- Secrets Manager read for `fartooyoung-production-secrets-tEmB4i`
- CloudWatch Logs write
- DynamoDB access for `fartooyoung-production-*` tables
- Lambda update permissions

Scope to specific resource ARNs where possible.

### 2. Lock Down CORS ⚠️ Security
**File:** `backend/template.yaml`

**Current state:** `AllowOrigin: "'*'"` for the API Gateway preflight (OPTIONS) response. This was set to fix a mobile Safari issue where users accessing `fartooyoung.org` (no www) were blocked because the preflight returned `https://www.fartooyoung.org` which didn't match.

**Note:** The actual Lambda responses already enforce specific origins via `getAllowedOrigin()` in `backend/lambda/utils/cors.js`, so the `*` preflight is not a security risk. The browser still blocks responses that don't match the requesting origin.

**Proper fix (two steps):**

1. **Add CloudFront redirect: `fartooyoung.org` → `www.fartooyoung.org`**
   - Add a CloudFront Function to the production distribution that redirects non-www to www
   - This ensures all users always hit `www.fartooyoung.org`
   - Then the preflight can safely return only `https://www.fartooyoung.org`

2. **Lock down preflight after redirect is in place:**
   ```yaml
   AllowOrigin: !If
     - IsProduction
     - "'https://www.fartooyoung.org'"
     - !If
       - IsStaging
       - "'https://staging.fartooyoung.org'"
       - "'http://localhost:5173'"
   ```

**Do NOT lock down the preflight until the CloudFront redirect is deployed**, or mobile users on `fartooyoung.org` will break again.

### 3. Add Manual Approval Gate
**File:** `deployment/production/pipeline.yml`

Currently any push to `main` auto-deploys to production with real payments and no approval step. Add a manual approval action between Source and Build stages.

**Note:** After migrating to split pipelines (#4), add approval only to the backend pipeline (higher risk). Frontend-only deploys are low-risk and can remain auto.

---

### 4 & 5. Pipeline Split + CodeStar Migration (Combined)

> **These must be done together.** CodeStar Connection (V2) is a prerequisite for path-based triggers, which enable the pipeline split. The old V1 polling approach does not support path filtering.

#### Current Architecture (V1 — Legacy)
```
GitHub (main branch)
    │
    │  Polling every 1-5 minutes (PollForSourceChanges)
    │  OAuth token authentication
    ▼
CodePipeline V1: fartooyoung-production-pipeline
    │
    ├── Source Stage (downloads ALL code)
    ├── BuildFrontend (ALWAYS runs)
    └── BuildBackend (ALWAYS runs — often "no changes")
```

**Problems:**
- Polling delay (1-5 min before pipeline notices new commits)
- Both builds always run regardless of what changed
- OAuth token requires manual management
- $1/month flat cost even when idle
- Can't roll back frontend/backend independently

#### Target Architecture (V2 — CodeStar + Split Pipelines)
```
GitHub (main branch)
    │
    │  Instant webhook via CodeStar Connection
    │  Path-based filtering
    ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
▼                                                         ▼
CodePipeline V2: fartooyoung-frontend-pipeline    CodePipeline V2: fartooyoung-backend-pipeline
    │                                                 │
    │  Triggers on: src/**, public/**,                │  Triggers on: backend/**
    │  vite.config.js, .env.production                │
    ▼                                                 ▼
BuildFrontend                                     BuildBackend
    │                                                 │
    ├── npm run build --mode production               ├── sam build
    ├── aws s3 sync → fartooyoung-frontend-production ├── sam deploy --config-env production
    └── CloudFront invalidation (E2PHSH4ED2AIN5)      └── Updates 17 Lambda functions
```

**Benefits:**
- Instant triggers (no polling delay)
- Frontend-only changes skip backend entirely (and vice versa)
- Independent rollback capability
- Pay-per-execution (~$0.002/action vs $1/month flat)
- No token management (CodeStar handles auth)

#### Implementation Steps

**Step 1: Create CodeStar Connection (one-time, ~5 min)**
```bash
# Create connection in AWS Console:
# Developer Tools → Settings → Connections → Create connection
# Provider: GitHub → Authorize AWS → Select repository: asharma12git/fartooyoung
# Status must be "Available" before proceeding

# Or via CLI:
aws codestar-connections create-connection \
  --provider-type GitHub \
  --connection-name fartooyoung-github \
  --region us-east-1

# Note: CLI-created connections start as "Pending" — must complete handshake in Console
```

**Step 2: Create Frontend Pipeline (V2)**

New file: `deployment/production/frontend-pipeline.yml`

Key configuration:
```yaml
Type: V2
Triggers:
  - ProviderType: CodeStarSourceConnection
    GitConfiguration:
      SourceActionName: Source
      Push:
        - FilePaths:
            Includes:
              - "src/**"
              - "public/**"
              - "vite.config.js"
              - ".env.production"
              - "package.json"
              - "package-lock.json"
            Excludes:
              - "src/**/*.test.*"
              - "src/**/*.spec.*"
          Branches:
            Includes:
              - "main"
```

Build stage uses existing `buildspec-frontend.yml`:
```yaml
# buildspec-frontend.yml (no changes needed)
phases:
  install:
    commands:
      - npm ci
  build:
    commands:
      - npm run build -- --mode production
  post_build:
    commands:
      - aws s3 sync dist/ s3://fartooyoung-frontend-production --delete
      - aws cloudfront create-invalidation --distribution-id E2PHSH4ED2AIN5 --paths "/*"
```

**Step 3: Create Backend Pipeline (V2)**

New file: `deployment/production/backend-pipeline.yml`

Key configuration:
```yaml
Type: V2
Triggers:
  - ProviderType: CodeStarSourceConnection
    GitConfiguration:
      SourceActionName: Source
      Push:
        - FilePaths:
            Includes:
              - "backend/**"
            Excludes:
              - "backend/README.md"
          Branches:
            Includes:
              - "main"
```

Build stage uses existing `buildspec-backend.yml`:
```yaml
# buildspec-backend.yml (no changes needed)
phases:
  install:
    commands:
      - pip install aws-sam-cli
  build:
    commands:
      - cd backend
      - sam build
      - sam deploy --config-env production --no-confirm-changeset --no-fail-on-empty-changeset
```

**Step 4: Deploy and Test**
```bash
# Deploy frontend pipeline
aws cloudformation deploy \
  --template-file deployment/production/frontend-pipeline.yml \
  --stack-name fartooyoung-frontend-pipeline \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Deploy backend pipeline
aws cloudformation deploy \
  --template-file deployment/production/backend-pipeline.yml \
  --stack-name fartooyoung-backend-pipeline \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Test: make a frontend-only change, push to main
# Verify: only frontend pipeline triggers
# Test: make a backend-only change, push to main
# Verify: only backend pipeline triggers
```

**Step 5: Delete Old Pipeline**
```bash
# Only after both new pipelines are verified working
aws cloudformation delete-stack \
  --stack-name fartooyoung-production-pipeline \
  --region us-east-1

# Clean up old artifacts bucket if no longer needed
# aws s3 rb s3://fartooyoung-pipeline-artifacts-538781441544 --force
```

**Step 6: Update Documentation**
- Update `docs/3-deployments/1-deployment-overview.md` with new pipeline architecture
- Update `docs/2-system-design/1-architecture.md` CI/CD diagram
- Remove references to single pipeline throughout docs

---

### 6. Add Build Validation Steps
**Files:** `buildspec-frontend.yml`, `buildspec-backend.yml`

Neither buildspec has testing or linting. Add:
- Frontend: `npm run lint` before build (add lint script to package.json if missing)
- Backend: `sam validate` before `sam build`
- Unit tests for payment Lambda functions (when available)

---

## Execution Order

| Step | Item | Depends On | Time | Status |
|------|------|-----------|------|--------|
| 1 | Create CodeStar Connection (shared) | Nothing | 5 min | ✅ |
| 2 | Create Staging Frontend Pipeline V2 | Step 1 | 20 min | ✅ |
| 3 | Create Staging Backend Pipeline V2 | Step 1 | 20 min | ✅ |
| 4 | Test staging pipelines (push to staging branch) | Steps 2+3 | 10 min | ✅ |
| 5 | Create Production Frontend Pipeline V2 | Step 4 verified | 20 min | ✅ |
| 6 | Create Production Backend Pipeline V2 | Step 4 verified | 20 min | ✅ |
| 7 | Test production pipelines (push to main branch) | Steps 5+6 | 10 min | ✅ |
| 8 | Delete old V1 production pipeline | Step 7 verified | 10 min | ✅ |
| 9 | Add manual approval gate to production backend pipeline | Step 8 | 30 min | ⬜ |
| 10 | Tighten CodeBuild IAM roles (#1) | Step 8 | 30 min | ⬜ |
| 11 | Add build validation steps (lint, sam validate) | Steps 5+6 | 1 hour | ⬜ |
| 12 | Update documentation | Step 8 | 30 min | ⬜ |

**Total:** ~4-5 hours

---

## Key Resource References

| Resource | Value |
|----------|-------|
| GitHub Repo | `asharma12git/fartooyoung` |
| AWS Account | `538781441544` |
| Region | `us-east-1` |
| Frontend S3 Bucket | `fartooyoung-frontend-production` |
| CloudFront Distribution | `E2PHSH4ED2AIN5` |
| Backend Stack | `fartooyoung-production` |
| Secrets ARN | `fartooyoung-production-secrets-tEmB4i` |
| Current Pipeline | `fartooyoung-production-pipeline` |
| Artifacts Bucket | `fartooyoung-pipeline-artifacts-538781441544` |

---

## Rollback Plan

If new pipelines have issues:
1. Old pipeline remains active until Step 8 — just push to main and it still works
2. Manual deploy always available as emergency fallback:
   ```bash
   # Frontend
   npm run build -- --mode production
   aws s3 sync dist/ s3://fartooyoung-frontend-production --delete
   aws cloudfront create-invalidation --distribution-id E2PHSH4ED2AIN5 --paths "/*"

   # Backend
   cd backend && sam build && sam deploy --config-env production
   ```

---

*Created: April 6, 2026*  
*Updated: May 26, 2026 — Added implementation details, execution order, and architecture diagrams*
