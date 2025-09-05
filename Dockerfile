# Use Node.js 18 Alpine como base
FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY bun.lockb ./

# Instalar dependências (pular scripts de preparação)
RUN npm ci --only=production --ignore-scripts

# Build stage
FROM base AS builder
WORKDIR /app

# Copiar código fonte
COPY . .

# Instalar todas as dependências (incluindo devDependencies, pular scripts)
RUN npm ci --ignore-scripts

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copiar arquivos de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
