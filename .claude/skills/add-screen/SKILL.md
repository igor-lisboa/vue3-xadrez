---
name: add-screen
description: Add a new screen (route, view, composables, tests, spec entry) to the Xadrez frontend following the project's layering. Use when the user asks for a new page or screen.
---

# Add a screen

Follow this order. Each step has its own file, and each file stays under 300 lines.

1. **Spec first.** Add the screen to `docs/specs/frontend.md`: route in section 2, behaviour in section 3, look in section 4 (reuse the existing classes). If the screen is part of the game flow, add it to the screen rules in section 2.1 and to `src/domain/game-screen.ts` before writing the view.
2. **Route params.** If the route has params, validate them in `src/router/guards.ts` (reuse `requireGameId`, `requireGameAndSide` or add a new guard) and add a `props` function in `src/router/index.ts` that returns typed values. Views must receive typed props, never read `route.params` directly.
3. **Domain.** Put any rule (ordering, filtering, labels) in `src/domain/` as a pure function. Labels for API values go in `src/domain/labels.ts`.
4. **API.** If the screen needs data, use the `add-api-call` skill.
5. **View.** Create `src/views/<Name>View.vue` with `<script setup lang="ts">`. Use `useLoader` for reads, `useRequest` for actions, `useGameState` for game screens, and `useGameSocket` if the screen reacts to game events. Use existing components from `src/components/common/` (`ActionButton`, `ChoiceGroup`, `LoadingSpinner`). Keep the template structure of the existing views (spinner first, then content).
6. **Register the route** in `src/router/index.ts`. Use an English kebab-case path.
7. **Tests.** Add `tests/views/<name>.test.ts` (mock services, `vue-router` and `@/services/dialogs` as the existing view tests do). Test the rule and each error path. Add domain tests for any new pure function.
8. **Check.** Run `npm run check`. Coverage must stay above the thresholds in `vite.config.ts`.
9. **Report.** Say which spec sections changed and which files were added.

Do not commit unless the user asks.
