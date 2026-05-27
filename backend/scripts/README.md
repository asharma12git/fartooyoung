# Backend Scripts

One-off scripts run manually from the command line. These are **not deployed** as Lambda functions and do **not trigger** the CI/CD pipeline.

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `migrate-donations.js` | Migrates donations table from old bloated format to clean 14-field format | `cd backend && node scripts/migrate-donations.js` |

## Important Notes

- Always run against **staging first**, verify, then change the table name to production
- Back up production data before running any migration (`backup/` folder)
- These scripts use your local AWS credentials (`~/.aws/credentials`)
- Change the `TABLE_NAME` variable at the top of each script to target the correct environment
