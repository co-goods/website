#!/bin/bash
set -e
git config --global url."https://${GRUND_TOKEN}@github.com/".insteadOf "https://github.com/"

# Force-reset both submodules. Vercel's initial clone leaves them with
# HEAD ref but possibly-empty working tree; a plain `git submodule update`
# sees them as "already initialized" and doesn't repopulate. Remove the
# directories so the update does a clean fresh clone.
rm -rf content grund
git submodule update --init --recursive

echo '=== content SHA ==='
git -C content rev-parse HEAD
echo '=== content top-level ==='
ls content
echo '=== content/research ==='
ls content/research 2>/dev/null || echo 'MISSING'
echo '=== content/thinking ==='
ls content/thinking 2>/dev/null || echo 'MISSING'

npm install
