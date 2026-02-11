# HeartHub
A plattform for friends and couples to share memories and daily routines.

## Project Structure

This is a monorepo containing:
- **apps/api**: NestJS backend with Prisma ORM
- **apps/web**: Next.js frontend application

## Quick Start

### Local Development with Docker

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Keycloak configuration

3. Start all services:
   ```bash
   docker-compose up -d
   ```

4. Access the applications:
   - Web: http://localhost:3002
   - API: http://localhost:3000
   - Database: localhost:5432

### Development without Docker

#### API Setup
```bash
cd apps/api
npm install
npx prisma migrate dev
npm run start:dev
```

#### Web Setup
```bash
cd apps/web
npm install
npm run dev
```

## Docker & CI/CD

For detailed information about Docker images and GitHub Actions workflows, see [DOCKER.md](./DOCKER.md).

### Building Docker Images

```bash
# Build API
docker build -t hearthub-api ./apps/api

# Build Web
docker build -t hearthub-web ./apps/web
```

### Automated Builds

GitHub Actions automatically builds and pushes Docker images to GitHub Container Registry when:
- Code is pushed to `main` or `develop` branches
- Pull requests are created

Only the images for changed applications are built, optimizing CI/CD time.

## Documentation

- [Docker Setup](./DOCKER.md) - Detailed Docker and CI/CD documentation
- [Architecture](./agent-docs/architecture.md) - System architecture
- [Backend Plan](./agent-docs/backend-plan.md) - Backend implementation details
- [Frontend Plan](./agent-docs/frontend-plan.md) - Frontend implementation details

