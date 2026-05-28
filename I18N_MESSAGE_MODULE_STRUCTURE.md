# I18N Message Module Structure

## Goal

Define and maintain a consistent modular message layout for all locales:
- `en`
- `be`
- `ru`
- `pl`

Target domain modules:
- `common`
- `nav`
- `login`
- `dashboard`
- `questions`
- `interviews`
- `assessments`
- `team`
- `feedback`
- `takeFlow`
- `toast`

## Target File Structure (for each locale)

```text
messages/
  en/
    common.json
    nav.json
    login.json
    dashboard.json
    questions.json
    interviews.json
    assessments.json
    team.json
    feedback.json
    takeFlow.json
    toast.json
  be/
    ... same files ...
  ru/
    ... same files ...
  pl/
    ... same files ...
```

The merge order is defined in one place:
- `messages/module-order.json`

Runtime loader and parity checks must both use this file as source of truth.

## Module Order Governance

When adding a new domain module, follow all steps (no hidden actions):
1. Add the module name to `messages/module-order.json` in the intended merge order.
2. Create `messages/<locale>/<new-module>.json` for **all** locales: `en`, `be`, `ru`, `pl`.
3. Add corresponding keys with the same structure/type across locales.
4. Run:
   - `npm run i18n:check`
   - `npm run lint:ci`

## Workflow: Add or Change Translation Keys

1. Pick module by domain (`questions`, `assessments`, `team`, etc.).
2. Add/update the key in `messages/en/<module>.json` first (`en` is source of truth).
3. Apply the same key path in:
   - `messages/be/<module>.json`
   - `messages/ru/<module>.json`
   - `messages/pl/<module>.json`
4. Keep the same shape and type across locales:
   - string in `en` -> string in all locales
   - object in `en` -> object in all locales
   - do not change nesting only in one locale
5. Run checks:
   - `npm run i18n:check`
   - `npm run lint:ci` (recommended before push)

## How To Resolve Parity Errors

- **Missing keys**
  - Meaning: locale misses a key existing in `en`.
  - Action: add missing key in reported locale/module with same path.

- **Extra keys**
  - Meaning: locale has key absent in `en`.
  - Action: remove key, or add the same key to `en` and all locales if intentional.

- **Type mismatch**
  - Meaning: same path has different types (e.g. `string` vs `object`).
  - Action: align locale type to match `en` at the same path.

## Format Policy

- Legacy flat files are forbidden:
  - `messages/en.json`
  - `messages/be.json`
  - `messages/ru.json`
  - `messages/pl.json`
- Only modular files `messages/<locale>/*.json` are allowed for edits.
- Runtime loader is strict modular-only; legacy fallback is disabled.

## Mapping (Legacy -> Modules)

This mapping is identical for `en`, `be`, `ru`, and `pl`.

- `metadata` -> `common.json` (`metadata`)
- `common` -> `common.json` (`common`)
- `languageSwitcher` -> `common.json` (`languageSwitcher`)
- `shared.fallback` -> `common.json` (`shared.fallback`)
- `shared.labels` -> `common.json` (`shared.labels`)

- `nav` -> `nav.json` (`nav`)
- `login` -> `login.json` (`login`)
- `dashboard` -> `dashboard.json` (`dashboard`)

- `questions` -> `questions.json` (`questions`)
- `interviews` -> `interviews.json` (`interviews`)
- `assessments` -> `assessments.json` (`assessments`)
- `team` -> `team.json` (`team`)
- `feedback` -> `feedback.json` (`feedback`)
- `takeFlow` -> `takeFlow.json` (`takeFlow`)
- `toast` -> `toast.json` (`toast`)

## Runtime Compatibility Contract

To preserve runtime behavior exactly, the loader merges modules back into the same top-level shape currently used by `useTranslations(...)`:

- `metadata`
- `common`
- `languageSwitcher`
- `nav`
- `login`
- `dashboard`
- `shared`
- `toast`
- `questions`
- `interviews`
- `assessments`
- `team`
- `feedback`
- `takeFlow`

Namespace names remain unchanged at runtime; only physical file organization is modular.

## Notes

- Keep key structure identical across `en/be/ru/pl`.
- Add or remove keys consistently in all locales.
- Update `messages/module-order.json` in one place if module list/order changes.
