#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import chalk from 'chalk';
import ora from 'ora';

const mockIssues = [
  {
    summary: 'User login fails with OAuth providers',
    type: 'Bug',
    priority: 'High',
    description: 'Users report unable to login using Google/Microsoft OAuth. Error shows "Invalid redirect URI".'
  },
  {
    summary: 'Implement dark mode for dashboard',
    type: 'Story',
    priority: 'Medium',
    description: 'Users have requested dark mode option for better accessibility and reduced eye strain during night work.'
  },
  {
    summary: 'API response time exceeds 2 seconds',
    type: 'Bug',
    priority: 'Highest',
    description: 'Production API endpoints showing degraded performance. Average response time is 3.5 seconds, SLA is 2 seconds.'
  },
  {
    summary: 'Add export to CSV feature',
    type: 'Story',
    priority: 'Low',
    description: 'Business users need ability to export reports to CSV format for offline analysis.'
  },
  {
    summary: 'Database connection pool exhausted',
    type: 'Bug',
    priority: 'High',
    description: 'Application crashes during peak hours due to connection pool exhaustion. Need to investigate pool sizing.'
  },
  {
    summary: 'Create user onboarding tutorial',
    type: 'Task',
    priority: 'Medium',
    description: 'New users struggle with initial setup. Create interactive tutorial for first-time users.'
  },
  {
    summary: 'Upgrade to React 18',
    type: 'Task',
    priority: 'Low',
    description: 'Technical debt: upgrade React from v17 to v18 to access concurrent features and improved performance.'
  }
];

async function createMockData() {
  console.log(chalk.bold.cyan('\n🏗️  Creating Mock Jira Data\n'));
  
  const spinner = ora('Connecting to MCP server...').start();
  
  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    const client = new Client({
      name: 'data-creator',
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
    
    // Get available projects
    spinner.start('Finding your Jira project...');
    const projects = await client.callTool({
      name: 'getVisibleJiraProjects',
      arguments: {
        cloudId: cloudId,
        action: 'create'
      }
    });
    
    const projectList = JSON.parse(projects.content[0].text);
    
    if (!projectList.values || projectList.values.length === 0) {
      spinner.fail('No projects found');
      console.log(chalk.red('\n❌ You need to create a Jira project first!'));
      console.log(chalk.yellow('\nSteps:'));
      console.log(chalk.white('1. Go to your Jira: https://[your-site].atlassian.net'));
      console.log(chalk.white('2. Click "Create Project"'));
      console.log(chalk.white('3. Choose "Scrum" template'));
      console.log(chalk.white('4. Name it "MCP Demo Project"'));
      console.log(chalk.white('5. Run this script again\n'));
      process.exit(1);
    }
    
    const project = projectList.values[0];
    spinner.succeed(`Found project: ${project.name} (${project.key})`);
    
    // Get issue types for this project
    spinner.start('Getting issue types...');
    const issueTypesData = await client.callTool({
      name: 'getJiraProjectIssueTypesMetadata',
      arguments: {
        cloudId: cloudId,
        projectIdOrKey: project.key
      }
    });
    
    const issueTypes = JSON.parse(issueTypesData.content[0].text);
    spinner.succeed('Issue types retrieved');
    
    // Debug: log the structure
    console.log(chalk.gray('\nAvailable issue types:'));
    const issueTypesList = issueTypes.issueTypes || issueTypes.values || issueTypes;
    if (Array.isArray(issueTypesList)) {
      issueTypesList.forEach(it => {
        console.log(chalk.gray(`  - ${it.name || it.untranslatedName || it}`));
      });
    } else {
      console.log(chalk.yellow('  Issue types response format:', JSON.stringify(issueTypes, null, 2).substring(0, 500)));
    }
    
    console.log(chalk.bold('\n📝 Creating Issues:\n'));
    
    let createdCount = 0;
    
    for (const issue of mockIssues) {
      try {
        spinner.start(`Creating: ${issue.summary}`);
        
        // Find matching issue type - try different possible structures
        let issueType;
        const typeList = issueTypes.issueTypes || issueTypes.values || issueTypes;
        
        if (Array.isArray(typeList)) {
          issueType = typeList.find(it => {
            const name = it.name || it.untranslatedName || '';
            return name.toLowerCase() === issue.type.toLowerCase();
          });
        }
        
        if (!issueType) {
          // Try common alternatives
          const alternatives = {
            'Bug': ['Bug', 'bug', 'Defect'],
            'Story': ['Story', 'story', 'User Story'],
            'Task': ['Task', 'task', 'To Do']
          };
          
          const possibleNames = alternatives[issue.type] || [issue.type];
          issueType = typeList.find(it => {
            const name = it.name || it.untranslatedName || '';
            return possibleNames.some(alt => name.toLowerCase() === alt.toLowerCase());
          });
        }
        
        if (!issueType) {
          spinner.warn(`Skipping ${issue.summary} - ${issue.type} not available`);
          continue;
        }
        
        const issueTypeName = issueType.name || issueType.untranslatedName;
        
        // Create the issue
        const result = await client.callTool({
          name: 'createJiraIssue',
          arguments: {
            cloudId: cloudId,
            projectKey: project.key,
            issueTypeName: issueType.name,
            summary: issue.summary,
            description: issue.description
          }
        });
        
        const created = JSON.parse(result.content[0].text);
        spinner.succeed(`Created ${chalk.green(created.key)}: ${issue.summary}`);
        createdCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        spinner.fail(`Failed to create: ${issue.summary}`);
        console.log(chalk.gray(`  Error: ${error.message}`));
      }
    }
    
    console.log(chalk.bold.green(`\n✅ Created ${createdCount} issues successfully!\n`));
    
    if (createdCount > 0) {
      console.log(chalk.yellow('Next steps:'));
      console.log(chalk.white('1. Run: npm run sprint'));
      console.log(chalk.white('2. Run: npm run triage'));
      console.log(chalk.white('3. Try the other demos!\n'));
    }
    
    process.exit(0);
    
  } catch (error) {
    spinner.fail('Failed to create mock data');
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}

createMockData();