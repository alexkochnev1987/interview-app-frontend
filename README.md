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

## Tests

| Layer | Command | What it covers |
|-------|---------|----------------|
| **Unit** | `npm run test` | Pure UI helpers (redirect safety, assessment status, URL state, question-editor parsers/validation) |
| **E2E** | `npm run test:e2e` | Browser smoke: auth gate + core recruiter pages |

API contract flows are covered in the **backend** integration suite (`interview-app-backend` → `npm run test:integration`).

### Unit

```bash
npm run test
```

### E2E (Playwright)

**Requirements:** PostgreSQL on `:5433` (backend `docker compose up -d`), sibling backend repo at `../interview-app-backend` (or set `BACKEND_REPO_PATH`).

Locally, tests use your installed **Google Chrome** — no browser download. CI installs Playwright Chromium via `npm run test:e2e:install`.

If backend (`:3000`) and frontend (`:3001`) are already running:

```bash
npm run test:e2e:fast
```

Otherwise (auto-starts both):

```bash
npm run test:e2e
```

Default credentials: `admin@interview-app.com` / `admin123` (backend bootstrap user). Override with `E2E_EMAIL` / `E2E_PASSWORD` if needed.

If services are already up, Playwright reuses them. To skip auto-start: `E2E_SKIP_WEBSERVER=1 npm run test:e2e`.

Run the API separately — [interview-app-backend](https://github.com/alexkochnev1987/interview-app-backend) (`docker compose up -d`, `npm run start:dev`). Default in `.env.local`: `BACKEND_URL=http://localhost:3000`.

## i18n messages

Translations are modular per locale:

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
- `npm run i18n:check` — checks parity against `en` (missing/extra/type mismatch).
- `npm run lint:ci` — runs ESLint + i18n parity check (used in CI).

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

Product language policy (current stage):
- Internal app surfaces are multilingual (`en/be/ru/pl`).
- Candidate flow pages (`/<locale>/take/[id]`, `/<locale>/feedback/[id]`) are intentionally English-only, including candidate TTS (`en-US`).
- Backend locale-aware AI/dynamic multilingual candidate content is out of scope for now.
- Decision log, scope boundaries, and future backend requirements: `DOCUMENTATION.md` -> `Candidate flow is intentionally English-only`.

---

**Full documentation:** [DOCUMENTATION.md](DOCUMENTATION.md)
