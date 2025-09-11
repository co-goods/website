#!/bin/bash
# Script to update whitepaper content from the submodule

echo "Updating whitepaper content..."
git submodule update --remote --merge whitepaper

echo "Content updated! Run 'npm run dev' to see changes locally."