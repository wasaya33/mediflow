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

Put local overrides in `.env.local`. It is git-ignored.

### Development auth bypass

`BYPASS_AUTH` is currently hard-coded to `true` in
`src/providers/AuthProvider.tsx`, `src/components/providers/ProtectedRoute.tsx`,
and `src/lib/api.ts`, and the auth store falls back to a demo user. Set these
to `false` to test real login and session verification against the API.

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
