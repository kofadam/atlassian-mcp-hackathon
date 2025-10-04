#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// SAFe PI (Program Increment) mock data
const PI_DATA = {
  // PI 24.4 (Completed)
  pi_24_4: {
    name: 'PI 24.4',
    status: 'Completed',
    startDate: '2024-10-01',
    endDate: '2024-12-20',
    objectives: [
      {
        summary: 'PI 24.4 Objective: Establish Cloud Infrastructure Foundation',
        description: `**Business Value:** 8/10
**Category:** Enabler

**Description:**
Build foundational cloud infrastructure to support scalable microservices architecture.

**Success Metrics:**
- 99.9% uptime SLA
- Support 10,000 concurrent users
- Auto-scaling configured and tested

**Dependencies:**
- Cloud provider account setup
- Security compliance approval`,
        labels: ['PI-24.4', 'PI-Objective', 'Cloud', 'Infrastructure']
      },
      {
        summary: 'PI 24.4 Objective: Modernize Authentication System',
        description: `**Business Value:** 9/10
**Category:** Feature

**Description:**
Replace legacy authentication with modern OAuth 2.0/OIDC implementation.

**Success Metrics:**
- Support SSO with major providers (Google, Microsoft, Okta)
- MFA implementation with 95% adoption
- Reduce authentication-related support tickets by 60%

**Dependencies:**
- Security audit completion
- Identity provider integrations`,
        labels: ['PI-24.4', 'PI-Objective', 'Security', 'Authentication']
      }
    ],
    features: [
      {
        summary: 'Feature: Kubernetes Cluster Setup',
        description: `**Epic Link:** Cloud Infrastructure Foundation
**Story Points:** 21

**Description:**
Set up production-ready Kubernetes cluster with monitoring, logging, and auto-scaling.

**Acceptance Criteria:**
- Multi-zone cluster deployment
- Prometheus + Grafana monitoring
- ELK stack for logging
- Horizontal pod autoscaling configured`,
        labels: ['PI-24.4', 'Feature', 'Cloud', 'Kubernetes'],
        storyPoints: 21
      },
      {
        summary: 'Feature: OAuth 2.0 Authentication Implementation',
        description: `**Epic Link:** Modernize Authentication System
**Story Points:** 34

**Description:**
Implement OAuth 2.0 authentication with support for multiple identity providers.

**Acceptance Criteria:**
- Support Google, Microsoft, and Okta
- JWT token management
- Refresh token rotation
- Session management
- API endpoints protected`,
        labels: ['PI-24.4', 'Feature', 'OAuth', 'Authentication'],
        storyPoints: 34
      },
      {
        summary: 'Feature: Multi-Factor Authentication (MFA)',
        description: `**Epic Link:** Modernize Authentication System
**Story Points:** 21

**Description:**
Add MFA support with TOTP and SMS options.

**Acceptance Criteria:**
- TOTP authenticator app support
- SMS backup codes
- Recovery flow
- User self-service enrollment`,
        labels: ['PI-24.4', 'Feature', 'MFA', 'Security'],
        storyPoints: 21
      }
    ],
    risks: [
      {
        summary: 'Risk: Cloud migration performance degradation',
        description: `**Risk Level:** High
**ROAM Status:** Mitigated
**Impact:** System performance could degrade during migration

**Mitigation Plan:**
- Comprehensive load testing before migration
- Blue-green deployment strategy
- Rollback plan prepared
- Performance monitoring dashboards

**Owner:** DevOps Team Lead
**Updated:** 2024-12-15`,
        labels: ['PI-24.4', 'Risk', 'ROAM-Mitigated', 'Cloud'],
        priority: 'High'
      },
      {
        summary: 'Risk: OAuth provider API changes breaking integration',
        description: `**Risk Level:** Medium
**ROAM Status:** Accepted
**Impact:** OAuth provider changes could break authentication flow

**Mitigation Plan:**
- Monitor provider changelogs
- Implement adapter pattern for providers
- Maintain basic auth as fallback

**Owner:** Security Team
**Updated:** 2024-12-10`,
        labels: ['PI-24.4', 'Risk', 'ROAM-Accepted', 'OAuth'],
        priority: 'Medium'
      }
    ]
  },

  // PI 25.1 (Current)
  pi_25_1: {
    name: 'PI 25.1',
    status: 'In Progress',
    startDate: '2025-01-06',
    endDate: '2025-03-28',
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
- Independent service deployments
- Zero-downtime deployments

**Dependencies:**
- Kubernetes infrastructure (PI 24.4)
- Service mesh selection
- Database migration strategy`,
        labels: ['PI-25.1', 'PI-Objective', 'Microservices', 'Architecture']
      },
      {
        summary: 'PI 25.1 Objective: Implement Advanced Analytics Platform',
        description: `**Business Value:** 8/10
**Category:** Feature

**Description:**
Build real-time analytics platform for business intelligence and user insights.

**Success Metrics:**
- Real-time dashboards with < 5s latency
- Support 100+ concurrent dashboard users
- 50+ custom reports available
- Data pipeline processing 1M events/day

**Dependencies:**
- Data warehouse setup
- ETL pipeline infrastructure
- BI tool selection`,
        labels: ['PI-25.1', 'PI-Objective', 'Analytics', 'Data']
      },
      {
        summary: 'PI 25.1 Objective: Enhance Mobile Experience',
        description: `**Business Value:** 9/10
**Category:** Feature

**Description:**
Deliver world-class mobile experience with offline support and native performance.

**Success Metrics:**
- App store rating > 4.5 stars
- 50% reduction in app load time
- Offline mode for core features
- 30% increase in mobile engagement

**Dependencies:**
- Mobile API v2 completion
- Push notification infrastructure
- App store optimization`,
        labels: ['PI-25.1', 'PI-Objective', 'Mobile', 'UX']
      }
    ],
    features: [
      {
        summary: 'Feature: User Service Extraction',
        description: `**Epic Link:** Migrate to Microservices Architecture
**Story Points:** 34

**Description:**
Extract user management into standalone microservice with REST + GraphQL APIs.

**Acceptance Criteria:**
- User CRUD operations via service
- JWT authentication integrated
- Database migration completed
- Service deployed to Kubernetes
- Health checks and monitoring`,
        labels: ['PI-25.1', 'Feature', 'Microservices', 'User-Service'],
        storyPoints: 34
      },
      {
        summary: 'Feature: API Gateway Implementation',
        description: `**Epic Link:** Migrate to Microservices Architecture
**Story Points:** 21

**Description:**
Implement API gateway for routing, authentication, and rate limiting.

**Acceptance Criteria:**
- Request routing to microservices
- JWT validation middleware
- Rate limiting per user/endpoint
- API versioning support
- Request/response logging`,
        labels: ['PI-25.1', 'Feature', 'Microservices', 'API-Gateway'],
        storyPoints: 21
      },
      {
        summary: 'Feature: Real-time Analytics Dashboard',
        description: `**Epic Link:** Implement Advanced Analytics Platform
**Story Points:** 34

**Description:**
Build real-time analytics dashboard with key business metrics and user activity.

**Acceptance Criteria:**
- Live metrics update every 5 seconds
- 10+ pre-built dashboard templates
- Custom dashboard builder
- Export to PDF/Excel
- Drill-down capabilities`,
        labels: ['PI-25.1', 'Feature', 'Analytics', 'Dashboard'],
        storyPoints: 34
      },
      {
        summary: 'Feature: Data Pipeline for Event Processing',
        description: `**Epic Link:** Implement Advanced Analytics Platform
**Story Points:** 21

**Description:**
Build scalable event processing pipeline using Kafka and stream processing.

**Acceptance Criteria:**
- Kafka cluster setup
- Event schemas defined
- Stream processing jobs
- Data quality validation
- Error handling and replay`,
        labels: ['PI-25.1', 'Feature', 'Analytics', 'Data-Pipeline'],
        storyPoints: 21
      },
      {
        summary: 'Feature: Mobile App Offline Mode',
        description: `**Epic Link:** Enhance Mobile Experience
**Story Points:** 21

**Description:**
Implement offline-first architecture with local caching and sync.

**Acceptance Criteria:**
- Core features work offline
- Background sync when online
- Conflict resolution
- Offline data persistence
- User notifications for sync status`,
        labels: ['PI-25.1', 'Feature', 'Mobile', 'Offline'],
        storyPoints: 21
      },
      {
        summary: 'Feature: Mobile Push Notification System',
        description: `**Epic Link:** Enhance Mobile Experience
**Story Points:** 13

**Description:**
Implement push notifications for iOS and Android with personalization.

**Acceptance Criteria:**
- FCM and APNs integration
- User notification preferences
- Rich notifications with actions
- Notification analytics
- Deep linking support`,
        labels: ['PI-25.1', 'Feature', 'Mobile', 'Push-Notifications'],
        storyPoints: 13
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
- Establish clear service boundaries
- Document patterns and best practices

**Owner:** Engineering Manager
**Next Review:** 2025-02-15
**Updated:** 2025-01-20`,
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
- Migration during low-traffic window
- Real-time monitoring during migration

**Owner:** Database Team Lead
**Next Review:** 2025-02-01
**Updated:** 2025-01-18`,
        labels: ['PI-25.1', 'Risk', 'ROAM-Mitigated', 'Database'],
        priority: 'Highest'
      },
      {
        summary: 'Risk: Third-party analytics vendor lock-in',
        description: `**Risk Level:** Medium
**ROAM Status:** Accepted
**Impact:** Dependency on specific analytics vendor could limit flexibility

**Mitigation Plan:**
- Use open standards for data collection
- Abstract vendor APIs behind our interface
- Plan for vendor switching if needed
- Regular vendor performance reviews

**Owner:** Product Manager
**Next Review:** 2025-03-01
**Updated:** 2025-01-15`,
        labels: ['PI-25.1', 'Risk', 'ROAM-Accepted', 'Analytics'],
        priority: 'Medium'
      },
      {
        summary: 'Risk: Mobile app store review delays',
        description: `**Risk Level:** Medium
**ROAM Status:** Resolved
**Impact:** App store review could delay PI completion

**Mitigation Plan:**
- Submit to stores 2 weeks before PI end
- Pre-review by app store consultants
- Prepare expedited review justification
- Have web fallback ready

**Resolution:** Early submission completed, apps approved
**Owner:** Mobile Team Lead
**Resolved Date:** 2025-01-25`,
        labels: ['PI-25.1', 'Risk', 'ROAM-Resolved', 'Mobile'],
        priority: 'Low'
      }
    ]
  }
};

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

    // Get project key using getVisibleJiraProjects instead of search
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
        } else {
          console.log(`⚠️  Could not parse project key, using default: ${projectKey}\n`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not get projects (${error.message}), using default: ${projectKey}\n`);
    }

    let createdCount = 0;
    let failedCount = 0;

    // Create PI 24.4 (Completed PI)
    console.log('📋 Creating PI 24.4 (Completed Program Increment)...\n');

    // Create PI 24.4 Objectives
    console.log('  Creating PI Objectives...');
    for (const objective of PI_DATA.pi_24_4.objectives) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Story',
          summary: objective.summary,
          description: objective.description,
          labels: objective.labels
        });
        console.log(`    ✓ ${objective.summary}`);
        createdCount++;
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Create PI 24.4 Features
    console.log('\n  Creating PI Features...');
    for (const feature of PI_DATA.pi_24_4.features) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Story',
          summary: feature.summary,
          description: feature.description,
          labels: feature.labels
        });
        console.log(`    ✓ ${feature.summary}`);
        createdCount++;
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Create PI 24.4 Risks
    console.log('\n  Creating PI Risks...');
    for (const risk of PI_DATA.pi_24_4.risks) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Task',
          summary: risk.summary,
          description: risk.description,
          labels: risk.labels
        });
        console.log(`    ✓ ${risk.summary}`);
        createdCount++;
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Create PI 25.1 (Current PI)
    console.log('\n\n📋 Creating PI 25.1 (Current Program Increment)...\n');

    // Create PI 25.1 Objectives
    console.log('  Creating PI Objectives...');
    for (const objective of PI_DATA.pi_25_1.objectives) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Story',
          summary: objective.summary,
          description: objective.description,
          labels: objective.labels
        });
        console.log(`    ✓ ${objective.summary}`);
        createdCount++;
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Create PI 25.1 Features
    console.log('\n  Creating PI Features...');
    for (const feature of PI_DATA.pi_25_1.features) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Story',
          summary: feature.summary,
          description: feature.description,
          labels: feature.labels
        });
        console.log(`    ✓ ${feature.summary}`);
        createdCount++;
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Create PI 25.1 Risks
    console.log('\n  Creating PI Risks...');
    for (const risk of PI_DATA.pi_25_1.risks) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Task',
          summary: risk.summary,
          description: risk.description,
          labels: risk.labels
        });
        console.log(`    ✓ ${risk.summary}`);
        createdCount++;
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        failedCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✨ SAFe PI data creation completed!');
    console.log('='.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`  ✓ Successfully created: ${createdCount} items`);
    if (failedCount > 0) {
      console.log(`  ✗ Failed to create: ${failedCount} items`);
    }
    console.log('\nPI 24.4 (Completed):');
    console.log(`  - Objectives: ${PI_DATA.pi_24_4.objectives.length}`);
    console.log(`  - Features: ${PI_DATA.pi_24_4.features.length}`);
    console.log(`  - Risks: ${PI_DATA.pi_24_4.risks.length}`);
    console.log('\nPI 25.1 (Current):');
    console.log(`  - Objectives: ${PI_DATA.pi_25_1.objectives.length}`);
    console.log(`  - Features: ${PI_DATA.pi_25_1.features.length}`);
    console.log(`  - Risks: ${PI_DATA.pi_25_1.risks.length}`);

    console.log('\n🎉 Your Jira now has SAFe PI planning data!');
    console.log('\n💡 Try these queries:');
    console.log('  - "Show PI 25.1 objectives"');
    console.log('  - "What are the PI 25.1 risks?"');
    console.log('  - "Show PI features"');
    console.log('  - "Generate PI 25.1 report"');
    console.log('  - "Compare PI 24.4 vs PI 25.1"');

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
