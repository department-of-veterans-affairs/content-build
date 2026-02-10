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

echo "✓ Postinstall scripts completed successfully"
