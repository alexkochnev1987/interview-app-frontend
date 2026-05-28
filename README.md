# Interview App — Frontend

Next.js app. API calls are rewritten to the backend (`BACKEND_URL` in `.env.local`; see `next.config.js`).

OpenAPI flow is automated from the backend repo:
- `npm run dev` and `npm run build` first run `openapi:refresh`.
- `openapi:refresh` generates backend spec, syncs `openapi/openapi.json` to frontend, then regenerates `src/lib/api-types.ts`.
- Override backend location with `BACKEND_REPO_PATH` if your local folder name differs.
- CI runs `openapi:generate` against the committed `openapi/openapi.json` and fails if `src/lib/api-types.ts` drifts.
- Always commit both `openapi/openapi.json` and the regenerated `src/lib/api-types.ts` together so CI stays green.

## Local setup

**Requirements:** Node.js 22. The backend must be reachable (see below).

```bash
git clone https://github.com/alexkochnev1987/interview-app-frontend.git
cd interview-app-frontend

cp .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3001

Run the API separately — [interview-app-backend](https://github.com/alexkochnev1987/interview-app-backend) (`docker compose up -d`, `npm run start:dev`). Default in `.env.local`: `BACKEND_URL=http://localhost:3000`.

## i18n messages

Translations are modular per locale (legacy flat files were removed):

```text
messages/
  en|be|ru|pl/
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
```

Loader policy:
- Runtime loads **only** modular files `messages/<locale>/*.json`.
- Legacy flat files are disabled and must not exist.

Validation:
- `npm run i18n:legacy:guard` — blocks legacy flat files (`messages/en.json`, `be.json`, `ru.json`, `pl.json`).
- `npm run i18n:check` — checks parity against `en` (missing/extra/type mismatch).
- `npm run lint:ci` — runs ESLint + legacy guard + i18n parity check (used in CI).

Team workflow (short):
- Add new keys in `messages/en/<module>.json` first, then mirror the same key path in `be/ru/pl`.
- Keep identical key structure and types across locales (`string` vs `object` must match `en`).
- If `i18n:check` reports:
  - `missing` -> add the key in the reported locale.
  - `extra` -> remove key or add it to `en` and all locales intentionally.
  - `type mismatch` -> align type to `en`.
- Module list/order source of truth: `messages/module-order.json`.
- When adding a new module: update `messages/module-order.json`, add `messages/<locale>/<module>.json` for `en/be/ru/pl`, then run `npm run i18n:check`.

Detailed process: `I18N_MESSAGE_MODULE_STRUCTURE.md`.

---

**Full documentation:** [DOCUMENTATION.md](DOCUMENTATION.md)
