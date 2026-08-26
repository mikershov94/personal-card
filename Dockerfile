FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /workspace


FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile

FROM dependencies AS development

COPY apps/api ./apps/api

EXPOSE 3000

CMD ["pnpm", "--filter", "api", "start:dev"]

FROM development AS build

RUN pnpm --filter api build

FROM base AS production-dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --prod --frozen-lockfile


#--------------------------------------------------------------

FROM node:24-alpine AS production

ENV NODE_ENV="production"

WORKDIR /workspace


COPY --from=production-dependencies --chown=node:node \
    /workspace/node_modules \
    ./node_modules

COPY --from=production-dependencies --chown=node:node \
    /workspace/apps/api/node_modules \
    ./apps/api/node_modules

COPY --from=build --chown=node:node \
    /workspace/apps/api/dist \
    ./apps/api/dist

USER node

EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]

