# Contributing to MediFlow

## Local setup

See the [root README](README.md) for backend setup (environment, Prisma,
seeding) and the [frontend README](frontend/README.md) for the web client.

## Workflow

1. Open or pick a GitHub issue that describes the change.
2. Create a branch from an up-to-date `main`:

   ```bash
   git switch main
   git pull
   git switch -c feat/patient-search
   ```

   Use a prefix that matches the change type: `feat/`, `fix/`, `docs/`,
   `refactor/`, `test/`, `chore/`, or `ci/`.

3. Make small, focused commits (see below).
4. Run the checks locally before pushing.
5. Push the branch and open a pull request against `main`. Reference the
   issue with `Closes #123` so it closes automatically on merge.
6. Merge once CI passes.

## Commit messages

MediFlow follows [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <summary in imperative mood, no trailing period>

<optional body explaining what changed and why>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`

**Common scopes:** `api`, `auth`, `database`, `patients`, `providers`,
`appointments`, `encounters`, `frontend`, `dashboard`, `layout`

Examples from this repository:

```text
feat(api): add database readiness endpoint
fix(auth): disable development bypass in production
docs(modules): document current feature modules and file conventions
```

Keep each commit to one logical change. A commit that fixes a bug should not
also reformat unrelated files.

## Checks

CI runs these on every pull request. Run them locally first:

```bash
# Backend
cd backend
npm run prisma:generate
npm run type-check

# Frontend
cd frontend
npm run lint
npm run build
```

## Code conventions

- **Backend modules** follow the layout described in
  [`backend/src/modules/README.md`](backend/src/modules/README.md): routes,
  controller, service, and Zod validation per feature.
- **Tenant isolation:** every query on tenant data must be scoped by
  `organizationId`.
- **Errors:** throw the `AppError` subclasses from `backend/src/shared/errors`
  rather than sending error responses by hand.
- **Responses:** use the helpers in `backend/src/shared/utils/response.ts` so
  every endpoint returns the standard `{ success, message, data, meta? }`
  envelope.
- **Secrets:** never commit `.env` files, credentials, or real patient data.
  Use the seed script and obviously fake data in examples and tests.
