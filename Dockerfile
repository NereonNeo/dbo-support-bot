FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run prisma:generate

ENV NODE_ENV=production
ENV HTTP_PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run start"]
