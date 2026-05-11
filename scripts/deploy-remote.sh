#!/usr/bin/env bash
# deploy-remote.sh — Runs on the target server after artifact upload.
# Extracts the deploy archive, preserves .env, and restarts PM2.
#
# Required env:
#   TARGET — absolute path to the deployment directory

set -euo pipefail

if [ -z "${TARGET:-}" ]; then
  echo "ERROR: TARGET env var is required (deployment directory path)."
  exit 1
fi

echo "==> Deploying to ${TARGET}"

cd "${TARGET}"

# 1. Preserve .env if it exists
if [ -f .env ]; then
  echo "==> Backing up .env"
  cp .env /tmp/.env.deploy-backup
fi

# 2. Remove old app files (keep .env backup, deploy archive, and deploy script)
echo "==> Cleaning old deployment files"
find "${TARGET}" -mindepth 1 \
  ! -name "deploy.tar.gz" \
  ! -name "deploy-remote.sh" \
  ! -name ".env" \
  -delete 2>/dev/null || true

# 3. Extract new artifact
echo "==> Extracting deploy.tar.gz"
tar -xzf deploy.tar.gz

# 4. Restore .env
if [ -f /tmp/.env.deploy-backup ]; then
  echo "==> Restoring .env"
  cp /tmp/.env.deploy-backup .env
  rm -f /tmp/.env.deploy-backup
fi

# 5. Clean up archive
rm -f deploy.tar.gz deploy-remote.sh

# 6. Restart PM2
echo "==> Restarting PM2 process"
if pm2 describe personal-finance > /dev/null 2>&1; then
  pm2 restart ecosystem.config.js
else
  pm2 start ecosystem.config.js
fi

pm2 save

echo "==> Deployment complete"
