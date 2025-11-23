# Debugging Guide: Monorepo Migration & Dependency Resolution

**Date**: 2025-11-23  
**Issue**: Lambda functions failing with "Cannot find module 'aws-sdk'" after migrating to monorepo structure  
**Resolution**: Successfully migrated from isolated function dependencies to centralized monorepo structure

---

## 🔍 Problem Summary

After implementing the Donation System and consolidating dependencies, Lambda functions began failing with:
```
Runtime.ImportModuleError: Error: Cannot find module 'aws-sdk'
Require stack:
- /var/task/login.js
```

## 🎯 Root Cause

**Initial Structure (Problematic):**
```
backend/
├── package.json (Had dependencies)
├── node_modules/ (Main dependencies)
├── lambda/
│   ├── auth/
│   │   ├── login.js
│   │   ├── package.json (Duplicate dependencies)
│   │   └── node_modules/ (Duplicate dependencies - DELETED)
│   └── donations/
│       └── create-donation.js
```

**Issues:**
1. Duplicate `node_modules` in `lambda/auth/` was deleted during cleanup
2. SAM template still pointed to `CodeUri: lambda/auth/` (isolated mode)
3. When SAM built the function, it couldn't find dependencies because:
   - It looked in `lambda/auth/` for `package.json`
   - No `node_modules` existed there anymore
4. Build cache in `.aws-sam/` was stale and causing conflicts

## 🛠️ Solution Steps

### Step 1: Consolidate Dependencies
```bash
# Install all dependencies at root level
cd backend
npm install aws-sdk bcryptjs jsonwebtoken uuid

# Remove duplicate dependency folders
rm -rf lambda/auth/node_modules
rm -rf lambda/auth/package.json
rm -rf lambda/auth/package-lock.json
```

### Step 2: Update SAM Template (Monorepo Structure)
Changed from isolated function structure to monorepo:

**Before:**
```yaml
LoginFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: lambda/auth/
    Handler: login.handler
```

**After:**
```yaml
LoginFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: .
    Handler: lambda/auth/login.handler
```

**Key Changes:**
- `CodeUri: .` - Points to the entire `backend/` directory (includes `node_modules`)
- `Handler: lambda/auth/login.handler` - Full path from the root

### Step 3: Clear Build Cache
```bash
# Delete stale build artifacts
rm -rf backend/.aws-sam

# Rebuild from scratch
sam build

# Restart local API
sam local start-api --port 3001
```

### Step 4: Fix DynamoDB Endpoint for Docker
Updated `template.yaml` to use Docker-compatible endpoint:

**Before:**
```yaml
DynamoDBEndpoint:
  Default: "http://192.168.1.199:8000"  # Hardcoded IP
```

**After:**
```yaml
DynamoDBEndpoint:
  Default: "http://host.docker.internal:8000"  # Docker-compatible
```

**Why:** Lambda runs in a Docker container. `localhost` refers to the container itself, not the host machine. `host.docker.internal` is the magic DNS name that resolves to the host.

## ✅ Verification Process

### Test 1: Account Locking
```bash
# Failed login attempts (3x)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "gary@test.com", "password": "wrong"}'

# Expected: "Account locked for 15 minutes..."
```

### Test 2: Forgot Password
```bash
curl -X POST http://localhost:3001/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "gary@test.com"}'

# Retrieve token from DynamoDB
aws dynamodb get-item \
  --table-name fartooyoung-users \
  --key '{"email": {"S": "gary@test.com"}}' \
  --endpoint-url http://localhost:8000 \
  --region us-east-1
```

### Test 3: Reset Password
```bash
curl -X POST http://localhost:3001/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "gary@test.com", "token": "TOKEN_HERE", "newPassword": "NewPass123!"}'
```

### Test 4: Login with New Password
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "gary@test.com", "password": "NewPass123!"}'

# Expected: JWT token returned
```

## 📊 Final Structure (Working)

```
backend/
├── package.json (Single source of truth)
├── node_modules/ (Shared by all functions)
├── lambda/
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── forgot-password.js
│   │   ├── reset-password.js
│   │   └── logout.js
│   └── donations/
│       └── create-donation.js
└── template.yaml (All functions use CodeUri: .)
```

## 🎓 Key Learnings

### 1. Monorepo Benefits
- **Single Dependency Management**: One `package.json` for all functions
- **Consistent Versions**: All functions use the same library versions
- **Smaller Deployment**: No duplicate dependencies in the bundle
- **Easier Maintenance**: Update once, applies everywhere

### 2. SAM Build Process
- SAM zips the entire `CodeUri` directory
- Handler path is relative to `CodeUri`
- Always clear `.aws-sam/` when changing structure
- `sam build` must be run after any `template.yaml` change

### 3. Docker Networking

#### Understanding the Two Different Endpoints

**The Confusion:**
There are TWO different ways to access DynamoDB Local, depending on WHERE the code is running.

**1. AWS CLI Endpoint (From Your Terminal):**
```bash
aws dynamodb get-item \
  --endpoint-url http://localhost:8000 \
  --region us-east-1
```
- **Who uses it:** You, from your terminal/command line
- **Where it runs:** Directly on your Mac
- **What `localhost` means:** Your Mac itself
- **Works because:** The AWS CLI runs on your Mac, and DynamoDB Local is also on your Mac (port 8000)

**2. Lambda Function Endpoint (From Docker Container):**
```javascript
// Inside login.js
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: 'us-east-1'
});
```
```yaml
# In template.yaml
DynamoDBEndpoint:
  Default: "http://host.docker.internal:8000"
