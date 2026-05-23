#!/bin/bash
# Script to update content from the submodule

echo "Updating content..."
git submodule update --remote --merge content

echo "Content updated! Run 'npm run dev' to see changes locally."
