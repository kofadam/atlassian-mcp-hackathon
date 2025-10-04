#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

console.log('🎯 Creating minimal PI test data...\n');

const client = new Client({
  name: 'pi-test-creator',
  version: '1.0.0'
}, {
  capabilities: {}
});

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
});

await client.connect(transport);
console.log('✅ Connected to Atlassian MCP\n');

// Get cloud ID
const resourcesResult = await client.callTool({
  name: 'getAccessibleAtlassianResources',
  arguments: {}
});
const resources = JSON.parse(resourcesResult.content[0].text);
const cloudId = resources[0].id;

// Use hardcoded project key
const projectKey = 'KMD';

console.log(`📋 Creating test PI issues in project ${projectKey}...\n`);

// Create just 3 test issues
const testIssues = [
  {
    summary: 'PI 25.4 Objective: Cloud Infrastructure Migration',
    description: 'Migrate legacy infrastructure to cloud-native architecture. **Business Value:** 10/10',
    labels: ['PI-25.4', 'PI-Objective']
  },
  {
    summary: 'PI 25.4 Feature: Container Orchestration',
    description: 'Implement Kubernetes-based container orchestration. **Story Points:** 21',
    labels: ['PI-25.4', 'Feature']
  },
  {
    summary: 'PI 26.1 Objective: AI-Powered Analytics',
    description: 'Build machine learning pipeline for predictive analytics. **Business Value:** 9/10',
    labels: ['PI-26.1', 'PI-Objective']
  }
];

for (const issue of testIssues) {
  try {
    console.log(`  Creating: ${issue.summary}`);

    const result = await client.callTool({
      name: 'createJiraIssue',
      arguments: {
        cloudId: cloudId,
        projectKey: projectKey,
        issueTypeName: 'Task',
        summary: issue.summary,
        description: issue.description,
        labels: issue.labels
      }
    });

    const created = JSON.parse(result.content[0].text);
    console.log(`    ✓ Created ${created.key}`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));

  } catch (error) {
    console.log(`    ✗ Failed: ${error.message}`);
  }
}

console.log('\n✅ Done! Test PI data created.');
console.log('\nYou can now test with: "show pi" in the web UI');

await client.close();
process.exit(0);
