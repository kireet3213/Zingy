# Zingy

Zingy is a real-time chat app:
- `client`: React + Vite + Redux Toolkit + RTK Query
- `server`: Express + Socket.IO + Sequelize (MySQL)

## Repo Structure

- `client/` - frontend app
- `server/` - backend API, sockets, DB models/migrations
- `shared-types/` - shared TypeScript contracts
- `.github/workflows/` - CI workflows

## Tech Stack

- Frontend: React 19, React Router, Redux Toolkit, RTK Query, Tailwind CSS
- Backend: Express 5, Socket.IO, Sequelize, Umzug migrations
- Database: MySQL
- Package manager: `pnpm`

## Prerequisites

- Node.js 20+
- `pnpm` 9+
- MySQL running locally or remotely

## Environment Variables

Create/update:
- `server/.env`
- `client/.env`

### `server/.env` (example)

```env
PORT=3000
DB_DIALECT=mysql
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=zingy_db
DB_LOGGER=true
JWT_SECRET=change_me
DB_PORT=3306
CLIENT_URL=http://localhost:5173
```

### `client/.env` (example)

```env
VITE_API_URL=http://localhost:3000
```

## Install

From repo root:

```bash
pnpm install
pnpm run install-shared
```

## Run Locally

Start server:

```bash
pnpm --filter zingy-server dev
```

Start client:

```bash
pnpm --filter zingy-client dev
```

## Database Migrations

Run migrations:

```bash
pnpm --filter zingy-server migration:run
```

Refresh migrations (drops and reruns, use carefully):

```bash
pnpm --filter zingy-server migration:refresh
```

Seed data:

```bash
pnpm --filter zingy-server seed
```

## Scripts

Root:

```bash
pnpm run lint
pnpm run check-types
pnpm run format
```

Per package:

```bash
pnpm --filter zingy-client lint
pnpm --filter zingy-client check-types
pnpm --filter zingy-server lint
pnpm --filter zingy-server check-types
```

## State Management (Frontend)

Redux Toolkit manages core app state:
- RTK Query:


## CI

GitHub Actions runs lint and type checks on pushes/PRs to `main`.
Dependabot is configured under `.github/dependabot.yml`.

## Notes

- Do not commit real credentials in `.env` files.
- Socket events are used for realtime delivery; messages are persisted via API.
