#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import chalk from 'chalk';
import ora from 'ora';

// Mock user roles (we'll use the real user's ID but create varied descriptions)
const mockRoles = [
  { role: 'Frontend Developer', team: 'Engineering' },
  { role: 'Backend Developer', team: 'Engineering' },
  { role: 'Product Manager', team: 'Product' },
  { role: 'UX Designer', team: 'Design' },
  { role: 'QA Engineer', team: 'Quality' },
  { role: 'DevOps Engineer', team: 'Infrastructure' }
];

// Business-focused mock issues for 2025 planning
const businessMockIssues = [
  // Q1 2025 - Customer Portal Launch
  {
    summary: '[Q1-2025] Launch new customer self-service portal',
    type: 'Epic',
    priority: 'Highest',
    description: 'Strategic initiative: Enable customers to manage accounts, view invoices, and submit tickets without calling support. Expected to reduce support costs by 30%.',
    labels: ['Q1-2025', 'customer-experience', 'cost-reduction'],
    roleHint: 'Product Manager'
  },
  {
    summary: 'Design customer portal UI/UX mockups',
    type: 'Story',
    priority: 'High',
    description: 'Create high-fidelity designs for customer portal including dashboard, account settings, and ticket management.',
    labels: ['Q1-2025', 'design', 'customer-portal'],
    roleHint: 'UX Designer'
  },
  {
    summary: 'Implement customer authentication system',
    type: 'Story',
    priority: 'High',
    description: 'Build secure authentication with SSO support (Google, Microsoft, SAML). Include MFA capability.',
    labels: ['Q1-2025', 'security', 'customer-portal'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'Build responsive customer dashboard frontend',
    type: 'Story',
    priority: 'High',
    description: 'React-based dashboard showing account overview, recent tickets, billing info. Must work on mobile.',
    labels: ['Q1-2025', 'frontend', 'customer-portal'],
    roleHint: 'Frontend Developer'
  },
  {
    summary: 'Setup customer portal infrastructure on AWS',
    type: 'Task',
    priority: 'High',
    description: 'Provision EKS cluster, RDS instance, CloudFront CDN, and monitoring for customer portal.',
    labels: ['Q1-2025', 'infrastructure', 'customer-portal'],
    roleHint: 'DevOps Engineer'
  },
  {
    summary: 'Customer portal load testing - 10k concurrent users',
    type: 'Task',
    priority: 'Medium',
    description: 'Performance testing to ensure portal can handle expected launch traffic of 10,000 concurrent users.',
    labels: ['Q1-2025', 'qa', 'performance'],
    roleHint: 'QA Engineer'
  },

  // Q2 2025 - Mobile App Development
  {
    summary: '[Q2-2025] Launch iOS and Android mobile apps',
    type: 'Epic',
    priority: 'High',
    description: 'Expand to mobile platforms with native apps. Market research shows 65% of users prefer mobile access.',
    labels: ['Q2-2025', 'mobile', 'strategic'],
    roleHint: 'Product Manager'
  },
  {
    summary: 'iOS app development - Core features',
    type: 'Story',
    priority: 'High',
    description: 'Swift/SwiftUI native iOS app with dashboard, notifications, and offline mode.',
    labels: ['Q2-2025', 'mobile', 'ios'],
    roleHint: 'Frontend Developer'
  },
  {
    summary: 'Android app development - Core features',
    type: 'Story',
    priority: 'High',
    description: 'Kotlin native Android app with material design, push notifications, and offline support.',
    labels: ['Q2-2025', 'mobile', 'android'],
    roleHint: 'Frontend Developer'
  },
  {
    summary: 'Mobile API optimization - reduce payload size',
    type: 'Story',
    priority: 'Medium',
    description: 'Optimize API responses for mobile bandwidth constraints. Target 70% payload reduction.',
    labels: ['Q2-2025', 'mobile', 'performance'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'Setup mobile CI/CD pipeline with TestFlight and Play Console',
    type: 'Task',
    priority: 'Medium',
    description: 'Automated build and deployment pipeline for iOS (TestFlight) and Android (Play Console Beta).',
    labels: ['Q2-2025', 'mobile', 'devops'],
    roleHint: 'DevOps Engineer'
  },

  // Q3 2025 - Platform Migration
  {
    summary: '[Q3-2025] Migrate legacy platform to microservices',
    type: 'Epic',
    priority: 'High',
    description: 'Technical debt: Migrate monolith to microservices architecture. Reduces deployment time and improves scalability.',
    labels: ['Q3-2025', 'architecture', 'technical-debt'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'Design microservices architecture and service boundaries',
    type: 'Story',
    priority: 'High',
    description: 'Define service domains, API contracts, and migration strategy. Include sequence diagrams.',
    labels: ['Q3-2025', 'architecture'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'Implement API Gateway with Kong',
    type: 'Story',
    priority: 'High',
    description: 'Setup Kong API Gateway for routing, rate limiting, authentication, and monitoring.',
    labels: ['Q3-2025', 'architecture', 'infrastructure'],
    roleHint: 'DevOps Engineer'
  },
  {
    summary: 'Extract user service from monolith',
    type: 'Story',
    priority: 'High',
    description: 'First microservice extraction: user management. Includes database split and data migration.',
    labels: ['Q3-2025', 'microservices'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'Extract billing service from monolith',
    type: 'Story',
    priority: 'Medium',
    description: 'Second microservice: billing and payments. Critical for PCI compliance isolation.',
    labels: ['Q3-2025', 'microservices'],
    roleHint: 'Backend Developer'
  },

  // Q4 2025 - AI Features
  {
    summary: '[Q4-2025] Launch AI-powered features and analytics',
    type: 'Epic',
    priority: 'Medium',
    description: 'Innovation initiative: Add AI chatbot, predictive analytics, and smart recommendations.',
    labels: ['Q4-2025', 'ai', 'innovation'],
    roleHint: 'Product Manager'
  },
  {
    summary: 'Implement AI chatbot for customer support',
    type: 'Story',
    priority: 'Medium',
    description: 'GPT-4 powered chatbot for answering common customer questions. Integrate with knowledge base.',
    labels: ['Q4-2025', 'ai', 'customer-experience'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'Build predictive analytics dashboard for business metrics',
    type: 'Story',
    priority: 'Medium',
    description: 'ML-powered predictions for churn risk, revenue forecasts, and usage trends.',
    labels: ['Q4-2025', 'ai', 'analytics'],
    roleHint: 'Frontend Developer'
  },

  // Current Sprint - Bugs and Urgent Items
  {
    summary: 'שגיאה קריטית: תשלום נכשל עבור לקוחות באירופה',
    type: 'Bug',
    priority: 'Highest',
    description: 'Payment gateway failing for EU customers due to SEPA validation issue. Affecting 15% of transactions.',
    labels: ['sprint-current', 'critical', 'payments'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'דף הבית נטען לאט - מעל 5 שניות',
    type: 'Bug',
    priority: 'High',
    description: 'Homepage load time increased to 5.2 seconds (target: 2 seconds). Users complaining about slow experience.',
    labels: ['sprint-current', 'performance', 'frontend'],
    roleHint: 'Frontend Developer'
  },
  {
    summary: 'דליפת זיכרון בשרת הייצור',
    type: 'Bug',
    priority: 'High',
    description: 'Production server memory leak causing crashes every 3-4 hours. Requires investigation with profiling tools.',
    labels: ['sprint-current', 'production', 'stability'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'שיפור חווית משתמש בטופס הרשמה',
    type: 'Story',
    priority: 'Medium',
    description: 'Signup form has 45% abandonment rate. Add progress indicator, inline validation, and social login.',
    labels: ['sprint-current', 'ux', 'conversion'],
    roleHint: 'UX Designer'
  },
  {
    summary: 'הוסף תמיכה בעברית מלאה בממשק',
    type: 'Story',
    priority: 'Medium',
    description: 'Add full RTL support and Hebrew translations for UI. Large Hebrew-speaking user base requesting this.',
    labels: ['sprint-current', 'i18n', 'hebrew'],
    roleHint: 'Frontend Developer'
  },

  // Backlog - Future Enhancements
  {
    summary: 'הוסף אינטגרציה עם Salesforce CRM',
    type: 'Story',
    priority: 'Low',
    description: 'Enterprise customers requesting two-way sync with Salesforce for account and opportunity data.',
    labels: ['backlog', 'integrations', 'enterprise'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'בנה מערכת דוחות מתקדמת עם ייצוא לאקסל',
    type: 'Story',
    priority: 'Low',
    description: 'Business users need customizable reports with Excel export, PDF generation, and scheduled delivery.',
    labels: ['backlog', 'reporting', 'business-intelligence'],
    roleHint: 'Frontend Developer'
  },
  {
    summary: 'הוסף תמיכה ב-SSO עם SAML 2.0',
    type: 'Story',
    priority: 'Low',
    description: 'Enterprise security requirement for SAML 2.0 SSO with Okta, Azure AD, and OneLogin.',
    labels: ['backlog', 'security', 'enterprise'],
    roleHint: 'Backend Developer'
  },
  {
    summary: 'שדרג את מסד הנתונים ל-PostgreSQL 16',
    type: 'Task',
    priority: 'Low',
    description: 'Technical debt: upgrade from PostgreSQL 13 to 16 for performance improvements and new features.',
    labels: ['backlog', 'technical-debt', 'database'],
    roleHint: 'DevOps Engineer'
  },
  {
    summary: 'הכן תיעוד API מלא עם Swagger/OpenAPI',
    type: 'Task',
    priority: 'Low',
    description: 'Generate comprehensive API documentation for external developers. Include code examples in multiple languages.',
    labels: ['backlog', 'documentation', 'developer-experience'],
    roleHint: 'Backend Developer'
  },

  // Security & Compliance
  {
    summary: 'ביצוע ביקורת אבטחה שנתית - ISO 27001',
    type: 'Task',
    priority: 'High',
    description: 'Annual security audit for ISO 27001 compliance. Includes penetration testing and vulnerability assessment.',
    labels: ['compliance', 'security', 'audit'],
    roleHint: 'DevOps Engineer'
  },
  {
    summary: 'יישום GDPR data deletion workflow',
    type: 'Story',
    priority: 'High',
    description: 'Implement automated GDPR compliance workflow for user data deletion requests. Required by EU regulations.',
    labels: ['compliance', 'gdpr', 'privacy'],
    roleHint: 'Backend Developer'
  },

  // Team Operations
  {
    summary: 'שדרוג תשתית הניטור - Grafana + Prometheus',
    type: 'Task',
    priority: 'Medium',
    description: 'Upgrade monitoring stack to Grafana 10 and Prometheus 2.5 with improved dashboards and alerting.',
    labels: ['infrastructure', 'monitoring', 'operations'],
    roleHint: 'DevOps Engineer'
  },
  {
    summary: 'הקמת סביבת staging חדשה',
    type: 'Task',
    priority: 'Medium',
    description: 'Setup dedicated staging environment that mirrors production for better testing before deployments.',
    labels: ['infrastructure', 'testing', 'operations'],
    roleHint: 'DevOps Engineer'
  },
  {
    summary: 'תיעוד תהליכי פיתוח ו-deployment',
    type: 'Task',
    priority: 'Low',
    description: 'Document development workflows, deployment procedures, and troubleshooting guides for team onboarding.',
    labels: ['documentation', 'operations', 'onboarding'],
    roleHint: 'DevOps Engineer'
  }
];

async function createBusinessMockData() {
  console.log(chalk.bold.cyan('\n🏢  Creating Business Mock Data for 2025 Planning\n'));

  const spinner = ora('Connecting to MCP server...').start();

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
    });

    const client = new Client({
      name: 'business-data-creator',
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

    console.log(chalk.bold('\n📝 Creating Business Issues:\n'));

    let createdCount = 0;
    let skippedCount = 0;

    for (const issue of businessMockIssues) {
      try {
        spinner.start(`Creating: ${issue.summary.substring(0, 60)}...`);

        // Find matching issue type
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
            'Bug': ['Bug', 'Defect', 'באג'],
            'Story': ['Story', 'User Story', 'סטורי'],
            'Task': ['Task', 'To Do', 'משימה'],
            'Epic': ['Epic', 'אפיק']
          };

          const possibleNames = alternatives[issue.type] || [issue.type];
          if (Array.isArray(typeList)) {
            issueType = typeList.find(it => {
              const name = it.name || it.untranslatedName || '';
              return possibleNames.some(alt => name.toLowerCase() === alt.toLowerCase());
            });
          }
        }

        if (!issueType) {
          spinner.warn(`Skipping - ${issue.type} not available: ${issue.summary.substring(0, 50)}`);
          skippedCount++;
          continue;
        }

        // Create issue with assignee and labels
        const createArgs = {
          cloudId: cloudId,
          projectKey: project.key,
          issueTypeName: issueType.name,
          summary: issue.summary,
          description: `${issue.description}\n\n_Assigned to: ${issue.roleHint}_`
        };

        // Note: MCP createJiraIssue doesn't support assignee or labels in basic call
        // We'll add the role hint in the description for now

        const result = await client.callTool({
          name: 'createJiraIssue',
          arguments: createArgs
        });

        const created = JSON.parse(result.content[0].text);
        const roleEmoji = issue.roleHint.includes('Developer') ? '👨‍💻' :
                         issue.roleHint.includes('Manager') ? '📊' :
                         issue.roleHint.includes('Designer') ? '🎨' :
                         issue.roleHint.includes('QA') ? '🧪' :
                         issue.roleHint.includes('DevOps') ? '🔧' : '👤';

        spinner.succeed(`${chalk.green(created.key)} ${roleEmoji} ${issue.roleHint}: ${issue.summary.substring(0, 50)}...`);
        createdCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error) {
        spinner.fail(`Failed: ${issue.summary.substring(0, 50)}`);
        console.log(chalk.gray(`  Error: ${error.message}`));
      }
    }

    console.log(chalk.bold.green(`\n✅ Successfully created ${createdCount} business issues!`));
    if (skippedCount > 0) {
      console.log(chalk.yellow(`⚠️  Skipped ${skippedCount} issues (issue type not available)`));
    }

    console.log(chalk.bold.cyan('\n📊 Summary of Created Data:\n'));
    console.log(chalk.white('  • Q1 2025: Customer Portal Launch (6 issues)'));
    console.log(chalk.white('  • Q2 2025: Mobile App Development (5 issues)'));
    console.log(chalk.white('  • Q3 2025: Microservices Migration (5 issues)'));
    console.log(chalk.white('  • Q4 2025: AI Features (3 issues)'));
    console.log(chalk.white('  • Current Sprint: Urgent bugs and tasks (5 issues)'));
    console.log(chalk.white('  • Backlog: Future enhancements (5 issues)'));
    console.log(chalk.white('  • Security & Compliance (2 issues)'));
    console.log(chalk.white('  • Operations (3 issues)'));

    if (createdCount > 0) {
      console.log(chalk.bold.yellow('\n🚀 Next Steps:\n'));
      console.log(chalk.white('1. Run the web interface: npm run web'));
      console.log(chalk.white('2. Try queries like:'));
      console.log(chalk.gray('   • "הצג נושאים לרבעון 1"'));
      console.log(chalk.gray('   • "צור דוח באגים"'));
      console.log(chalk.gray('   • "הצג כל הבאגים הקריטיים"'));
      console.log(chalk.gray('   • "Show Q2 2025 mobile initiatives"'));
      console.log(chalk.white('3. Generate reports and publish to Confluence\n'));
    }

    process.exit(0);

  } catch (error) {
    spinner.fail('Failed to create business mock data');
    console.error(chalk.red('\nError:'), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

createBusinessMockData();
