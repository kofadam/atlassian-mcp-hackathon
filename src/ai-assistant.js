#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';

let mcpClient = null;
let cloudId = null;

async function connectMCP() {
  if (mcpClient) return mcpClient;

  const spinner = ora('Connecting to Atlassian MCP Server...').start();
  
  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    mcpClient = new Client({
      name: 'atlassian-ai-assistant',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    
    // Get cloudId
    const resources = await mcpClient.callTool({
      name: 'getAccessibleAtlassianResources',
      arguments: {}
    });
    cloudId = JSON.parse(resources.content[0].text)[0].id;
    
    spinner.succeed('Connected to Atlassian MCP Server');
    return mcpClient;
  } catch (error) {
    spinner.fail('Failed to connect to MCP Server');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

async function processNaturalLanguage(query) {
  const lowerQuery = query.toLowerCase();
  
  // Pattern matching for different intents
  // In a real implementation, you'd use Claude API here
  
  // Show bugs
  if (lowerQuery.includes('show') && (lowerQuery.includes('bug') || lowerQuery.includes('bugs'))) {
    return await showBugs(query);
  }
  
  // Show high priority
  if ((lowerQuery.includes('high') || lowerQuery.includes('critical') || lowerQuery.includes('urgent')) && 
      (lowerQuery.includes('issue') || lowerQuery.includes('ticket'))) {
    return await showHighPriority(query);
  }
  
  // Create issue
  if (lowerQuery.includes('create') && (lowerQuery.includes('issue') || lowerQuery.includes('ticket') || lowerQuery.includes('bug'))) {
    return await createIssue(query);
  }
  
  // Search
  if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('look for')) {
    return await searchIssues(query);
  }
  
  // Show all issues
  if (lowerQuery.includes('all') && (lowerQuery.includes('issue') || lowerQuery.includes('ticket'))) {
    return await showAllIssues(query);
  }
  
  // Show confluence pages
  if (lowerQuery.includes('confluence') || lowerQuery.includes('page') || lowerQuery.includes('documentation')) {
    return await showConfluencePages(query);
  }
  
  // Summary/report
  if (lowerQuery.includes('summary') || lowerQuery.includes('report') || lowerQuery.includes('overview')) {
    return await showSummary(query);
  }
  
  return "I'm not sure how to help with that. Try asking:\n" +
         "  - Show me all bugs\n" +
         "  - What are the high priority issues?\n" +
         "  - Find issues about login\n" +
         "  - Create a bug for broken navigation\n" +
         "  - Give me a project summary\n" +
         "  - Show confluence pages";
}

async function showBugs(query) {
  const spinner = ora('Searching for bugs...').start();
  
  try {
    const result = await mcpClient.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: 'type = Bug AND status != Done ORDER BY priority DESC'
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    spinner.succeed(`Found ${data.total} bugs`);
    
    console.log(chalk.bold('\n🐛 Open Bugs:\n'));
    
    if (data.issues && data.issues.length > 0) {
      data.issues.forEach((issue, idx) => {
        const priority = issue.fields.priority?.name || 'None';
        const color = priority === 'Highest' ? 'red' : 
                      priority === 'High' ? 'yellow' : 'white';
        
        console.log(chalk[color](`${idx + 1}. [${issue.key}] ${issue.fields.summary}`));
        console.log(chalk.gray(`   Priority: ${priority} | Status: ${issue.fields.status.name}`));
        if (issue.fields.description) {
          console.log(chalk.gray(`   ${issue.fields.description.substring(0, 80)}...`));
        }
        console.log();
      });
    } else {
      console.log(chalk.green('No open bugs! 🎉'));
    }
    
    return '';
  } catch (error) {
    spinner.fail('Failed to search bugs');
    return `Error: ${error.message}`;
  }
}

async function showHighPriority(query) {
  const spinner = ora('Finding high priority issues...').start();
  
  try {
    const result = await mcpClient.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: 'priority in (Highest, High) AND status != Done ORDER BY priority DESC'
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    spinner.succeed(`Found ${data.total} high priority issues`);
    
    console.log(chalk.bold.red('\n🚨 High Priority Issues:\n'));
    
    if (data.issues && data.issues.length > 0) {
      data.issues.forEach((issue, idx) => {
        const priority = issue.fields.priority?.name || 'None';
        const color = priority === 'Highest' ? 'red' : 'yellow';
        
        console.log(chalk[color](`${idx + 1}. [${issue.key}] ${issue.fields.summary}`));
        console.log(chalk.gray(`   Priority: ${priority} | Type: ${issue.fields.issuetype.name}`));
        console.log();
      });
    } else {
      console.log(chalk.green('No high priority issues! 🎉'));
    }
    
    return '';
  } catch (error) {
    spinner.fail('Failed to search issues');
    return `Error: ${error.message}`;
  }
}

async function searchIssues(query) {
  // Extract search terms from the query
  const searchTerms = query
    .replace(/find|search|look for|show me|about/gi, '')
    .trim();
  
  if (!searchTerms) {
    return 'What would you like to search for?';
  }
  
  const spinner = ora(`Searching for "${searchTerms}"...`).start();
  
  try {
    const result = await mcpClient.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: `text ~ "${searchTerms}" OR summary ~ "${searchTerms}" ORDER BY created DESC`
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    spinner.succeed(`Found ${data.total} matching issues`);
    
    console.log(chalk.bold(`\n🔍 Search Results for "${searchTerms}":\n`));
    
    if (data.issues && data.issues.length > 0) {
      data.issues.forEach((issue, idx) => {
        console.log(chalk.white(`${idx + 1}. [${issue.key}] ${issue.fields.summary}`));
        console.log(chalk.gray(`   Type: ${issue.fields.issuetype.name} | Status: ${issue.fields.status.name}`));
        console.log();
      });
    } else {
      console.log(chalk.yellow('No matching issues found.'));
    }
    
    return '';
  } catch (error) {
    spinner.fail('Failed to search');
    return `Error: ${error.message}`;
  }
}

async function createIssue(query) {
  console.log(chalk.yellow('\n📝 Creating a new issue...\n'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
  
  try {
    const summary = await question(chalk.cyan('Issue summary: '));
    const description = await question(chalk.cyan('Description (optional): '));
    const issueType = await question(chalk.cyan('Type (Bug/Story/Task): ')) || 'Task';
    
    rl.close();
    
    const spinner = ora('Creating issue...').start();
    
    // Get project
    const projects = await mcpClient.callTool({
      name: 'getVisibleJiraProjects',
      arguments: { cloudId: cloudId, action: 'create' }
    });
    const projectList = JSON.parse(projects.content[0].text);
    const project = projectList.values[0];
    
    // Create issue
    const result = await mcpClient.callTool({
      name: 'createJiraIssue',
      arguments: {
        cloudId: cloudId,
        projectKey: project.key,
        issueTypeName: issueType.charAt(0).toUpperCase() + issueType.slice(1),
        summary: summary,
        description: description || 'Created via AI assistant'
      }
    });
    
    const created = JSON.parse(result.content[0].text);
    spinner.succeed(`Created issue ${chalk.green(created.key)}`);
    
    console.log(chalk.white(`\n✅ ${created.key}: ${summary}\n`));
    
    return '';
  } catch (error) {
    return `Error creating issue: ${error.message}`;
  }
}

async function showAllIssues(query) {
  const spinner = ora('Fetching all open issues...').start();
  
  try {
    const result = await mcpClient.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: 'status != Done ORDER BY priority DESC, created DESC'
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    spinner.succeed(`Found ${data.total} open issues`);
    
    console.log(chalk.bold('\n📋 All Open Issues:\n'));
    
    if (data.issues && data.issues.length > 0) {
      // Group by type
      const byType = {};
      data.issues.forEach(issue => {
        const type = issue.fields.issuetype.name;
        if (!byType[type]) byType[type] = [];
        byType[type].push(issue);
      });
      
      Object.entries(byType).forEach(([type, issues]) => {
        console.log(chalk.bold.cyan(`\n${type}s (${issues.length}):`));
        issues.forEach((issue, idx) => {
          const priority = issue.fields.priority?.name || 'None';
          console.log(chalk.white(`  ${idx + 1}. [${issue.key}] ${issue.fields.summary}`));
          console.log(chalk.gray(`     Priority: ${priority}`));
        });
      });
    } else {
      console.log(chalk.green('No open issues!'));
    }
    
    return '';
  } catch (error) {
    spinner.fail('Failed to fetch issues');
    return `Error: ${error.message}`;
  }
}

async function showConfluencePages(query) {
  const spinner = ora('Searching Confluence...').start();
  
  try {
    const result = await mcpClient.callTool({
      name: 'searchConfluenceUsingCql',
      arguments: {
        cloudId: cloudId,
        cql: 'type=page',
        limit: 25
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    spinner.succeed(`Found ${data.results?.length || 0} pages`);
    
    console.log(chalk.bold('\n📚 Confluence Pages:\n'));
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((page, idx) => {
        console.log(chalk.white(`${idx + 1}. ${page.title}`));
        console.log(chalk.gray(`   Space: ${page.space?.name || 'Unknown'}`));
        if (page.excerpt) {
          console.log(chalk.gray(`   ${page.excerpt.substring(0, 80)}...`));
        }
        console.log();
      });
    } else {
      console.log(chalk.yellow('No pages found.'));
    }
    
    return '';
  } catch (error) {
    spinner.fail('Failed to search Confluence');
    return `Error: ${error.message}`;
  }
}

async function showSummary(query) {
  const spinner = ora('Generating project summary...').start();
  
  try {
    const result = await mcpClient.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: cloudId,
        jql: 'ORDER BY created DESC',
        maxResults: 100
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    spinner.succeed('Summary generated');
    
    console.log(chalk.bold.cyan('\n📊 Project Summary\n'));
    
    const issues = data.issues || [];
    const open = issues.filter(i => i.fields.status.name !== 'Done').length;
    const done = issues.filter(i => i.fields.status.name === 'Done').length;
    
    console.log(chalk.white(`Total Issues: ${data.total}`));
    console.log(chalk.white(`Open: ${open} | Completed: ${done}`));
    
    // By type
    const byType = {};
    issues.forEach(i => {
      const type = i.fields.issuetype.name;
      byType[type] = (byType[type] || 0) + 1;
    });
    
    console.log(chalk.bold('\nBy Type:'));
    Object.entries(byType).forEach(([type, count]) => {
      console.log(chalk.white(`  ${type}: ${count}`));
    });
    
    // By priority
    const byPriority = {};
    issues.forEach(i => {
      const priority = i.fields.priority?.name || 'None';
      byPriority[priority] = (byPriority[priority] || 0) + 1;
    });
    
    console.log(chalk.bold('\nBy Priority:'));
    Object.entries(byPriority).forEach(([priority, count]) => {
      const color = priority === 'Highest' || priority === 'High' ? 'red' : 'white';
      console.log(chalk[color](`  ${priority}: ${count}`));
    });
    
    console.log();
    
    return '';
  } catch (error) {
    spinner.fail('Failed to generate summary');
    return `Error: ${error.message}`;
  }
}

async function startInteractiveMode() {
  console.log(chalk.bold.cyan('\n🤖 Atlassian AI Assistant\n'));
  console.log(chalk.white('Ask me anything about your Jira or Confluence!\n'));
  console.log(chalk.gray('Examples:'));
  console.log(chalk.gray('  - Show me all bugs'));
  console.log(chalk.gray('  - What are the high priority issues?'));
  console.log(chalk.gray('  - Find issues about API'));
  console.log(chalk.gray('  - Create a bug'));
  console.log(chalk.gray('  - Give me a project summary'));
  console.log(chalk.gray('  - Show confluence pages\n'));
  
  await connectMCP();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.green('\n💬 You: ')
  });
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const query = line.trim();
    
    if (!query) {
      rl.prompt();
      return;
    }
    
    if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
      console.log(chalk.yellow('\nGoodbye! 👋\n'));
      process.exit(0);
    }
    
    console.log(chalk.cyan('\n🤖 Assistant: '));
    const response = await processNaturalLanguage(query);
    if (response) {
      console.log(chalk.white(response));
    }
    
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log(chalk.yellow('\nGoodbye! 👋\n'));
    process.exit(0);
  });
}

startInteractiveMode();