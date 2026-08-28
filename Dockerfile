FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /workspace


FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

FROM dependencies AS development

COPY apps/api ./apps/api

RUN DATABASE_URL=postgresql://prisma:prisma@localhost:5432/prisma \
    pnpm --filter api db:generate

EXPOSE 3000

CMD ["pnpm", "--filter", "api", "start:dev"]

FROM development AS build

RUN pnpm --filter api build

FROM base AS production-dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --prod --frozen-lockfile


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

COPY --from=build --chown=node:node \
    /workspace/apps/api/prisma \
    ./apps/api/prisma

COPY --from=build --chown=node:node \
    /workspace/apps/api/prisma.config.ts \
    ./apps/api/prisma.config.ts

COPY --chown=node:node docker/api-entrypoint.sh ./docker/api-entrypoint.sh

RUN chmod +x ./docker/api-entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["./docker/api-entrypoint.sh"]

