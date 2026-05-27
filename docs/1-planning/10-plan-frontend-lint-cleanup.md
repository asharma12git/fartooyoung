# Plan 10: Frontend Lint Cleanup

## Priority: Low
## Status: Backlog
## Estimated Effort: 1-2 hours

---

## Why

- 186 lint errors exist across the frontend codebase
- Currently non-blocking (pipeline warns but deploys anyway)
- Clean lint = easier to catch real bugs in future PRs
- Professional code quality standard

---

## Common Issues (by count)

| Error | Count | Fix |
|-------|-------|-----|
| `no-unused-vars` | ~50+ | Remove unused imports/variables |
| `react/no-unknown-property` (jsx) | ~20+ | Use `className` instead of `class`, fix `jsx` prop |
| `no-case-declarations` | ~5 | Wrap case blocks in `{}` |
| `no-useless-escape` | ~3 | Remove unnecessary backslashes in regex |
| `no-undef` (process) | 1 | Add `/* global process */` to vite.config.js |
| `react-hooks/exhaustive-deps` | 2 | Add missing deps or suppress with comment |

---

## Approach

1. Fix file by file, starting with smallest files
2. Run `npm run lint` after each file to verify
3. Test the app still works after changes
4. Once clean, change pipeline lint to blocking (`npm run lint` without `|| echo`)

---

## When to Do This

- During a quiet week with no feature work
- Or incrementally: fix a few files per session
- **Not urgent** — code works correctly, this is quality polish

---

*Created: May 27, 2026*
