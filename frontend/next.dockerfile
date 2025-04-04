# --- Base Stage (Dependencies) ---
FROM node:20-alpine AS base

WORKDIR /app

RUN npm install -g pnpm

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
# Use --frozen-lockfile for reproducible installs
RUN pnpm install --frozen-lockfile

# --- Builder Stage ---
FROM base AS builder

# Copy the rest of the source code
COPY . .

# Copy environment variables needed for build time (if any)
# Ensure this file exists or handle its absence
# COPY .env.production .env.production

# Build the Next.js application
# Pass build-time env vars if needed via ARG and --build-arg
# Example: ARG NEXT_PUBLIC_SOME_VAR
# ENV NEXT_PUBLIC_SOME_VAR=$NEXT_PUBLIC_SOME_VAR
RUN pnpm build

# --- Runner Stage ---
FROM base AS runner

# Copy built artifacts from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Copy only necessary node_modules for production runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the Next.js app runs on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

CMD ["pnpm", "start"]