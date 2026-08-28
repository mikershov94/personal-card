#!/bin/sh

set -eu

echo 'Applying database migrations...'
./apps/api/node_modules/.bin/prisma migrate deploy --config ./apps/api/prisma.config.ts

echo 'Starting API...'
exec node ./apps/api/dist/src/main.js
