#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import AtlassianRestClient from './atlassian-rest-client.js';
import { processNaturalLanguage } from './improved-nlp-processor.js';
import { generateReport, detectReportIntent } from './report-generator.js';
import ConfluenceSummarizer from './confluence-summarizer.js';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let atlassianClient = null;
let projectKey = null;
let cachedSpaceInfo = null; // Cache space info to avoid repeated lookups
let confluenceSummarizer = null; // Confluence summarization service

async function getConfluenceSpaceInfo() {
  // Return cached info if available
  if (cachedSpaceInfo) {
    return cachedSpaceInfo;
  }

  try {
    // Search for any Confluence page to get space information
    const searchData = await atlassianClient.searchConfluencePages('type=page', { limit: 1 });

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error('No Confluence pages found. Please create at least one page in Confluence first.');
    }

    const firstPage = searchData.results[0];

    // Extract space key from the resultGlobalContainer or _expandable
    let spaceKey = null;

    if (firstPage.resultGlobalContainer && firstPage.resultGlobalContainer.displayUrl) {
      // Extract from /spaces/SPACEKEY format
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
      console.log('   📄 Full page object:', JSON.stringify(firstPage, null, 2));
      throw new Error('Could not extract space key from Confluence search results');
    }

    const spaceInfo = {
      key: spaceKey,
      name: firstPage.resultGlobalContainer?.title || spaceKey
    };

    console.log('   📚 Extracted space key:', spaceKey);

    // Cache the space info
    cachedSpaceInfo = spaceInfo;
    console.log(`   📚 Found Confluence space: ${spaceInfo.name} (${spaceInfo.key})`);

    return spaceInfo;
  } catch (error) {
    throw new Error(`Failed to get Confluence space info: ${error.message}`);
  }
}

