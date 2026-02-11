# Stage 1: Build stage

CMD ["node", "dist/main"]
# Start the application

EXPOSE 3000
# Expose port (adjust if your app uses a different port)

COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy generated Prisma Client from builder stage

COPY --from=builder /app/dist ./dist
# Copy built application from builder stage

COPY prisma ./prisma/
# Copy prisma schema for runtime

RUN npm ci --only=production
# Install production dependencies only

COPY package.json package-lock.json* ./
# Copy package files

ENV NODE_ENV=production
# Set NODE_ENV to production

WORKDIR /app

FROM node:20-alpine AS runner
# Stage 2: Production stage

RUN npm run build
# Build the application

COPY . .
# Copy source code

RUN npx prisma generate
# Generate Prisma Client

COPY prisma ./prisma/
# Copy prisma schema

RUN npm ci
# Install dependencies

COPY package.json package-lock.json* ./
# Copy package files

WORKDIR /app

FROM node:20-alpine AS builder
