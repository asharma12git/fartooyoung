# Frontend Lint Cleanup

## Overview
Fix 186 lint errors across the frontend codebase. Currently non-blocking (pipeline warns but deploys anyway). Clean lint = easier to catch real bugs in future PRs.

**Status:** 📋 Backlog  
**Priority:** Low  
**Effort:** 1-2 hours  
**Dependencies:** None

## Prerequisites
- `npm run lint` configured in package.json
- ESLint + React plugin installed

## Checklist
- [ ] Step 1: Fix lint errors file by file
- [ ] Step 2: Make pipeline lint blocking

---

## Step 1: Fix lint errors file by file

**Common issues (by count):**

| Error | Count | Fix |
|-------|-------|-----|
| `no-unused-vars` | ~50+ | Remove unused imports/variables |
| `react/no-unknown-property` (jsx) | ~20+ | Use `className` instead of `class`, fix `jsx` prop |
| `no-case-declarations` | ~5 | Wrap case blocks in `{}` |
| `no-useless-escape` | ~3 | Remove unnecessary backslashes in regex |
| `no-undef` (process) | 1 | Add `/* global process */` to vite.config.js |
| `react-hooks/exhaustive-deps` | 2 | Add missing deps or suppress with comment |

**Approach:**
1. Fix file by file, starting with smallest files
2. Run `npm run lint` after each file to verify
3. Test the app still works after changes

## Step 2: Make pipeline lint blocking

Once clean, change pipeline lint to blocking:
- Remove `|| echo` from lint command in buildspec
- Future PRs with lint errors will fail the build

---

## When to Do This

- During a quiet week with no feature work
- Or incrementally: fix a few files per session
- **Not urgent** — code works correctly, this is quality polish

---

*Created: May 27, 2026*
