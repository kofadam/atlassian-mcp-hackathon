# Atlassian Intelligence Platform

**Natural Language Interface for Jira & Confluence using Ollama AI + Atlassian MCP**

A production-ready web interface that lets users query Jira and Confluence in plain language (Hebrew or English) without learning JQL/CQL. Powered by local Ollama AI for zero API costs and complete data privacy.

---

## Key Features

- **Natural Language Understanding** - Ask questions naturally: "Show me all bugs" or "הצג את כל הבאגים"
- **Ollama AI Integration** - Local 3B model (llama3.2) for intent classification
- **MCP Protocol** - Uses Atlassian's official Model Context Protocol for real-time data
- **Professional Dashboard** - Enterprise-grade UI with visual issue cards
- **Program Increment Support** - Built-in PI tracking for SAFe/Agile workflows
- **Zero API Costs** - Everything runs locally on your infrastructure
- **Multilingual** - Hebrew and English support out of the box
- **Production Security** - OAuth 2.1 authentication via Atlassian

---

## Architecture

```
User Query (Natural Language)
    ↓
Ollama (Intent Classification)
    ↓
Query Builder (Deterministic JQL Generation)
    ↓
Atlassian MCP (OAuth-secured execution)
    ↓
Jira/Confluence Data
    ↓
Professional Web UI (Visual Results)
```

**Why This Architecture?**
- Small local AI models (3B params) are unreliable at generating structured JQL
- Two-stage approach: Ollama classifies intent → JavaScript builds perfect JQL
- Always produces syntactically correct queries
- Fast and deterministic

---

## Technology Stack

**Backend:**
- Node.js + Express
- `@modelcontextprotocol/sdk` - MCP client
- Ollama API (local LLM inference)

**Frontend:**
- Vanilla JavaScript (no frameworks)
- Professional dashboard design
- RTL support for Hebrew

**AI/ML:**
- Ollama llama3.2:3b (2GB model)
- Intent classification only (not query generation)
- Runs entirely offline/air-gapped

**Integration:**
- Atlassian MCP Remote Server
- OAuth 2.1 authentication
- Real-time Jira/Confluence queries

---

## Prerequisites

- Node.js v20+
- Ollama installed locally
- Atlassian Cloud account with Jira/Confluence
- Two terminal windows for running processes

---

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/kofadam/atlassian-mcp-hackathon.git
cd atlassian-mcp-hackathon
npm install
```

### 2. Install Ollama
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull the model
ollama pull llama3.2:3b

# Verify installation
ollama run llama3.2:3b "Hello"
```

### 3. Configure Frontend
Create/edit `public/config.js`:
```javascript
window.API_URL = '';  // Use relative URLs for same-server deployment
```

---

## Running the Application

### Terminal 1: MCP Remote Proxy (keep running)
```bash
npx -y mcp-remote https://mcp.atlassian.com/v1/sse
```
- OAuth browser window will open
- Authenticate with your Atlassian account
- Leave this terminal running

### Terminal 2: Web Server
```bash
npm run web
```
- Server starts on http://localhost:3000
- Access from network: http://YOUR_SERVER_IP:3000

### Expected Startup Logs
```
🚀 Server running on http://localhost:3000
🤖 Ollama: ENABLED
🔗 MCP: Initializing connection...
✅ MCP client connected
```

---

## Usage Examples

### Supported Query Types

**Bug Tracking:**
- "Show me all bugs"
- "הצג באגים בעדיפות גבוהה" (High priority bugs in Hebrew)
- "Find bugs about OAuth"

**Program Increments:**
- "Show next PI" → Returns PI-26.1 labeled issues
- "Current PI" → Returns PI-25.4 labeled issues
- "PI report" → Cross-increment summary

**Task Management:**
- "Show my tasks"
- "In progress issues"
- "High priority tasks"

**Project Summaries:**
- "Project summary" → Statistics dashboard
- "Give me an overview"

**Searches:**
- "Find issues about database"
- "Search for authentication"

---

## Configuration

### Customizing PI Labels

Edit `src/ollama-integration.js`:

```javascript
// Around line 95
NEXT_PI: `${baseProject} AND labels = "PI-26.1" ORDER BY priority DESC`,
CURRENT_PI: `${baseProject} AND labels = "PI-25.4" ORDER BY priority DESC`,
```

Update these labels to match your organization's PI naming convention.

### Changing Project Key

Edit `src/web-server.js`:

```javascript
const PROJECT_KEY = 'KMD';  // Change to your project key
```

### Changing Ollama Model

Edit `src/ollama-integration.js`:

```javascript
async function callOllama(prompt, systemPrompt = '', model = 'llama3.2:3b') {
  // Change model parameter to use different models
}
```

---

## Project Structure

```
atlassian-mcp-hackathon/
├── src/
│   ├── web-server.js              # Main web server with MCP integration
│   ├── ollama-integration.js      # AI intent classification & query building
│   ├── index.js                   # Alternative CLI interface
│   └── ai-assistant.js            # Terminal chat interface
├── public/
│   ├── index.html                 # Professional dashboard UI
│   └── config.js                  # Frontend configuration
├── package.json
└── README.md
```

---

## Key Implementation Details

