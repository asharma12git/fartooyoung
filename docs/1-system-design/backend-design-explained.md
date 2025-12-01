# Backend Architecture Visual Guide

**Purpose**: Understanding how Lambda functions, template.yaml, and the file system connect together

---

## 🏗️ Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                                  │
│                    (React App - Port 5173)                              │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTP Requests
                             │ (fetch API calls)
                             ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (SAM Local)                            │
│                         Port 3001                                       │
│                                                                         │
│  Routes:                                                                │
│  POST /auth/login          → LoginFunction                             │
│  POST /auth/register       → RegisterFunction                          │
│  POST /auth/forgot-password → ForgotPasswordFunction                   │
│  POST /auth/reset-password → ResetPasswordFunction                     │
│  POST /auth/logout         → LogoutFunction                            │
│  POST /donations           → CreateDonationFunction                    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ Invokes Lambda
                             ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    LAMBDA FUNCTIONS (Docker Containers)                 │
│                                                                         │
│  Each function runs in its own isolated container                      │
│  All share the same code base (monorepo)                               │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ Database Calls
                             ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    DYNAMODB LOCAL (Docker)                              │
│                         Port 8000                                       │
│                                                                         │
│  Tables:                                                                │
│  - fartooyoung-users                                                    │
│  - fartooyoung-donations                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File System Structure & Connections

```
backend/
├── template.yaml                    ← SAM Configuration (The Blueprint)
│   │
│   ├─ Defines: LoginFunction
│   │   ├─ CodeUri: .               ← Points to backend/ folder
│   │   ├─ Handler: lambda/auth/login.handler  ← Path to the code
│   │   └─ Events: POST /auth/login
│   │
│   ├─ Defines: RegisterFunction
│   │   ├─ CodeUri: .
│   │   ├─ Handler: lambda/auth/register.handler
│   │   └─ Events: POST /auth/register
│   │
│   └─ Defines: CreateDonationFunction
│       ├─ CodeUri: .
│       ├─ Handler: lambda/donations/create-donation.handler
│       └─ Events: POST /donations
│
├── package.json                     ← Dependencies (Shared by ALL functions)
│   └─ Contains: aws-sdk, bcryptjs, jsonwebtoken, uuid
│
├── node_modules/                    ← Installed libraries (Shared)
│   ├── aws-sdk/
│   ├── bcryptjs/
│   ├── jsonwebtoken/
│   └── uuid/
│
└── lambda/                          ← Function Code
    ├── auth/
    │   ├── login.js                 ← LoginFunction code
    │   ├── register.js              ← RegisterFunction code
    │   ├── forgot-password.js       ← ForgotPasswordFunction code
    │   ├── reset-password.js        ← ResetPasswordFunction code
    │   └── logout.js                ← LogoutFunction code
    │
    └── donations/
        └── create-donation.js       ← CreateDonationFunction code
```

---

## 🔄 How template.yaml Connects to Code Files

### Example: LoginFunction

**In template.yaml:**
```yaml
LoginFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: .                              # Step 1: Start from backend/
    Handler: lambda/auth/login.handler      # Step 2: Find lambda/auth/login.js
    Runtime: nodejs18.x                     # Step 3: Run with Node.js 18
    Environment:
      Variables:
        DYNAMODB_ENDPOINT: !Ref DynamoDBEndpoint  # Step 4: Pass environment vars
        JWT_SECRET: !Ref JWTSecret
    Events:
      LoginApi:
        Type: Api
        Properties:
          Path: /auth/login                 # Step 5: Create API route
          Method: post
```

**What SAM Does:**

```
1. SAM reads template.yaml
   ↓
2. Sees CodeUri: .
   → Zips the entire backend/ folder (includes node_modules/)
   ↓
3. Sees Handler: lambda/auth/login.handler
   → Looks for backend/lambda/auth/login.js
   → Calls the exported function: exports.handler
   ↓
4. Creates Docker container with:
   - Node.js 18 runtime
   - Zipped code at /var/task/
   - Environment variables set
   ↓
5. Creates API Gateway route:
   POST /auth/login → Invokes this container
```

---

## 🎯 Request Flow Example: User Login

