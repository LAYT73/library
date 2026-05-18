# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build application
RUN npm run build

# Compile seed.ts to seed.js
RUN npm run build && npx tsc prisma/seed.ts --outDir prisma --module commonjs --target es2020 --skipLibCheck true

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

# Copy full node_modules from builder (including prisma CLI and client)
COPY --from=builder /app/node_modules ./node_modules

# Copy prisma schema and seed
COPY prisma ./prisma
COPY --from=builder /app/prisma/seed.js ./prisma/seed.js

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "./node_modules/.bin/prisma db push --skip-generate && node prisma/seed.js && node dist/src/main"]
# CMD ["npm", "run", "start:prod"]
