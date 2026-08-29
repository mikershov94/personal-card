#!/bin/sh

set -eu

if [ -n "${DATABASE_CA_CERT_BASE64:-}" ]; then
    database_ca_cert_path='/tmp/database-ca.crt'

    echo 'Configuring database CA certificate...'
    printf '%s' "$DATABASE_CA_CERT_BASE64" | base64 -d > "$database_ca_cert_path"

    if ! grep -q '^-----BEGIN CERTIFICATE-----$' "$database_ca_cert_path"; then
        echo 'DATABASE_CA_CERT_BASE64 does not contain a valid PEM certificate.' >&2
        exit 1
    fi

    chmod 600 "$database_ca_cert_path"
    export NODE_EXTRA_CA_CERTS="$database_ca_cert_path"
fi

echo 'Applying database migrations...'
./apps/api/node_modules/.bin/prisma migrate deploy --config ./apps/api/prisma.config.ts

echo 'Starting API...'
exec node ./apps/api/dist/src/main.js
