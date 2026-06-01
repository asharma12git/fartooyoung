# AWS SDK v2 → v3 Migration

## Overview
Migrate 17 Lambda functions from AWS SDK v2 (maintenance mode) to v3 (modular). Smaller bundle sizes, faster cold starts, better TypeScript support. Not urgent — current setup works fine.

**Status:** 📋 Backlog  
**Priority:** Low  
**Effort:** 2-3 sessions  
**Dependencies:** None

## Prerequisites
- All 17 Lambda functions working on staging
- Services used: DynamoDB, SES, Secrets Manager

## Checklist
- [ ] Step 1: Install v3 packages
- [ ] Step 2: Update Lambda functions
- [ ] Step 3: Test all endpoints on staging
- [ ] Step 4: Deploy to production

---

## Step 1: Install v3 packages

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses @aws-sdk/client-secrets-manager
npm uninstall aws-sdk
```

## Step 2: Update Lambda functions

Replace v2 patterns:
```javascript
// OLD (v2)
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
await dynamo.put({ TableName, Item }).promise();
```

With v3 patterns:
```javascript
// NEW (v3)
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
await client.send(new PutCommand({ TableName, Item }));
```

Update all 17 Lambda functions + migration script (`backend/scripts/migrate-donations.js`).

## Step 3: Test all endpoints on staging

Test all 17 functions thoroughly on staging before prod deploy. SES and Secrets Manager calls also need verification.

## Step 4: Deploy to production

Deploy after all staging tests pass.

---

## When to Do This

- When refactoring backend for another reason
- When a Node.js Lambda runtime upgrade forces it
- When v2 end-of-life is announced
- **Not now** — current setup works fine

## Risks

- Low risk — API behavior is identical, just different syntax
- Test all 17 functions thoroughly on staging before prod

## References

- [AWS SDK v3 Migration Guide](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrating-to-v3.html)
- [v2 Maintenance Announcement](https://aws.amazon.com/blogs/developer/announcing-end-of-support-for-aws-sdk-for-javascript-v2/)

---

*Created: May 2026*
