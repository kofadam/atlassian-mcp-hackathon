# Atlassian AI Assistant - Complete Project Summary

## Project Overview

**Project Name:** Atlassian AI Assistant

**Description:** A natural language web interface for Jira and Confluence using REST API. Users can ask questions in plain language ("Show me all bugs", "Summarize KMD Home") and get instant visual results.

**Status:** Complete and functional, supports local Docker and cloud deployments.

---

## Technical Architecture

### Stack
- **Backend:** Node.js/Express web server
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Integration:** Direct REST API (Jira v2, Confluence)
- **Authentication:** Basic Auth (username + API token/password)
- **Summarization:** Free extractive mode or AI-powered (Anthropic Claude)

### Flow
```
Browser → Web Server (port 3000) → REST API Client → Jira/Confluence (REST API)
```

### Key Files Structure
```
atlassian-mcp-hackathon/
├── src/
│   ├── web-server.js              # Express server, main application
│   ├── atlassian-rest-client.js   # REST API client
│   ├── improved-nlp-processor.js  # Natural language processing
│   ├── report-generator.js        # Report generation
│   └── confluence-summarizer.js   # Document summarization
├── public/
│   └── index.html                 # Web UI
├── scripts/
│   └── create-correct-pi-data.js  # PI test data generator
├── docker-compose.yml             # Local Jira/Confluence setup
└── .env                           # Configuration
```

---

## Features

### Core Functionality
1. **Natural Language Queries**
   - Search issues by status, priority, assignee
   - Filter by sprint, type, labels
   - Support for English and Hebrew

2. **Report Generation**
   - Sprint reports with statistics
   - Bug reports by priority
   - PI (Program Increment) reports for SAFe
   - Status reports

3. **Confluence Integration**
   - Search pages
   - Summarize documents (free extractive or AI-powered)

4. **SAFe/PI Support**
   - PI objectives tracking
   - Feature management
   - ROAM risk framework
   - PI dashboards

### Technical Features
- Bilingual UI (English/Hebrew) with RTL support
- Color-coded issue cards
- Real-time data from Jira/Confluence
- Local Docker deployment option
- Air-gapped capable

---

## Deployment Options

### Local Docker (Recommended)
- Complete air-gapped deployment
- Jira, Confluence, PostgreSQL in containers
- No internet dependency
- Full control over data

### Cloud Atlassian
- Works with existing Atlassian Cloud instances
- Uses Personal Access Tokens
- Standard REST API connectivity

---

## Key Capabilities

### Query Examples
- "Show me all bugs"
- "Find high priority issues"
- "Generate sprint 1 report"
- "Show PI 25.4 objectives"
- "Summarize KMD Home"
- "Search confluence for API documentation"

### Supported Operations
- Issue search (JQL-based)
- Issue creation
- Report generation (Sprint, Bug, Status, PI)
- Confluence search (CQL-based)
- Document summarization
- PI tracking and dashboards

---

## Configuration

Required environment variables:
```bash
ATLASSIAN_EMAIL=username
ATLASSIAN_API_TOKEN=password-or-token
ATLASSIAN_DOMAIN=jira.example.com
JIRA_BASE_URL=http://jira.example.com
CONFLUENCE_BASE_URL=http://confluence.example.com/wiki
DEFAULT_PROJECT_KEY=PROJ
ANTHROPIC_API_KEY=sk-ant-... # Optional, for AI summaries
```

---

## Testing

Run the web server:
```bash
npm run web
```

Access at: `http://localhost:3000`

Test queries:
- "Show me all bugs"
- "Generate sprint report"
- "Show PI 25.4"
- "Summarize KMD Home"

---

## Future Enhancements

Potential additions:
- Multi-project support
- Advanced filtering UI
- Saved queries/templates
- Email report delivery
- Slack integration
- Custom dashboards

---

## License

MIT
