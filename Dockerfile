# ---- Stage 1: build frontend and backend ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/backend/package*.json ./packages/backend/

RUN npm ci

COPY packages ./packages

RUN npm run build

# ---- Stage 2: production image ----
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/backend/package*.json ./packages/backend/

RUN npm ci --omit=dev

# Compiled backend
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Frontend static files served by the backend at /
COPY --from=builder /app/packages/frontend/dist ./packages/backend/dist/client

EXPOSE 3001

CMD ["node", "packages/backend/dist/main.js"]
