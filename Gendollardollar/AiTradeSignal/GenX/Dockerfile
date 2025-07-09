
# Multi-stage Dockerfile for GenZ Trading Bot Pro
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    python3-dev \
    postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY python/requirements.txt ./python/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN pip3 install --no-cache-dir -r python/requirements.txt

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    postgresql-client \
    ca-certificates

WORKDIR /app

# Copy node_modules from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /usr/lib/python3.11/site-packages /usr/lib/python3.11/site-packages

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S genzbot -u 1001

# Change ownership of the app directory
RUN chown -R genzbot:nodejs /app
USER genzbot

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
