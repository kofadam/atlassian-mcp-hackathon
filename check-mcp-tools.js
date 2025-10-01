#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function checkAvailableTools() {
  console.log('🔍 Checking available MCP tools...\n');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'],
  });

  const client = new Client({
    name: 'mcp-tools-checker',
    version: '1.0.0',
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to Atlassian MCP server\n');

    // List all available tools
    console.log('📋 Available Tools:\n');
    const tools = await client.listTools();
    
    if (!tools.tools || tools.tools.length === 0) {
      console.log('❌ No tools available. This might be an authentication issue.\n');
      console.log('Make sure you have authenticated with Atlassian in the mcp-remote proxy.\n');
      return;
    }

    tools.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      if (tool.description) {
        console.log(`   Description: ${tool.description}`);
      }
      if (tool.inputSchema) {
        console.log(`   Parameters:`, JSON.stringify(tool.inputSchema, null, 2).split('\n').map(line => '   ' + line).join('\n'));
      }
      console.log();
    });

    console.log(`\nTotal tools available: ${tools.tools.length}\n`);

    // Try to find Jira and Confluence related tools
    const jiraTools = tools.tools.filter(t => t.name.toLowerCase().includes('jira'));
    const confluenceTools = tools.tools.filter(t => t.name.toLowerCase().includes('confluence'));

    if (jiraTools.length > 0) {
      console.log(`✅ Found ${jiraTools.length} Jira-related tools:`);
      jiraTools.forEach(t => console.log(`   - ${t.name}`));
      console.log();
    } else {
      console.log('❌ No Jira tools found\n');
    }

    if (confluenceTools.length > 0) {
      console.log(`✅ Found ${confluenceTools.length} Confluence-related tools:`);
      confluenceTools.forEach(t => console.log(`   - ${t.name}`));
      console.log();
    } else {
      console.log('❌ No Confluence tools found\n');
    }

    // Check for search tools
    const searchTools = tools.tools.filter(t => 
      t.name.toLowerCase().includes('search') || 
      t.name.toLowerCase().includes('query') ||
      t.name.toLowerCase().includes('jql') ||
      t.name.toLowerCase().includes('cql')
    );

    if (searchTools.length > 0) {
      console.log(`🔍 Found ${searchTools.length} search-related tools:`);
      searchTools.forEach(t => console.log(`   - ${t.name}`));
      console.log();
    }

    // Try a simple Jira search to verify connectivity
    console.log('🧪 Testing Jira connectivity...\n');
    
    const jqlSearchTool = tools.tools.find(t => 
      t.name.includes('searchJiraIssuesUsingJql') || 
      t.name.includes('jira_search') ||
      t.name.includes('search_jira')
    );

    if (jqlSearchTool) {
      try {
        console.log(`Using tool: ${jqlSearchTool.name}`);
        const result = await client.callTool(jqlSearchTool.name, {
          jql: 'project is not EMPTY',
          maxResults: 1
        });
        
        console.log('✅ Successfully connected to Jira!');
        
        // Parse the result to find project info
        const resultText = result.content?.[0]?.text || JSON.stringify(result);
        const projectMatch = resultText.match(/"project":\s*{[^}]*"key":\s*"([^"]+)"/);
        if (projectMatch) {
          console.log(`📁 Found project: ${projectMatch[1]}\n`);
        }
      } catch (error) {
        console.log(`❌ Could not search Jira: ${error.message}\n`);
      }
    } else {
      console.log('❌ No Jira search tool found\n');
    }

    // Try Confluence search
    console.log('🧪 Testing Confluence connectivity...\n');
    
    const cqlSearchTool = tools.tools.find(t => 
      t.name.includes('searchConfluenceUsingCql') || 
      t.name.includes('confluence_search') ||
      t.name.includes('search_confluence')
    );

    if (cqlSearchTool) {
      try {
        console.log(`Using tool: ${cqlSearchTool.name}`);
        const result = await client.callTool(cqlSearchTool.name, {
          cql: 'type=page',
          maxResults: 1
        });
        
        console.log('✅ Successfully connected to Confluence!\n');
      } catch (error) {
        console.log(`❌ Could not search Confluence: ${error.message}\n`);
      }
    } else {
      console.log('❌ No Confluence search tool found\n');
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`   - Total tools: ${tools.tools.length}`);
    console.log(`   - Jira tools: ${jiraTools.length}`);
    console.log(`   - Confluence tools: ${confluenceTools.length}`);
    console.log(`   - Search tools: ${searchTools.length}`);
    
    console.log('\n💡 Next Steps:');
    if (jiraTools.length === 0 && confluenceTools.length === 0) {
      console.log('   1. Make sure you are authenticated with Atlassian');
      console.log('   2. Check that you have proper permissions in Jira/Confluence');
      console.log('   3. Verify the mcp-remote proxy is running correctly');
    } else {
      console.log('   1. Update your scripts to use the available tool names');
      console.log('   2. Check the tool parameters match the expected format');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nThis might mean:');
    console.error('1. The mcp-remote proxy is not running');
    console.error('2. You need to authenticate with Atlassian first');
    console.error('3. There\'s a network connectivity issue');
  } finally {
    await client.close();
  }
}

// Run the diagnostic
checkAvailableTools().catch(console.error);