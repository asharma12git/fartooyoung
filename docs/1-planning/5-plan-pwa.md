# Progressive Web App (PWA)

## Overview
Make the site installable on phones with offline support and push notifications. PWA chosen over React Native ($0 cost, 2-3 hours, uses existing infrastructure). Manifest and icons already deployed via Plan 3 SEO.

**Status:** ✅ Partially Complete (manifest + icons deployed)  
**Cost:** $0 additional  
**Effort:** 2-3 hours remaining  
**Dependencies:** None (enhances existing React app)

## Prerequisites
- React app deployed on S3 + CloudFront (HTTPS required)
- PWA manifest already in `public/manifest.json` (done in Plan 3)
- Icons (192px + 512px) in `public/` (done in Plan 3)

## Checklist
- [x] Step 1: Web App Manifest + Icons
- [ ] Step 2: Service Worker (Offline Support)
- [ ] Step 3: Push Notifications

---

## Step 1: Web App Manifest + Icons ✅

Already deployed in Plan 3 SEO. `public/manifest.json` with app name, icons, dark theme color (`#0a0a0a`), standalone display mode. Linked via `<link rel="manifest">` and `<meta name="theme-color">` in `index.html`.

```json
{
  "name": "Far Too Young",
  "short_name": "FTY",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0a0a0a",
  "background_color": "#0a0a0a"
}
```

## Step 2: Service Worker (Offline Support)

Implement service worker for:
- Cache static assets (CSS, JS, images) for instant loading
- Offline fallback page (view donation history without internet)
- Background sync capabilities
- Service worker runs in secure isolated context

**Strategy:** Cache-first for static assets, network-first for API calls.

## Step 3: Push Notifications

Web-based push notifications for:
- Donation confirmations
- Impact updates
- Campaign announcements

Uses existing API infrastructure — no additional AWS services needed.

---

## Why PWA Over Native Apps

| Approach | Cost | Time | App Store Fees |
|----------|------|------|----------------|
| **PWA** | $0 | 2-3 hours | $0 |
| React Native | $5-20/month | 4-6 weeks | $124/year |
| AppSync + RN | $10-40/month | 6-8 weeks | $124/year |

**PWA benefits:** Zero additional AWS costs, same backend APIs, no app store fees, cross-platform, instant updates, same security model (JWT + HTTPS).

**PWA limitations:** Limited native device features, iOS Safari has some restrictions, no app store discoverability.

## Migration Path (Future)

If native app needed later:
- 80% React code reuse with React Native
- Same backend APIs — no Lambda/DynamoDB changes
- Trigger: need for native camera/contacts, app store presence requirement, user feedback demanding native features
- Evaluate in 6-12 months based on PWA analytics

---

*Last Updated: November 23, 2025*
