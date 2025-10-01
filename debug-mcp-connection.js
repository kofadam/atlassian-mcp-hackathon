#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function debugMCP() {
  console.log('🔍 MCP Connection Debugger\n');
  
  let client;
  
  try {
    // 1. Test connection
    console.log('1️⃣ Connecting to MCP...');
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    client = new Client({
      name: 'mcp-debugger',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await client.connect(transport);
    console.log('✅ Connected to MCP\n');

    // 2. List tools
    console.log('2️⃣ Listing available tools...');
    const tools = await client.listTools();
    console.log(`✅ Found ${tools.tools.length} tools\n`);

    // 3. Get resources
    console.log('3️⃣ Getting Atlassian resources...');
    const resourcesResult = await client.callTool({
      name: 'getAccessibleAtlassianResources',
      arguments: {}
    });
    
    const resources = JSON.parse(resourcesResult.content[0].text);
    const cloudId = resources[0]?.id;
    
    if (!cloudId) {
      console.log('❌ No cloud ID found. You may need to re-authenticate.');
      console.log('Raw response:', resourcesResult.content[0].text);
      return;
    }
    
    console.log(`✅ Cloud ID: ${cloudId}\n`);

    // 4. Get projects
    console.log('4️⃣ Getting Jira projects...');
    const projectsResult = await client.callTool({
      name: 'getVisibleJiraProjects',
      arguments: { cloudId: cloudId }
    });
    
    const projects = JSON.parse(projectsResult.content[0].text);
    const projectKey = projects.values?.[0]?.key;
    
    if (!projectKey) {
      console.log('❌ No projects found');
      console.log('Raw response:', projectsResult.content[0].text);
      return;
    }
    
    console.log(`✅ Project key: ${projectKey}\n`);

    // 5. Simple search test
    console.log('5️⃣ Testing simple JQL search...');
    console.log(`   JQL: project = ${projectKey}`);
    
    const searchResult = await client.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: `project = ${projectKey}`,
        maxResults: 5
      }
    });
    
    const searchData = JSON.parse(searchResult.content[0].text);
    
    if (searchData.error) {
      console.log(`❌ Search error: ${searchData.message}`);
      return;
    }
    
    const issues = searchData.issues || [];
    console.log(`✅ Found ${issues.length} issues\n`);
    
    if (issues.length > 0) {
      console.log('Sample issues:');
      issues.slice(0, 3).forEach(issue => {
        console.log(`  - ${issue.key}: ${issue.fields.summary}`);
      });
    }
    
    // 6. Test specific issue fetch
    if (issues.length > 0) {
      console.log(`\n6️⃣ Testing specific issue fetch (${issues[0].key})...`);
      
      const issueResult = await client.callTool({
        name: 'getJiraIssue',
        arguments: {
          cloudId: cloudId,
          issueKey: issues[0].key
        }
      });
      
      const issueData = JSON.parse(issueResult.content[0].text);
      console.log(`✅ Successfully fetched ${issueData.key}\n`);
    }
    
    // 7. Test search with text
    console.log('7️⃣ Testing text search...');
    const textSearch = `project = ${projectKey} AND text ~ "test"`;
    console.log(`   JQL: ${textSearch}`);
    
    const textResult = await client.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: textSearch,
        maxResults: 5
      }
    });
    
    const textData = JSON.parse(textResult.content[0].text);
    console.log(`✅ Text search returned ${textData.issues?.length || 0} results\n`);
    
    console.log('✨ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Cloud ID: ${cloudId}`);
    console.log(`  - Project: ${projectKey}`);
    console.log(`  - Total issues: ${issues.length}`);
    console.log('\nYour MCP connection is working properly.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nDebug info:');
    console.error(error);
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure mcp-remote is running in another terminal');
    console.log('2. Check if you need to re-authenticate (OAuth window should have opened)');
    console.log('3. Verify your Atlassian account has access to the Jira project');
    
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the debug script
debugMCP().catch(console.error);