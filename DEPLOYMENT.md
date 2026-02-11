# Docker Deployment Guide

## Runtime Environment Variables

The Next.js application now supports runtime configuration of the API base URL without rebuilding the image.

### Using Pre-built Images

Once the image is built, you can set the `NEXT_PUBLIC_API_BASE_URL` environment variable when running the container, and it will be injected at startup.

#### Docker Run Example

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

#### Docker Compose Example

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

#### Docker Swarm Example

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

## How It Works

1. The Dockerfile includes a `docker-entrypoint.sh` script that runs on container startup
2. This script generates `/app/public/env-config.js` with the environment variables from the running container
3. The HTML includes this script before other application code loads
4. All components read the API URL from `window.__ENV__.NEXT_PUBLIC_API_BASE_URL` at runtime
5. No rebuild is needed when changing the API URL

## Building the Image

Only build once with a default configuration:

```bash
docker build -t hearthub-web:latest ./apps/web
```

Then use the same image everywhere with different environment variables.
