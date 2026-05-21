#!/bin/bash
# Script to update research content from the submodule

echo "Updating research content..."
git submodule update --remote --merge research

echo "Content updated! Run 'npm run dev' to see changes locally."
