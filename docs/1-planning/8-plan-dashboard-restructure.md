# Dashboard Restructure

## Overview
Restructure the donor dashboard tabs (de-emphasize empty e-commerce tabs, focus on nonprofit mission) and add an admin dashboard for site management.

## Prerequisites
- Existing donor dashboard at `/dashboard`
- User authentication system with JWT

## Cost
$0/month (no new AWS services — uses existing Lambda + DynamoDB)

## Checklist
- [ ] Step 1: Donor Dashboard Tab Cleanup
- [ ] Step 2: Admin Dashboard

---

## Step 1: Donor Dashboard Tab Cleanup ⬜

**Benefit:** Restructuring tabs to prioritize donations and impact over empty e-commerce features creates a focused, mission-aligned user experience that doesn't confuse donors with non-functional sections.

**Problem:** Current tabs (Orders, Wishlist) are top-level but no e-commerce exists yet. This misleads users into thinking shopping is the primary function, when the nonprofit mission should be front and center.

**Implementation:**

Current Tabs:
- 🏠 Overview
- ❤️ Donations
- 📦 Orders
- 💝 Wishlist
- ⚙️ Settings

New Tabs:
- 🏠 **Overview** — Welcome, impact stats, recent activity
- ❤️ **Donations** — History + Subscriptions (keep current)
- 🛍️ **Shop** — Orders + Wishlist (combined, de-emphasized)
- ⚙️ **Settings** — Profile, password, preferences

## Step 2: Admin Dashboard ⬜

**Benefit:** An admin dashboard provides a centralized interface for site management — viewing all donations, managing users, and monitoring analytics — without needing to access AWS Console or DynamoDB directly.

**Problem:** Without an admin dashboard, the site owner must use AWS Console to view donation data, manage users, or check site stats — slow, technical, and error-prone.

**Implementation:**

Route: `/admin` (role-based access)

Tabs:
- 📊 **Overview** — Analytics, total donations, user stats
- 💰 **Donations** — All donations across users, export data
- 👥 **Users** — User management
- ⚙️ **Settings** — Site config

Backend Requirements:
- Add `role` field to users table (`donor` / `admin`)
- Admin-only API endpoints with role checking
- Role-based routing in frontend

---

## Files Modified

| File | Change |
|------|--------|
| `src/pages/DonorDashboard.jsx` | Restructure tabs |
| `src/App.jsx` | Add `/admin` route |
| `src/pages/AdminDashboard.jsx` | New admin page |
| `backend/lambda/utils/auth-middleware.js` | Role checking |

Note: Blog UI is handled in Plan 6 (Blog System). This plan covers dashboard layout only.

---

*Last updated: June 1, 2026*
