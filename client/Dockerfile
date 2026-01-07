# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
# Remove package-lock.json to avoid platform incompatibility with optional dependencies (rollup-linux-x64-gnu)
RUN rm -f package-lock.json && npm install
COPY . .
ARG REACT_APP_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
RUN npm run build

# Stage 2: Serve (using nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
