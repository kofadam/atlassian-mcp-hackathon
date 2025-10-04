# Atlassian AI Assistant

Natural language interface for Jira and Confluence with support for local and cloud deployments.

## Overview

This web-based assistant provides a conversational interface to interact with Jira and Confluence using natural language queries in both Hebrew and English. Query issues, generate reports, and summarize Confluence pages without writing JQL or navigating complex UIs.

## Features

- **Natural language queries** - Ask questions in plain English or Hebrew
- **Issue search and filtering** - Find bugs, tasks, stories by status, priority, assignee, or sprint
- **Report generation** - Create sprint reports, bug reports, and PI (Program Increment) summaries
- **Confluence integration** - Search pages and generate document summaries
- **Bilingual support** - Full Hebrew and English interface with RTL support
- **SAFe/PI tracking** - Enterprise Agile support with PI objectives, features, and ROAM risk tracking

## Architecture

```
┌─────────────────┐
│   Web Browser   │  ← Natural language chat interface
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js Server │  ← NLP processing, query routing
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
  Jira    Confluence
  (REST API v2)
```

## Prerequisites

- Node.js v20+
- Docker (for local Jira/Confluence deployment)
- Jira and Confluence instances (local or cloud)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
# Jira/Confluence credentials
ATLASSIAN_EMAIL=your-username
ATLASSIAN_API_TOKEN=your-password-or-token
ATLASSIAN_DOMAIN=your-domain.atlassian.net

# Base URLs
JIRA_BASE_URL=https://your-domain.atlassian.net
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net/wiki

# Default project
DEFAULT_PROJECT_KEY=YOUR-PROJECT

# Optional: Anthropic API for AI-powered summaries
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Note**: For local Jira installations, use your password as the API token. For Atlassian Cloud, generate a Personal Access Token from your account settings.

### 3. Start the Server

```bash
npm run web
```

Open your browser to `http://localhost:3000`

## Local Deployment with Docker

For a fully local setup, deploy Jira and Confluence using Docker:

```bash
docker-compose up -d
```

This starts:
- Jira on port 8088
- Confluence on port 8090
- PostgreSQL on port 5432

See [LOCAL-JIRA-SETUP.md](LOCAL-JIRA-SETUP.md) for detailed setup instructions.

## Usage Examples

### Issue Queries

- "Show me all bugs"
- "Find high priority issues"
- "Show tasks assigned to John"
- "What's in the current sprint?"
- "Display fixed bugs"

### Report Generation

- "Generate sprint 1 report"
- "Create a bug report"
- "Show PI 25.4 objectives"
- "Generate PI 25.4 report"

### Confluence

- "Search confluence for API documentation"
- "Summarize Getting Started" (requires Anthropic API key for AI summaries, or uses free extractive mode)

### SAFe/PI Tracking

- "Show PI 25.4 features"
- "Display PI risks"
- "Show ROAM-Owned risks"
- "Generate PI dashboard"

## Document Summarization

The system supports two modes for summarizing Confluence pages:

1. **Free extractive summarization** (default) - Extracts first paragraphs, no API required
2. **AI-powered summarization** - Uses Claude API for better summaries (requires Anthropic API key)

To enable AI summaries, add your Anthropic API key to `.env`. Otherwise, free extractive summaries are used automatically.

## Configuration

### Adding NLP Patterns

Edit `src/improved-nlp-processor.js` to add new query patterns:

```javascript
patterns.myPattern = {
  en: /pattern here/i,
  he: /hebrew pattern/
};
```

### Customizing Reports

Edit `src/report-generator.js` to modify report templates or add new report types.

## Project Structure

```
src/
  ├── web-server.js              # Express server, query routing
  ├── improved-nlp-processor.js  # Natural language processing
  ├── report-generator.js        # Report generation
  ├── atlassian-rest-client.js   # Jira/Confluence REST API client
  └── confluence-summarizer.js   # Document summarization
public/
  └── index.html                 # Web UI
scripts/
  └── create-correct-pi-data.js  # PI test data generator
```

## REST API Endpoints

- `POST /api/query` - Process natural language query
- `GET /api/confluence-pages` - List Confluence pages

## Troubleshooting

### Connection Issues

- Verify Jira/Confluence URLs are accessible
- Check credentials in `.env`
- For local deployments, ensure Docker containers are running: `docker ps`

### No Results Found

- Verify project key in `.env` matches your Jira project
- Check that issues exist in the specified project
- Review server logs for API errors

### Confluence Summarization Fails

- Verify page title matches exactly (case-sensitive)
- Check Confluence base URL includes `/wiki` path
- Ensure user has permission to view the page

## Development

Run tests:
```bash
npm test
```

Create test data:
```bash
node scripts/create-correct-pi-data.js
```

## License

MIT
