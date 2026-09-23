# ==========================================================
# STAGE 1: Build Stage (Node.js Environment)
# ==========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies strictly according to package-lock.json
RUN npm ci

# Copy application source code
COPY . .

# Build static production bundle into /app/dist
RUN npm run build

# ==========================================================
# STAGE 2: Production Runtime Stage (Ultra-Light Nginx)
# ==========================================================
FROM nginx:alpine

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Deploy custom Nginx config for Single Page Application (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx in foreground (daemon off) so the container doesn't exit immediately
CMD ["nginx", "-g", "daemon off;"]
