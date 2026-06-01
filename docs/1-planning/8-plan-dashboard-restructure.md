# Plan 8: Dashboard Restructure

## Status: 📋 Planned
## Priority: Medium
## Estimated Effort: 4-6 hours
## Dependencies: None

---

## Overview

Restructure the donor dashboard tabs and add an admin dashboard for site management.

**Note:** Blog UI is handled in Plan 6 (Blog System). This plan covers dashboard layout only.

---

## Phase 1: Donor Dashboard Tab Cleanup

### Current Tabs:
- 🏠 Overview
- ❤️ Donations
- 📦 Orders
- 💝 Wishlist
- ⚙️ Settings

### New Tabs:
- 🏠 **Overview** — Welcome, impact stats, recent activity
- ❤️ **Donations** — History + Subscriptions (keep current)
- 🛍️ **Shop** — Orders + Wishlist (combined, de-emphasized)
- ⚙️ **Settings** — Profile, password, preferences

### Why:
- Orders/Wishlist are top-level but no e-commerce exists yet
- Misleads users into thinking shopping is primary
- Nonprofit mission should be front and center

---

## Phase 2: Admin Dashboard

### Route: `/admin` (role-based access)

**Tabs:**
- 📊 **Overview** — Analytics, total donations, user stats
- 💰 **Donations** — All donations across users, export data
- 👥 **Users** — User management
- ⚙️ **Settings** — Site config

### Backend Requirements:
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

---

*Last updated: June 1, 2026*
