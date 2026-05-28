# Far Too Young - Child Marriage Prevention Platform

A full-stack serverless web application for an organization focused on ending child marriage globally. Live at [www.fartooyoung.org](https://www.fartooyoung.org).

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: 17 AWS Lambda functions (Node.js 18) via API Gateway
- **Database**: DynamoDB (3 tables: Users, Donations, Rate Limits)
- **Payments**: Stripe (live checkout, subscriptions, webhooks)
- **Email**: AWS SES (verification, password reset, notifications)
- **Infrastructure**: CloudFront CDN, S3, Route 53, Secrets Manager, SAM

## Features

- User authentication with email verification and input validation
- One-time and recurring donations via Stripe
- User dashboard (donation history, subscription management, profile settings)
- Rate limiting and bot protection
- Password strength enforcement (8+ chars, uppercase, lowercase, number, special)
- Mobile-responsive dark theme UI
- 5 public pages: Child Marriage, Founder & Team, Partners, What We Do, Home

## Project Structure

```
fartooyoung/
├── src/                        # React frontend (components, pages)
├── backend/
│   ├── lambda/                 # 17 Lambda functions
│   ├── scripts/                # One-off migration scripts (manual)
│   ├── template.yaml           # SAM infrastructure definition
│   └── samconfig.toml          # Deployment targets per environment
├── deployment/                 # V2 pipeline templates + manual deploy scripts
├── docs/                       # System design documentation
├── .env.local                  # Local dev config
├── .env.staging                # Staging config
└── .env.production             # Production config
```

## Environments

| Environment | Frontend | Backend | Stripe |
|-------------|----------|---------|--------|
| Local | localhost:5173 | SAM local :3001 + DynamoDB Docker :8000 | Test keys |
| Staging | staging.fartooyoung.org | AWS API Gateway (staging) | Test keys |
| Production | www.fartooyoung.org | AWS API Gateway (production) | Live keys |

## Quick Start (Local)

```bash
# Terminal 1: Database
docker run -p 8000:8000 amazon/dynamodb-local

# Terminal 2: Backend
cd backend && sam local start-api --port 3001

# Terminal 3: Frontend
npm install && npm run dev
```

## Development Workflow

> 🚨 **NEVER push directly to `main`. Always work on `staging` branch first.**

```
1. Work on `staging` branch
2. Test locally (npm run dev)
3. Push to staging → pipeline auto-deploys to staging.fartooyoung.org
4. Validate on staging (test all affected features)
5. Only after full validation → merge staging into main
6. Main auto-deploys to production (www.fartooyoung.org)
```

**For large features:** Do NOT merge to main until the feature is fully tested end-to-end on staging. Production has real users and real payments.

## Deployment

- **Staging**: Auto-deploys via V2 pipeline on push to `staging` branch
- **Production**: Auto-deploys via V2 pipeline on push to `main` branch
- **Path-based triggers**: Frontend and backend deploy independently based on which files changed

> ⚠️ Pushing to `main` immediately deploys to the live production site. Always test on staging first.

## Documentation

Detailed system design docs are in `docs/`:
- `1-planning/` — Prioritized feature plans (deployment, SEO, blog, e-commerce, etc.)
- `2-system-design/` — Architecture, frontend, backend, database, and environment design
- `3-deployments/` — Deployment processes and CI/CD
- `4-testing/` — API testing commands, Stripe test cards, webhook setup
- `development-progress.md` — Full development history and session log

## License

This project is licensed under the MIT License.
