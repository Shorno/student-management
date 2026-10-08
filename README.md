# student-management

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Self, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine

## What the App Does

A student information system:

- **Register (`/`)**: a form with name, student ID, department, batch, year, semester, address, email, phone, gender (radio), club membership (checkboxes), photo, birth date (calendar), captcha, and terms and conditions.
- **Students (`/students`)**: every record in a table, including a derived **Age** column calculated from the birth date. You can search by Student ID and edit or delete any row.
- **Edit (`/students/<id>/edit`)**: update a record. Student ID is the primary key, so it can't be changed.

## Running Locally

### 1. Prerequisites

- **Node.js 22 or 24**. Node 22 is pinned in `.node-version` for version managers like [fnm](https://github.com/Schniz/fnm) (`fnm use`) or [nvm](https://github.com/nvm-sh/nvm) (`nvm use 22`), but a normal Node 24 install also works.
- **pnpm 11**. The easiest way to get the exact version is through Corepack, which ships with Node:

  ```bash
  corepack enable
  ```

- **A Neon Postgres database**. The free tier is enough; sign up at [neon.tech](https://neon.tech). The app connects with Neon's serverless HTTP driver, so a plain local PostgreSQL server will not work without changing the driver in `packages/db/src/index.ts`.

Check your versions:

```bash
node -v
```

```bash
pnpm -v
```

### 2. Clone the project and install dependencies

```bash
git clone <repository-url> student-management
```

```bash
cd student-management
```

```bash
pnpm install
```

`pnpm install` also generates the typed env files `apps/web/src/env.ts` and `packages/db/src/env.ts`.

### 3. Configure the database connection

Create `apps/web/.env`. It is gitignored, so it is never committed. Add your Neon connection string from the Neon dashboard (**Connect** → copy the connection string):

```env
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/neondb?sslmode=require
```

This is the only variable the app needs. `packages/db` reads the same file, so you don't need a second `.env`.

### 4. Create the database table

Push the Drizzle schema (`packages/db/src/schema/index.ts`) to your database. This creates the `students` table:

```bash
pnpm run db:push
```

Run it again whenever you change the schema.

### 5. Start the development server

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001). Pages and server code reload automatically when you save a file.

### 6. (Optional) Production build

```bash
pnpm run build
```

```bash
cd apps/web
```

```bash
node .output/server/index.mjs
```

The production server listens on [http://localhost:3000](http://localhost:3000) by default; set the `PORT` environment variable to change it. Start it from `apps/web` as shown, so it finds `DATABASE_URL` in `apps/web/.env`.

### Browsing the data

To view and edit table rows directly in a browser-based database UI, run:

```bash
pnpm run db:studio
```

### Troubleshooting

| Problem | Fix |
|---|---|
| `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` during install or any `pnpm run` | On Windows with Node 24, varlock's usage telemetry crashes the process as it exits. `.varlock/config.json` turns that telemetry off for this project, so make sure the file exists (pull the latest code), then run `pnpm install` again. As a one-off workaround, set `DO_NOT_TRACK=1` before the command. |
| `[varlock] config is invalid` | `apps/web/.env` is missing, or `DATABASE_URL` is empty. |
| `relation "students" does not exist` | Run `pnpm run db:push`. |
| Port 3001 is already in use | Stop the other process, or run `pnpm --filter web dev --port 3002`. |

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@student-management/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Environment Configuration

Each app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation; run `pnpm run env:generate` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated `ENV` accessor in application code. Shared database and auth packages receive configuration or initialized clients from the application. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

Bun's automatic env loading is disabled in `bunfig.toml`; the framework integration or server bootstrap loads Varlock. Node deployments must include Varlock and its dependencies alongside the app schema.

Run standalone Node/Bun tools that use Varlock from the owning app directory so they load that app's schema and env files. `env:generate` only generates TypeScript files; it does not initialize environment values in a subsequent command.

## Deployment

### Docker Compose

- Target: web + server
- Config: `docker-compose.yml` (app Dockerfiles live in `apps/*/Dockerfile`)
- Build images: pnpm run docker:build
- Start: pnpm run docker:up
- Logs: pnpm run docker:logs
- Stop: pnpm run docker:down

Environment variables are read from each app's `.env` file (baked into web builds for public variables) and overridden in `docker-compose.yml` for container networking.

For more details, see the guide on [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).

## Project Structure

```
student-management/
├── apps/
│   └── web/                          # Fullstack application (React + TanStack Start)
│       └── src/
│           ├── routes/               # Pages: / (register), /students, /students/$studentId/edit
│           ├── components/           # Student form, captcha, header
│           ├── lib/student.ts        # Dropdown options + validation rules (shared by form and server)
│           └── server/students.functions.ts  # Backend: insert, view, update, delete, search
├── packages/
│   ├── ui/                           # Shared shadcn/ui components and styles
│   └── db/                           # Drizzle schema (students table) & database client
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:studio`: Open database studio UI
- `pnpm run docker:build`: Build the Docker Compose images
- `pnpm run docker:up`: Build and start the Docker Compose stack
- `pnpm run docker:logs`: Tail logs from the Docker Compose stack
- `pnpm run docker:down`: Stop the Docker Compose stack
