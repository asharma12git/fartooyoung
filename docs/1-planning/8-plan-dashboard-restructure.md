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

## Step 3: Super Admin & User Management ⬜

**Benefit:** A super admin role allows the site owner to manage who has admin access, without code changes. Enables safe delegation of content management to team members.

**Problem:** Currently only one admin exists (set manually in DynamoDB). No way to add/remove admins through the UI. As the team grows, need to control who can manage blog posts, research articles, etc.

**Implementation:**

Role Hierarchy:
- `super_admin` — full access + can manage other admins
- `admin` — can manage blog, research, content
- `donor` — standard user (donations, dashboard)

Admin Panel "Users" Tab (super_admin only):
- List all registered users with their role
- Toggle role: donor → admin, admin → donor
- Cannot remove own super_admin role (safety)
- Future: granular permissions (blog only, research only, shop only)

Database Change:
- Add `role: 'super_admin'` to owner's user record
- Admin panel checks `super_admin` for Users tab visibility

---

## Checklist (Updated)
- [ ] Step 1: Donor Dashboard Tab Cleanup
- [ ] Step 2: Admin Dashboard
- [ ] Step 3: Super Admin & User Management

---

*Last updated: August 17, 2026*
