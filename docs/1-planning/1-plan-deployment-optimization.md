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

Current: `AllowOrigin: "'*'"` — any website can call the API from a browser.

Change to environment-specific origins using existing SAM conditions:
- Production: `https://www.fartooyoung.org`
- Staging: `https://staging.fartooyoung.org`
- Local: `http://localhost:5173`

Use the existing `IsProduction`/`IsStaging` conditions in `template.yaml` to set `AllowOrigin` dynamically.

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

| Step | Item | Depends On | Time | Risk |
|------|------|-----------|------|------|
| 1 | IAM role scoping (#1) | Nothing | 30 min | Low |
| 2 | CORS lockdown (#2) | Nothing | 10 min | Low |
| 3 | Create CodeStar Connection | Nothing | 5 min | Low |
| 4 | Create frontend pipeline (V2) | Step 3 | 1 hour | Medium |
| 5 | Create backend pipeline (V2) | Step 3 | 1 hour | Medium |
| 6 | Test both pipelines | Steps 4+5 | 30 min | Low |
| 7 | Add approval gate to backend pipeline (#3) | Step 5 | 30 min | Low |
| 8 | Delete old pipeline | Step 6 verified | 10 min | Low |
| 9 | Add build validation (#6) | Steps 4+5 | 1 hour | Low |
| 10 | Update documentation | Step 8 | 30 min | Low |

**Total:** ~5-6 hours

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
