# Interview App — Frontend

Next.js app. API calls are rewritten to the backend (`BACKEND_URL` in `.env.local`; see `next.config.js`).

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

---

**Full documentation:** [DOCUMENTATION.md](DOCUMENTATION.md)
