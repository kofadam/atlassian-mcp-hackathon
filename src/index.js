#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import ora from 'ora';

const program = new Command();

// MCP Client setup
let mcpClient = null;

async function connectMCP() {
  if (mcpClient) return mcpClient;

  const spinner = ora('Connecting to Atlassian MCP Server...').start();
  
  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    mcpClient = new Client({
      name: 'atlassian-mcp-hackathon',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    spinner.succeed('Connected to Atlassian MCP Server');
    return mcpClient;
  } catch (error) {
    spinner.fail('Failed to connect to MCP Server');
    console.error(chalk.red('Error:'), error.message);
    console.log(chalk.yellow('\nMake sure you have:'));
    console.log(chalk.yellow('1. Authenticated with: npx -y mcp-remote https://mcp.atlassian.com/v1/sse'));
    console.log(chalk.yellow('2. The mcp-remote process is running in another terminal'));
    process.exit(1);
  }
}

async function callTool(toolName, args = {}) {
  const client = await connectMCP();
  
  try {
    const result = await client.callTool({
      name: toolName,
      arguments: args
    });
    
    return result;
  } catch (error) {
    console.error(chalk.red(`Error calling tool ${toolName}:`), error.message);
    throw error;
  }
}

// Demo Command - Shows all available scenarios
program
  .command('demo')
  .description('Run a full interactive demo of all scenarios')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🚀 Atlassian MCP Hackathon Demo\n'));
    console.log(chalk.white('Available demo scenarios:\n'));
    console.log(chalk.green('1. Sprint Planning Report') + ' - Analyze current sprint status');
    console.log(chalk.green('2. Release Notes Generator') + ' - Auto-generate release notes');
    console.log(chalk.green('3. Knowledge Gap Analyzer') + ' - Find undocumented issues');
    console.log(chalk.green('4. Bug Triage Assistant') + ' - Prioritize critical bugs');
    console.log(chalk.green('5. Quick Stats') + ' - Show project statistics\n');
    
    console.log(chalk.yellow('Run individual scenarios with:'));
    console.log(chalk.white('  npm run sprint    - Sprint Planning Report'));
    console.log(chalk.white('  npm run release   - Release Notes'));
    console.log(chalk.white('  npm run gaps      - Knowledge Gaps'));
    console.log(chalk.white('  npm run triage    - Bug Triage\n'));
  });

