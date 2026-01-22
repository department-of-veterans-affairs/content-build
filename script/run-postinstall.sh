#!/bin/bash
# Shared postinstall script for content-build
# This script runs necessary postinstall steps for trusted packages.
# Used by CI workflows and local development after `yarn install-safe`.

set -euo pipefail

echo "Running postinstall scripts for trusted packages..."

if [ ! -d "node_modules" ]; then
  echo "Error: node_modules not found. Run yarn install-safe first."
  exit 1
fi

run_pkg_cmd() {
  local pkg="$1"
  local step_name="$2"
  shift 2

  if [ ! -d "node_modules/${pkg}" ]; then
    echo "→ Skipping ${pkg} (${step_name}): not installed"
    return 0
  fi

  echo "→ Running ${step_name} for ${pkg}..."
  (cd "node_modules/${pkg}" && "$@")
}

# Native deps that must build/download binaries.
run_pkg_cmd "node-libcurl" "install" ../.bin/node-pre-gyp install --fallback-to-build
run_pkg_cmd "node-libcurl" "postinstall" node scripts/postinstall

run_pkg_cmd "node-sass" "install" node scripts/install.js
run_pkg_cmd "node-sass" "postinstall" node scripts/build.js

echo "✓ Postinstall scripts completed successfully"
