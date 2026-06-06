# Session Wrap Prompt

> **Run this checklist at the end of every session. Update each document in order. Do NOT skip any step.**

---

## Document Update Order

### 1. `PROGRESS.md`

Update the following sections:

- **Last Updated** — set to current date and time
- **What's Working** section — update counts (Lambda functions, DynamoDB tables, etc.) if they changed
- **Roadmap table** — update plan statuses if progress was made
- **Session Left Off At** — replace entirely with:
  - What was built this session (specific files, endpoints, features)
  - What was deployed (staging only? production?)
  - Current branch and commit status
  - Known bugs or incomplete items
  - Exact next steps for the next session
  - Any blockers or decisions pending owner input

### 2. `README.md`

Check and update:

- **Tech Stack** — Lambda count, DynamoDB table count, any new services
- **Features list** — add new features if user-facing functionality was added
- **Project Structure** — update if new folders or significant files were added
- **Environments table** — update if new endpoints or services were added
- **Documentation table** — update if new docs were created

### 3. `CONTRIBUTING.md`

Check and update:

- **Lambda/table counts** in any references
- **Workflow steps** if development process changed
- **BEFORE ENDING section** if new document categories were added
- **How to Add a New Page** if page creation process changed
- **Further Reading** table if new docs were added

### 4. `ORGANIZATION.md`

Check and update:

- **AWS Resources** — new tables, Lambda functions, S3 buckets, EventBridge rules
- **Accounts & Dashboards** — new services or integrations
- **API Endpoints** — new routes added

### 5. Planning Docs (`docs/1-planning/`)

**Walk through EVERY plan file.** For each plan that was worked on:

- **Status line** — update (e.g. "Steps 1-3 Done" → "Steps 1-6 Done")
- **Checklist** — mark completed steps with [x]
- **Implementation notes** — update with what was actually built (not just planned)
- **Architecture diagrams** — update if data flow changed
- **Last updated date** — set to today
- **Even plans NOT directly worked on** — check if references to other plans are still accurate

### 6. System Design Docs (`docs/2-system-design/`)

**Walk through EVERY file in this folder.** Update if ANY of the following changed:

- `1-architecture.md` — new services, Lambda functions, data flows, DynamoDB tables, EventBridge rules, S3 buckets, or integrations
- `2-environments.md` — new environment variables, table names, endpoints, or service configurations
- `3-frontend-design.md` — new pages, components, routes, or UI patterns
- `4-backend-design.md` — new Lambda functions, API endpoints, middleware, or auth patterns
- `5-database-design.md` — new tables, fields, indexes, or access patterns

**Do NOT skip these.** Open each file, compare against what was built this session, and update if stale.

### 7. Deployment Docs (`docs/3-deployments/`)

**Walk through EVERY file in this folder.** Update if:

- `1-deployment-overview.md` — new services deployed, new pipeline steps, or new environments
- `2-frontend-deployment-guide.md` — new build steps, new routes to prerender, or pipeline changes
- `3-backend-deployment-guide.md` — new Lambda functions, new SAM template resources, or deploy commands changed

### 8. Testing Docs (`docs/5-testing/`)

- `1-testing-checklist.md` — add test cases for new features built this session
- `2-api-test-commands.md` — add curl commands for new endpoints added this session

---

## Final Steps

1. **Build check** — run `npm run build` and confirm no errors
2. **Git commit** — stage all changed files, write descriptive commit message
3. **Git push** — push to `staging` branch ONLY
4. **⛔ DO NOT merge to main** without explicit owner permission

---

## Commit Message Format

```
Session [date]: [brief summary]

- [Feature/fix 1]
- [Feature/fix 2]
- [Docs updated]
```

Example:
```
Session Jun 6: Admin panel + RSS fixes

- Built /admin page (research curation + blog management)
- Fixed RSS fetcher (removed dead feeds, added UN News)
- Added CORS PUT/DELETE support
- Created tiers table in DynamoDB
- Updated Plan 6, PROGRESS.md, README.md
```

---

## Quality Check

Before ending, confirm:

- [ ] All code changes build without errors
- [ ] Backend deployed to staging if Lambda changes were made
- [ ] `PROGRESS.md` updated (phase, counts, session left off at)
- [ ] `README.md` updated (counts, features, structure)
- [ ] `CONTRIBUTING.md` checked for stale references
- [ ] `ORGANIZATION.md` updated if AWS resources changed
- [ ] `docs/1-planning/` — walked through, statuses updated
- [ ] `docs/2-system-design/` — walked through, every file checked against changes
- [ ] `docs/3-deployments/` — walked through if deploy process changed
- [ ] `docs/5-testing/` — new test cases and API commands added
- [ ] PROGRESS.md "Session Left Off At" is detailed enough for a cold start
- [ ] No uncommitted changes left in working directory
- [ ] Branch is `staging` (not main)

---

*This file is referenced by CONTRIBUTING.md. Follow it every session without exception.*
