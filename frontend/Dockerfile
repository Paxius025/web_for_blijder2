# Stage 1: Build static files
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx expo export --platform web

# Stage 2: Serve static files
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 8081
CMD ["serve", "-s", "dist", "-l", "8081"]