// Sprint Planning Report
program
  .command('sprint-report')
  .description('Generate a comprehensive sprint planning report')
  .action(async () => {
    console.log(chalk.bold.cyan('\n📊 Sprint Planning Report\n'));
    
    const spinner = ora('Connecting to Atlassian MCP Server...').start();
    
    try {
      await connectMCP();
      spinner.succeed('Connected to Atlassian MCP Server');
      
      // First get cloudId
      spinner.start('Getting cloud ID...');
      const resources = await callTool('getAccessibleAtlassianResources', {});
      const cloudId = JSON.parse(resources.content[0].text)[0].id;
      spinner.succeed('Cloud ID retrieved');
      
      // Search for open issues (since sprint might not be created yet)
      spinner.start('Analyzing open issues...');
      const sprintIssues = await callTool('searchJiraIssuesUsingJql', {
        cloudId: cloudId,
        jql: 'status != Done ORDER BY priority DESC, created DESC'
      });
      
      spinner.succeed('Issue data retrieved');
      
      // Parse results
      const issues = JSON.parse(sprintIssues.content[0].text);
      
      console.log(chalk.bold('\n📋 Project Overview:'));
      console.log(chalk.white(`Total Open Issues: ${issues.total || 0}`));
      
      if (issues.issues && issues.issues.length > 0) {
        // Count by type
        const byType = {};
        const byPriority = {};
        
        issues.issues.forEach(issue => {
          const type = issue.fields.issuetype.name;
          const priority = issue.fields.priority?.name || 'None';
          
          byType[type] = (byType[type] || 0) + 1;
          byPriority[priority] = (byPriority[priority] || 0) + 1;
        });
        
        console.log(chalk.bold('\n📊 By Type:'));
        Object.entries(byType).forEach(([type, count]) => {
          console.log(chalk.white(`  ${type}: ${count}`));
        });
        
        console.log(chalk.bold('\n🎯 By Priority:'));
        Object.entries(byPriority).forEach(([priority, count]) => {
          const color = priority === 'Highest' || priority === 'High' ? 'red' : 'white';
          console.log(chalk[color](`  ${priority}: ${count}`));
        });
        
        console.log(chalk.bold('\n🔥 Top Priority Issues:'));
        issues.issues.slice(0, 5).forEach((issue, idx) => {
          console.log(chalk.white(`  ${idx + 1}. [${issue.key}] ${issue.fields.summary}`));
          console.log(chalk.gray(`     Priority: ${issue.fields.priority?.name || 'None'} | Type: ${issue.fields.issuetype.name}`));
        });
      }
      
      console.log(chalk.green('\n✅ Sprint report generated successfully!\n'));
      
    } catch (error) {
      spinner.fail('Failed to generate sprint report');
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Release Notes Generator
program
  .command('release-notes')
  .description('Generate release notes from completed issues')
  .option('-d, --days <days>', 'Look back N days', '7')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n📝 Release Notes Generator\n'));
    
    const spinner = ora('Gathering completed issues...').start();
    
    try {
      await connectMCP();
      
      // Get cloudId
      const resources = await callTool('getAccessibleAtlassianResources', {});
      const cloudId = JSON.parse(resources.content[0].text)[0].id;
      
      // Search for recently completed issues
      const daysAgo = options.days;
      spinner.text = `Fetching issues completed in last ${daysAgo} days...`;
      
      const completedIssues = await callTool('searchJiraIssuesUsingJql', {
        cloudId: cloudId,
        jql: `status = Done AND resolved >= -${daysAgo}d ORDER BY resolved DESC`
      });
      
      spinner.succeed('Issues retrieved');
      
      const issues = JSON.parse(completedIssues.content[0].text);
      
      console.log(chalk.bold('\n📋 Release Notes:\n'));
      
      if (issues.issues && issues.issues.length > 0) {
        const features = [];
        const bugs = [];
        const tasks = [];
        
        issues.issues.forEach(issue => {
          const item = {
            key: issue.key,
            summary: issue.fields.summary,
            type: issue.fields.issuetype.name
          };
          
          if (item.type === 'Story') features.push(item);
          else if (item.type === 'Bug') bugs.push(item);
          else tasks.push(item);
        });
        
        if (features.length > 0) {
          console.log(chalk.bold.green('✨ New Features:'));
          features.forEach(f => {
            console.log(chalk.white(`  • ${f.summary} (${f.key})`));
          });
          console.log();
        }
        
        if (bugs.length > 0) {
          console.log(chalk.bold.yellow('🐛 Bug Fixes:'));
          bugs.forEach(b => {
            console.log(chalk.white(`  • ${b.summary} (${b.key})`));
          });
          console.log();
        }
        
        if (tasks.length > 0) {
          console.log(chalk.bold.blue('🔧 Improvements:'));
          tasks.forEach(t => {
            console.log(chalk.white(`  • ${t.summary} (${t.key})`));
          });
          console.log();
        }
        
        console.log(chalk.gray(`Total changes: ${issues.issues.length}`));
      } else {
        console.log(chalk.yellow('No completed issues found in the specified timeframe.'));
      }
      
      console.log(chalk.green('\n✅ Release notes generated!\n'));
      
    } catch (error) {
      spinner.fail('Failed to generate release notes');
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Knowledge Gap Analyzer
program
  .command('knowledge-gaps')
  .description('Find Jira issues without linked Confluence documentation')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🔍 Knowledge Gap Analyzer\n'));
    
    const spinner = ora('Analyzing documentation coverage...').start();
    
    try {
      await connectMCP();
      
      // Get cloudId
      const resources = await callTool('getAccessibleAtlassianResources', {});
      const cloudId = JSON.parse(resources.content[0].text)[0].id;
      
      // Get all open issues
      spinner.text = 'Fetching open issues...';
      const openIssues = await callTool('searchJiraIssuesUsingJql', {
        cloudId: cloudId,
        jql: 'status != Done ORDER BY priority DESC',
        maxResults: 20
      });
      
      spinner.text = 'Searching Confluence pages...';
      const confluencePages = await callTool('searchConfluenceUsingCql', {
        cloudId: cloudId,
        cql: 'type=page',
        limit: 50
      });
      
      const issues = JSON.parse(openIssues.content[0].text);
      const pages = JSON.parse(confluencePages.content[0].text);
      
      console.log(chalk.bold('\n📊 Documentation Coverage Analysis:\n'));
      
      console.log(chalk.white(`Total Open Issues: ${issues.total || 0}`));
      console.log(chalk.white(`Total Documentation Pages: ${pages.results?.length || 0}\n`));
      
      if (issues.issues && issues.issues.length > 0) {
        console.log(chalk.bold.yellow('⚠️  Issues Potentially Missing Documentation:\n'));
        
        // Simple heuristic: high priority issues
        const highPriorityIssues = issues.issues.filter(issue => 
          issue.fields.priority?.name === 'High' || issue.fields.priority?.name === 'Highest'
        );
        
        if (highPriorityIssues.length > 0) {
          highPriorityIssues.forEach((issue, idx) => {
            console.log(chalk.white(`  ${idx + 1}. [${issue.key}] ${issue.fields.summary}`));
            console.log(chalk.gray(`     Priority: ${issue.fields.priority.name} | Type: ${issue.fields.issuetype.name}`));
            console.log(chalk.yellow(`     💡 Suggestion: Create documentation in Confluence\n`));
          });
        } else {
          console.log(chalk.green('  ✅ All high-priority issues appear to be tracked!'));
        }
      }
      
      console.log(chalk.green('\n✅ Knowledge gap analysis complete!\n'));
      
    } catch (error) {
      spinner.fail('Failed to analyze knowledge gaps');
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Bug Triage Assistant
program
  .command('bug-triage')
  .description('Prioritize and analyze critical bugs')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🐛 Bug Triage Assistant\n'));
    
    const spinner = ora('Analyzing bugs...').start();
    
    try {
      await connectMCP();
      
      // Get cloudId
      const resources = await callTool('getAccessibleAtlassianResources', {});
      const cloudId = JSON.parse(resources.content[0].text)[0].id;
      
      // Search for open bugs
      spinner.text = 'Fetching open bugs...';
      const bugs = await callTool('searchJiraIssuesUsingJql', {
        cloudId: cloudId,
        jql: 'type = Bug AND status != Done ORDER BY priority DESC, created DESC'
      });
      
      spinner.succeed('Bug analysis complete');
      
      const issues = JSON.parse(bugs.content[0].text);
      
      console.log(chalk.bold('\n🔥 Bug Triage Report:\n'));
      
      if (issues.issues && issues.issues.length > 0) {
        console.log(chalk.white(`Total Open Bugs: ${issues.total || 0}\n`));
        
        // Categorize by priority
        const critical = [];
        const high = [];
        const medium = [];
        const low = [];
        
        issues.issues.forEach(issue => {
          const priority = issue.fields.priority?.name || 'None';
          const bug = {
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            created: new Date(issue.fields.created).toLocaleDateString()
          };
          
          if (priority === 'Highest') critical.push(bug);
          else if (priority === 'High') high.push(bug);
          else if (priority === 'Medium') medium.push(bug);
          else low.push(bug);
        });
        
        if (critical.length > 0) {
          console.log(chalk.bold.red('🚨 CRITICAL (Highest Priority):'));
          critical.forEach(b => {
            console.log(chalk.red(`  • [${b.key}] ${b.summary}`));
            console.log(chalk.gray(`    Status: ${b.status} | Created: ${b.created}`));
          });
          console.log();
        }
        
        if (high.length > 0) {
          console.log(chalk.bold.yellow('⚠️  HIGH Priority:'));
          high.forEach(b => {
            console.log(chalk.yellow(`  • [${b.key}] ${b.summary}`));
            console.log(chalk.gray(`    Status: ${b.status} | Created: ${b.created}`));
          });
          console.log();
        }
        
        if (medium.length > 0) {
          console.log(chalk.bold.blue('📌 MEDIUM Priority:'));
          console.log(chalk.white(`  ${medium.length} bugs in this category`));
          console.log();
        }
        
        if (low.length > 0) {
          console.log(chalk.bold.gray('📎 LOW Priority:'));
          console.log(chalk.gray(`  ${low.length} bugs in this category`));
          console.log();
        }
        
        // Recommendations
        console.log(chalk.bold.green('💡 Recommendations:\n'));
        if (critical.length > 0) {
          console.log(chalk.red(`  ⚡ Address ${critical.length} critical bug(s) immediately`));
        }
        if (high.length > 0) {
          console.log(chalk.yellow(`  📋 Schedule ${high.length} high-priority bug(s) for next sprint`));
        }
        if (medium.length + low.length > 10) {
          console.log(chalk.blue(`  🧹 Consider bug bash for ${medium.length + low.length} lower-priority items`));
        }
        
      } else {
        console.log(chalk.green('🎉 No open bugs found! Your codebase is clean!'));
      }
      
      console.log(chalk.green('\n✅ Bug triage complete!\n'));
      
    } catch (error) {
      spinner.fail('Failed to perform bug triage');
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Stats Command - Quick overview
program
  .command('stats')
  .description('Show quick statistics about your Atlassian workspace')
  .action(async () => {
    console.log(chalk.bold.cyan('\n📊 Workspace Statistics\n'));
    
    const spinner = ora('Gathering statistics...').start();
    
    try {
      await connectMCP();
      
      // Get cloudId
      const resources = await callTool('getAccessibleAtlassianResources', {});
      const cloudId = JSON.parse(resources.content[0].text)[0].id;
      
      // Get Jira stats
      spinner.text = 'Fetching Jira data...';
      const allIssues = await callTool('searchJiraIssuesUsingJql', {
        cloudId: cloudId,
        jql: 'ORDER BY created DESC',
        maxResults: 100
      });
      
      // Get Confluence stats
      spinner.text = 'Fetching Confluence data...';
      const allPages = await callTool('searchConfluenceUsingCql', {
        cloudId: cloudId,
        cql: 'type=page',
        limit: 100
      });
      
      const issues = JSON.parse(allIssues.content[0].text);
      const pages = JSON.parse(allPages.content[0].text);
      
      console.log(chalk.bold('📈 Jira Statistics:'));
      console.log(chalk.white(`  Total Issues: ${issues.total || 0}`));
      
      if (issues.issues && issues.issues.length > 0) {
        const open = issues.issues.filter(i => i.fields.status.name !== 'Done').length;
        const done = issues.issues.filter(i => i.fields.status.name === 'Done').length;
        console.log(chalk.white(`  Open: ${open} | Completed: ${done}`));
      }
      
      console.log(chalk.bold('\n📚 Confluence Statistics:'));
      console.log(chalk.white(`  Total Pages: ${pages.results?.length || 0}`));
      
      console.log(chalk.green('\n✅ Statistics retrieved!\n'));
      
    } catch (error) {
      spinner.fail('Failed to gather statistics');
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Default action
program
  .name('mcp-demo')
  .description('AI-powered Jira & Confluence automation using Atlassian MCP Server')
  .version('1.0.0')
  .action(() => {
    console.log(chalk.bold.cyan('\n🚀 Atlassian MCP Hackathon Demo\n'));
    console.log(chalk.white('Available commands:\n'));
    console.log(chalk.green('  demo              ') + chalk.white('- Show all available scenarios'));
    console.log(chalk.green('  sprint-report     ') + chalk.white('- Generate sprint planning report'));
    console.log(chalk.green('  release-notes     ') + chalk.white('- Generate release notes'));
    console.log(chalk.green('  knowledge-gaps    ') + chalk.white('- Find documentation gaps'));
    console.log(chalk.green('  bug-triage        ') + chalk.white('- Prioritize critical bugs'));
    console.log(chalk.green('  stats             ') + chalk.white('- Show workspace statistics'));
    console.log(chalk.white('\nRun with --help for more options\n'));
  });

program.parse(process.argv);