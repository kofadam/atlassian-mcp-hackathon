// src/web-server.js
// Optimized version with persistent MCP connection

import express from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { parseQuery, isOllamaAvailable } from './ollama-integration.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const CLOUD_ID = '252a1017-b96e-41fc-8035-a3c27ec05bb5';
const PROJECT_KEY = 'KMD';

// Global MCP client (persistent connection)
let mcpClient = null;
let mcpInitializing = false;

// Check Ollama availability on startup
let ollamaEnabled = false;
isOllamaAvailable().then(available => {
  ollamaEnabled = available;
  console.log(`🤖 Ollama ${available ? 'ENABLED' : 'DISABLED'}`);
  if (!available) {
    console.log('💡 Install Ollama: curl -fsSL https://ollama.com/install.sh | sh');
  }
});

// Initialize MCP client once on startup
async function initializeMCPClient() {
  if (mcpClient) return mcpClient;
  if (mcpInitializing) {
    // Wait for initialization to complete
    while (mcpInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return mcpClient;
  }

  mcpInitializing = true;
  try {
    console.log('🔗 Initializing MCP client...');
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    const client = new Client({
      name: 'atlassian-web-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await client.connect(transport);
    mcpClient = client;
    console.log('✅ MCP client connected');
    
    // Handle disconnection
    transport.onclose = () => {
      console.log('⚠️  MCP connection closed, will reconnect on next request');
      mcpClient = null;
    };

    return mcpClient;
  } catch (error) {
    console.error('❌ Failed to initialize MCP client:', error.message);
    mcpClient = null;
    throw error;
  } finally {
    mcpInitializing = false;
  }
}

// Get or create MCP client
async function getMCPClient() {
  if (!mcpClient) {
    return await initializeMCPClient();
  }
  return mcpClient;
}

// AI-powered query endpoint
app.post('/api/query-with-ai', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query required' });
  }

  // Check if Ollama is available
  if (!ollamaEnabled) {
    return res.status(503).json({
      success: false,
      error: 'Ollama not available. Install with: curl -fsSL https://ollama.com/install.sh | sh',
      fallback: true
    });
  }

  try {
    // Parse query using Ollama
    console.log('🤖 Parsing query with Ollama:', query);
    const parsed = await parseQuery(query, PROJECT_KEY);
    console.log('📊 Parsed:', parsed);

    // Get MCP client
    const client = await getMCPClient();

    let result;
    let resultType = 'issues';

    // Execute based on intent
    if (parsed.cql) {
      // Confluence search
      result = await client.callTool({
        name: 'searchConfluenceUsingCql',
        arguments: {
          cloudId: CLOUD_ID,
          cql: parsed.cql,
          limit: 20
        }
      });
      resultType = 'confluence';
    } else if (parsed.jql) {
      // Jira search
      result = await client.callTool({
        name: 'searchJiraIssuesUsingJql',
        arguments: {
          cloudId: CLOUD_ID,
          jql: parsed.jql,
          fields: ['summary', 'status', 'issuetype', 'priority', 'assignee', 'created'],
          maxResults: 50
        }
      });
    }

    // Parse result
    const data = JSON.parse(result.content[0].text);

    // Format response
    let formattedResult;
    if (resultType === 'confluence') {
      formattedResult = {
        type: 'confluence',
        data: data.results || []
      };
    } else {
      formattedResult = {
        type: parsed.intent === 'project_summary' ? 'summary' : 'issues',
        data: data.issues || [],
        issues: data.issues || []
      };

      // Add summary stats if needed
      if (parsed.intent === 'project_summary') {
        const issues = data.issues || [];
        formattedResult.data = {
          total: issues.length,
          open: issues.filter(i => i.fields.status.name !== 'Done').length,
          done: issues.filter(i => i.fields.status.name === 'Done').length
        };
      }
    }

    console.log('✅ Query successful, returning results');
    res.json({
      success: true,
      message: `✅ ${parsed.explanation}`,
      aiThinking: parsed.explanation,
      toolUsed: parsed.jql ? 'searchJiraIssuesUsingJql' : 'searchConfluenceUsingCql',
      query: parsed.jql || parsed.cql,
      result: formattedResult
    });

  } catch (error) {
    console.error('❌ AI query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Original query endpoint (keep for backward compatibility)
app.post('/api/query', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query required' });
  }

  try {
    // If Ollama is enabled, redirect to AI endpoint
    if (ollamaEnabled) {
      return app._router.handle(
        Object.assign(req, { url: '/api/query-with-ai' }),
        res,
        () => {}
      );
    }

    // Fallback: direct query without AI
    res.status(503).json({
      success: false,
      error: 'Ollama not available for query parsing'
    });

  } catch (error) {
    console.error('❌ Query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const ollamaStatus = await isOllamaAvailable();
  const mcpStatus = mcpClient ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    ollama: ollamaStatus ? 'available' : 'unavailable',
    mcp: mcpStatus
  });
});

// Initialize MCP on startup
initializeMCPClient().catch(err => {
  console.error('⚠️  Could not initialize MCP on startup:', err.message);
  console.log('💡 Will retry on first request');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Ollama: ${ollamaEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔗 MCP: Initializing connection...`);
});