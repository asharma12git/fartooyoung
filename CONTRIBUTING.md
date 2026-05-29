# Contributing - Technical Guide

## ⚠️ Critical Rules

1. **⛔ NEVER PUSH OR MERGE TO `main` WITHOUT EXPLICIT OWNER PERMISSION** — ALWAYS ASK FIRST, NO EXCEPTIONS, REGARDLESS OF HOW SMALL THE CHANGE IS
2. **⛔ NEVER PUSH DIRECTLY TO `main`** — main auto-deploys to production with real users and real payments
3. **⛔ NEVER MODIFY PRODUCTION DYNAMODB TABLES DIRECTLY** — always test on staging first
4. **⛔ NEVER COMMIT SECRETS** (API keys, passwords, tokens) — use AWS Secrets Manager
5. **ALWAYS TEST ON STAGING BEFORE MERGING TO MAIN**

> 🚨🚨🚨 **EVEN FOR A ONE-LINE CHANGE — ASK BEFORE MERGING TO MAIN. NO ASSUMPTIONS. NO SHORTCUTS.** 🚨🚨🚨

---

## Development Workflow

```
1. Work on `staging` branch
2. Test locally (npm run dev)
3. Push to staging → pipeline auto-deploys to staging.fartooyoung.org
4. Validate on staging (test all affected features)
5. ⛔ ASK THE OWNER FOR PERMISSION TO MERGE TO MAIN
6. Only after explicit approval → merge staging into main
7. Main auto-deploys to production (www.fartooyoung.org)
```

### For ALL Changes (Large or Small)

- **⛔ DO NOT MERGE TO MAIN WITHOUT ASKING FIRST**
- **⛔ DO NOT CHECKOUT `main` WITHOUT PERMISSION**
- Run the regression testing checklist (`docs/4-testing/1-testing-checklist.md`)
- If the feature touches payments — test with real Stripe test cards on staging
- **WHEN IN DOUBT — ASK BEFORE MERGING**

---

## Local Development

```bash
# Frontend only (points to staging backend)
npm run dev

# Full stack (local backend + local DB)
# Terminal 1: Database
docker run -p 8000:8000 amazon/dynamodb-local

# Terminal 2: Backend
cd backend && sam local start-api --port 3001

# Terminal 3: Frontend
npm run dev
```

### Hybrid Mode (Recommended)

Run frontend locally but point to staging backend — edit `.env.local`:
```
VITE_API_BASE_URL=https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod
```
Then just `npm run dev`. You get hot-reload with a real backend.

---

## Git Branch Strategy

| Branch | Deploys To | Trigger |
|--------|-----------|---------|
| `staging` | staging.fartooyoung.org | Auto (instant webhook) |
| `main` | www.fartooyoung.org (PRODUCTION) | Auto (instant webhook) |

### What Triggers Pipelines

| Change | Frontend Pipeline | Backend Pipeline |
|--------|------------------|-----------------|
| `src/**`, `public/**`, `package.json`, `vite.config.js` | ✅ Triggers | ❌ No |
| `backend/lambda/**`, `backend/template.yaml`, `backend/samconfig.toml` | ❌ No | ✅ Triggers |
| `docs/**`, `deployment/**`, `README.md`, `backend/scripts/**` | ❌ No | ❌ No |

---

## How to Add a New Feature

1. Make sure you're on `staging` branch: `git checkout staging`
2. Write code and test locally
3. Commit and push: `git push origin staging`
4. Wait for staging pipeline to deploy (~2 min)
5. Test on staging.fartooyoung.org
6. **⛔ ASK THE OWNER FOR PERMISSION TO MERGE TO MAIN** — do NOT proceed without approval
7. Only after explicit approval → `git checkout main && git merge staging && git push origin main`
8. Verify on www.fartooyoung.org

---

## How to Add a New API Endpoint

1. Create Lambda function in `backend/lambda/{category}/`
2. Add function + API event to `backend/template.yaml`
3. Deploy to staging: `cd backend && sam build && sam deploy --config-env staging`
4. Test the endpoint via curl
5. Add test cases to `docs/4-testing/1-testing-checklist.md`
6. Push to staging, verify pipeline deploys it

---

## How to Add a New Page (with SEO)

1. Create the page component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Add `<SEO title="..." description="..." path="/your-page" />` to the page component
4. Add the URL to `public/sitemap.xml`
5. Add the route to `scripts/prerender.mjs` (in the `routes` array)
6. Test locally: `npm run build` — verify the new page appears in pre-render output
7. Deploy to staging, verify at `staging.fartooyoung.org/your-page`
8. Google picks up the new page automatically from the sitemap (no manual action needed)

**SEO files to remember:**
- `src/components/SEO.jsx` — shared meta tag component
- `public/sitemap.xml` — list of all public pages for Google
- `public/robots.txt` — crawl rules
- `scripts/prerender.mjs` — generates static HTML at build time

