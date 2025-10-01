# Atlassian MCP Hackathon POC - Complete Project Summary

## Project Overview

**Repository:** https://github.com/kofadam/atlassian-mcp-hackathon.git

**Project Name:** Atlassian MCP Hackathon POC

**Description:** A natural language web interface for Jira and Confluence using Atlassian's Model Context Protocol (MCP). Users can ask questions in plain language ("Show me all bugs", "Give me a project summary") and get instant visual results.

**Status:** Complete and functional, ready for hackathon presentation.

---

## Technical Architecture

### Stack
- **Backend:** Node.js web server (`src/web-server.js`)
- **Frontend:** Vanilla HTML/CSS/JavaScript (`public/index.html`)
- **MCP Integration:** Uses `@modelcontextprotocol/sdk` to connect to Atlassian's hosted MCP server
- **Authentication:** OAuth 2.1 via Atlassian's mcp-remote proxy

### Flow
```
Browser → Web Server (port 3000) → mcp-remote proxy → Atlassian MCP Server → Jira/Confluence
```

### Key Files Structure
```
atlassian-mcp-hackathon/
├── src/
│   ├── web-server.js          # Primary: Web UI backend
│   ├── index.js               # Alternative: CLI tools
│   └── ai-assistant.js        # Alternative: Terminal chat
├── public/
│   └── index.html             # Web UI interface
├── create-mock-data.js        # Creates test Jira issues
├── fix-priorities.js          # Updates issue priorities
├── test-connection.js         # Tests MCP connection
├── README.md                  # Technical documentation
├── HACKATHON_PITCH.md         # English presentation guide
├── HACKATHON_PITCH_HE.md      # Hebrew presentation guide
└── QUICK_REFERENCE.md         # Demo day cheat sheet
```

---

## Setup Requirements

### Prerequisites
- Node.js v20+
- Atlassian Cloud account with Jira/Confluence
- Two terminal windows

### Installation
```bash
git clone https://github.com/kofadam/atlassian-mcp-hackathon.git
cd atlassian-mcp-hackathon
npm install
```

### First Run

**Terminal 1** (keep running):
```bash
npx -y mcp-remote https://mcp.atlassian.com/v1/sse
# OAuth browser window opens - authenticate with Atlassian
```

**Terminal 2**:
```bash
npm run web
# Server starts on http://localhost:3000
```

### Access
- Local: `http://localhost:3000`
- Network: `http://10.100.102.110:3000` (or your server IP)

---

## Key Features Implemented

### 1. Natural Language Queries
- **"Show me all bugs"** - Returns bug list with color-coded priority cards
- **"Give me a project summary"** - Dashboard with statistics
- **"Find issues about [topic]"** - Intelligent search
- **"What are all the open issues?"** - Full issue listing

### 2. Visual Interface
- Modern gradient design (purple/blue theme)
- Interactive issue cards with priority color coding
- Real-time project statistics dashboard
- Suggestion chips for common queries
- Responsive layout for different screen sizes

### 3. MCP Integration
- Uses `searchJiraIssuesUsingJql` for Jira queries
- Uses `searchConfluenceUsingCql` for Confluence queries
- OAuth authentication via mcp-remote proxy
- Respects existing Jira permissions
- Project-scoped queries to comply with Jira Cloud limitations

### 4. Mock Data Setup
- `npm run setup-data` - Creates 7 test issues in Jira
- Issue types: Bug, Story, Task
- Priorities: Highest, High, Medium, Low (if Priority field enabled)
- Realistic test data for demos

---

## Important Technical Details

### Jira Query Restrictions
All JQL queries MUST include `project = ${projectKey}` to avoid "Unbounded JQL queries" errors. This is a Jira Cloud performance limitation.

**Example:**
```javascript
// Wrong - will fail
jql: 'type = Bug AND status != Done'

// Correct
jql: 'project = KMD AND type = Bug AND status != Done'
```

### Priority Field Issue
The test Jira project doesn't have the Priority field enabled by default in the screen configuration. This means:
- Priority queries return 0 results
- Issues show as "Medium" priority regardless of actual setting
- Can be fixed by enabling Priority field in Jira Project Settings → Issue Types

### Network Configuration
- Web server listens on `0.0.0.0` (all network interfaces)
- Frontend uses relative URLs (`/api/query`) for cross-machine compatibility
- Allows demo from laptop connecting to server

### Available npm Scripts
```bash
# Primary interface
npm run web              # Launch web UI (PRIMARY)

# Development & testing
npm test                 # Test MCP connection
npm run setup-data       # Create mock Jira issues
npm run fix-priorities   # Update issue priorities

# Alternative interfaces
npm run ai               # Terminal chat interface
npm run sprint           # CLI sprint report
npm run triage           # CLI bug triage
npm run release          # CLI release notes
npm run gaps             # CLI knowledge gap analysis
```

---

## Current Issues & Limitations

### 1. Priority Field Not Configured
- Test Jira project created without Priority field in screen
- "High priority issues" query returns 0 results
- **Solution:** Enable Priority field in Jira or remove that query from demo

### 2. No Actual Claude API Integration
- Current implementation uses pattern matching for intent recognition
- Not actual LLM-powered natural language understanding
- Works well for demo but limited to predefined patterns
- **Future:** Integrate Claude API for more sophisticated NLU

### 3. Single Project Support
- Hardcoded to first project found in workspace (KMD)
- Doesn't support multi-project queries
- **Future:** Add project selector or multi-project queries

