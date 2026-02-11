# Docker Deployment Guide

## Frontend (Next.js Web App)

### Runtime Environment Variables

The Next.js application now supports runtime configuration of the API base URL without rebuilding the image.

#### Using Pre-built Images

Once the image is built, you can set the `NEXT_PUBLIC_API_BASE_URL` environment variable when running the container, and it will be injected at startup.

##### Docker Run Example

```bash
docker run \
  -e NEXT_PUBLIC_API_BASE_URL=https://heart-api.konrad2002.de \
  -e NEXTAUTH_URL=https://app.konrad2002.de \
  -e NEXTAUTH_SECRET=your-secret \
  -e KEYCLOAK_ISSUER=https://auth.swimresults.de/realms/hearthub \
  -e KEYCLOAK_CLIENT_ID=app-web-pkce \
  -e KEYCLOAK_CLIENT_SECRET=your-secret \
  -p 3000:3000 \
  hearthub-web
```

##### Docker Compose Example

```yaml
services:
  web:
    image: your-registry/hearthub-web:latest
    environment:
      NEXT_PUBLIC_API_BASE_URL: https://heart-api.konrad2002.de
      NEXTAUTH_URL: https://app.konrad2002.de
      NEXTAUTH_SECRET: your-secret
      KEYCLOAK_ISSUER: https://auth.swimresults.de/realms/hearthub
      KEYCLOAK_CLIENT_ID: app-web-pkce
      KEYCLOAK_CLIENT_SECRET: your-secret
    ports:
      - "3000:3000"
```

##### Docker Swarm Example

```bash
docker service create \
  --name hearthub-web \
  -e NEXT_PUBLIC_API_BASE_URL=https://heart-api.konrad2002.de \
  -e NEXTAUTH_URL=https://app.konrad2002.de \
  -e NEXTAUTH_SECRET=your-secret \
  -e KEYCLOAK_ISSUER=https://auth.swimresults.de/realms/hearthub \
  -e KEYCLOAK_CLIENT_ID=app-web-pkce \
  -e KEYCLOAK_CLIENT_SECRET=your-secret \
  -p 3000:3000 \
  your-registry/hearthub-web:latest
```

#### How It Works

1. The Dockerfile includes a `docker-entrypoint.sh` script that runs on container startup
2. This script generates `/app/public/env-config.js` with the environment variables from the running container
3. The HTML includes this script before other application code loads
4. All components read the API URL from `window.__ENV__.NEXT_PUBLIC_API_BASE_URL` at runtime
5. No rebuild is needed when changing the API URL

#### Building the Image

Only build once with a default configuration:

```bash
docker build -t hearthub-web:latest ./apps/web
```

Then use the same image everywhere with different environment variables.

---

## Backend (NestJS API)

### Database Migrations

The API Dockerfile automatically runs Prisma migrations on container startup before starting the application.

#### Migration Process

1. When the container starts, `prisma migrate deploy` runs first
2. This applies all pending migrations from `./prisma/migrations`
3. Only migrations not yet applied to the database are executed
4. If any migration fails, the container will exit with an error (safe to retry)
5. Once migrations succeed, the NestJS application starts

#### Docker Run Example

```bash
docker run \
  -e DATABASE_URL=postgresql://user:password@db-host:5432/hearthub \
  -e NODE_ENV=production \
  -p 3000:3000 \
  hearthub-api
```

#### Docker Compose Example

```yaml
services:
  api:
    image: your-registry/hearthub-api:latest
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/hearthub
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "3001:3000"
```

#### Docker Swarm Example

```bash
docker service create \
  --name hearthub-api \
  -e DATABASE_URL=postgresql://user:password@db-host:5432/hearthub \
  -e NODE_ENV=production \
  -p 3001:3000 \
  your-registry/hearthub-api:latest
```

#### Important Notes

- **Ensure DATABASE_URL is set correctly** before starting the container
- The database must be accessible before the container starts
- Migrations are idempotent and safe to re-run
- If a migration fails, check database connectivity and fix the issue, then restart the container
- Always backup your database before running migrations in production

#### Building the Image

```bash
docker build -t hearthub-api:latest ./apps/api
```

---

## Building Both Images

```bash
# Frontend
docker build -t hearthub-web:latest ./apps/web

# Backend
docker build -t hearthub-api:latest ./apps/api
```

Or use a build script if pushing to a registry:

```bash
TAG=my-registry/hearthub

docker build -t $TAG-web:latest ./apps/web
docker push $TAG-web:latest

docker build -t $TAG-api:latest ./apps/api
docker push $TAG-api:latest
```