**Analytics dashboards:**
- Google Analytics: [analytics.google.com](https://analytics.google.com) (GA4 ID: `G-XJN5PR545G`)
- Microsoft Clarity: [clarity.microsoft.com](https://clarity.microsoft.com) (Project ID: `wytghx7ix4`)
- Google Search Console: [search.google.com/search-console](https://search.google.com/search-console)

---

## Testing

### After Every Deploy (Smoke Test — 2 min)

```bash
# Site loads
curl -s -o /dev/null -w "%{http_code}" https://staging.fartooyoung.org

# Login works
curl -X POST {api}/auth/login -d '{"email":"...","password":"..."}'

# Dashboard returns data
curl -X GET {api}/donations -H "Authorization: Bearer {token}"
```

### Full Regression (Before Merging to Main)

> **⛔ IF YOU ADDED A NEW FEATURE — UPDATE THE CHECKLIST FIRST** before running tests. Add new test cases to cover the feature, then run the full suite.

See `docs/4-testing/1-testing-checklist.md` — 70+ test cases covering all endpoints.

---

## What NOT to Do

| ❌ Don't | ✅ Do Instead |
|----------|--------------|
| Merge to `main` without asking | Always ask owner for permission first |
| Checkout `main` branch without permission | Stay on `staging` until approved |
| Push to `main` without testing | Push to `staging`, test, ask, then merge |
| Edit production DynamoDB directly | Copy prod data to staging, test there |
| Store secrets in code or .env files | Use AWS Secrets Manager |
| Delete S3 buckets without checking | Verify nothing points to them first |
| Run migration scripts on prod first | Always run on staging first |
| Merge during active production issues | Fix the issue first, then merge |
| Assume a small change is safe | Ask anyway — no exceptions |

---

## Emergency: Manual Deploy (If Pipeline Breaks)

```bash
# Frontend
./deployment/stg-manual-deploy-frontend.sh   # staging
./deployment/prod-manual-deploy-frontend.sh  # production

# Backend
./deployment/stg-manual-deploy-backend.sh    # staging
./deployment/prod-manual-deploy-backend.sh   # production
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/template.yaml` | ALL AWS infrastructure (Lambda + DB + API) |
| `backend/samconfig.toml` | Deploy targets per environment |
| `.env.local` / `.env.staging` / `.env.production` | Frontend API URLs per environment |
| `deployment/*.yml` | Pipeline infrastructure templates |
| `docs/4-testing/1-testing-checklist.md` | Full regression test suite |
| `docs/1-planning/` | Feature roadmap and plans |
| `PROGRESS.md` | Session history log |

---

## AWS Resources Quick Reference

| Resource | Staging | Production |
|----------|---------|------------|
| Frontend | `fartooyoung-stg-frontend` | `fartooyoung-prod-frontend` |
| Backend | `fartooyoung-stg-backend` | `fartooyoung-prod-backend` |
| Pipeline (FE) | `fartooyoung-stg-frontend-pipeline` | `fartooyoung-prod-frontend-pipeline` |
| Pipeline (BE) | `fartooyoung-stg-backend-pipeline` | `fartooyoung-prod-backend-pipeline` |
| API | `71z0wz0dg9...amazonaws.com` | `0o7onj0dr7...amazonaws.com` |
| CloudFront | `EYHMCS1M0XJX1` | `E2PHSH4ED2AIN5` |
| DynamoDB | `fartooyoung-staging-*` | `fartooyoung-production-*` |

---

## ⛔ Further Reading — READ THESE BEFORE YOU BEGIN

> **🚨 DO NOT START ANY WORK UNTIL YOU HAVE READ AND UNDERSTOOD THESE DOCUMENTS. They contain critical context about the architecture, environments, and how everything connects.**

| Doc | What You'll Learn |
|-----|-------------------|
| `README.md` | Project overview, tech stack, features, how to run locally |
| `docs/2-system-design/1-architecture.md` | Full system architecture, how services connect |
| `docs/2-system-design/2-environments.md` | All AWS resources per environment (staging vs production) |
| `docs/2-system-design/3-frontend-design.md` | React components, pages, routing |
| `docs/2-system-design/4-backend-design.md` | All 17 Lambda functions, what each does |
| `docs/2-system-design/5-database-design.md` | DynamoDB table schemas |
| `docs/3-deployments/1-deployment-overview.md` | How deployment works end-to-end |
| `docs/4-testing/1-testing-checklist.md` | Full regression test suite (70 test cases) |
| `docs/1-planning/` | Feature roadmap (numbered by priority) |
| `PROGRESS.md` | Session-by-session development history |

---

## ⛔ BEFORE ENDING ANY SESSION

> **🚨 DO NOT END A SESSION WITHOUT WALKING THROUGH EVERY DOCUMENT ONE BY ONE, IN FULL DETAIL, AND UPDATING ALL THAT ARE AFFECTED BY YOUR CHANGES. NO EXCEPTIONS.**

**Process:**
1. Iterate through EVERY document listed below
2. Read each one and check if your changes affect it
3. If yes — update it with current information
4. If no — confirm it's still accurate and move on
5. Do NOT skip any document. Do NOT assume it's fine without checking.

Update **every document** that is affected by your changes, including but not limited to:

1. **`PROGRESS.md`** — Add a session entry with what was done, what was deployed, what's next
2. **`docs/4-testing/1-testing-checklist.md`** — Add new test cases if new features were added
3. **`docs/2-system-design/1-architecture.md`** — Update if architecture changed
4. **`docs/2-system-design/2-environments.md`** — Update if environments or AWS resources changed
5. **`docs/2-system-design/3-frontend-design.md`** — Update if frontend components changed
6. **`docs/2-system-design/4-backend-design.md`** — Update if Lambda functions or API endpoints changed
7. **`docs/2-system-design/5-database-design.md`** — Update if database schema changed
8. **`docs/3-deployments/1-deployment-overview.md`** — Update if deployment process changed
9. **`docs/3-deployments/2-frontend-deployment-guide.md`** — Update if frontend deployment changed
10. **`docs/3-deployments/3-backend-deployment-guide.md`** — Update if backend deployment changed
11. **`docs/1-planning/`** — Update plan status if a plan was started or completed
12. **`CONTRIBUTING.md`** — Update if workflow, pipelines, or AWS resources changed
13. **`README.md`** — Update if features, tech stack, or project structure changed
14. **`deployment/*.yml`** — Update if pipeline triggers or names changed
15. **Any other doc that references what you changed**

**Leave the project in a state where the next session can pick up immediately without guessing what happened.**
