# Dashboard Restructure Plan
**Date:** November 29, 2025  
**Status:** Planning Phase

---

## 🎯 Objective
Restructure the donor dashboard to better align with the organization's mission and prepare for future e-commerce and admin features.

---

## 📋 Current State

### Existing Donor Dashboard Tabs:
- 🏠 Overview
- ❤️ Donations
- 📦 Orders
- 💝 Wishlist
- ⚙️ Settings

### Issues:
- Orders and Wishlist are top-level tabs but no e-commerce exists yet
- Gives impression that shopping is as important as donations
- Not aligned with nonprofit mission-first approach

---

## 🎨 Phase 1: Donor Dashboard Refinement (TODAY)

### New Structure:
- 🏠 **Overview** - Welcome message, impact stats, recent activity
- ❤️ **Donations** - Donation history & Subscriptions (keep current layout)
- 🛍️ **Shop** - E-commerce features (new combined tab)
  - Orders subtab
  - Wishlist subtab
- ⚙️ **Settings** - Profile, password, preferences

### Changes Required:
1. **Remove** top-level "Orders" and "Wishlist" tabs
2. **Create** new "Shop" tab with nested subtabs
3. **Move** Orders content into Shop → Orders
4. **Move** Wishlist content into Shop → Wishlist
5. **Update** navigation UI to support nested tabs
6. **Add** empty state messaging for Shop tab (since no products yet)

### Files to Modify:
- `/src/pages/DonorDashboard.jsx` - Main dashboard component
- Tab navigation logic
- Active tab state management
- Content rendering for new Shop tab

### Design Considerations:
- Shop tab should be visually de-emphasized (not primary CTA)
- Empty state should encourage donations, not shopping
- Maintain consistent styling with current dashboard

---

## 🚀 Phase 2: Admin Dashboard (FUTURE)

### Admin Dashboard Structure (`/admin`):
- 📊 **Overview** - Analytics, total donations, user stats, revenue charts
- 💰 **Donations** - All donations across all users, export data, donor emails
- 📝 **Blog** - Create/edit/delete blog posts, manage drafts
- 🛍️ **Shop** - Manage products, inventory, orders (when ready)
- ⚙️ **Settings** - Site settings, payment config, email templates

### Access Control:
- Regular user logs in → Redirected to `/dashboard`
- Admin user logs in → Can access both `/dashboard` AND `/admin`
- Role-based routing and component protection

### Backend Requirements:
- Add `role` field to users table (values: 'donor', 'admin')
- Create admin-only API endpoints
- Implement role-based middleware for Lambda functions

### Frontend Requirements:
- Create new `/admin` route
- Build AdminDashboard component
- Add role checking in routing
- Create admin-specific components:
  - Analytics charts
  - Donation management table
  - Blog post editor (rich text)
  - Settings forms

---

## 🌐 Phase 3: Public Blog (FUTURE)

### Public Pages:
- `/blog` - Blog listing page (all published posts)
- `/blog/[slug]` - Individual blog post page

### Features:
- Public read access for everyone
- Admin users see "Edit" and "Delete" buttons when logged in
- Rich text content rendering
- Categories/tags for organization
- Search functionality

### Backend Requirements:
- Create `blogs` DynamoDB table
- Blog CRUD API endpoints
- Image upload for blog posts (S3)

---

## 📊 Success Metrics

### Phase 1 (Donor Dashboard):
- ✅ Cleaner navigation with mission-first focus
- ✅ Donations remain prominent
- ✅ E-commerce features grouped logically
- ✅ No breaking changes to existing functionality

### Phase 2 (Admin Dashboard):
- ✅ Admins can view all donations
- ✅ Analytics provide actionable insights
- ✅ Blog management is intuitive
- ✅ Role-based access is secure

### Phase 3 (Public Blog):
- ✅ Blog posts are publicly accessible
- ✅ Admin editing is seamless
- ✅ Content is SEO-friendly
- ✅ Images load quickly

---

## 🔧 Technical Notes

### Nested Tab Implementation:
```javascript
const tabs = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'donations', label: 'Donations', icon: '❤️' },
  { 
    id: 'shop', 
    label: 'Shop', 
    icon: '🛍️',
    subtabs: [
      { id: 'orders', label: 'Orders' },
      { id: 'wishlist', label: 'Wishlist' }
    ]
  },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
]
```

### Role-Based Routing:
```javascript
// Protect admin routes
if (user.role !== 'admin' && location.pathname.startsWith('/admin')) {
  navigate('/dashboard')
}
```

---

## 📅 Timeline

### Today (Nov 29, 2025):
- ✅ Plan documented
- 🔄 Implement Phase 1 (Donor Dashboard restructure)
- 🔄 Test all existing functionality
- 🔄 Deploy changes

### Future Sessions:
- Phase 2: Admin Dashboard (4-6 hours)
- Phase 3: Public Blog (3-4 hours)
- E-commerce integration (TBD)

---

## 🎯 Next Steps

1. Review and approve this plan
2. Begin Phase 1 implementation
3. Test thoroughly before deployment
4. Update documentation after completion
5. Plan Phase 2 timeline

---

**Status:** Ready to begin Phase 1 implementation ✅
