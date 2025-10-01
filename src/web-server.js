#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processNaturalLanguage } from './improved-nlp-processor.js';
import { generateReport, detectReportIntent } from './report-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mcpClient = null;
let cloudId = null;
let projectKey = null;
let cachedSpaceInfo = null; // Cache space info to avoid repeated lookups

async function getConfluenceSpaceInfo() {
  // Return cached info if available
  if (cachedSpaceInfo) {
    return cachedSpaceInfo;
  }

  try {
    // Search for any Confluence page to get space information
    const searchResult = await mcpClient.callTool({
      name: 'searchConfluenceUsingCql',
      arguments: {
        cloudId: cloudId,
        cql: 'type=page',
        limit: 1
      }
    });

    const searchData = JSON.parse(searchResult.content[0].text);

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error('No Confluence pages found. Please create at least one page in Confluence first.');
    }

    const firstPage = searchData.results[0];

    // Extract space key from the resultGlobalContainer or _expandable
    let spaceKey = null;

    if (firstPage.resultGlobalContainer && firstPage.resultGlobalContainer.displayUrl) {
      // Extract from /spaces/SPACEKE format
      const match = firstPage.resultGlobalContainer.displayUrl.match(/\/spaces\/([A-Z0-9]+)/);
      if (match) {
        spaceKey = match[1];
      }
    }

    if (!spaceKey && firstPage._expandable && firstPage._expandable.space) {
      // Extract from /rest/api/space/SPACEKEY format
      const match = firstPage._expandable.space.match(/\/space\/([A-Z0-9]+)/);
      if (match) {
        spaceKey = match[1];
      }
    }

    if (!spaceKey) {
      console.log('   🔍 Full page object:', JSON.stringify(firstPage, null, 2));
      throw new Error('Could not extract space key from Confluence search results');
    }

    const spaceInfo = {
      key: spaceKey,
      name: firstPage.resultGlobalContainer?.title || spaceKey
    };

    console.log('   📚 Extracted space key:', spaceKey);

    // Cache the space info
    cachedSpaceInfo = spaceInfo;
    console.log(`   📚 Found Confluence space: ${spaceInfo.name} (${spaceInfo.key}), ID: ${spaceInfo.id}`);

    return spaceInfo;
  } catch (error) {
    throw new Error(`Failed to get Confluence space info: ${error.message}`);
  }
}

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
    
    // Get resources with timeout
    const resourcesPromise = mcpClient.callTool({
      name: 'getAccessibleAtlassianResources',
      arguments: {}
    });
    
    const resources = await Promise.race([
      resourcesPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout getting resources')), 5000))
    ]);
    
    cloudId = JSON.parse(resources.content[0].text)[0].id;
    
    // Get project key with timeout
    const projectsPromise = mcpClient.callTool({
      name: 'getVisibleJiraProjects',
      arguments: { cloudId: cloudId }
    });
    
    const projects = await Promise.race([
      projectsPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout getting projects')), 5000))
    ]);
    
    const projectList = JSON.parse(projects.content[0].text);
    projectKey = projectList.values[0].key;
    
    console.log('✅ Connected to Atlassian MCP');
    console.log('✅ Using project:', projectKey);
    console.log('✅ Cloud ID:', cloudId);
    return mcpClient;
  } catch (error) {
    console.error('Failed to connect to MCP:', error.message);
    throw error;
  }
}

