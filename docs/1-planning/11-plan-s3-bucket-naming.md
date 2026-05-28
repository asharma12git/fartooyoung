# Plan 11: S3 Bucket Naming Standardization

## Priority: Low
## Status: Backlog
## Estimated Effort: 1-2 hours

---

## Why

Current S3 bucket names use inconsistent naming:
- Buckets: `fartooyoung-frontend-staging` (project-purpose-env)
- Pipelines: `fartooyoung-stg-frontend` (project-env-purpose)

Standardizing to `{project}-{env}-{purpose}` makes it easier to find and group resources.

---

## Current → Target

| Current Name | Target Name |
|-------------|-------------|
| `fartooyoung-frontend-staging` | `fartooyoung-stg-frontend` |
| `fartooyoung-frontend-production` | `fartooyoung-prod-frontend` |
| `fartooyoung-backend-staging` | `fartooyoung-stg-backend` |
| `fartooyoung-backend-production` | `fartooyoung-prod-backend` |
| `fartooyoung-stg-frontend-artifacts` | ✅ Already correct |
| `fartooyoung-stg-backend-artifacts` | ✅ Already correct |
| `fartooyoung-prod-frontend-artifacts` | ✅ Already correct |
| `fartooyoung-prod-backend-artifacts` | ✅ Already correct |

---

## Steps (per bucket)

1. Create new bucket with target name
2. Copy all content from old → new (`aws s3 sync`)
3. Update references:
   - CloudFront origin
   - Pipeline template (buildspec S3 sync target)
   - SAM config (`samconfig.toml` s3_bucket)
   - Manual deploy scripts
4. Verify site still works
5. Delete old bucket

---

## Risk

- Medium — touches CloudFront, pipelines, and SAM deploy config
- Must update all references before deleting old bucket
- Do one bucket at a time, verify between each

---

## When to Do This

- During a quiet maintenance window
- Not urgent — everything works, this is cosmetic consistency

---

*Created: May 27, 2026*
