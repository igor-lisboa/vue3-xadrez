---
applyTo: "tests/**/*.ts"
---

- Tests mirror `src/`. Keep each file under 300 lines; split by screen or behaviour.
- Domain functions: test as pure functions (`tests/domain/game-screen.test.ts` is the model). Services: mock `http`. Views and composables: mock services, `vue-router` and `@/services/dialogs` (`tests/views/home-select-views.test.ts` is the model); use `runComposable` from `tests/helpers/run-composable.ts` when lifecycle hooks are needed.
- Reuse `tests/helpers/fixtures.ts`. Use `flushPromises` for views, `await nextTick()` after watchers, and `vi.useFakeTimers()` for the clock.
- Test behaviour and each error path, not implementation details. Never lower coverage thresholds or skip a test to make it pass.
