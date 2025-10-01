#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import chalk from 'chalk';
import ora from 'ora';

// Priority mappings for the issues
const priorityUpdates = [
  { key: 'KMD-8', priority: 'High', name: 'User login fails with OAuth providers' },
  { key: 'KMD-9', priority: 'Medium', name: 'Implement dark mode for dashboard' },
  { key: 'KMD-10', priority: 'Highest', name: 'API response time exceeds 2 seconds' },
  { key: 'KMD-11', priority: 'Low', name: 'Add export to CSV feature' },
  { key: 'KMD-12', priority: 'High', name: 'Database connection pool exhausted' },
  { key: 'KMD-13', priority: 'Medium', name: 'Create user onboarding tutorial' },
  { key: 'KMD-14', priority: 'Low', name: 'Upgrade to React 18' }
];

async function fixPriorities() {
  console.log(chalk.bold.cyan('\n🔧 Updating Issue Priorities\n'));
  
  const spinner = ora('Connecting to MCP server...').start();
  
  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    const client = new Client({
      name: 'priority-fixer',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await client.connect(transport);
    spinner.succeed('Connected to MCP server');
    
    // Get cloudId
    spinner.start('Getting cloud ID...');
    const resources = await client.callTool({
      name: 'getAccessibleAtlassianResources',
      arguments: {}
    });
    const cloudId = JSON.parse(resources.content[0].text)[0].id;
    spinner.succeed('Cloud ID retrieved');
    
    console.log(chalk.bold('\n📝 Updating Priorities:\n'));
    
    let updatedCount = 0;
    
    for (const issue of priorityUpdates) {
      try {
        spinner.start(`Updating ${issue.key}: ${issue.name}`);
        
        // Update the issue priority
        await client.callTool({
          name: 'editJiraIssue',
          arguments: {
            cloudId: cloudId,
            issueIdOrKey: issue.key,
            fields: {
              priority: { name: issue.priority }
            }
          }
        });
        
        const color = issue.priority === 'Highest' ? 'red' : 
                      issue.priority === 'High' ? 'yellow' :
                      issue.priority === 'Low' ? 'gray' : 'white';
        
        spinner.succeed(`${issue.key} priority set to ${chalk[color](issue.priority)}`);
        updatedCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        spinner.fail(`Failed to update: ${issue.key}`);
        console.log(chalk.gray(`  Error: ${error.message}`));
      }
    }
    
    console.log(chalk.bold.green(`\n✅ Updated ${updatedCount} issue priorities!\n`));
    
    if (updatedCount > 0) {
      console.log(chalk.yellow('Now try:'));
      console.log(chalk.white('  npm run sprint   - See prioritized issues'));
      console.log(chalk.white('  npm run triage   - See bug triage with priorities\n'));
    }
    
    process.exit(0);
    
  } catch (error) {
    spinner.fail('Failed to update priorities');
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}

fixPriorities();