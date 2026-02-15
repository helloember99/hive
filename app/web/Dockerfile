FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY app/web/package.json app/web/
RUN npm ci 2>/dev/null || npm install

# Build web app — NEXT_PUBLIC_API_URL is needed at build time for client bundles
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY app/web/ app/web/
RUN npm run build -w @hive/web

EXPOSE 3001
CMD ["npm", "run", "start", "-w", "@hive/web"]
