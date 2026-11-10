---
name: add-api-call
description: Add or change a call to the Chess API in the frontend (typed schema, service function, tests, spec section 5). Use when a screen needs a new endpoint or an existing endpoint changes.
---

# Add an API call

The API contract is the OpenAPI file in the backend repository (docs/api/openapi.yaml there; the raw URL is in the `review-api-contract` agent). The live Swagger is at `/docs` on the API base URL. Read the operation there before writing code. Note that the deployed API may be behind Vercel protection, so the file in the repository is the reliable source.

1. **Schema.** Add the request and response types in `src/api/types/`. Pick the file by area (`catalogue.ts`, `game.ts`, `game-summary.ts`, `move.ts`, or a new file if the area is new). Use the API's exact wire names. Type only the fields the frontend reads, and add a comment when a type is partial. Enum-like values use union types in `enums.ts`.
2. **Service.** Add the function to the matching file in `src/api/services/` (one file per area; create a new file only for a new area). Rules:
   - Use the shared `http` client from `@/api/http`.
   - Unwrap `data.data` for reads; return `data.message` for actions the UI reports to the player.
   - Put the acting side in the header via `sideHeaders(sideId)`.
   - Never import Vue or the router here.
3. **Socket events.** If the change adds a socket event, use the `add-socket-event` skill.
4. **Tests.** Add the cases to `tests/api/services.test.ts` (or a new file for a new area): the URL, the method, the body, the header, and the returned value.
5. **Spec.** Add the row to the table in `docs/specs/frontend.md` section 5.
6. **Check.** Run `npm run check`. Every request already sends `Accept-Language`; do not add it per call.

When the change affects an existing screen, also run the `review-api-contract` agent or check the screen's tests.
