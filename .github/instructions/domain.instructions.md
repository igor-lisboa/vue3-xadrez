---
applyTo: "src/domain/**/*.ts"
---

- `src/domain/` is pure: no Vue, no HTTP, no router, no DOM. It may import types from `src/api/types/` only.
- Each exported function has a short doc comment that says why it exists. No unused exports.
- Every function has a test in `tests/domain/` that calls it as a pure function.
