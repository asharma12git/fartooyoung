# Frontend Deployment Guide - AWS CLI

This guide documents the step-by-step process to deploy the Far Too Young frontend to AWS using the AWS CLI.

> **Note:** This guide uses **staging environment** values as examples. For production deployment, follow the same steps but replace staging-specific values (domain, bucket names, etc.) with production equivalents.

## AWS Services Used

- **S3 (Simple Storage Service)**: Static file hosting
- **CloudFront**: Content Delivery Network (CDN) with SSL/TLS
- **ACM (AWS Certificate Manager)**: SSL certificate provisioning and management
- **Route 53**: DNS management and domain routing

## Prerequisites

- AWS CLI installed and configured
- Domain registered in Route 53
- Frontend built with environment variables

## Environment-Specific Values

This guide uses staging values. Replace with production values as needed:

| Resource        | Staging                            | Production                                  |
|-----------------|------------------------------------|--------------------------------------------|
| Domain          | `staging.fartooyoung.org`          | `fartooyoung.org` or `www.fartooyoung.org` |
| S3 Bucket       | `fartooyoung-staging-frontend`     | `fartooyoung-production-frontend`          |
| Build Command   | `npm run build --mode staging`     | `npm run build --mode production`          |
| Deploy Script   | `deploy-staging.sh`                | `deploy-production.sh`                     |

## Deployment Steps Overview

1. **Request SSL Certificate (ACM)** - Request certificate for your domain
2. **Validate Certificate with Route 53** - Prove domain ownership via DNS record
3. **Create S3 Bucket** - Set up static website hosting bucket
4. **Build and Upload Frontend** - Compile React app and sync to S3
5. **Create CloudFront Distribution** - Configure CDN with SSL and custom domain
6. **Configure Route 53 DNS** - Point domain to CloudFront distribution
7. **Verify Deployment** - Test the live site

---

## Step 1: Request SSL Certificate (AWS Certificate Manager)

SSL certificates for CloudFront must be in `us-east-1` region.

```bash
aws acm request-certificate \
  --domain-name staging.fartooyoung.org \
  --validation-method DNS \
  --region us-east-1
```

**Output:** Certificate ARN
```
arn:aws:acm:us-east-1:538781441544:certificate/98a7fa0a-8462-45c4-9009-d26411fe89a1
```

---

## Step 2: Validate Certificate with Route 53

Get the DNS validation record:

```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:538781441544:certificate/98a7fa0a-8462-45c4-9009-d26411fe89a1 \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
```

Add the CNAME record to Route 53:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z10244882P83IUVL8IHLM \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "_validation_record_name.staging.fartooyoung.org",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "_validation_record_value"}]
      }
    }]
  }'
```

Wait for validation (usually 5-10 minutes):

```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:538781441544:certificate/98a7fa0a-8462-45c4-9009-d26411fe89a1 \
  --region us-east-1 \
  --query 'Certificate.Status'
```

---

## Step 3: Create S3 Bucket

```bash
aws s3api create-bucket \
  --bucket fartooyoung-staging-frontend \
  --region us-east-1
```

Enable static website hosting:

```bash
aws s3 website s3://fartooyoung-staging-frontend/ \
  --index-document index.html \
  --error-document index.html
```

Make bucket publicly readable:

```bash
aws s3api put-bucket-policy \
  --bucket fartooyoung-staging-frontend \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fartooyoung-staging-frontend/*"
    }]
  }'
```

---

## Step 4: Build and Upload Frontend

Build the frontend with staging environment variables:

```bash
cd /Users/avinashsharma/WebstormProjects/fartooyoung
npm run build --mode staging
```

Upload to S3:

```bash
aws s3 sync dist/ s3://fartooyoung-staging-frontend/ --delete
```

**Result:** 28.3 MB uploaded (HTML, CSS, JS, images, fonts)

---

## Step 5: Create CloudFront Distribution

Create distribution configuration file `cloudfront-config.json`:

```json
{
  "CallerReference": "staging-fartooyoung-2025-11-30",
  "Aliases": {
    "Quantity": 1,
    "Items": ["staging.fartooyoung.org"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-fartooyoung-staging-frontend",
      "DomainName": "fartooyoung-staging-frontend.s3.us-east-1.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-fartooyoung-staging-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [{
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    }]
  },
  "Comment": "Far Too Young Staging Frontend",
  "Enabled": true,
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:538781441544:certificate/98a7fa0a-8462-45c4-9009-d26411fe89a1",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
```

Create the distribution:

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

**Output:** Distribution ID: `EYHMCS1M0XJX1`

Check deployment status (takes 15-30 minutes):

```bash
aws cloudfront get-distribution \
  --id EYHMCS1M0XJX1 \
  --query 'Distribution.Status'
```

---

## Step 6: Configure Route 53 DNS

Get CloudFront domain name:

```bash
aws cloudfront get-distribution \
  --id EYHMCS1M0XJX1 \
  --query 'Distribution.DomainName' \
  --output text
```

**Result:** `db9gpqewllpi7.cloudfront.net`

Create A record pointing to CloudFront:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z10244882P83IUVL8IHLM \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "staging.fartooyoung.org",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "db9gpqewllpi7.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

**Note:** `Z2FDTNDATAQYW2` is the fixed hosted zone ID for all CloudFront distributions.

---

## Step 7: Verify Deployment

Test CloudFront domain:

```bash
curl -I https://db9gpqewllpi7.cloudfront.net
```

Test custom domain:

```bash
curl -I https://staging.fartooyoung.org
```

Both should return `200 OK` with the HTML content.

---

## Automated Deployment Script

Created `deploy-staging.sh` for future deployments:

```bash
#!/bin/bash
set -e

echo "Building frontend..."
npm run build --mode staging

echo "Uploading to S3..."
aws s3 sync dist/ s3://fartooyoung-staging-frontend/ --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id EYHMCS1M0XJX1 \
  --paths "/*"

echo "Deployment complete!"
```

Usage:

```bash
chmod +x deploy-staging.sh
./deploy-staging.sh
```

---

## Key Resources

- **S3 Bucket:** fartooyoung-staging-frontend
- **CloudFront Distribution ID:** EYHMCS1M0XJX1
- **CloudFront Domain:** db9gpqewllpi7.cloudfront.net
- **Custom Domain:** staging.fartooyoung.org
- **SSL Certificate ARN:** arn:aws:acm:us-east-1:538781441544:certificate/98a7fa0a-8462-45c4-9009-d26411fe89a1
- **Route 53 Hosted Zone ID:** Z10244882P83IUVL8IHLM

---

## Cost Breakdown

- **ACM (AWS Certificate Manager):** Free (when used with CloudFront)
- **S3 Storage:** ~$0.60/month (28.3 MB)
- **CloudFront:** Free tier covers 1 TB data transfer/month
- **Route 53:** $0.50/month per hosted zone (already counted)

**Total Additional Cost:** ~$0.60/month

---

## Troubleshooting

### CloudFront returns 403 Forbidden
- Check S3 bucket policy allows public read access
- Verify bucket name matches CloudFront origin

### Custom domain doesn't work
- Verify Route 53 A record points to CloudFront domain
- Check ACM certificate status is "Issued"
- Wait for CloudFront distribution status to be "Deployed"

### React Router routes return 404
- Verify CloudFront custom error response redirects 404 to /index.html
- Check S3 error document is set to index.html

### Changes not appearing
- Invalidate CloudFront cache:
  ```bash
  aws cloudfront create-invalidation \
    --distribution-id EYHMCS1M0XJX1 \
    --paths "/*"
  ```
