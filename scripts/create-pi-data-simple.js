#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Simplified PI data - just the essentials for demo
const PI_DATA = {
  // PI 25.1 (Current) - Just a few key items
  objectives: [
    {
      summary: 'PI 25.1 Objective: Migrate to Microservices Architecture',
      description: `**Business Value:** 10/10
**Category:** Enabler

**Description:**
Break monolithic application into scalable microservices with API gateway.

**Success Metrics:**
- 5 core services extracted and deployed
- API response time < 200ms (p95)
- Independent service deployments`,
      labels: ['PI-25.1', 'PI-Objective', 'Microservices']
    },
    {
      summary: 'PI 25.1 Objective: Implement Advanced Analytics Platform',
      description: `**Business Value:** 8/10
**Category:** Feature

**Description:**
Build real-time analytics platform for business intelligence.

**Success Metrics:**
- Real-time dashboards with < 5s latency
- Support 100+ concurrent dashboard users`,
      labels: ['PI-25.1', 'PI-Objective', 'Analytics']
    }
  ],
  features: [
    {
      summary: 'Feature: User Service Extraction',
      description: `**Epic Link:** Migrate to Microservices Architecture
**Story Points:** 34

**Description:**
Extract user management into standalone microservice.

**Acceptance Criteria:**
- User CRUD operations via service
- JWT authentication integrated
- Service deployed to Kubernetes`,
      labels: ['PI-25.1', 'Feature', 'Microservices']
    },
    {
      summary: 'Feature: API Gateway Implementation',
      description: `**Epic Link:** Migrate to Microservices Architecture
**Story Points:** 21

**Description:**
Implement API gateway for routing and rate limiting.

**Acceptance Criteria:**
- Request routing to microservices
- JWT validation middleware
- Rate limiting per user`,
      labels: ['PI-25.1', 'Feature', 'API-Gateway']
    }
  ],
  risks: [
    {
      summary: 'Risk: Microservices complexity overwhelming team',
      description: `**Risk Level:** High
**ROAM Status:** Owned
**Impact:** Team may struggle with distributed systems complexity

**Mitigation Plan:**
- Comprehensive microservices training (2 weeks)
- Start with 1 simple service as learning exercise
- Hire senior distributed systems architect

**Owner:** Engineering Manager
**Next Review:** 2025-02-15`,
      labels: ['PI-25.1', 'Risk', 'ROAM-Owned', 'Microservices'],
      priority: 'Highest'
    },
    {
      summary: 'Risk: Data migration causing downtime',
      description: `**Risk Level:** High
**ROAM Status:** Mitigated
**Impact:** Database migration could cause service interruption

**Mitigation Plan:**
- Dual-write strategy during migration
- Extensive testing with production data copy
- Rollback scripts prepared

**Owner:** Database Team Lead
**Next Review:** 2025-02-01`,
      labels: ['PI-25.1', 'Risk', 'ROAM-Mitigated', 'Database'],
      priority: 'High'
    },
    {
      summary: 'Risk: Third-party analytics vendor lock-in',
      description: `**Risk Level:** Medium
**ROAM Status:** Accepted
**Impact:** Dependency on specific analytics vendor

**Mitigation Plan:**
- Use open standards for data collection
- Abstract vendor APIs behind interface

**Owner:** Product Manager`,
      labels: ['PI-25.1', 'Risk', 'ROAM-Accepted', 'Analytics'],
      priority: 'Medium'
    }
  ]
};

// Helper to wait between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createPIData() {
  console.log('🎯 Starting SAFe PI (Program Increment) data creation...\n');

  // Initialize MCP client
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'],
  });

  const client = new Client({
    name: 'pi-data-creator',
    version: '1.0.0',
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to Atlassian MCP server\n');

    // Get project key
    console.log('🔍 Finding Jira project...\n');
    let projectKey = 'KMD'; // Default fallback

    try {
      const projectsResult = await client.callTool('getVisibleJiraProjects', {});

      if (projectsResult && projectsResult.content && projectsResult.content[0]) {
        const resultText = projectsResult.content[0].text;
        const projectMatch = resultText.match(/"key"\s*:\s*"([^"]+)"/);
        if (projectMatch) {
          projectKey = projectMatch[1];
          console.log(`✅ Found project: ${projectKey}\n`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Using default project: ${projectKey}\n`);
    }

    let createdCount = 0;
    let failedCount = 0;

    console.log('📋 Creating PI 25.1 (Current Program Increment)...\n');
    console.log(`   This will create ${PI_DATA.objectives.length} objectives, ${PI_DATA.features.length} features, and ${PI_DATA.risks.length} risks.\n`);

    // Create Objectives
    console.log('  Creating PI Objectives...');
    for (const objective of PI_DATA.objectives) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Story',
          summary: objective.summary,
          description: objective.description,
          labels: objective.labels.join(',')
        });
        console.log(`    ✓ ${objective.summary.substring(0, 60)}...`);
        createdCount++;
        await delay(1000); // Wait 1 second between creates
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Create Features
    console.log('\n  Creating PI Features...');
    for (const feature of PI_DATA.features) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Story',
          summary: feature.summary,
          description: feature.description,
          labels: feature.labels.join(',')
        });
        console.log(`    ✓ ${feature.summary.substring(0, 60)}...`);
        createdCount++;
        await delay(1000);
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Create Risks
    console.log('\n  Creating PI Risks...');
    for (const risk of PI_DATA.risks) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Task',
          summary: risk.summary,
          description: risk.description,
          labels: risk.labels.join(',')
        });
        console.log(`    ✓ ${risk.summary.substring(0, 60)}...`);
        createdCount++;
        await delay(1000);
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✨ PI data creation completed!');
    console.log('='.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`  ✓ Successfully created: ${createdCount} items`);
    if (failedCount > 0) {
      console.log(`  ✗ Failed to create: ${failedCount} items`);
    }
    console.log('\nPI 25.1 (Current):');
    console.log(`  - Objectives: ${PI_DATA.objectives.length}`);
    console.log(`  - Features: ${PI_DATA.features.length}`);
    console.log(`  - Risks: ${PI_DATA.risks.length}`);

    console.log('\n🎉 Your Jira now has SAFe PI planning data!');
    console.log('\n💡 Try these queries:');
    console.log('  - "Show PI 25.1 objectives"');
    console.log('  - "Show PI 25.1 risks"');
    console.log('  - "Show owned risks"');
    console.log('  - "Generate PI 25.1 report"');
    console.log('  - "Show current PI"');

  } catch (error) {
    console.error('❌ Error creating PI data:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('  1. Make sure mcp-remote is authenticated with Atlassian');
    console.error('  2. Check you have permissions to create issues');
    console.error('  3. Verify the project key exists');
  } finally {
    await client.close();
  }
}

// Run the script
createPIData().catch(console.error);
