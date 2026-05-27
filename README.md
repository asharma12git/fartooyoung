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
│   ├── template.yaml           # SAM infrastructure definition
│   └── samconfig.toml          # Deployment targets per environment
├── deployment/                 # CI/CD pipeline and deploy scripts
├── docs/                       # System design documentation
├── .env.local                  # Local dev config
├── .env.staging                # Staging config
├── .env.production             # Production config
├── buildspec-frontend.yml      # CI/CD frontend build steps
└── buildspec-backend.yml       # CI/CD backend build steps
```

## Environments

| Environment | Frontend | Backend | Stripe |
|-------------|----------|---------|--------|
| Local | localhost:5173 | SAM local :3001 + DynamoDB Docker :8000 | Test keys |
| Staging | staging.fartooyoung.org (DNS disabled) | AWS API Gateway (staging) | Test keys |
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

## Deployment

- **Staging**: Manual deploy via SAM + S3 sync (see `docs/3-deployments/`)
- **Production**: Auto-deploys via CI/CD on push to `main` branch

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
