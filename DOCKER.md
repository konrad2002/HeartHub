# Docker and CI/CD Setup

This document describes the Docker and GitHub Actions setup for the HeartHub project.

## Overview

The project consists of two main applications:
- **API**: NestJS backend with Prisma ORM
- **Web**: Next.js frontend

Each application has its own Dockerfile and is built as a separate Docker image.

## Docker Images

### API Image

**Location**: `apps/api/Dockerfile`

The API Dockerfile:
- Uses multi-stage build for optimization
- Generates Prisma Client during build
- Includes only production dependencies in final image
- Exposes port 3000 by default

**Build locally**:
```bash
cd apps/api
docker build -t hearthub-api .
```

**Run locally**:
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  hearthub-api
```

### Web Image

**Location**: `apps/web/Dockerfile`

The Web Dockerfile:
- Uses multi-stage build with standalone output mode
- Creates non-root user for security
- Optimized for Next.js production deployment
- Exposes port 3000 by default

**Build locally**:
```bash
cd apps/web
docker build -t hearthub-web .
```

**Run locally**:
```bash
docker run -p 3000:3000 \
  -e KEYCLOAK_ISSUER="..." \
  -e KEYCLOAK_CLIENT_ID="..." \
  -e KEYCLOAK_CLIENT_SECRET="..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="..." \
  hearthub-web
```

## GitHub Actions Workflow

**Location**: `.github/workflows/build-docker-images.yml`

### Features

1. **Change Detection**: Only builds images for apps that have changed
   - Uses `dorny/paths-filter` to detect changes in `apps/api/**` or `apps/web/**`
   - Skips builds for unchanged applications

2. **Image Registry**: Pushes to GitHub Container Registry (ghcr.io)
   - Images are tagged with branch name, commit SHA, and `latest` for main branch
   - Accessible at `ghcr.io/<owner>/hearthub-api` and `ghcr.io/<owner>/hearthub-web`

3. **Caching**: Uses GitHub Actions cache for Docker layers
   - Significantly speeds up subsequent builds
   - Cache is shared across workflow runs

4. **Security**: Uses minimal permissions
   - Only requires `contents: read` and `packages: write`

### Triggers

The workflow runs on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop` branches

### Environment Variables

The workflow uses the following environment variables:
- `REGISTRY`: Set to `ghcr.io` (GitHub Container Registry)
- `IMAGE_PREFIX`: Automatically set to repository owner

### Image Tags

Images are tagged with:
- Branch name (e.g., `main`, `develop`)
- Commit SHA with branch prefix (e.g., `main-abc1234`)
- `latest` tag for default branch only
- PR number for pull requests

## Local Development

### Building with Docker Compose (Optional)

You can create a `docker-compose.yml` in the root directory for local development:

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/hearthub
    depends_on:
      - db

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3002:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://api:3000
      KEYCLOAK_ISSUER: ${KEYCLOAK_ISSUER}
      KEYCLOAK_CLIENT_ID: ${KEYCLOAK_CLIENT_ID}
      KEYCLOAK_CLIENT_SECRET: ${KEYCLOAK_CLIENT_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3002

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: hearthub
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Prisma Setup

The API Dockerfile automatically generates the Prisma Client during the build process:

1. Copies the `prisma` directory
2. Runs `npx prisma generate` to create the client
3. Copies the generated client to the production image

### Running Migrations

Migrations should be run separately before starting the API container:

```bash
docker run --rm \
  -e DATABASE_URL="postgresql://..." \
  hearthub-api \
  npx prisma migrate deploy
```

Or include a migration step in your deployment process.

## Production Deployment

### Prerequisites

1. Set up GitHub Container Registry access
2. Configure environment variables in your deployment platform
3. Ensure database is accessible from containers

### Pulling Images

```bash
# Pull latest images
docker pull ghcr.io/<owner>/hearthub-api:latest
docker pull ghcr.io/<owner>/hearthub-web:latest
```

### Environment Variables

**API**:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Should be set to `production`

**Web**:
- `KEYCLOAK_ISSUER`: Keycloak server URL
- `KEYCLOAK_CLIENT_ID`: OAuth client ID
- `KEYCLOAK_CLIENT_SECRET`: OAuth client secret
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `NEXTAUTH_URL`: Public URL of the web application
- `NEXT_PUBLIC_API_URL`: API endpoint URL

## Troubleshooting

### Image not building in CI

- Check that changes were made in the correct directory (`apps/api` or `apps/web`)
- Verify GitHub Actions workflow file syntax
- Check GitHub Actions logs for specific errors

### Prisma Client not found in API

- Ensure `npx prisma generate` runs during Docker build
- Verify that Prisma Client is copied from builder stage

### Next.js standalone build issues

- Ensure `output: 'standalone'` is set in `next.config.ts`
- Check that all required files are copied in Dockerfile

### Permission issues with Web container

- The Web container runs as non-root user `nextjs` (UID 1001)
- Ensure file permissions are correct if mounting volumes

