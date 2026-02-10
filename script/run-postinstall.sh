#!/bin/bash
# Shared postinstall script for content-build
# Runs any necessary postinstall steps for trusted packages.
# Used by CI workflows and local development after `yarn install-safe`.
#
# Currently no packages require postinstall steps (native/gyp deps removed).
# This script is kept as a hook for future packages that may need it.

set -euo pipefail

if [ ! -d "node_modules" ]; then
  echo "Error: node_modules not found. Run yarn install-safe first."
  exit 1
fi

# Add trusted postinstall commands here as needed.

echo "✓ Postinstall check completed (no steps currently required)"
