#!/bin/bash
# scripts/push_to_github.sh

set -e

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
    echo "Usage: $0 <github_repo_url>"
    echo "Example: $0 https://github.com/username/vovera-v2.git"
    exit 1
fi

echo "Initializing git repository..."
git init
git add .
git commit -m "Initial commit: VOVERA v2.0 codebase"

echo "Adding remote..."
git remote add origin $REPO_URL

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "Done!"
