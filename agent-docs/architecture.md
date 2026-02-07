# Architecture

## Overview
- Web: Next.js (TypeScript)
- iOS: Swift + SwiftUI
- Android: Kotlin + Jetpack Compose
- Backend: Node.js + TypeScript (NestJS or Fastify)
- Auth: Keycloak (OIDC)
- DB: PostgreSQL + Prisma
- Container: Docker Compose

## Key Principles
- API-first with explicit contracts (OpenAPI).
- Shared types and client SDKs generated from API schema.
- Separate domain modules for notes, workouts, places, recipes.

## High-Level Flow
1. Client authenticates via Keycloak OIDC.
2. Client calls backend with access token.
3. Backend validates token and enforces couple membership.
4. Backend persists and queries data in PostgreSQL.
5. Dashboard aggregates recent and upcoming items.

## Modules
- Auth: token validation and user mapping.
- Couples: membership and permissions.
- Notes: quick capture and pinned items.
- Workouts: structured training entries.
- Places: visited and wishlist entries.
- Recipes: planned and cooked entries.
- Feed: unified timeline for dashboard.

## API Strategy
- REST with OpenAPI schema.
- CRUD endpoints per module.
- Aggregation endpoint for dashboard feed.

## Data Model (Outline)
- User: id, email, name
- Couple: id, name
- CoupleMember: userId, coupleId, role
- Note: id, coupleId, authorId, title, body, pinned, createdAt
- Workout: id, coupleId, authorId, date, duration, tags
- PlaceVisited: id, coupleId, authorId, name, date, notes
- PlaceWishlist: id, coupleId, authorId, name, priority, notes
- Recipe: id, coupleId, authorId, title, ingredients, steps, status
- FeedItem: type, entityId, createdAt

## Deployment
- Docker Compose for local dev and staging.
- One container each: api, postgres, keycloak.
- Migrations run on api startup.

## Observability (Later)
- Basic structured logs.
- Error tracking (Sentry or similar).
