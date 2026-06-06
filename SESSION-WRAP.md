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

For each plan that was worked on:

- **Status line** — update (e.g. "Steps 1-3 Done" → "Steps 1-6 Done")
- **Checklist** — mark completed steps with [x]
- **Implementation notes** — update with what was actually built (not just planned)
- **Architecture diagrams** — update if data flow changed
- **Last updated date** — set to today

### 6. System Design Docs (`docs/2-system-design/`)

Only update if relevant changes were made:

- `1-architecture.md` — new services, data flows, or integrations
- `3-frontend-design.md` — new pages, components, or routes
- `4-backend-design.md` — new Lambda functions, API endpoints, or middleware
- `5-database-design.md` — new tables, fields, or indexes

### 7. Testing Docs (`docs/5-testing/`)

- `1-testing-checklist.md` — add test cases for new features
- `2-api-test-commands.md` — add curl commands for new endpoints

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
- [ ] All documents above reviewed and updated where needed
- [ ] PROGRESS.md "Session Left Off At" is detailed enough for a cold start
- [ ] No uncommitted changes left in working directory
- [ ] Branch is `staging` (not main)

---

*This file is referenced by CONTRIBUTING.md. Follow it every session without exception.*
