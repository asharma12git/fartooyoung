# Plan 9: AWS SDK v2 → v3 Migration

## Priority: Low
## Status: Backlog
## Estimated Effort: 2-3 sessions

---

## Why

- AWS SDK v2 is in **maintenance mode** (critical fixes only, no new features)
- SDK v3 is modular — smaller Lambda bundle sizes, faster cold starts
- Better TypeScript support if we migrate frontend/backend later
- Will eventually be required when v2 reaches end-of-life

---

## Scope

- 17 Lambda functions using `aws-sdk` v2
- Services used: DynamoDB, SES, Secrets Manager
- Migration script (`backend/scripts/migrate-donations.js`)

---

## Approach

### Phase 1: Install v3 packages
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses @aws-sdk/client-secrets-manager
npm uninstall aws-sdk
```

### Phase 2: Update Lambda functions
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

### Phase 3: Test all endpoints on staging

### Phase 4: Deploy to production

---

## When to Do This

- When refactoring backend for another reason
- When a Node.js Lambda runtime upgrade forces it
- When v2 end-of-life is announced
- **Not now** — current setup works fine

---

## Risks

- Low risk — API behavior is identical, just different syntax
- Test all 17 functions thoroughly on staging before prod deploy
- SES and Secrets Manager calls also need updating

---

## References

- [AWS SDK v3 Migration Guide](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrating-to-v3.html)
- [v2 Maintenance Announcement](https://aws.amazon.com/blogs/developer/announcing-end-of-support-for-aws-sdk-for-javascript-v2/)
