// src/web-server.js
// Optimized version with persistent MCP connection and report generation

import express from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { parseQuery, isOllamaAvailable, isReportIntent, getPIDetailsFromIntent } from './ollama-integration.js';
import { generatePIReport } from './report-generator.js';
import { 
  createConfluencePage, 
  listConfluencePages, 
  searchConfluence,
  publishReportToConfluence,
  createKnowledgeArticle,
  createProjectStructure 
} from './confluence-integration.js';

const app = express();
app.use(express.json({ limit: '10mb' }));  // Increased limit for report handling
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

// AI-powered query endpoint with report generation support
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

    // Check if this is a HELP response (parseQuery returns the full response for HELP)
    if (parsed.toolUsed === 'help') {
      // Return the help response directly
      return res.json(parsed);
    }
    
    // Get MCP client
    const client = await getMCPClient();

    // Check if this is a report generation request
    if (isReportIntent(parsed.intent)) {
      console.log('📊 Report generation requested');
      
      // Get PI details for the report
      const piDetails = getPIDetailsFromIntent(parsed.intent, parsed.keywords);
      
      if (!piDetails) {
        return res.json({
          success: false,
          message: '❌ Could not determine which PI to report on',
          aiThinking: parsed.explanation,
          toolUsed: 'report_generator'
        });
      }
      
      // Generate the report
      const reportResult = await generatePIReport(
        client, 
        piDetails.label, 
        piDetails.name, 
        PROJECT_KEY
      );
      
      if (reportResult.success) {
        res.json({
          success: true,
          message: reportResult.summary,
          aiThinking: parsed.explanation,
          toolUsed: 'report_generator',
          result: {
            type: 'report',
            data: reportResult.reportData,
            html: reportResult.htmlReport,
            downloads: reportResult.downloads
          }
        });
      } else {
        res.json({
          success: false,
          message: '❌ Failed to generate report: ' + reportResult.error,
          aiThinking: parsed.explanation,
          toolUsed: 'report_generator'
        });
      }
      
      return;
    }
    // Handle Confluence page listing
    if (parsed.intent === 'CONFLUENCE_LIST_PAGES') {
      const result = await listConfluencePages(client, CLOUD_ID, 'KP', 20);
      
      return res.json({
        success: true,
        message: result.message,
        aiThinking: parsed.explanation,
        toolUsed: 'confluence_list',
        result: {
          type: 'confluence_pages',
          data: result.pages
        }
      });
    }
    
    // Handle Confluence page creation form
    if (parsed.intent === 'CONFLUENCE_CREATE_PAGE') {
      return res.json({
        success: true,
        message: 'פתיחת טופס יצירת דף Confluence',
        aiThinking: parsed.explanation,
        toolUsed: 'confluence_create_form',
        result: {
          type: 'confluence_form',
          data: null
        }
      });
    }
    
    // Handle publishing report to Confluence
    if (parsed.intent === 'PUBLISH_REPORT_TO_CONFLUENCE') {
      return res.json({
        success: true,
        message: 'בחר דוח לפרסום ב-Confluence',
        aiThinking: parsed.explanation,
        toolUsed: 'confluence_publish',
        result: {
          type: 'confluence_publish_prompt',
          data: null
        }
      });
    }

    // Handle non-report queries (existing logic)
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
          fields: ['summary', 'status', 'issuetype', 'priority', 'assignee', 'created', 'labels', 'duedate', 'reporter', 'description'],
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

// Download report endpoint
app.post('/api/download-report', (req, res) => {
  try {
    const { format, content, filename } = req.body;
    
    if (!content || !format || !filename) {
      return res.status(400).json({ 
        error: 'Missing required parameters' 
      });
    }
    
    // Set appropriate headers for download
    const mimeTypes = {
      html: 'text/html',
      markdown: 'text/markdown',
      json: 'application/json'
    };
    
    res.setHeader('Content-Type', mimeTypes[format] || 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the content
    res.send(content);
    
  } catch (error) {
    console.error('❌ Error downloading report:', error);
    res.status(500).json({ 
      error: 'Failed to download report' 
    });
  }
});

// Get available PIs endpoint (for future enhancement)
app.get('/api/available-pis', async (req, res) => {
  try {
    // This could be enhanced to dynamically discover PIs from Jira
    const availablePIs = [
      { label: 'PI-25.4', name: 'Current PI', status: 'active' },
      { label: 'PI-26.1', name: 'Next PI', status: 'planned' },
      { label: 'PI-25.3', name: 'Previous PI', status: 'completed' }
    ];
    
    res.json({
      success: true,
      pis: availablePIs
    });
    
  } catch (error) {
    console.error('❌ Error fetching PIs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available PIs' 
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

// Create Confluence page endpoint
app.post('/api/confluence/create-page', async (req, res) => {
  try {
    const { title, content, type, spaceKey = 'KP' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'כותרת ותוכן נדרשים'
      });
    }
    
    const client = await getMCPClient();
    
    let result;
    if (type === 'kb') {
      result = await createKnowledgeArticle(client, CLOUD_ID, title, content, 'general', spaceKey);
    } else {
      const isLiveDoc = type === 'live';
      result = await createConfluencePage(client, CLOUD_ID, title, content, spaceKey, isLiveDoc);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error creating Confluence page:', error);
    res.status(500).json({
      success: false,
      message: `שגיאה ביצירת דף: ${error.message}`
    });
  }
});

// List Confluence pages endpoint
app.get('/api/confluence/list-pages', async (req, res) => {
  try {
    const { spaceKey = 'KP', limit = 20 } = req.query;
    
    const client = await getMCPClient();
    const result = await listConfluencePages(client, CLOUD_ID, spaceKey, parseInt(limit));
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error listing Confluence pages:', error);
    res.status(500).json({
      success: false,
      message: `שגיאה בקריאת דפים: ${error.message}`
    });
  }
});

// Search Confluence endpoint
app.post('/api/confluence/search', async (req, res) => {
  try {
    const { query, spaceKey = 'KP' } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'חיפוש נדרש'
      });
    }
    
    const client = await getMCPClient();
    const result = await searchConfluence(client, CLOUD_ID, query, spaceKey);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error searching Confluence:', error);
    res.status(500).json({
      success: false,
      message: `שגיאה בחיפוש: ${error.message}`
    });
  }
});

// Publish report to Confluence endpoint
app.post('/api/confluence/publish-report', async (req, res) => {
  try {
    const { reportData, spaceKey = 'KP' } = req.body;
    
    if (!reportData) {
      return res.status(400).json({
        success: false,
        message: 'נתוני דוח נדרשים'
      });
    }
    
    const client = await getMCPClient();
    const result = await publishReportToConfluence(client, CLOUD_ID, reportData, spaceKey);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error publishing report to Confluence:', error);
    res.status(500).json({
      success: false,
      message: `שגיאה בפרסום דוח: ${error.message}`
    });
  }
});

// Create project structure endpoint
app.post('/api/confluence/create-structure', async (req, res) => {
  try {
    const { projectName = 'KMD Project', spaceKey = 'KP' } = req.body;
    
    const client = await getMCPClient();
    const result = await createProjectStructure(client, CLOUD_ID, projectName, spaceKey);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error creating project structure:', error);
    res.status(500).json({
      success: false,
      message: `שגיאה ביצירת מבנה: ${error.message}`
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