```
- **Who uses it:** The Lambda function (running inside a Docker container)
- **Where it runs:** Inside a Docker container (isolated environment)
- **What `localhost` would mean:** The container itself (NOT your Mac)
- **Why we use `host.docker.internal`:** This is a special DNS name that Docker provides to reach the host machine (your Mac) from inside a container

#### Visual Diagram

```
┌─────────────────────────────────────────────────┐
│  Your Mac (Host Machine)                        │
│                                                 │
│  ┌──────────────────┐                          │
│  │ DynamoDB Local   │ ← Port 8000              │
│  │ (Docker)         │                          │
│  └──────────────────┘                          │
│           ↑                                     │
│           │                                     │
│  ┌────────┴─────────┐    ┌──────────────────┐ │
│  │ AWS CLI          │    │ Lambda Container │ │
│  │ (Your Terminal)  │    │ (SAM Local)      │ │
│  │                  │    │                  │ │
│  │ Uses:            │    │ Uses:            │ │
│  │ localhost:8000   │    │ host.docker      │ │
│  │ ✅ WORKS         │    │ .internal:8000   │ │
│  └──────────────────┘    │ ✅ WORKS         │ │
│                          │                  │ │
│                          │ If it used:      │ │
│                          │ localhost:8000   │ │
│                          │ ❌ FAILS         │ │
│                          └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Key Insight

**Same destination, different addresses:**
- From your terminal: `localhost:8000` = Your Mac
- From Lambda container: `localhost:8000` = The container itself (wrong!)
- From Lambda container: `host.docker.internal:8000` = Your Mac (correct!)

**Analogy:**
- If you're inside your house and say "home," you mean your house
- If you're at a friend's house and say "home," you mean YOUR house (not theirs)
- `localhost` = "this house I'm in right now"
- `host.docker.internal` = "the actual host machine (your Mac)"

#### Evolution of Our Endpoint Configuration

**Version 1 (Initial):**
```yaml
DynamoDBEndpoint:
  Default: "http://192.168.1.199:8000"  # Hardcoded IP
```
- **Pros:** Works from Lambda container
- **Cons:** Breaks when your IP changes (different WiFi network)

**Version 2 (Current - Best Practice):**
```yaml
DynamoDBEndpoint:
  Default: "http://host.docker.internal:8000"  # Docker magic DNS
```
- **Pros:** Always works, regardless of IP changes
- **Cons:** Only works on Docker Desktop (Mac/Windows), not Linux (use `172.17.0.1` on Linux)

#### Troubleshooting Docker Networking

**Symptom:** Lambda can't connect to DynamoDB
```
Error: connect ECONNREFUSED
```

**Diagnosis Steps:**
1. Check if DynamoDB Local is running:
   ```bash
   docker ps | grep dynamodb
   ```

2. Test from your terminal (should work):
   ```bash
   aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1
   ```

3. Check what endpoint Lambda is using:
   ```bash
   # Look at template.yaml
   grep -A 2 "DynamoDBEndpoint" backend/template.yaml
   ```

**Solutions:**
- **Mac/Windows:** Use `http://host.docker.internal:8000`
- **Linux:** Use `http://172.17.0.1:8000` (Docker bridge network)
- **Custom Network:** Create a shared Docker network and connect both containers

#### Alternative: Custom Docker Network (Advanced)

If `host.docker.internal` doesn't work, create a shared network:

```bash
# Create network
docker network create lambda-local

# Run DynamoDB on this network
docker run -d --network lambda-local --name dynamodb-local \
  -p 8000:8000 amazon/dynamodb-local

# Start SAM with the same network
sam local start-api --port 3001 --docker-network lambda-local

# Use this endpoint in template.yaml
DynamoDBEndpoint:
  Default: "http://dynamodb-local:8000"
```

- Lambda containers cannot access `localhost` (refers to container)
- Use `host.docker.internal` to reach host machine services
- Alternative: Create custom Docker network and connect all containers

### 4. Environment Detection
```javascript
// Check if running locally
const isLocal = process.env.DYNAMODB_ENDPOINT && 
                process.env.DYNAMODB_ENDPOINT.includes('localhost');
```
**Issue:** After changing to `host.docker.internal`, this check fails.
**Fix:** Use a dedicated `NODE_ENV=development` variable instead.

## 🚨 Common Pitfalls

### 1. Stale Build Cache
**Symptom:** Changes to `template.yaml` don't take effect  
**Fix:** `rm -rf .aws-sam && sam build`

### 2. Wrong Handler Path
**Symptom:** "Handler not found" error  
**Fix:** Ensure `Handler` path is relative to `CodeUri`

### 3. Missing Dependencies
**Symptom:** "Cannot find module" error  
**Fix:** Verify `package.json` includes the module and run `npm install`

### 4. Docker Network Issues
**Symptom:** "ECONNREFUSED" or "getaddrinfo" errors  
**Fix:** Use `host.docker.internal` instead of `localhost` in environment variables

## 📝 Deployment Checklist

Before deploying to AWS:
- [ ] All functions use `CodeUri: .`
- [ ] Handler paths include full directory structure
- [ ] `package.json` contains all required dependencies
- [ ] `.aws-sam/` deleted and rebuilt
- [ ] Local testing passes (auth + donations)
- [ ] Environment variables set correctly for production
- [ ] `DYNAMODB_ENDPOINT` is empty or undefined (uses real AWS DynamoDB)

## 🔗 Related Documentation
- [Architecture Design](../1-system-design/architecture.md)
- [Backend Design](../1-system-design/backend-design.md)
- [Test Credentials](../4-planning/test-credentials.md)