```
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 1: User clicks "Login" button in React                         │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 2: React sends HTTP POST request                               │
│                                                                      │
│  fetch('http://localhost:3001/auth/login', {                        │
│    method: 'POST',                                                   │
│    body: JSON.stringify({                                            │
│      email: 'gary@test.com',                                         │
│      password: 'NewPass123!'                                         │
│    })                                                                │
│  })                                                                  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 3: API Gateway (SAM) receives request                          │
│                                                                      │
│  - Matches route: POST /auth/login                                   │
│  - Finds function: LoginFunction                                     │
│  - Creates event object with request data                            │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 4: SAM invokes LoginFunction                                   │
│                                                                      │
│  - Starts Docker container                                           │
│  - Mounts code from: backend/.aws-sam/build/LoginFunction/           │
│  - Sets environment variables:                                       │
│    DYNAMODB_ENDPOINT=http://host.docker.internal:8000               │
│    JWT_SECRET=dev-secret-key                                         │
│  - Calls: lambda/auth/login.js → exports.handler(event)              │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 5: login.js executes                                           │
│                                                                      │
│  const AWS = require('aws-sdk');  ← Loaded from node_modules/       │
│  const bcrypt = require('bcryptjs'); ← Loaded from node_modules/    │
│  const jwt = require('jsonwebtoken'); ← Loaded from node_modules/   │
│                                                                      │
│  1. Parses email/password from event.body                            │
│  2. Queries DynamoDB for user                                        │
│  3. Compares password with bcrypt                                    │
│  4. Generates JWT token                                              │
│  5. Returns response                                                 │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 6: login.js talks to DynamoDB                                  │
│                                                                      │
│  const dynamodb = new AWS.DynamoDB.DocumentClient({                 │
│    endpoint: process.env.DYNAMODB_ENDPOINT  ← Uses the env var      │
│  });                                                                 │
│                                                                      │
│  await dynamodb.get({                                                │
│    TableName: 'fartooyoung-users',                                   │
│    Key: { email: 'gary@test.com' }                                   │
│  }).promise();                                                       │
│                                                                      │
│  Request goes to: http://host.docker.internal:8000                  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 7: DynamoDB Local responds                                     │
│                                                                      │
│  Returns user record:                                                │
│  {                                                                   │
│    email: 'gary@test.com',                                           │
│    name: 'Gary Smith',                                               │
│    hashedPassword: '$2b$04$...'                                      │
│  }                                                                   │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 8: login.js validates and responds                             │
│                                                                      │
│  - bcrypt.compare(password, hashedPassword) → true ✅                │
│  - jwt.sign({ email, name }, secret) → token                        │
│                                                                      │
│  return {                                                            │
│    statusCode: 200,                                                  │
│    body: JSON.stringify({                                            │
│      success: true,                                                  │
│      user: { email, name },                                          │
│      token: 'eyJhbGc...'                                             │
│    })                                                                │
│  }                                                                   │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 9: API Gateway returns response to React                       │
│                                                                      │
│  HTTP 200 OK                                                         │
│  {                                                                   │
│    "success": true,                                                  │
│    "user": { "email": "gary@test.com", "name": "Gary Smith" },      │
│    "token": "eyJhbGc..."                                             │
│  }                                                                   │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 10: React receives response                                    │
│                                                                      │
│  - Stores token in localStorage                                      │
│  - Updates user state                                                │
│  - Redirects to /dashboard                                           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 How SAM Build Process Works

### When you run `sam build`:

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. SAM reads template.yaml                                          │
│    - Finds all function definitions                                 │
│    - Notes their CodeUri and Handler                                │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. For each function (e.g., LoginFunction):                         │
│                                                                     │
│    CodeUri: .                                                       │
│    ↓                                                                │
│    SAM looks at: /Users/.../fartooyoung/backend/                    │
│    ↓                                                                │
│    Finds:                                                           │
│    - package.json                                                   │
│    - node_modules/                                                  │
│    - lambda/ folder                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. SAM runs npm install (if needed)                                │
│    - Ensures all dependencies in package.json are installed         │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. SAM creates build artifacts                                     │
│                                                                     │
│    backend/.aws-sam/build/                                          │
│    ├── LoginFunction/                                               │
│    │   ├── node_modules/        ← Copied from backend/node_modules │
│    │   ├── lambda/               ← Copied from backend/lambda      │
│    │   │   └── auth/                                                │
│    │   │       └── login.js                                         │
│    │   └── package.json          ← Copied from backend/            │
│    │                                                                │
│    ├── RegisterFunction/                                            │
│    │   ├── node_modules/        ← Same copy                        │
│    │   ├── lambda/                                                  │
│    │   └── package.json                                             │
│    │                                                                │
│    └── CreateDonationFunction/                                      │
│        ├── node_modules/        ← Same copy                        │
│        ├── lambda/                                                  │
│        └── package.json                                             │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Each function now has a complete, self-contained copy            │
│    - Ready to be zipped and deployed                                │
│    - All dependencies included                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎭 Monorepo vs Isolated Structure Comparison

### OLD WAY (Isolated - What We Had Before)

```
backend/
├── lambda/
│   ├── auth/
│   │   ├── package.json           ← Separate dependencies
│   │   ├── node_modules/          ← Separate copy of libraries
│   │   │   ├── aws-sdk/
│   │   │   ├── bcryptjs/
│   │   │   └── jsonwebtoken/
│   │   └── login.js
│   │
│   └── donations/
│       ├── package.json           ← Another separate copy
│       ├── node_modules/          ← Another separate copy
│       │   ├── aws-sdk/
│       │   └── uuid/
│       └── create-donation.js
│
└── template.yaml
    LoginFunction:
      CodeUri: lambda/auth/        ← Points to auth folder only
      Handler: login.handler       ← Relative to auth folder
