# Plan 12: Image Migration to S3/CDN

## Overview
Move heavy images (fieldwork photos, hero images, page backgrounds) out of the React bundle and into S3, served via CloudFront CDN. Reduces bundle size, speeds up builds, and allows adding/removing images without code deploys.

**Status:** 📋 Planned
**Priority:** Low (optimization, not blocking)
**Cost:** $0 (uses existing S3 + CloudFront)
**Effort:** 2-3 hours
**Dependencies:** None

## Prerequisites
- Existing S3 bucket (`fartooyoung-prod-frontend`)
- CloudFront already serves from this bucket

## Cost
$0/month — uses existing infrastructure. S3 storage for images is negligible (~$0.02/month for 500MB).

## Checklist
- [ ] Step 1: Upload images to S3
- [ ] Step 2: Update components to use CDN URLs
- [ ] Step 3: Remove images from React bundle

---

## Step 1: Upload Images to S3 ⬜

**Benefit:** S3 + CloudFront is a global CDN that serves images faster than bundling them in JavaScript. Images load on-demand instead of all at once.

**Problem:** 40+ fieldwork images (~14MB+) are bundled in the React build, bloating the JS bundle and slowing page loads and build times.

**Implementation:**
- Create folder structure in `s3://fartooyoung-prod-frontend/assets/`
- Upload all images organized by: `fieldwork/nepal/`, `fieldwork/bangladesh/`, `pages/`, `shared/`, `blog/`
- Both staging and production reference the same image URLs (no duplication)
- Upload via CLI: `aws s3 sync src/assets/images/ s3://fartooyoung-prod-frontend/assets/`

## Step 2: Update Components to Use CDN URLs ⬜

**Benefit:** Components reference `https://www.fartooyoung.org/assets/fieldwork/nepal/IMG_0958.webp` instead of importing files. Works from localhost, staging, and production identically.

**Problem:** Current imports (`import img from '../assets/...'`) bake images into the JS bundle.

**Implementation:**
- Replace `import` statements with URL strings
- Keep logo/favicon in React bundle (tiny, needed instantly for PWA)
- Update WhatWeDo.jsx carousel to use URL array instead of 40+ imports

## Step 3: Remove Images from React Bundle ⬜

**Benefit:** Dramatically smaller build output. Faster `npm run build`. Smaller deploy to S3.

**Problem:** Build currently processes and hashes 40+ large image files unnecessarily.

**Implementation:**
- Delete `src/assets/images/pages/what-we-do/carousel/` (after confirming S3 upload)
- Keep only `src/assets/images/shared/Far-Too-Young-Logo.png` and favicon
- Verify build size reduction

---

*Created: June 1, 2026*
