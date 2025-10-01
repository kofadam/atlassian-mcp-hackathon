#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mcpClient = null;
let cloudId = null;
let projectKey = null; // Cache the project key

async function connectMCP() {
  if (mcpClient) return mcpClient;

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    mcpClient = new Client({
      name: 'atlassian-web-ui',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    
    const resources = await mcpClient.callTool({
      name: 'getAccessibleAtlassianResources',
      arguments: {}
    });
    cloudId = JSON.parse(resources.content[0].text)[0].id;
    
    // Get project key
    const projects = await mcpClient.callTool({
      name: 'getVisibleJiraProjects',
      arguments: { cloudId: cloudId }
    });
    const projectList = JSON.parse(projects.content[0].text);
    projectKey = projectList.values[0].key;
    
    console.log('✅ Connected to Atlassian MCP');
    console.log('✅ Using project:', projectKey);
    return mcpClient;
  } catch (error) {
    console.error('Failed to connect to MCP:', error.message);
    throw error;
  }
}

async function processQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  console.log(`\n📝 Processing query: "${query}"`);
  
  try {
    // Show bugs
    if (lowerQuery.includes('bug')) {
      console.log('🔍 Searching for bugs...');
      const result = await mcpClient.callTool({
        name: 'searchJiraIssuesUsingJql',
        arguments: {
          cloudId: cloudId,
          jql: `project = ${projectKey} AND type = Bug AND status != Done ORDER BY priority DESC`
        }
      });
      const data = JSON.parse(result.content[0].text);
      console.log(`✅ Found ${data.issues?.length || 0} bugs`);
      const total = data.issues ? data.issues.length : 0;
      return {
        type: 'bugs',
        data: data.issues || [],
        message: `Found ${total} open bugs`
      };
    }
    
    // High priority
    if (lowerQuery.includes('high') || lowerQuery.includes('priority') || lowerQuery.includes('urgent')) {
      console.log('🚨 Searching for high priority issues...');
      const result = await mcpClient.callTool({
        name: 'searchJiraIssuesUsingJql',
        arguments: {
          cloudId: cloudId,
          jql: `project = ${projectKey} AND priority in (Highest, High) AND status != Done ORDER BY priority DESC`
        }
      });
      console.log('High priority result:', JSON.stringify(result, null, 2).substring(0, 500));
      const data = JSON.parse(result.content[0].text);
      
      // Check for errors
      if (data.error) {
        console.log('Error:', data.message);
        return {
          type: 'error',
          message: `Error: ${data.message}`
        };
      }
      
      const total = data.issues ? data.issues.length : 0;
      console.log(`Found ${total} high priority issues`);
      return {
        type: 'issues',
        data: data.issues || [],
        message: `Found ${total} high priority issues`
      };
    }
    
    // Search
    if (lowerQuery.includes('find') || lowerQuery.includes('search')) {
      const searchTerms = query.replace(/find|search|look for|show me|about/gi, '').trim();
      const result = await mcpClient.callTool({
        name: 'searchJiraIssuesUsingJql',
        arguments: {
          cloudId: cloudId,
          jql: `project = ${projectKey} AND (text ~ "${searchTerms}" OR summary ~ "${searchTerms}") ORDER BY created DESC`
        }
      });
      const data = JSON.parse(result.content[0].text);
      const total = data.issues ? data.issues.length : 0;
      return {
        type: 'issues',
        data: data.issues || [],
        message: `Found ${total} issues matching "${searchTerms}"`
      };
    }
    
    // Summary
    if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('all')) {
      console.log('📊 Generating summary...');
      const result = await mcpClient.callTool({
        name: 'searchJiraIssuesUsingJql',
        arguments: {
          cloudId: cloudId,
          jql: `project = ${projectKey} ORDER BY created DESC`,
          maxResults: 100
        }
      });
      const data = JSON.parse(result.content[0].text);
      const issues = data.issues || [];
      const total = issues.length;
      
      const summary = {
        total: total,
        open: issues.filter(i => i.fields.status.name !== 'Done').length,
        done: issues.filter(i => i.fields.status.name === 'Done').length,
        byType: {},
        byPriority: {}
      };
      
      issues.forEach(i => {
        const type = i.fields.issuetype.name;
        const priority = i.fields.priority?.name || 'None';
        summary.byType[type] = (summary.byType[type] || 0) + 1;
        summary.byPriority[priority] = (summary.byPriority[priority] || 0) + 1;
      });
      
      return {
        type: 'summary',
        data: summary,
        issues: issues.slice(0, 10),
        message: `Project has ${total} total issues`
      };
    }
    
    // Confluence
    if (lowerQuery.includes('confluence') || lowerQuery.includes('page') || lowerQuery.includes('doc')) {
      const result = await mcpClient.callTool({
        name: 'searchConfluenceUsingCql',
        arguments: {
          cloudId: cloudId,
          cql: 'type=page',
          limit: 25
        }
      });
      const data = JSON.parse(result.content[0].text);
      return {
        type: 'confluence',
        data: data.results || [],
        message: `Found ${data.results?.length || 0} Confluence pages`
      };
    }
    
    // Default - show all open issues
    const result = await mcpClient.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: `project = ${projectKey} AND status != Done ORDER BY priority DESC`
      }
    });
    const data = JSON.parse(result.content[0].text);
    const total = data.issues ? data.issues.length : 0;
    return {
      type: 'issues',
      data: data.issues || [],
      message: `Showing ${total} open issues. Try asking: "show me bugs", "high priority issues", or "give me a summary"`
    };
    
  } catch (error) {
    return {
      type: 'error',
      message: `Error: ${error.message}`
    };
  }
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Serve HTML
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    res.end(html);
    return;
  }
  
  // API endpoint
  if (req.url === '/api/query' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { query } = JSON.parse(body);
        
        if (!mcpClient) {
          await connectMCP();
        }
        
        const result = await processQuery(query);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces

server.listen(PORT, HOST, async () => {
  console.log('\n🚀 Atlassian AI Assistant - Web UI');
  console.log('================================\n');
  console.log('Starting MCP connection...');
  
  try {
    await connectMCP();
    console.log(`\n✅ Server running at http://localhost:${PORT}`);
    console.log(`✅ Also accessible at http://10.100.102.110:${PORT}`);
    console.log('\n📱 Open in your browser to start chatting!\n');
  } catch (error) {
    console.error('\n❌ Failed to start:', error.message);
    console.log('\nMake sure mcp-remote is running in another terminal:');
    console.log('  npx -y mcp-remote https://mcp.atlassian.com/v1/sse\n');
    process.exit(1);
  }
});