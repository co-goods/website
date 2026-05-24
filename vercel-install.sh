#!/bin/bash
set -e
git config --global url."https://${GRUND_TOKEN}@github.com/".insteadOf "https://github.com/"
git submodule update --init --recursive --depth 1

echo '=== content SHA ==='
git -C content rev-parse HEAD
echo '=== content top-level ==='
ls content
echo '=== content/research ==='
ls content/research 2>/dev/null || echo 'MISSING'
echo '=== content/thinking ==='
ls content/thinking 2>/dev/null || echo 'MISSING'
echo '=== content/resources ==='
ls content/resources 2>/dev/null || echo 'MISSING'
echo '=== DEV_MODE ENV ==='
echo "NEXT_PUBLIC_DEV_MODE=[${NEXT_PUBLIC_DEV_MODE:-UNSET}]"

npm install
