FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY app/web/package.json app/web/
RUN npm ci 2>/dev/null || npm install

# Build web app
COPY app/web/ app/web/
RUN npm run build -w @hive/web

# Production image using standalone output
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone server and static/public assets
COPY --from=base /app/app/web/.next/standalone ./
COPY --from=base /app/app/web/.next/static ./app/web/.next/static
COPY --from=base /app/app/web/public ./app/web/public

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# NEXT_PUBLIC_API_URL is read at runtime by server components via getApiUrl()
CMD ["node", "app/web/server.js"]
