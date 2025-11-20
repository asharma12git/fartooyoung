# Local Testing Plan for Far Too Young

## Overview
This document outlines how to run AWS Lambda functions and DynamoDB locally for development and testing without connecting to AWS services.

## Local AWS Services (No AWS Connection Required)

### DynamoDB Local
```bash
# Download and run DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local

# Create tables locally (same code as AWS)
aws dynamodb create-table \
  --table-name fartooyoung-users-dev \
  --endpoint-url http://localhost:8000 \
  --no-cli-pager
```

### Lambda Functions Locally
```bash
# AWS SAM runs your actual Lambda code locally
sam local start-api

# Your Lambda function runs in Docker container
# Same code that will run in AWS Lambda
```

## Real Example: Donation Lambda Function

### Lambda Function Code (Works Both Local & AWS)
```javascript
// lambda/donate.js - SAME CODE runs locally and in AWS
const AWS = require('aws-sdk');

// Automatically detects local vs AWS
const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined // localhost:8000 or AWS
});

exports.handler = async (event) => {
  const { email, amount, paymentMethod } = JSON.parse(event.body);
  
  // This exact code runs locally AND in AWS
  const donation = {
    donationId: `don_${Date.now()}`,
    email,
    amount,
    paymentMethod,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };
  
  await dynamodb.put({
    TableName: 'fartooyoung-orders-dev',
    Item: donation
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, donationId: donation.donationId })
  };
};
```

### Local Testing
```bash
# Start local services
docker run -p 8000:8000 amazon/dynamodb-local  # DynamoDB
sam local start-api --port 3001                 # Lambda API

# Test the donation endpoint
curl -X POST http://localhost:3001/donate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","amount":100,"paymentMethod":"stripe"}'

# Check local DynamoDB
aws dynamodb scan \
  --table-name fartooyoung-orders-dev \
  --endpoint-url http://localhost:8000
```

## What Runs Locally vs AWS

### Runs 100% Locally (No AWS)
✅ **DynamoDB Local** - Exact same API as AWS DynamoDB  
✅ **Lambda Functions** - Same code in Docker containers  
✅ **API Gateway** - SAM simulates the API endpoints  
✅ **S3 Local** - LocalStack provides S3-compatible storage  

### Still Need AWS For
❌ **Stripe/PayPal** - Payment processors (but use test keys)  
❌ **Email sending** - SES/SendGrid (can mock locally)  
❌ **Domain/SSL** - Route 53, CloudFront  

## LocalStack: Complete AWS Simulation

### Install LocalStack
```bash
pip install localstack
localstack start

# Now you have local versions of:
- DynamoDB: http://localhost:4566
- Lambda: http://localhost:4566  
- S3: http://localhost:4566
- API Gateway: http://localhost:4566
- SES: http://localhost:4566
```

### React App Configuration
```javascript
// config.js
const config = {
  development: {
    apiUrl: 'http://localhost:3001',        // Local Lambda
    dynamoEndpoint: 'http://localhost:8000' // Local DynamoDB
  },
  production: {
    apiUrl: 'https://api.fartooyoung.org',  // AWS API Gateway
    dynamoEndpoint: undefined               // AWS DynamoDB
  }
};
```

## Development Workflow

### Day-to-Day Development
```bash
# Terminal 1: Start local DynamoDB
docker run -p 8000:8000 amazon/dynamodb-local

# Terminal 2: Start local Lambda API
sam local start-api --port 3001

# Terminal 3: Start React app
npm start  # Runs on localhost:3000

# Everything works together locally!
```

### When Ready for AWS
```bash
# Deploy the SAME code to AWS
sam deploy --guided

# Your Lambda functions and DynamoDB tables
# are created in AWS with identical code
```

## Recommended Local Setup for Far Too Young

### 1. Install Development Tools
```bash
# AWS CLI
aws configure --profile fartooyoung-dev

# SAM CLI for local Lambda testing
npm install -g @aws-sam/cli

# DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local
```

### 2. Project Structure
```
fartooyoung/
├── frontend/          # React app (existing)
├── backend/
│   ├── lambda/        # Lambda functions
│   ├── api/           # Express.js for local dev
│   └── database/      # DynamoDB table definitions
├── infrastructure/    # AWS CDK/CloudFormation
└── docker-compose.yml # Local services
```

### 3. Local Development Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  dynamodb:
    image: amazon/dynamodb-local
    ports:
      - "8000:8000"
  
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DYNAMODB_ENDPOINT=http://dynamodb:8000
      - STRIPE_SECRET_KEY=sk_test_...
```

## Testing Strategy

### Local Testing
```javascript
// Test donation flow locally
const donation = {
  email: "test@example.com",
  amount: 100,
  paymentMethod: "stripe"
};

// Hits local API → Local DynamoDB
fetch('http://localhost:3001/donate', {
  method: 'POST',
  body: JSON.stringify(donation)
});
```

### Integration Testing
```bash
# Test with real Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_... npm run test

# Test with local DynamoDB
DYNAMODB_ENDPOINT=http://localhost:8000 npm run test
```

## Benefits of Local Development

### For Development Team:
✅ **Fast iteration** - No deployment delays  
✅ **Free testing** - No AWS charges during development  
✅ **Offline development** - Work without internet  
✅ **Easy debugging** - Full access to logs and data  

### For the Project:
✅ **Risk-free experimentation** - Break things locally  
✅ **Team collaboration** - Anyone can run the full stack  
✅ **CI/CD pipeline** - Automated testing before deployment  

## When to Deploy to AWS

### Deploy When:
- Feature is complete and tested locally
- Ready for user acceptance testing
- Need to test with real payment processors
- Ready for production traffic

### Keep Local For:
- Daily development work
- Feature experimentation
- Bug fixing and debugging
- Performance testing

## Development Phases

### Phase 1: Pure Local Development
```
React App (localhost:3000)
    ↓
Express/Node.js API (localhost:3001) 
    ↓
DynamoDB Local (localhost:8000)
    ↓
Stripe Test Mode (test keys)
```

### Phase 2: Hybrid (Local + AWS)
```
React App (localhost:3000)
    ↓
Local Lambda Functions
    ↓
Real AWS DynamoDB (dev tables)
    ↓
Stripe Test Mode
```

### Phase 3: Full AWS Deployment
```
React App (S3 + CloudFront)
    ↓
API Gateway + Lambda
    ↓
DynamoDB Production
    ↓
Stripe Live Mode
```

## Conclusion

You can develop the entire Far Too Young donation system locally using the exact same code that will run in AWS. This approach saves money, enables fast iteration, and provides full control during development.

The same Lambda functions and DynamoDB table structures work identically in both local and AWS environments, ensuring production parity throughout the development process.