```

**Problems:**
- ❌ Duplicate dependencies (5 copies of aws-sdk!)
- ❌ Inconsistent versions (auth uses aws-sdk@2.1692, donations uses @2.1490)
- ❌ Larger deployment size
- ❌ Hard to maintain (update dependencies in 5 places)

### NEW WAY (Monorepo - What We Have Now)

```
backend/
├── package.json                   ← ONE source of truth
├── node_modules/                  ← ONE shared copy
│   ├── aws-sdk/
│   ├── bcryptjs/
│   ├── jsonwebtoken/
│   └── uuid/
│
├── lambda/
│   ├── auth/
│   │   └── login.js               ← Just code, no dependencies
│   │
│   └── donations/
│       └── create-donation.js     ← Just code, no dependencies
│
└── template.yaml
    LoginFunction:
      CodeUri: .                   ← Points to entire backend/
      Handler: lambda/auth/login.handler  ← Full path from root
```

**Benefits:**
- ✅ One copy of dependencies
- ✅ Consistent versions everywhere
- ✅ Smaller deployment size
- ✅ Easy to maintain (update once)

---

## 🔍 How Lambda Finds Dependencies

### Inside the Docker Container:

```
/var/task/                         ← Container root (your code lives here)
├── node_modules/                  ← Dependencies are here
│   ├── aws-sdk/
│   ├── bcryptjs/
│   └── jsonwebtoken/
│
├── lambda/
│   └── auth/
│       └── login.js               ← Your code is here
│
└── package.json

When login.js does: require('aws-sdk')
                           ↓
Node.js looks for node_modules/ starting from current directory:
  1. Check: /var/task/lambda/auth/node_modules/  ← Not found
  2. Check: /var/task/lambda/node_modules/       ← Not found
  3. Check: /var/task/node_modules/              ← FOUND! ✅
```

**This is why `CodeUri: .` works!**
- SAM copies the entire `backend/` folder to `/var/task/`
- `node_modules/` is at `/var/task/node_modules/`
- `login.js` is at `/var/task/lambda/auth/login.js`
- Node.js automatically finds dependencies by walking up the directory tree

---

## 🎯 Key Takeaways

1. **template.yaml is the blueprint**
   - Defines what functions exist
   - Maps API routes to functions
   - Specifies where code lives (CodeUri)
   - Specifies which file to run (Handler)

2. **CodeUri: . means "use the whole backend folder"**
   - Includes `node_modules/`
   - Includes all `lambda/` subfolders
   - Includes `package.json`

3. **Handler is the path to your code**
   - Format: `folder/subfolder/file.exportedFunction`
   - Example: `lambda/auth/login.handler`
   - Means: `backend/lambda/auth/login.js` → `exports.handler`

4. **All functions share the same dependencies**
   - One `package.json`
   - One `node_modules/`
   - Consistent versions
   - Easier maintenance

5. **SAM build creates isolated copies**
   - Each function gets its own folder in `.aws-sam/build/`
   - Each contains a complete copy of code + dependencies
   - Ready for deployment

---

## 📚 Related Documentation
- [Monorepo Migration Debugging](./5-monorepo-migration-debugging.md)
- [Backend Design](../1-system-design/backend-design.md)
- [Architecture Overview](../1-system-design/architecture.md)
