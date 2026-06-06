# Far Too Young, Inc. — Organization Reference

## Legal Information

| Field | Value |
|-------|-------|
| Legal Name | Far Too Young, Inc. |
| Business Type | Domestic Nonprofit Corporation |
| EIN (Tax ID) | 87-3583633 |
| 501(c)(3) | Yes |
| Date of Formation | November 4, 2021 |
| State of Formation | Georgia |
| Status | Active/Compliance |
| NAICS Code | Other Services (except Public Administration) |
| NAICS Sub Code | Human Rights Organizations |
| Last Annual Registration | 2027 |

## Officers

| Name | Title |
|------|-------|
| Avinash Sharma | CEO |
| Avinash Sharma | CFO |
| Ravi Baral | Secretary |

## Registered Agent

- Name: Avinash Sharma
- Address: 5072 Micaela Way, Duluth, GA, 30096, USA
- County: Gwinnett

## Georgia Secretary of State

- Control Number: 21285996
- Lookup: [ecorp.sos.ga.gov/BusinessSearch](https://ecorp.sos.ga.gov/BusinessSearch)

## Mission

Far Too Young envisions a society free from child, underage and forced marriages — a society where girls and women feel valued and reach their full potential.

**Motto:** Restoring Hopes, Restoring Smiles.

## Websites

| Environment | URL |
|-------------|-----|
| Production | https://www.fartooyoung.org |
| Staging | https://staging.fartooyoung.org |

## Social Profiles

| Platform | URL |
|----------|-----|
| Instagram | https://www.instagram.com/fartooyoung_organization/ |
| Facebook | https://www.facebook.com/fartooyoung.org |
| YouTube | https://www.youtube.com/@FarTooYoungInc |

## Accounts & Dashboards

| Service | Account | ID / Link |
|---------|---------|-----------|
| Google Analytics 4 | FTY Google Workspace admin | Measurement ID: `G-XJN5PR545G`, Stream ID: `6380801517` — [analytics.google.com](https://analytics.google.com) |
| Microsoft Clarity | FTY Microsoft nonprofit account | Project ID: `wytghx7ix4` — [clarity.microsoft.com](https://clarity.microsoft.com) |
| Google Search Console | FTY Google Workspace admin | Property: `www.fartooyoung.org` — [search.google.com/search-console](https://search.google.com/search-console) |
| Google Ad Grants | Applied May 29, 2026 (via Goodstack) | [nonprofits.google.com](https://nonprofits.google.com/) |
| Wikidata | Username: `FTYoung` | Item: [Q139980067](https://www.wikidata.org/wiki/Q139980067) |
| Stripe (Live) | Far Too Young | [dashboard.stripe.com](https://dashboard.stripe.com) |
| AWS | Account `538781441544`, Region `us-east-1` | [console.aws.amazon.com](https://console.aws.amazon.com) |

## AWS Resources

| Resource | Staging | Production |
|----------|---------|------------|
| API Gateway | https://71z0wz0dg9.execute-api.us-east-1.amazonaws.com/Prod | https://0o7onj0dr7.execute-api.us-east-1.amazonaws.com/Prod |
| S3 Frontend | fartooyoung-stg-frontend | fartooyoung-prod-frontend |
| S3 Backend | fartooyoung-stg-backend | fartooyoung-prod-backend |
| CloudFront | EYHMCS1M0XJX1 | E2PHSH4ED2AIN5 |
| Frontend Pipeline | fartooyoung-stg-frontend-pipeline | fartooyoung-prod-frontend-pipeline |
| Backend Pipeline | fartooyoung-stg-backend-pipeline | fartooyoung-prod-backend-pipeline |
| CodeStar Connection | arn:aws:codeconnections:us-east-1:538781441544:connection/2b096c20-2f8f-4def-8be1-030bbc00df07 |

### DynamoDB Tables (Staging)

| Table | Purpose |
|-------|---------|
| fartooyoung-staging-users-table | User accounts + roles |
| fartooyoung-staging-donations-table | Donation records |
| fartooyoung-staging-rate-limits | Rate limiting (TTL) |
| fartooyoung-staging-blog-posts | Blog posts (draft/published) |
| fartooyoung-staging-research-articles | Research articles (pending/approved/starred) |
| fartooyoung-staging-tiers | Source tier descriptions |

---

*Last updated: June 6, 2026*
