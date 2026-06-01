# AWS SDK v2 → v3 Migration

## Overview
Migrate 17 Lambda functions from AWS SDK v2 (maintenance mode) to v3 (modular). Smaller bundle sizes, faster cold starts, better TypeScript support. Not urgent — current setup works fine.

## Prerequisites
- All 17 Lambda functions working on staging
- Services used: DynamoDB, SES, Secrets Manager

## Cost
$0 (no new services — same Lambda functions, different SDK)

## Checklist
- [ ] Step 1: Install v3 packages
- [ ] Step 2: Update Lambda functions
- [ ] Step 3: Test all endpoints on staging
- [ ] Step 4: Deploy to production

---

## Step 1: Install v3 packages ⬜

**Benefit:** AWS SDK v3 uses modular imports — you only install the clients you need (DynamoDB, SES, Secrets Manager) instead of the entire AWS SDK. This reduces bundle size by 50-80% and improves Lambda cold start times.

**Problem:** AWS SDK v2 bundles the entire SDK (~70MB) even if you only use 3 services. It's also in maintenance mode — no new features, only critical fixes.

**Implementation:**
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses @aws-sdk/client-secrets-manager
npm uninstall aws-sdk
```

## Step 2: Update Lambda functions ⬜

**Benefit:** v3 uses a command pattern (explicit `send()` calls) that's more predictable, tree-shakeable, and TypeScript-friendly than v2's `.promise()` chaining.

**Problem:** v2 syntax (`new AWS.DynamoDB.DocumentClient()`, `.promise()`) will eventually stop working when AWS ends v2 support entirely.

**Implementation:**

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

## Step 3: Test all endpoints on staging ⬜

**Benefit:** Thorough staging testing catches any behavioral differences between v2 and v3 before affecting real users.

**Problem:** While API behavior is identical, subtle differences in error handling or response formats could break functionality if not caught.

**Implementation:** Test all 17 functions thoroughly on staging before prod deploy. SES and Secrets Manager calls also need verification.

## Step 4: Deploy to production ⬜

**Benefit:** Production deployment completes the migration, giving us smaller bundles and faster cold starts for all Lambda functions.

**Problem:** Staying on v2 in production means we don't benefit from the performance improvements and remain on a deprecated SDK.

**Implementation:** Deploy after all staging tests pass.

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
