# MediFlow Feature Modules

Each feature module groups its API routes, controller, service, and request
validation. Modules with additional domain types also include a `types.ts`
file.

## Current modules

- `auth` — registration, login, profile, and password management
- `organizations` — organization settings and operational counts
- `users` — tenant-scoped user management
- `patients` — patient records and statistics
- `providers` — provider records
- `insurance` — patient insurance policies
- `appointments` — appointment scheduling
- `encounters` — clinical encounters

## Module structure

```text
modules/
├── feature/
│   ├── controller.ts   # HTTP request handling
│   ├── routes.ts       # Route definitions and middleware
│   ├── service.ts      # Business logic and database access
│   ├── validation.ts   # Zod request schemas
│   └── types.ts        # Optional feature-specific types
└── README.md
```

Keep business logic in services, use controllers to translate HTTP requests
into service calls, and validate incoming data in routes before invoking
controllers.
