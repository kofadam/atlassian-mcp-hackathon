# 🚀 Quick Reference Card

## Setup (One Time Only)

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd atlassian-mcp-hackathon
chmod +x setup.sh
./setup.sh

# 2. Authenticate (Terminal 1 - KEEP OPEN)
npx -y mcp-remote https://mcp.atlassian.com/v1/sse
# Browser opens → Login → Approve → Done

# 3. Start web server (Terminal 2)
npm run web

# 4. Open browser
http://localhost:3000
# Or from another machine: http://your-server-ip:3000
```

## Daily Usage

### Primary Interface - Web UI

```bash
# Terminal 1 (if not already running)
npx -y mcp-remote https://mcp.atlassian.com/v1/sse

# Terminal 2
npm run web

# Then open browser to http://localhost:3000
```

**Natural Language Queries:**
- "Show me all bugs"
- "Give me a project summary"
- "Find issues about OAuth"
- "What are all the open issues?"
- "Search for database problems"

### Alternative Commands

```bash
npm test          # Test MCP connection
npm run ai        # Terminal chat interface
npm run sprint    # CLI sprint report
npm run triage    # CLI bug triage
```

## File Structure

```
atlassian-mcp-hackathon/
├── src/
│   └── index.js              # Main application
├── package.json              # Dependencies
├── test-connection.js        # Connection tester
├── README.md                 # Full documentation
├── HACKATHON_PITCH.md        # Presentation guide
└── QUICK_REFERENCE.md        # This file
```

## Troubleshooting

### ❌ "Cannot connect to MCP Server"
- Start mcp-remote in another terminal
- Check OAuth was completed (browser opened?)

### ❌ "No results found"  
- Verify Jira/Confluence has data
- Check you're logged into correct account

### ❌ "Node version error"
```bash
nvm install 20
nvm use 20
```

## Demo Day Checklist

**Before presenting:**
- [ ] Start mcp-remote connection (Terminal 1)
- [ ] Test with `npm test` (Terminal 2)
- [ ] Run each demo once to verify
- [ ] Close unnecessary apps
- [ ] Set terminal font size large (18pt+)
- [ ] Turn off notifications

**During demo:**
1. `npm run sprint` - Show sprint analysis
2. `npm run release` - Generate release notes
3. `npm run triage` - Bug prioritization
4. Show GitHub repo
5. Q&A

## Key Talking Points

- ✅ **5-minute setup** from clone to running
- ✅ **Zero infrastructure** - Atlassian hosts the MCP server
- ✅ **Production-ready** - Not a toy, real tool
- ✅ **10+ hours saved** per team per week
- ✅ **Open source** - Any team can use it

## Available MCP Tools

```javascript
// Jira
jira_search_issues    // JQL queries
jira_get_issue        // Get single issue
jira_create_issue     // Create new issue
jira_update_issue     // Update existing

// Confluence  
confluence_search     // CQL queries
confluence_get_page   // Get page content
confluence_create_page // Create new page
confluence_update_page // Update existing
```

## Example JQL Queries

```javascript
// All open issues
'status != Done'

// Current sprint
'sprint in openSprints()'

// High priority bugs
'type = Bug AND priority = High'

// Recently completed
'status = Done AND resolved >= -7d'

// Assigned to me
'assignee = currentUser()'
```

## Example CQL Queries

```javascript
// All pages
'type=page'

// In specific space
'space=MCPDEMO'

// Recently updated
'lastModified >= now("-7d")'

// By label
'label=documentation'
```

## Emergency Backup

If live demo fails:
1. Show recorded video (pre-record!)
2. Show GitHub code + screenshots
3. Walk through the concept with slides

## Resources

- Atlassian MCP Docs: https://support.atlassian.com/rovo/docs/getting-started-with-the-atlassian-remote-mcp-server/
- MCP Protocol: https://modelcontextprotocol.io
- Your GitHub: [add your repo URL]

---

**Keep this card handy during hackathon! 📋**