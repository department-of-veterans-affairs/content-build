#!/bin/bash
# Safe install wrapper for content-build.
# Runs `yarn install --ignore-scripts` and then selectively runs trusted
# postinstall steps needed for this repo to build.

set -euo pipefail

echo "Running yarn install with --ignore-scripts..."

yarn install --ignore-scripts "$@"

./script/run-postinstall.sh
