# Git & Deployment Workflow

## Git Branch Structure

```
main (production)
  ↑
staging (development)
```

- **staging**: Development work, deploys to staging.fartooyoung.org
- **main**: Production-ready code, deploys to fartooyoung.org

---

## How Environment Variables Work

### Key Concept
**Git tracks source code, NOT environment values.**

Environment variables are **injected during build**, not stored in code.

### Source Code (Same in Both Branches)
```javascript
// file.jsx
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### Build for Staging
```bash
npm run build -- --mode staging
```
- Reads `.env.staging`
- Replaces variables with staging values
- Creates `dist/` with hardcoded staging URLs

### Build for Production
```bash
npm run build -- --mode production
```
- Reads `.env.production`
- Replaces variables with production values
- Creates `dist/` with hardcoded production URLs

---

## What Git Tracks vs. Ignores

**Tracked by Git:**
- Source code (`src/`)
- Config files (`.env.staging`, `.env.production`)
- Documentation

**Ignored by Git (.gitignore):**
- `dist/` folder (build output)
- `node_modules/`
- Environment secrets

---

## Deployment Flow

### Staging Deployment
```bash
git checkout staging          # Switch to staging branch
npm run build -- --mode staging   # Build with staging env
aws s3 sync dist/ s3://fartooyoung-staging-frontend
```

### Production Deployment
```bash
git checkout main             # Switch to main branch
npm run build -- --mode production  # Build with production env
aws s3 sync dist/ s3://fartooyoung-production-frontend
```

---

## How AWS Receives Code

**AWS doesn't directly connect to Git.**

### Manual Deployment (Current)
1. You pull code from Git to your computer
2. Your computer builds the code
3. Your computer uploads to AWS S3
4. AWS serves the files

### Automated CI/CD (Future)
1. You push to GitHub
2. GitHub/AWS detects the push
3. AWS pulls code from GitHub
4. AWS builds and uploads automatically
5. AWS serves the files

**In both cases:** AWS only receives built files, not git history.

---

## Key Takeaways

1. **Same source code** → Different builds based on env file
2. **Git branch** = code version
3. **Build mode** = which environment config to use
4. **dist/ folder** = temporary, local, never committed
5. **AWS** = receives built files only, doesn't care about git

---

**Last Updated:** November 30, 2025
