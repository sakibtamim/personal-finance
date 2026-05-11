#!/usr/bin/env bash
# deploy-remote.sh — Runs on the target server after artifact upload.
# Extracts the deploy archive, preserves .env, and restarts PM2.
#
# Required env:
#   TARGET — absolute path to the deployment directory

set -euo pipefail

# Source shell profile so node/npm/pm2 are in PATH for non-interactive SSH
for profile in "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile" "$HOME/.nvm/nvm.sh"; do
  if [ -f "$profile" ]; then
    # shellcheck disable=SC1090
    source "$profile" 2>/dev/null || true
  fi
done

# --- Validate TARGET ---

if [ -z "${TARGET:-}" ]; then
  echo "ERROR: TARGET env var is required (deployment directory path)."
  exit 1
fi

# Resolve to absolute path and block dangerous values
TARGET="$(realpath "${TARGET}")"

if [ "${TARGET}" = "/" ]; then
  echo "ERROR: TARGET must not be the filesystem root."
  exit 1
fi

if [ ! -d "${TARGET}" ]; then
  echo "ERROR: TARGET directory does not exist: ${TARGET}"
  exit 1
fi

if [ ! -f "${TARGET}/deploy.tar.gz" ]; then
  echo "ERROR: deploy.tar.gz not found in ${TARGET}. Aborting to prevent accidental wipe."
  exit 1
fi

echo "==> Deploying to ${TARGET}"

cd "${TARGET}"

# --- Backup .env using a secure temp file ---

ENV_BACKUP=""
cleanup_backup() {
  if [ -n "${ENV_BACKUP}" ] && [ -f "${ENV_BACKUP}" ]; then
    rm -f "${ENV_BACKUP}"
  fi
}
trap cleanup_backup EXIT

if [ -f .env ]; then
  echo "==> Backing up .env"
  ENV_BACKUP="$(mktemp)"
  chmod 600 "${ENV_BACKUP}"
  mv .env "${ENV_BACKUP}"
fi

# --- Clean old deployment files ---

echo "==> Cleaning old deployment files"
find . -mindepth 1 \
  ! -name "deploy.tar.gz" \
  ! -name "deploy-remote.sh" \
  -delete

# --- Extract new artifact ---

echo "==> Extracting deploy.tar.gz"
tar -xzf deploy.tar.gz

# --- Restore .env ---

if [ -n "${ENV_BACKUP}" ] && [ -f "${ENV_BACKUP}" ]; then
  echo "==> Restoring .env"
  mv "${ENV_BACKUP}" .env
  ENV_BACKUP=""
fi

# --- Restart PM2 ---

echo "==> Restarting PM2 process"
if pm2 describe personal-finance > /dev/null 2>&1; then
  pm2 restart ecosystem.config.js
else
  pm2 start ecosystem.config.js
fi

pm2 save

# --- Clean up archive (only after successful PM2 restart) ---

rm -f deploy.tar.gz deploy-remote.sh

echo "==> Deployment complete"
