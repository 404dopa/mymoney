# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download
COPY backend/ ./backend/
RUN cd backend && CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server

# Stage 3: Production Image
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app

# Copy compiled backend binary
COPY --from=backend-builder /app/server /app/server

# Copy built frontend static assets
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV PORT=8095
EXPOSE 8095

CMD ["/app/server"]
