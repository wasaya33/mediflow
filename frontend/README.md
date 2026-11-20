# MediFlow Frontend

Web client for MediFlow, built with Next.js 14 (App Router), TypeScript,
Tailwind CSS, and shadcn/ui components.

## Getting started

The frontend talks to the MediFlow API in [`../backend`](../backend). Start the
backend first (see the [root README](../README.md)), then:

```bash
cd frontend
npm install
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

### Environment

| Variable              | Default                     | Description               |
| :-------------------- | :-------------------------- | :------------------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Base URL of the MediFlow API |
| `NEXT_PUBLIC_AUTH_BYPASS` | _(unset)_ | Set to `false` to disable the development auth bypass |

Put local overrides in `.env.local`. It is git-ignored.

### Development auth bypass

Under `npm run dev`, the app skips login and signs you in as a demo
`PLATFORM_ADMIN` user, matching the backend's development bypass. The switch
lives in `src/lib/authBypass.ts`.

Production builds (`npm run build`) always enforce authentication. To test
the real login and session flow locally, set `NEXT_PUBLIC_AUTH_BYPASS=false`
in `.env.local` and restart the dev server.

## Scripts

| Command         | Description                                   |
| :-------------- | :-------------------------------------------- |
| `npm run dev`   | Start the development server with hot reload  |
| `npm run build` | Create a production build (also runs ESLint and type checks) |
| `npm run start` | Serve the production build                    |
| `npm run lint`  | Run ESLint                                    |

## Project structure

```text
src/
├── app/
│   ├── (auth)/         # Login and registration pages
│   └── (dashboard)/    # Authenticated pages: patients, providers,
│                       # appointments, encounters, claims, settings, ...
├── components/
│   ├── ui/             # shadcn/ui primitives
│   ├── layout/         # Header, sidebar, breadcrumbs
│   ├── forms/          # Entity forms (patient, provider, appointment, ...)
│   └── shared/         # Reusable building blocks (tables, badges, empty states)
├── hooks/              # React Query hooks per API resource
├── lib/                # Axios API client and utilities
├── providers/          # App-level React providers (auth, React Query)
├── store/              # Zustand stores
└── types/              # Shared TypeScript types
```
