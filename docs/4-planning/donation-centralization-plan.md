# Donation Feature Centralization Plan

## Overview
Centralize all donation buttons across the Far Too Young website to use a single, consistent donation modal managed by App.jsx instead of multiple local modal instances.

## Current Architecture Analysis

### **Pages with LOCAL donation modals (Need to centralize):**
1. **ChildMarriage.jsx** - 1 donate button + local modal
2. **FounderTeam.jsx** - 1 donate button + local modal  
3. **Partners.jsx** - 1 donate button + local modal
4. **WhatWeDo.jsx** - 3 donate buttons + local modal

### **Pages with CENTRALIZED donation (Already good):**
5. **DonorDashboard.jsx** - 5+ donate buttons using App.jsx modal
6. **Header.jsx** - Global donate button using App.jsx modal

**Total Impact:** ~10 donate buttons across entire website

---

## Implementation Plan

### **Step 1: Update App.jsx Routes**
Add `onDonateClick` prop to all page routes:

```javascript
// App.jsx - Current routes
<Routes>
  <Route path="/" element={<ChildMarriage />} />
  <Route path="/founder-team" element={<FounderTeam />} />
  <Route path="/partners" element={<Partners />} />
  <Route path="/what-we-do" element={<WhatWeDo />} />
  <Route path="/dashboard" element={<DonorDashboard onDonateClick={handleDonateClick} />} />
</Routes>

// App.jsx - Updated routes
<Routes>
  <Route path="/" element={<ChildMarriage onDonateClick={handleDonateClick} />} />
  <Route path="/founder-team" element={<FounderTeam onDonateClick={handleDonateClick} />} />
  <Route path="/partners" element={<Partners onDonateClick={handleDonateClick} />} />
  <Route path="/what-we-do" element={<WhatWeDo onDonateClick={handleDonateClick} />} />
  <Route path="/dashboard" element={<DonorDashboard onDonateClick={handleDonateClick} />} />
</Routes>
```

### **Step 2: Update Component Signatures**
Add `onDonateClick` prop to each component:

```javascript
// Before
const ChildMarriage = () => {

// After  
const ChildMarriage = ({ onDonateClick }) => {
```

### **Step 3: Replace Button Handlers**
Update all donate button click handlers:

```javascript
// Before
onClick={() => setShowDonationModal(true)}

// After
onClick={() => onDonateClick()}
```

---

## Cleanup Checklist

### **ChildMarriage.jsx**
**Remove:**
- ❌ `import { useState } from 'react'` (if not used elsewhere)
- ❌ `import DonationModal from '../components/DonationModal'`
- ❌ `const [showDonationModal, setShowDonationModal] = useState(false)`
- ❌ Modal JSX block:
  ```javascript
  {showDonationModal && (
    <DonationModal onClose={() => setShowDonationModal(false)} />
  )}
  ```

**Add:**
- ✅ `onDonateClick` prop to component signature
- ✅ PropTypes validation:
  ```javascript
  ChildMarriage.propTypes = {
    onDonateClick: PropTypes.func.isRequired
  }
  ```

### **FounderTeam.jsx**
**Remove:**
- ❌ `import { useState } from 'react'` (if not used elsewhere)
- ❌ `import DonationModal from '../components/DonationModal'`
- ❌ `const [showDonationModal, setShowDonationModal] = useState(false)`
- ❌ Modal JSX block (lines ~312-314)

**Add:**
- ✅ `onDonateClick` prop to component signature
- ✅ PropTypes validation

### **Partners.jsx**
**Remove:**
- ❌ `import { useState } from 'react'` (if not used elsewhere)
- ❌ `import DonationModal from '../components/DonationModal'`
- ❌ `const [showDonationModal, setShowDonationModal] = useState(false)`
- ❌ Modal JSX block (lines ~298-300)

**Add:**
- ✅ `onDonateClick` prop to component signature
- ✅ PropTypes validation

### **WhatWeDo.jsx**
**Remove:**
- ⚠️ **Keep** `import { useState } from 'react'` (used for `currentSlide`, `zoomedImage`)
- ❌ `import DonationModal from '../components/DonationModal'`
- ❌ `const [showDonationModal, setShowDonationModal] = useState(false)`
- ❌ Modal JSX block (lines ~835-837)

**Add:**
- ✅ `onDonateClick` prop to component signature
- ✅ PropTypes validation

---

## Benefits After Implementation

### **Consistency Benefits:**
- ✅ Single donation modal across entire website
- ✅ Same user experience everywhere
- ✅ Consistent styling and behavior
- ✅ User login state preserved across all donations

### **Stripe Integration Benefits:**
- ✅ Single success/failure handling
- ✅ Unified analytics tracking
- ✅ Easier webhook integration testing
- ✅ Consistent payment flow

### **Code Quality Benefits:**
- ✅ Removed code duplication (4 identical modal patterns → 1)
- ✅ Smaller bundle size per page
- ✅ Single source of truth for donation logic
- ✅ Easier to add features (monthly subscriptions, etc.)

### **Maintenance Benefits:**
- ✅ One place to update donation logic
- ✅ Single point for error handling
- ✅ Easier debugging and testing

---

## Impact Summary

### **Before Centralization:**
- 4 separate donation modals + 1 centralized
- 4 pages importing `DonationModal` unnecessarily
- 4 duplicate modal instances in memory
- Redundant state management code

### **After Centralization:**
- 1 centralized donation modal for entire website
- Only `App.jsx` imports `DonationModal`
- Single modal instance
- Clean, maintainable component code

---

## Files to Modify

### **Primary Changes:**
1. `src/App.jsx` - Add `onDonateClick` props to routes
2. `src/pages/ChildMarriage.jsx` - Remove local modal, add prop
3. `src/pages/FounderTeam.jsx` - Remove local modal, add prop
4. `src/pages/Partners.jsx` - Remove local modal, add prop
5. `src/pages/WhatWeDo.jsx` - Remove local modal, add prop

### **No Changes Needed:**
- `src/pages/DonorDashboard.jsx` - Already centralized
- `src/components/Header.jsx` - Already centralized
- `src/components/DonationModal.jsx` - No changes needed
- `src/App.jsx` modal logic - Already working correctly

---

## Testing Plan

### **After Implementation:**
1. **Test all donate buttons** on every page
2. **Verify modal consistency** across pages
3. **Check user login state** preservation
4. **Test donation flow** from each page
5. **Verify no console errors** from removed imports

### **Expected Results:**
- All donate buttons open the same modal
- User information auto-fills consistently
- No duplicate modals or state conflicts
- Clean console with no import errors

---

## Next Steps After Centralization

1. **Complete Stripe webhook setup** - Easier with centralized flow
2. **Add monthly subscription support** - Single place to implement
3. **Enhanced analytics tracking** - Unified donation source tracking
4. **Frontend AWS deployment** - Cleaner, more maintainable codebase

---

*Created: November 25, 2025*
*Status: Ready for Implementation*
*Estimated Time: 1-2 hours*