async function connectAtlassian() {
  if (atlassianClient) return atlassianClient;

  try {
    // Initialize REST API client with credentials from environment
    atlassianClient = new AtlassianRestClient({
      email: process.env.ATLASSIAN_EMAIL,
      apiToken: process.env.ATLASSIAN_API_TOKEN,
      domain: process.env.ATLASSIAN_DOMAIN,
      jiraBaseUrl: process.env.JIRA_BASE_URL,
      confluenceBaseUrl: process.env.CONFLUENCE_BASE_URL
    });

    // Test connection
    const connectionTest = await atlassianClient.testConnection();
    if (!connectionTest.success) {
      throw new Error(`Authentication failed: ${connectionTest.error}`);
    }

    console.log(`✅ Connected to Atlassian Cloud as ${connectionTest.user}`);

    // Get project key
    const projects = await atlassianClient.getProjects();
    projectKey = process.env.DEFAULT_PROJECT_KEY || projects[0].key;

    console.log('✅ Using project:', projectKey);
    return atlassianClient;
  } catch (error) {
    console.error('Failed to connect to Atlassian:', error.message);
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

      const searchResult = await atlassianClient.searchJiraIssues(jql, {
        maxResults: 100,
        fields: ['summary', 'status', 'priority', 'issuetype', 'assignee', 'reporter', 'created', 'updated', 'labels']
      });

      let issues = searchResult.issues || [];
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

          console.log(`   📄 Creating page in space: ${spaceInfo.name} (${spaceInfo.key})`);

          // Create the Confluence page using space key
          const createdPage = await atlassianClient.createConfluencePage(
            spaceInfo.key,
            report.title,
            report.content
          );

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
    
    // Handle PI Dashboard intent (MOVED HERE - AFTER nlpResult is defined)
    if (nlpResult.intent === 'pi-dashboard') {
      try {
        // Get all PI-labeled issues
        const searchResult = await atlassianClient.searchJiraIssues(
          `project = ${projectKey} AND labels in (PI-24.4, PI-25.1, PI-25.4, PI-26.1)`,
          {
            maxResults: 100,
            fields: ['summary', 'status', 'labels', 'issuetype', 'priority']
          }
        );

        const issues = searchResult.issues || [];
        console.log(`   PI Dashboard - Found ${issues.length} total issues`);
        if (issues.length > 0) {
          console.log('   First issue labels:', issues[0].fields.labels);
        }

        // Group issues by PI
        const piGroups = {};
        issues.forEach(issue => {
          const piLabel = issue.fields.labels?.find(l => l.match(/^PI-\d+\.\d+$/));
          if (piLabel) {
            console.log(`   Found PI label: ${piLabel} in issue ${issue.key}`);
          }
          if (piLabel) {
            if (!piGroups[piLabel]) {
              piGroups[piLabel] = {
                total: 0,
                done: 0,
                inProgress: 0,
                todo: 0,
                objectives: 0,
                features: 0,
                risks: 0
              };
            }
            piGroups[piLabel].total++;
            
            // Count by status
            const status = issue.fields.status.name;
            if (status === 'Done') piGroups[piLabel].done++;
            else if (status === 'In Progress') piGroups[piLabel].inProgress++;
            else piGroups[piLabel].todo++;
            
            // Count by type
            if (issue.fields.labels.includes('PI-Objective')) piGroups[piLabel].objectives++;
            if (issue.fields.labels.includes('Feature')) piGroups[piLabel].features++;
            if (issue.fields.labels.includes('Risk')) piGroups[piLabel].risks++;
          }
        });

        console.log(`   PI Dashboard - Grouped into ${Object.keys(piGroups).length} PIs:`, Object.keys(piGroups));

        return {
          type: 'pi-dashboard',
          data: piGroups,
          message: 'Program Increment Dashboard'
        };
      } catch (error) {
        return {
          type: 'error',
          message: `Could not generate PI dashboard: ${error.message}`
        };
      }
    }
    
    // Handle creation intent
    if (nlpResult.intent === 'create') {
      try {
        const data = await atlassianClient.createJiraIssue(projectKey, {
          issueType: nlpResult.type,
          summary: nlpResult.title,
          description: nlpResult.description || ''
        });
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
    
    // Handle Confluence summarization
    if (nlpResult.intent === 'summarize-confluence') {
      try {
        console.log(`   Searching for page: "${nlpResult.pageTitle}"`);

        // Search for the page by title
        const pageData = await atlassianClient.getConfluencePageByTitle(nlpResult.pageTitle);

        if (!pageData) {
          return {
            type: 'error',
            message: `Could not find Confluence page titled "${nlpResult.pageTitle}"`
          };
        }

        console.log(`   Found page: ${pageData.title} (ID: ${pageData.id})`);
        console.log(`   Generating summary with Claude...`);

        // Summarize the page
        const summary = await confluenceSummarizer.summarizePage({
          title: pageData.title,
          body: pageData.body.storage.value,
          id: pageData.id
        });

        return {
          type: 'confluence-summary',
          data: {
            ...summary,
            pageId: pageData.id,
            pageUrl: pageData._links?.webui ? `${atlassianClient.confluenceBaseUrl}${pageData._links.webui}` : null
          },
          message: `Summary of "${pageData.title}"`
        };
      } catch (error) {
        console.error('Confluence summarization error:', error.message);
        return {
          type: 'error',
          message: `Failed to summarize page: ${error.message}`
        };
      }
    }

    // Handle Confluence search
    if (nlpResult.intent === 'confluence') {
      try {
        const data = await atlassianClient.searchConfluencePages(nlpResult.cql, { limit: 25 });
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
        const searchPromise = atlassianClient.searchJiraIssues(
          nlpResult.jql || `project = ${projectKey} ORDER BY created DESC`,
          { maxResults: 100 }
        );

        // Add timeout for the search
        const data = await Promise.race([
          searchPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Search timeout')), 10000))
        ]);
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
      const searchPromise = atlassianClient.searchJiraIssues(jql, {
        maxResults: 50,
        fields: ['summary', 'status', 'priority', 'issuetype', 'assignee', 'reporter', 'created', 'updated', 'labels']
      });

      // Add 10 second timeout
      const data = await Promise.race([
        searchPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Search timeout')), 10000))
      ]);

      console.log('   ✅ Search completed');
      
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
      console.log('Testing Atlassian REST API connection...');
      const result = await atlassianClient.searchJiraIssues(
        `project = ${projectKey}`,
        { maxResults: 1 }
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'REST API connection working',
        projectKey: projectKey
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  
  // Direct API test endpoint - demonstrates REST API approach
  if (req.url === '/api/direct-test' && req.method === 'GET') {
    try {
      // Use credentials from .env file
      const API_TOKEN = `${process.env.ATLASSIAN_EMAIL}:${process.env.ATLASSIAN_API_TOKEN}`;
      const encoded = Buffer.from(API_TOKEN).toString('base64');

      const response = await fetch(
        `https://${process.env.ATLASSIAN_DOMAIN}/rest/api/3/search?jql=project=${projectKey}`,
        {
          headers: {
            'Authorization': `Basic ${encoded}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Direct REST API works! This simulates on-prem approach.',
        issueCount: data.issues?.length || 0,
        issues: data.issues?.slice(0, 3).map(i => ({
          key: i.key,
          summary: i.fields.summary,
          status: i.fields.status.name
        }))
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

        if (!atlassianClient) {
          await connectAtlassian();
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
  console.log('Starting Atlassian REST API connection...');

  try {
    await connectAtlassian();

    // Initialize Confluence summarizer
    const apiKey = (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-api-key-here')
      ? process.env.ANTHROPIC_API_KEY
      : null;

    confluenceSummarizer = new ConfluenceSummarizer(apiKey);

    if (apiKey) {
      console.log('✅ Confluence summarization enabled (AI-powered with Claude API)');
    } else {
      console.log('✅ Confluence summarization enabled (FREE extractive mode - no API key needed)');
    }

    console.log(`\n✅ Server running at http://localhost:${PORT}`);
    console.log(`✅ Also accessible at http://10.100.102.110:${PORT}`);
    console.log('\n📱 Open in your browser to start chatting!\n');

    // Test the connection
    console.log('Testing connection...');
    const testData = await atlassianClient.searchJiraIssues(
      `project = ${projectKey}`,
      { maxResults: 1 }
    );
    console.log(`✅ Connection test successful - Found ${testData.issues?.length || 0} issues\n`);

  } catch (error) {
    console.error('\n❌ Failed to start:', error.message);
    console.log('\nMake sure your .env file has the correct credentials:');
    console.log('  ATLASSIAN_EMAIL=your-email@example.com');
    console.log('  ATLASSIAN_API_TOKEN=your-api-token');
    console.log('  ATLASSIAN_DOMAIN=your-domain.atlassian.net\n');
    process.exit(1);
  }
});