### Intent Classification (Ollama)

The system uses a two-stage approach:

**Stage 1: Intent Classification**
```javascript
User: "show next PI"
Ollama: Classifies as NEXT_PI intent
```

**Stage 2: Query Building (JavaScript)**
```javascript
NEXT_PI intent → project = KMD AND labels = "PI-26.1"
```

This ensures:
- Small model only does simple classification
- JavaScript guarantees syntactically correct JQL
- Fast, reliable, predictable results

### Available Intents

```
LIST_BUGS, LIST_TASKS, LIST_STORIES
PROJECT_SUMMARY, HIGH_PRIORITY
MY_ISSUES, IN_PROGRESS
SEARCH_ISSUES, CONFLUENCE_SEARCH
SPRINT_INFO, NEXT_PI, CURRENT_PI, PI_REPORT
```

### Adding New Intents

1. Add to intent list in `classifyIntent()` system prompt
2. Add examples to teach Ollama
3. Add to `validIntents` array
4. Implement JQL mapping in `buildJQL()`
5. Add explanation in `getExplanation()`

---

## API Endpoints

### POST /api/query-with-ai
Main query endpoint with AI processing.

**Request:**
```json
{
  "query": "show me all bugs"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Listing all open bugs",
  "aiThinking": "Listing all open bugs",
  "toolUsed": "searchJiraIssuesUsingJql",
  "query": "project = KMD AND type = Bug AND status != Done",
  "result": {
    "type": "issues",
    "data": [...]
  }
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "ollama": "available",
  "mcp": "connected"
}
```

---

## Troubleshooting

### Ollama Not Available
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### MCP Connection Failed
```bash
# Ensure mcp-remote is running in Terminal 1
npx -y mcp-remote https://mcp.atlassian.com/v1/sse

# Check if port 5598 is available
lsof -i :5598
```

### Intent Classification Returns UNKNOWN
- Add more examples to the Ollama prompt
- Check if your query matches existing patterns
- Review logs for classification output

### No Results Displayed in UI
- Check browser console (F12) for JavaScript errors
- Verify data structure: `data.result.type` and `data.result.data`
- Hard refresh browser (Ctrl+Shift+R)

---

## Performance

**Typical Response Times:**
- Intent classification: 200-500ms (local Ollama)
- JQL execution: 500-1500ms (Atlassian API)
- Total query time: 1-2 seconds

**Resource Usage:**
- Ollama (llama3.2:3b): ~2GB RAM
- Node.js server: ~100MB RAM
- Browser: Standard web app

---

## Security

- OAuth 2.1 via Atlassian MCP (no credentials stored)
- All queries respect existing Jira permissions
- Local AI inference (no data sent to external APIs)
- HTTPS encrypted communication with Atlassian

---

## Limitations

### Current Scope
- Single project queries only
- Read-only operations (no issue creation yet)
- Basic Confluence search (no page creation)
- English and Hebrew only

### Model Limitations
- llama3.2:3b cannot reliably generate complex JQL
- Intent classification only (not query generation)
- Requires examples for new query types

---

## Future Enhancements (Post-Hackathon)

### High Priority
1. **Self-Learning Schema Discovery**
   - Auto-detect labels, statuses, custom fields
   - Adapt to any Jira setup without code changes

2. **Epic/Feature Hierarchy Support**
   - Query by Epic
   - Feature-level tracking
   - Story rollup reports

3. **Confluence Report Generation**
   - Create formatted reports
   - Post directly to Confluence
   - Scheduled report generation

4. **Multi-Project Support**
   - Query across projects
   - Project comparison reports

### Medium Priority
5. Advanced visualizations (charts, graphs)
6. Issue creation via natural language
7. Workflow automation
8. Slack/Teams integration
9. Saved queries and templates
10. User preferences and history

---

## Development

### Running Tests
```bash
npm test
```

### Creating Mock Data
```bash
npm run setup-data
```

### Development Mode
```bash
# Watch mode (if you add nodemon)
npm run dev
```

---

## Deployment Options

### Development (Current)
Two terminal processes, manual start

### Production Options

**Option 1: PM2 Process Manager**
```bash
npm install -g pm2
pm2 start src/web-server.js --name atlassian-web
pm2 startup
pm2 save
```

**Option 2: Docker**
```bash
# Create Dockerfile
docker build -t atlassian-intelligence .
docker run -d -p 3000:3000 atlassian-intelligence
```

**Option 3: Cloud Platforms**
- Railway
- Render
- Vercel
- AWS/Azure/GCP

---

## Contributing

This is a hackathon POC. For production use:
1. Fork the repository
2. Add comprehensive error handling
3. Implement rate limiting
4. Add user authentication
5. Create deployment documentation
6. Add comprehensive tests

---

## License

MIT License - See LICENSE file

---

## Credits

- **Atlassian MCP** - https://mcp.atlassian.com
- **Ollama** - https://ollama.ai
- **Model Context Protocol** - https://modelcontextprotocol.io

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/kofadam/atlassian-mcp-hackathon/issues
- Atlassian MCP Docs: https://support.atlassian.com/rovo/docs/

---

**Last Updated:** October 2025  
**Status:** Production-ready POC, hackathon demo ready