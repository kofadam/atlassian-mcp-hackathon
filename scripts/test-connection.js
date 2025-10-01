#!/usr/bin/env node

// Quick test script to verify MCP connection is working

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import chalk from 'chalk';
import ora from 'ora';

async function testConnection() {
  console.log(chalk.bold.cyan('\n🔌 Testing Atlassian MCP Connection\n'));
  
  const spinner = ora('Connecting to MCP server...').start();
  
  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    const client = new Client({
      name: 'connection-test',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await client.connect(transport);
    spinner.succeed('Connected to MCP server');
    
    console.log(chalk.green('\n✅ Connection successful!\n'));
    
    // Get cloudId first
    spinner.start('Getting cloud ID...');
    const resources = await client.callTool({
      name: 'getAccessibleAtlassianResources',
      arguments: {}
    });
    
    const cloudId = JSON.parse(resources.content[0].text)[0].id;
    spinner.succeed(`Cloud ID retrieved: ${cloudId}`);
    
    // Test a simple query
    spinner.start('Testing Jira query...');
    
    const result = await client.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: 'ORDER BY created DESC',
        maxResults: 1
      }
    });
    
    spinner.succeed('Jira query successful');
    
    const data = JSON.parse(result.content[0].text);
    console.log(chalk.white(`Found ${data.total || 0} issues in your Jira workspace`));
    
    console.log(chalk.green('\n🎉 Everything is working!\n'));
    console.log(chalk.yellow('You can now run:'));
    console.log(chalk.white('  npm start        - Show all commands'));
    console.log(chalk.white('  npm run demo     - Run demo overview'));
    console.log(chalk.white('  npm run sprint   - Sprint planning report\n'));
    
    process.exit(0);
    
  } catch (error) {
    spinner.fail('Connection failed');
    
    console.log(chalk.red('\n❌ Connection test failed\n'));
    console.log(chalk.yellow('Troubleshooting steps:\n'));
    
    console.log(chalk.white('1. Make sure mcp-remote is running in another terminal:'));
    console.log(chalk.gray('   npx -y mcp-remote https://mcp.atlassian.com/v1/sse\n'));
    
    console.log(chalk.white('2. Verify you completed OAuth authentication'));
    console.log(chalk.gray('   (Browser should have opened for Atlassian login)\n'));
    
    console.log(chalk.white('3. Check that you have Jira/Confluence Cloud access'));
    console.log(chalk.gray('   (Free tier is fine)\n'));
    
    console.log(chalk.white('4. Ensure Node.js is version 20 or higher:'));
    console.log(chalk.gray(`   Current: ${process.version}\n`));
    
    console.log(chalk.red('Error details:'), error.message);
    console.log();
    
    process.exit(1);
  }
}

testConnection();