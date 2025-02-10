FROM node:20 AS base
WORKDIR /app

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

FROM node:20-alpine3.20 AS release
WORKDIR /app

RUN npm i -g pnpm

COPY --from=base /app .

EXPOSE 3000

CMD ["pnpm", "dev"]