---
name: add-translation
description: Add, rename, change or remove a visible UI text in the Chess frontend, in all six languages (en, pt-BR, pt, fr, it, de) and in the Messages interface. Use whenever a component or view needs a new text, a label for an API value, or a text changes.
---

# Add or change a UI text

UI text is never written in a `.vue` file or a composable. It lives in one message file per language, and every language has every key.

Files (all under `src/i18n/messages/`):

| Language | File | Export |
| --- | --- | --- |
| English (reference) | `en.ts` | `en` |
| Portuguese, Brazil | `pt-br.ts` | `ptBR` |
| Portuguese, Portugal | `pt.ts` | `pt` |
| French | `fr.ts` | `fr` |
| Italian | `it.ts` | `it` |
| German | `de.ts` | `de` |

The shape is the `Messages` interface in `src/i18n/messages/types.ts`. `src/i18n/messages/index.ts` maps each `Locale` (from `src/i18n/locales.ts`) to its file.

## Steps

1. **Pick the key.** Group by screen, as the interface does (`home`, `selectSide`, `promotePawn`, `answer`, `endGame`, `game`, `common`, `footer`, `install`, `errors`). Texts that translate an API value go in `labels`. Use a function value when the text has a variable, as `selectSide.title: (gameId: number) => string` does. Enum-keyed records use the existing union types (`SideId`, `PieceName`, `EndingLabel`, `MoveName`, `ProposalKind`, `ShiftTimeKey`) so a new API value fails the type check until it is translated.
2. **Interface first.** Add the key to `Messages` in `types.ts`. From now on `npm run typecheck` lists every language file that lacks it.
3. **Six files, same change.** Add the key to `en.ts`, `pt-br.ts`, `pt.ts`, `fr.ts`, `it.ts` and `de.ts`. Keep the key order of the interface. Write the text for each language; do not paste the English one.
   - `pt-BR` and `pt` (Portugal) are different. Use the vocabulary of each: for example "Carregando" and "Compartilhar" (Brazil) against "A carregar" and "Partilhar" (Portugal), "você" against the infinitive or "tu" forms, "Tela de Início" against "Ecrã principal", "contactar" and "ligação" (Portugal) against "contatar" and "conexão" (Brazil). Look at the neighbouring keys of the same file and match them.
   - Keep placeholders, punctuation, and the variable in function values identical in meaning across languages.
   - Do not translate API wire values. The text that the API sends in the `message` field is shown as received.
4. **Use it.**
   - In a view: `const { messages } = useLocale()`, then `messages.<group>.<key>` in the template (refs unwrap there) and `messages.value.<group>.<key>` in the script.
   - In a component: receive the text as a prop from the view. Components never import the messages.
   - Outside components (dialogs, sockets): `currentMessages()` from `@/services/locale`.
5. **Tests.**
   - `tests/i18n/messages.test.ts` already checks, for every language, that the keys and the kinds of values match English and that no text is empty. It needs no change for a normal key; add an assertion there only when the key is a function (like `selectSide.title`).
   - Add or adjust the view or component test that shows the text. Assert on the English text through the real message file (`MESSAGES.en...`) rather than a copy of the string, so a rewording does not break the test.
6. **Spec.** If the change adds or changes a language, a label table or a rule about text, update `docs/specs/frontend.md` section 6 (6.1 languages and text, 6.2 labels). A single new text does not need a spec change.
7. **Check.** Run `npm run check`.

## Adding a seventh language

Add the code to `LOCALES` and the name to `LOCALE_NAMES` in `src/i18n/locales.ts`, add `matchLocale` handling if the code needs it, create the message file, register it in `index.ts`, update the tests in `tests/i18n/locales.test.ts` (the `LOCALE_OPTIONS` list), and update the table in `docs/specs/frontend.md` section 6.1, `CLAUDE.md` and `README.md` where they list the languages. Ask the user first: it is a product decision.
