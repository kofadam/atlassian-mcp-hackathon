#!/bin/bash

# Commit and push all changes

echo "📝 Staging all changes..."
git add .

echo ""
echo "📊 Files to be committed:"
git status --short

echo ""
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Complete web UI with natural language interface for Atlassian MCP

- Natural language AI assistant for Jira & Confluence
- Beautiful web interface with real-time chat
- Project summary dashboards and visual issue cards
- Intelligent search with plain English queries
- Support for bugs, issues, and Confluence pages
- Zero infrastructure cost using Atlassian's hosted MCP
- Production-ready with OAuth authentication
- Updated documentation to reflect web-first approach"
fi

echo ""
echo "💾 Committing with message:"
echo "$COMMIT_MSG"
echo ""

git commit -m "$COMMIT_MSG"

echo ""
read -p "Push to remote? (y/n): " PUSH_CONFIRM

if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
    echo ""
    echo "🚀 Pushing to remote..."
    git push
    echo ""
    echo "✅ Done! Your code is now on GitHub."
    echo ""
    echo "🌐 View your repo:"
    git remote get-url origin
else
    echo ""
    echo "✅ Committed locally. Run 'git push' when ready."
fi

echo ""