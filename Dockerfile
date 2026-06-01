FROM node:22-alpine AS exporter

WORKDIR /workspace

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json vitest.config.ts ./
COPY apps ./apps
COPY fixtures ./fixtures
COPY packages ./packages

RUN pnpm install --no-frozen-lockfile
RUN pnpm run export:schemas -- --output /tmp/catalog-public

FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY --from=exporter /tmp/catalog-public/ /usr/share/nginx/html/

EXPOSE 8080
