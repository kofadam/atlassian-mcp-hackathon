#!/bin/bash

# Atlassian MCP Hackathon POC - Setup Script
# This script automates the initial setup process

set -e  # Exit on any error

echo "🚀 Atlassian MCP Hackathon POC - Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 20+ required. Current version: $(node --version)${NC}"
    echo -e "${YELLOW}Please upgrade Node.js:${NC}"
    echo "  Using NVM: nvm install 20 && nvm use 20"
    echo "  Or download from: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version OK: $(node --version)${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Make the main script executable
chmod +x src/index.js

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Authenticate with Atlassian MCP (in a separate terminal):${NC}"
echo "   npx -y mcp-remote https://mcp.atlassian.com/v1/sse"
echo ""
echo -e "${YELLOW}   ⚠️  KEEP THAT TERMINAL OPEN! The connection must stay active.${NC}"
echo ""
echo -e "${YELLOW}2. Back in this terminal, test the connection:${NC}"
echo "   npm start"
echo ""
echo -e "${YELLOW}3. Try the demo scenarios:${NC}"
echo "   npm run sprint     # Sprint planning report"
echo "   npm run release    # Release notes generator"
echo "   npm run triage     # Bug triage assistant"
echo "   npm run gaps       # Knowledge gap analyzer"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📚 Documentation:${NC}"
echo "   - README.md - Full documentation"
echo "   - HACKATHON_PITCH.md - Presentation guide"
echo ""
echo -e "${GREEN}🎉 Ready to build something awesome!${NC}"