### 4. Limited Confluence Integration
- Only reads Confluence pages
- Cannot create/update pages via web UI
- Search works but display is basic
- **Future:** Add page creation and better formatting

### 5. No Persistent Storage
- Each request spawns new MCP connection
- No caching of results
- No session management
- **Future:** Add Redis for caching and session state

---

## Server Configuration

### Current Setup
- **Server:** Ubuntu at 10.100.102.110
- **Port:** 3000
- **CloudId:** 252a1017-b96e-41fc-8035-a3c27ec05bb5
- **Project Key:** KMD (kofiko-mcp-demo)
- **Issues Created:** 14 total (7 from initial setup, 7 duplicates from testing)

### mcp-remote Process
- Runs in separate terminal (Terminal 1)
- Must stay active for web server to work
- Uses port 5598 internally for proxy
- Handles OAuth token refresh automatically

---

## Hackathon Demo Strategy

### Target Audience
Technical judges at organization hackathon

### Key Selling Points
1. **Natural language interface** - Eliminates JQL learning curve
2. **Zero infrastructure cost** - Atlassian hosts MCP server
3. **Production-ready** - OAuth security, permission-aware
4. **5-minute setup** - From clone to running
5. **Real-time data** - No stale reports or caching delays

### Demo Flow (5 minutes)

**1. Opening (30 seconds)**
- Open browser to `http://your-server-ip:3000`
- Show clean, modern interface

**2. Natural Language Demo (3 minutes)**
- Click: "Show me all bugs" - Visual cards appear
- Type: "Give me a project summary" - Dashboard with stats
- Type: "Find issues about database" - Intelligent search

**3. Technical Highlights (1 minute)**
- Explain MCP protocol
- Zero infrastructure cost
- OAuth security
- Real-time data

**4. Q&A (30 seconds)**

### What Works Best for Demo
- Project summary (shows 14 issues, statistics)
- Show all bugs (visual impact with cards)
- Search functionality (demonstrates intelligence)

### What to Avoid in Demo
- High priority issues query (returns 0 due to Priority field)
- Complex multi-step queries (not implemented)
- Confluence write operations (read-only)

---

## Documentation Files

### README.md
Technical setup and usage guide. Focus on web UI as primary interface.

### HACKATHON_PITCH.md (English)
Complete presentation guide including:
- 5-slide deck outline
- 30-second elevator pitch
- 5-minute demo script
- Q&A responses
- Pre-demo checklist

### HACKATHON_PITCH_HE.md (Hebrew)
Full Hebrew translation of presentation guide for Hebrew-speaking audience.

### QUICK_REFERENCE.md
Cheat sheet for demo day with common commands and queries.

---

## For New Chat Context

### What Works
- Web UI at `http://localhost:3000` or `http://10.100.102.110:3000`
- Project summary query shows 14 total issues
- Bug listing displays correctly
- Visual cards with issue details
- Search functionality operational
- Confluence page search works

### What Needs Attention
1. Priority queries return 0 results (field not enabled in Jira)
2. Could integrate actual Claude API for better NLU
3. Could add Confluence page creation
4. Could support multiple projects
5. Could add data visualization (charts, graphs)

### Known Working Queries
- "Show me all bugs"
- "Give me a project summary"
- "Find issues about OAuth"
- "Show confluence pages"
- "Search for database"

### Environment Details
- Server: Ubuntu at 10.100.102.110
- Port: 3000
- Node.js: v20.19.5
- CloudId: 252a1017-b96e-41fc-8035-a3c27ec05bb5
- Project: KMD (kofiko-mcp-demo)
- Total Issues: 14

---

## Next Steps if Continuing

### Quick Wins
1. Enable Priority field in Jira for better demo
2. Add more example queries to suggestion chips
3. Improve error messages in UI
4. Add loading states and animations

### Medium Effort
1. Integrate Claude API for real NLU
2. Add Confluence page creation
3. Implement result caching
4. Add user preferences/settings
5. Support multiple projects

### Major Features
1. Full conversational AI with context memory
2. Advanced data visualization (charts, graphs)
3. Automated workflows (create issue → update confluence)
4. Integration with Slack/Teams for notifications
5. Deploy to cloud platform (Vercel, Railway, etc.)

---

## Deployment Options

### Current (Development)
Two terminals on Ubuntu server, manual start

### Quick Production
1. Use PM2 to manage processes
2. Add nginx reverse proxy
3. Add SSL certificate
4. Set up systemd services

### Cloud Deployment
1. Deploy to Railway/Render/Vercel
2. Use environment variables for config
3. Set up CI/CD with GitHub Actions
4. Add monitoring and logging

---

## Success Metrics

### Technical
- ✅ MCP connection working
- ✅ OAuth authentication successful
- ✅ Real-time Jira queries functional
- ✅ Web UI responsive and accessible
- ✅ Cross-machine access working

### Demo
- ✅ 14 test issues created
- ✅ Multiple query types working
- ✅ Visual results impressive
- ✅ 5-minute demo rehearsed
- ✅ Documentation complete

### Hackathon
- Ready for presentation
- All demo scenarios tested
- Backup plans prepared
- GitHub repo public and documented

---

## Contact & Resources

- **GitHub:** https://github.com/kofadam/atlassian-mcp-hackathon.git
- **Atlassian MCP Docs:** https://support.atlassian.com/rovo/docs/getting-started-with-the-atlassian-remote-mcp-server/
- **MCP Protocol:** https://modelcontextprotocol.io

---

**Last Updated:** October 2025
**Status:** Ready for hackathon presentation