async function processQuery(query) {
  console.log(`\n📝 Processing query: "${query}"`);
  
  try {
    // FIRST: Check for report generation intent
    const reportIntent = detectReportIntent(query);
    if (reportIntent) {
      console.log(`   Report Intent Detected: ${reportIntent.reportType}`);
      
      let jql = `project = ${projectKey}`;
      
      // Handle different report types with specific JQL
      if (reportIntent.reportType === 'sprint') {
        // Check if query mentions a specific sprint number (English or Hebrew)
        const sprintMatch = query.match(/(?:sprint|ספרינט)\s+(\d+)/i);
        if (sprintMatch) {
          jql += ` AND sprint = "Sprint ${sprintMatch[1]}"`;
          console.log(`   Generating report for Sprint ${sprintMatch[1]}`);
        } else {
          jql += ' AND sprint in openSprints()';
          console.log('   Generating report for current sprint');
        }
      } else if (reportIntent.reportType === 'future-sprints') {
        jql += ' AND sprint in futureSprints()';
        // Check if query includes status filter
        if (query.toLowerCase().includes('in progress') || query.includes('בביצוע') || query.includes('בתהליך')) {
          jql += ' AND status = "In Progress"';
          console.log('   Generating report for future sprints in progress');
        } else {
          console.log('   Generating report for future sprints');
        }
        // Check if query includes assignee filter
        const nameMatch = query.match(/(?:to|for|של|assigned to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
        if (nameMatch) {
          const personName = nameMatch[1];
          jql += ' AND assignee is not EMPTY';
          console.log(`   Filtering report by assignee: ${personName}`);
          reportIntent.filterByAssignee = personName;
        }
      } else if (reportIntent.reportType === 'bug') {
        jql += ' AND type = Bug';
        console.log('   Generating bug report');
      } else if (reportIntent.reportType === 'status') {
        // Status report gets all issues
        console.log('   Generating status report');
      }
      
      console.log(`   JQL: ${jql}`);

      const searchResult = await mcpClient.callTool({
        name: 'searchJiraIssuesUsingJql',
        arguments: {
          cloudId: cloudId,
          jql: jql,
          maxResults: 100,
          fields: ['summary', 'status', 'priority', 'issuetype', 'assignee', 'reporter', 'created', 'updated']
        }
      });

      let issues = JSON.parse(searchResult.content[0].text).issues || [];
      console.log(`   Found ${issues.length} issues for report`);

      // Apply client-side assignee filter if specified
      if (reportIntent.filterByAssignee) {
        const targetName = reportIntent.filterByAssignee.toLowerCase();
        console.log(`   🔍 Filtering report by assignee: ${reportIntent.filterByAssignee}`);
        issues = issues.filter(issue => {
          const assigneeName = issue.fields.assignee?.displayName || '';
          return assigneeName.toLowerCase().includes(targetName);
        });
        console.log(`   After filtering: ${issues.length} issues`);
      }
      
      const report = generateReport(issues, reportIntent.reportType);
      
      // Check if we should publish to Confluence
      if (reportIntent.shouldPublish) {
        console.log('   📤 Publishing report to Confluence...');

        try {
          // Get Confluence space info (cached after first call)
          const spaceInfo = await getConfluenceSpaceInfo();

          console.log(`   📝 Creating page in space: ${spaceInfo.name} (${spaceInfo.key})`);

          // Create the Confluence page using space key
          const createResult = await mcpClient.callTool({
            name: 'createConfluencePage',
            arguments: {
              cloudId: cloudId,
              spaceKey: spaceInfo.key,  // Use space key instead of ID
              title: report.title,
              body: report.content,
              bodyFormat: 'storage'
            }
          });

          const createdPage = JSON.parse(createResult.content[0].text);

          // Check for errors in response
          if (createdPage.error) {
            throw new Error(createdPage.message || 'Unknown error creating page');
          }

          // Extract page ID (different APIs use different field names)
          const pageId = createdPage.id || createdPage.pageId || createdPage._id;

          if (!pageId) {
            console.log('   ⚠️ Response:', JSON.stringify(createdPage, null, 2));
            throw new Error('No page ID in response');
          }

          const pageUrl = `https://kofadam.atlassian.net/wiki/spaces/${spaceInfo.key}/pages/${pageId}`;

          console.log(`   ✅ Report published successfully!`);
          console.log(`   🔗 ${pageUrl}`);

          return {
            type: 'report',
            message: `✅ דוח פורסם ל-Confluence בהצלחה!\n🔗 ${pageUrl}`,
            report: report,
            confluenceUrl: pageUrl
          };
        } catch (error) {
          console.error('   ❌ Could not publish to Confluence:', error.message);

          // Return the report with helpful export instructions
          return {
            type: 'report',
            message: `✅ דוח נוצר בהצלחה! הדוח מוכן להצגה למטה.`,
            report: report,
            exportInstructions: `📋 כיצד לייצא את הדוח:\n\n• העתק את תוכן הדוח (HTML)\n• פתח Confluence וצור דף חדש\n• הדבק בעורך (במצב HTML)\n• לחלופין: שמור כקובץ HTML ופתח בדפדפן`,
            exportOptions: {
              html: report.content,
              canCopy: true,
              canDownload: true
            }
          };
        }
      }

      // Report generated successfully (not publishing to Confluence)
      return {
        type: 'report',
        message: `✅ דוח נוצר בהצלחה!`,
        report: report,
        exportOptions: {
          html: report.content,
          canCopy: true,
          canDownload: true
        }
      };
    }
    
    // SECOND: Use the improved NLP processor if not a report
    const nlpResult = processNaturalLanguage(query);
    console.log(`   Intent: ${nlpResult.intent}`);
    console.log(`   Description: ${nlpResult.description}`);
    
    // Handle creation intent
    if (nlpResult.intent === 'create') {
      try {
        const result = await mcpClient.callTool({
          name: 'createJiraIssue',
          arguments: {
            cloudId: cloudId,
            projectKey: projectKey,
            issueType: nlpResult.type,
            summary: nlpResult.title,
            description: nlpResult.description || ''
          }
        });
        
        const data = JSON.parse(result.content[0].text);
        return {
          type: 'created',
          data: data,
          message: `Created ${nlpResult.type}: ${nlpResult.title}`
        };
      } catch (error) {
        console.error('Create error:', error.message);
        return {
          type: 'error',
          message: `Could not create issue: ${error.message}`
        };
      }
    }
    
    // Handle Confluence search
    if (nlpResult.intent === 'confluence') {
      try {
        const result = await mcpClient.callTool({
          name: 'searchConfluenceUsingCql',
          arguments: {
            cloudId: cloudId,
            cql: nlpResult.cql,
            limit: 25
          }
        });
        const data = JSON.parse(result.content[0].text);
        return {
          type: 'confluence',
          data: data.results || [],
          message: nlpResult.description || `Found ${data.results?.length || 0} Confluence pages`
        };
      } catch (error) {
        console.error('Confluence search error:', error.message);
        return {
          type: 'error',
          message: `Confluence search failed: ${error.message}`
        };
      }
    }
    
    // Handle summary intent
    if (nlpResult.intent === 'summary') {
      try {
        console.log('   Fetching project summary...');
        const searchPromise = mcpClient.callTool({
          name: 'searchJiraIssuesUsingJql',
          arguments: {
            cloudId: cloudId,
            jql: nlpResult.jql || `project = ${projectKey} ORDER BY created DESC`,
            maxResults: 100
          }
        });
        
        // Add timeout for the search
        const result = await Promise.race([
          searchPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Search timeout')), 10000))
        ]);
        
        const data = JSON.parse(result.content[0].text);
        const issues = data.issues || [];
        const total = issues.length;
        
        const summary = {
          total: total,
          open: issues.filter(i => i.fields.status.name !== 'Done').length,
          done: issues.filter(i => i.fields.status.name === 'Done').length,
          byType: {},
          byPriority: {},
          byStatus: {}
        };
        
        issues.forEach(i => {
          const type = i.fields.issuetype.name;
          const priority = i.fields.priority?.name || 'None';
          const status = i.fields.status.name;
          summary.byType[type] = (summary.byType[type] || 0) + 1;
          summary.byPriority[priority] = (summary.byPriority[priority] || 0) + 1;
          summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
        });
        
        return {
          type: 'summary',
          data: summary,
          issues: issues.slice(0, 10),
          message: nlpResult.description || `Project has ${total} total issues`
        };
      } catch (error) {
        console.error('Summary error:', error.message);
        if (error.message === 'Search timeout') {
          return {
            type: 'error',
            message: 'Request timed out. The MCP server is slow. Please try again.'
          };
        }
        return {
          type: 'error',
          message: `Could not fetch summary: ${error.message}`
        };
      }
    }
    
    // Handle search intent (default)
    // Changed from 'let jql' to just 'jql' since it's already declared above
    let jql = nlpResult.jql || `project = ${projectKey}`;
    
    // Ensure project key is in the JQL if not already present
    if (!jql.includes('project =')) {
      jql = `project = ${projectKey} AND (${jql})`;
    } else {
      // Replace placeholder KMD with actual project key
      jql = jql.replace(/project = KMD/g, `project = ${projectKey}`);
    }
    
    console.log(`🔍 Executing JQL: ${jql}`);

    try {
      const searchPromise = mcpClient.callTool({
        name: 'searchJiraIssuesUsingJql',
        arguments: {
          cloudId: cloudId,
          jql: jql,
          maxResults: 50,
          fields: ['summary', 'status', 'priority', 'issuetype', 'assignee', 'reporter', 'created', 'updated']
        }
      });
      
      // Add 10 second timeout
      const result = await Promise.race([
        searchPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Search timeout')), 10000))
      ]);
      
      console.log('   ✅ Search completed');
      
      const data = JSON.parse(result.content[0].text);
      
      // Check for errors
      if (data.error) {
        console.log('   ❌ Search error:', data.message);
        return {
          type: 'error',
          message: `Search error: ${data.message}`
        };
      }
      
      let issues = data.issues || [];

      // Apply client-side assignee filter if specified
      if (nlpResult.filterByAssignee) {
        const targetName = nlpResult.filterByAssignee.toLowerCase();
        console.log(`   🔍 Filtering by assignee: ${nlpResult.filterByAssignee}`);
        issues = issues.filter(issue => {
          const assigneeName = issue.fields.assignee?.displayName || '';
          return assigneeName.toLowerCase().includes(targetName);
        });
      }

      const total = issues.length;
      console.log(`   📊 Found ${total} issues`);

      // Debug: Log assignee info for first few issues
      if (jql.includes('assignee')) {
        console.log('   🔍 Assignee Debug (first 3 issues):');
        issues.slice(0, 3).forEach(issue => {
          console.log(`      ${issue.key}: assignee = ${issue.fields.assignee?.displayName || 'NULL/EMPTY'}`);
        });
      }
      
      // Determine the response type based on the issues
      let responseType = 'issues';
      if (issues.length > 0) {
        const firstType = issues[0].fields.issuetype.name;
        if (issues.every(i => i.fields.issuetype.name === 'Bug')) {
          responseType = 'bugs';
        } else if (issues.every(i => i.fields.issuetype.name === 'Story')) {
          responseType = 'stories';
        } else if (issues.every(i => i.fields.issuetype.name === 'Task')) {
          responseType = 'tasks';
        }
      }
      
      return {
        type: responseType,
        data: issues,
        message: nlpResult.description || `Found ${total} issues`
      };
      
    } catch (error) {
      console.error('   ❌ Search error:', error.message);
      
      if (error.message === 'Search timeout') {
        return {
          type: 'error',
          message: 'Search timed out after 10 seconds. The MCP server might be slow. Please try again.'
        };
      }
      
      return {
        type: 'error',
        message: `Search failed: ${error.message}`
      };
    }
    
  } catch (error) {
    console.error('Query processing error:', error);
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

  // Serve static files from public folder
  if (req.url === '/config.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    const js = fs.readFileSync(path.join(__dirname, '../public/config.js'), 'utf8');
    res.end(js);
    return;
  }
  
  // Test endpoint
  if (req.url === '/api/test' && req.method === 'GET') {
    try {
      console.log('Testing MCP connection...');
      const result = await mcpClient.callTool({
        name: 'searchJiraIssuesUsingJql',
        arguments: {
          cloudId: cloudId,
          jql: `project = ${projectKey}`,
          maxResults: 1
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'MCP connection working',
        cloudId: cloudId,
        projectKey: projectKey
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
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
        console.error('Request error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          type: 'error',
          message: error.message 
        }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, async () => {
  console.log('\n🚀 Atlassian AI Assistant - Web UI');
  console.log('================================\n');
  console.log('Starting MCP connection...');
  
  try {
    await connectMCP();
    console.log(`\n✅ Server running at http://localhost:${PORT}`);
    console.log(`✅ Also accessible at http://10.100.102.110:${PORT}`);
    console.log('\n📱 Open in your browser to start chatting!\n');
    
    // Test the connection
    console.log('Testing connection...');
    const testResult = await mcpClient.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: `project = ${projectKey}`,
        maxResults: 1
      }
    });
    const testData = JSON.parse(testResult.content[0].text);
    console.log(`✅ Connection test successful - Found ${testData.issues?.length || 0} issues\n`);
    
  } catch (error) {
    console.error('\n❌ Failed to start:', error.message);
    console.log('\nMake sure mcp-remote is running in another terminal:');
    console.log('  npx -y mcp-remote https://mcp.atlassian.com/v1/sse\n');
    process.exit(1);
  }
});