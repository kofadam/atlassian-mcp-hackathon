# Atlassian MCP Hackathon - TODO List

## Project Status: IN PROGRESS 🚧

### What's Working
- Natural language queries for Jira (bugs, stories, tasks, epics)
- Sprint support (current sprint, specific sprints)
- Hebrew language support
- Confluence search with content filtering
- Project summary with statistics
- **Enterprise SAFe/PI Support** ✨ (NEW!)
  - PI objectives, features, and risks queries
  - ROAM risk framework support
  - PI report generation
  - Multi-PI support (24.4 completed, 25.1 current)
- Deployed to Vercel
- Mobile responsive (with some issues)

### Critical Issues to Fix
- [ ] ngrok URL changes on restart - need persistent solution
- [ ] Error handling for when backend is offline
- [ ] Better loading states in UI
- [ ] Fix mobile layout issues on very small screens

### Nice to Have Features
- [ ] Visual charts for project summary
- [ ] Create demo video as backup
- [ ] Optimize search queries for performance
- [ ] Add more Hebrew query examples
- [ ] Better error messages for users

### Enterprise SAFe/PI Support ✅ COMPLETED
- [x] Add PI (Program Increment) support for enterprise users
  - [x] Create `scripts/create-pi-data.js` - Generate PI test data
    - PI objectives (e.g., "PI 25.1 Objective: Migrate to microservices")
    - Features/Epics tagged with PI labels
    - PI risks with ROAM framework (Resolved/Owned/Accepted/Mitigated)
    - Multiple PIs (24.4 completed, 25.1 current)
  - [x] Update `src/improved-nlp-processor.js` - Add PI query patterns
    - Pattern: `/(?:PI|program increment)\s*(\d+)\.(\d+)/i`
    - Support: "Show PI 25.1 objectives", "PI 25.1 risks", "PI features"
    - Use labels: `PI-25.1`, `PI-Objective`, `Risk`, `ROAM-*`
  - [x] Update `src/report-generator.js` - Add PI report type
    - Show objectives, features, risks grouped by ROAM status
    - Display completion stats across PI sprints
    - Support for multiple PIs
  - [x] Update `public/index.html` - Add PI UI elements
    - Quick action buttons: "Show PI 25.1", "PI Risks"
    - Context-aware suggestions after PI queries
    - Help section with PI examples
  - **Value**: Shows understanding of scaled Agile/SAFe, differentiates from basic tools

### How to Use PI Features

**✅ RECOMMENDED: Manual Setup in Jira (5 minutes, 100% reliable)**

1. Go to your Jira project
2. Create or edit existing issues and add labels:

**For PI Objectives:**
- Labels: `PI-25.1`, `PI-Objective`
- Example title: "PI 25.1 Objective: Migrate to Microservices"

**For PI Features:**
- Labels: `PI-25.1`, `Feature`
- Example title: "Feature: API Gateway Implementation"

**For PI Risks:**
- Labels: `PI-25.1`, `Risk`, plus one ROAM status:
  - `ROAM-Owned` - Risk with assigned owner
  - `ROAM-Mitigated` - Risk with mitigation plan
  - `ROAM-Resolved` - Addressed risk
  - `ROAM-Accepted` - Accepted risk
- Example title: "Risk: Microservices complexity"

**Alternative: Automated Scripts** *(May experience MCP connection timeouts)*
```bash
# Simplified version (7 items: 2 objectives, 2 features, 3 risks)
node scripts/create-pi-data-simple.js

# Full version (20+ items across 2 PIs)
node scripts/create-pi-data.js
```

**⚡ Quick Demo Setup (2 minutes):**
1. Create 1 issue → Add labels: `PI-25.1`, `PI-Objective`
2. Create 1 issue → Add labels: `PI-25.1`, `Risk`, `ROAM-Owned`
3. Query: "Show PI 25.1" - Done! ✨

**Example Queries:**
```
"Show PI 25.1 objectives"
"Show PI 25.1 risks"
"Show owned risks"
"Show mitigated risks"
"Generate PI 25.1 report"
"Show current PI"
```

### Documentation Needed
- [ ] Complete setup instructions in README
- [ ] Demo script for presentation
- [ ] Architecture diagram
- [ ] Known limitations section

### Deployment
- Frontend: https://atlassian-mcp-hackathon.vercel.app
- Backend: Local with ngrok tunnel
- GitHub: https://github.com/kofadam/atlassian-mcp-hackathon
