---
name: verify
description: Run the full quality gate of the Chess frontend (typecheck, tests with coverage, build, file size rule) and report the results. Use before saying a change is done, or when the user asks to check the project.
---

# Verify

1. Run `npm run check`. It runs the type check, the tests with coverage, and the production build.
2. Check the file size rule: no file under `src/` or `tests/` may exceed 300 lines.

   ```bash
   find src tests -type f \( -name "*.ts" -o -name "*.vue" \) -exec wc -l {} + | sort -n | tail -5
   ```

3. Check that no `any` was added in application code:

   ```bash
   grep -rn ": any\|as any" src
   ```

4. Check the language rules (see `CLAUDE.md`): code, comments and file names are English, Portuguese is allowed only in the API wire names and enum values, and no visible text is hard-coded in `.vue` files (it belongs in `src/i18n/messages/`).
5. If skills or agents changed, run `npm run check:agents`.
6. Report to the user, faithfully:
   - the exact pass or fail of each step,
   - the coverage numbers from the output,
   - any failing test name and its error text,
   - any file over 300 lines, by path and line count.

Do not claim success unless every step passed. If a step was not run, say so.
