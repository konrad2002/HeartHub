# Frontend Plan (Next.js)

## Goals
- Ship a clean dashboard-first web app for project collaboration.
- Connect to the Nest API with authenticated requests.
- Keep the UI fast and simple for daily use.

## Stack
- Next.js (App Router, TypeScript)
- Auth: Keycloak OIDC (Authorization Code + PKCE)
- Styling: Tailwind or CSS modules (decide later)
- Data: REST API client (typed via OpenAPI later)

## Core Pages
- /login (redirect to Keycloak)
- /callback (handle OIDC redirect)
- /app (dashboard)
- /app/projects (list + create)
- /app/projects/[id] (project home)
- /app/projects/[id]/notes
- /app/projects/[id]/trainings
- /app/projects/[id]/locations
- /app/projects/[id]/members

## Dashboard (MVP)
- Recent notes, trainings, locations, and MOTD messages.
- Quick add actions.
- Project switcher.

## Data Flow
1. User authenticates with Keycloak.
2. Store access token in memory (or secure cookie).
3. Call API with `Authorization: Bearer <token>`.
4. Fetch /me to hydrate user profile.

## API Client Plan
- Start with a small `fetch` wrapper.
- Later: generate typed SDK from OpenAPI.

## Components
- Layout: app shell, sidebar, top bar.
- ProjectSwitcher
- FeedList
- QuickAdd
- MotdCard
- NotesList
- TrainingsList
- LocationsList
- MembersList

## Auth Integration
- Use `openid-client` or NextAuth (Keycloak provider).
- Prefer server-side session for web app.

## Error Handling
- Global error boundary for /app.
- Toast notifications for CRUD errors.

## Milestones
1) Auth + /app shell
2) Project list + create
3) Notes CRUD
4) Trainings CRUD
5) Locations CRUD
6) Members + invites
7) Dashboard feed aggregation

## Non-Goals (Now)
- Offline support
- File uploads
- Realtime updates
