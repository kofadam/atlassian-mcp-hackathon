/**
 * Create Mock Data for Local Jira
 *
 * Creates realistic PI (Program Increment) structure with:
 * - Past PIs (24.3, 24.4)
 * - Current PI (25.1 - October 2025)
 * - Future PIs (25.2, 25.3)
 * - Epics and Stories under each PI
 * - Mix of project management and software development
 */

import AtlassianRestClient from '../src/atlassian-rest-client.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new AtlassianRestClient({
  email: process.env.ATLASSIAN_EMAIL,
  apiToken: process.env.ATLASSIAN_API_TOKEN,
  domain: process.env.ATLASSIAN_DOMAIN,
  jiraBaseUrl: process.env.JIRA_BASE_URL
});

const PROJECT_KEY = process.env.DEFAULT_PROJECT_KEY || 'KMD';

// Today: October 4, 2025
const TODAY = new Date('2025-10-04');

const PIs = [
  {
    name: 'PI 24.3',
    label: 'PI-24.3',
    status: 'Done',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    theme: 'Digital Transformation & Process Optimization',
    objectives: [
      { title: 'Digitize Paper-based Workflows', businessValue: 8, features: 3 },
      { title: 'Implement Project Portfolio Management', businessValue: 9, features: 2 },
      { title: 'Automate Reporting Infrastructure', businessValue: 7, features: 2 }
    ]
  },
  {
    name: 'PI 24.4',
    label: 'PI-24.4',
    status: 'Done',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    theme: 'Cloud Migration & Team Collaboration',
    objectives: [
      { title: 'Migrate Legacy Systems to Cloud', businessValue: 10, features: 4 },
      { title: 'Enhance Team Collaboration Tools', businessValue: 8, features: 3 },
      { title: 'Implement DevOps Pipeline', businessValue: 9, features: 2 }
    ]
  },
  {
    name: 'PI 25.1',
    label: 'PI-25.1',
    status: 'In Progress',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    theme: 'AI Integration & Analytics Platform',
    objectives: [
      { title: 'Build AI-Powered Analytics Dashboard', businessValue: 10, features: 3 },
      { title: 'Implement Predictive Resource Planning', businessValue: 9, features: 2 },
      { title: 'Enhance Mobile Workforce Management', businessValue: 8, features: 3 }
    ]
  },
  {
    name: 'PI 25.2',
    label: 'PI-25.2',
    status: 'To Do',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    theme: 'Customer Experience & Integration',
    objectives: [
      { title: 'Launch Customer Self-Service Portal', businessValue: 10, features: 4 },
      { title: 'Integrate Third-Party Systems', businessValue: 8, features: 2 },
      { title: 'Implement Real-time Notifications', businessValue: 7, features: 2 }
    ]
  },
  {
    name: 'PI 25.3',
    label: 'PI-25.3',
    status: 'To Do',
    startDate: '2025-07-01',
    endDate: '2025-09-30',
    theme: 'Security & Compliance',
    objectives: [
      { title: 'Achieve SOC2 Compliance', businessValue: 10, features: 3 },
      { title: 'Implement Zero-Trust Security', businessValue: 9, features: 3 },
      { title: 'Enhance Audit & Reporting Capabilities', businessValue: 8, features: 2 }
    ]
  }
];

const FEATURES_TEMPLATES = {
  'Digitize Paper-based Workflows': [
    { name: 'Digital Document Management System', points: 13, type: 'Feature' },
    { name: 'Electronic Signature Integration', points: 8, type: 'Feature' },
    { name: 'Automated Workflow Engine', points: 21, type: 'Feature' }
  ],
  'Implement Project Portfolio Management': [
    { name: 'Portfolio Dashboard & Reporting', points: 13, type: 'Feature' },
    { name: 'Resource Allocation Module', points: 13, type: 'Feature' }
  ],
  'Automate Reporting Infrastructure': [
    { name: 'Real-time KPI Dashboard', points: 13, type: 'Feature' },
    { name: 'Automated Report Generation', points: 8, type: 'Feature' }
  ],
  'Migrate Legacy Systems to Cloud': [
    { name: 'Database Migration to AWS RDS', points: 21, type: 'Feature' },
    { name: 'Application Containerization', points: 13, type: 'Feature' },
    { name: 'CI/CD Pipeline Setup', points: 13, type: 'Feature' },
    { name: 'Infrastructure as Code Implementation', points: 8, type: 'Feature' }
  ],
  'Enhance Team Collaboration Tools': [
    { name: 'Unified Communication Platform', points: 13, type: 'Feature' },
    { name: 'Knowledge Base & Wiki', points: 8, type: 'Feature' },
    { name: 'Video Conferencing Integration', points: 5, type: 'Feature' }
  ],
  'Implement DevOps Pipeline': [
    { name: 'Automated Testing Framework', points: 13, type: 'Feature' },
    { name: 'Continuous Deployment Automation', points: 13, type: 'Feature' }
  ],
  'Build AI-Powered Analytics Dashboard': [
    { name: 'Machine Learning Model Development', points: 21, type: 'Feature' },
    { name: 'Interactive Visualization Engine', points: 13, type: 'Feature' },
    { name: 'Natural Language Query Interface', points: 13, type: 'Feature' }
  ],
  'Implement Predictive Resource Planning': [
    { name: 'Forecasting Algorithm Development', points: 21, type: 'Feature' },
    { name: 'Resource Optimization Dashboard', points: 13, type: 'Feature' }
  ],
  'Enhance Mobile Workforce Management': [
    { name: 'Mobile App Development (iOS/Android)', points: 21, type: 'Feature' },
    { name: 'Offline Capability & Sync', points: 13, type: 'Feature' },
    { name: 'GPS Tracking & Geofencing', points: 8, type: 'Feature' }
  ],
  'Launch Customer Self-Service Portal': [
    { name: 'User Authentication & Profile Management', points: 13, type: 'Feature' },
    { name: 'Ticket Management System', points: 13, type: 'Feature' },
    { name: 'Knowledge Base Search', points: 8, type: 'Feature' },
    { name: 'Live Chat Integration', points: 8, type: 'Feature' }
  ],
  'Integrate Third-Party Systems': [
    { name: 'API Gateway Development', points: 13, type: 'Feature' },
    { name: 'Data Synchronization Engine', points: 13, type: 'Feature' }
  ],
  'Implement Real-time Notifications': [
    { name: 'Push Notification Service', points: 8, type: 'Feature' },
    { name: 'Email & SMS Integration', points: 5, type: 'Feature' }
  ],
  'Achieve SOC2 Compliance': [
    { name: 'Security Audit & Gap Analysis', points: 13, type: 'Feature' },
    { name: 'Policy Documentation & Training', points: 8, type: 'Feature' },
    { name: 'Compliance Monitoring Dashboard', points: 13, type: 'Feature' }
  ],
  'Implement Zero-Trust Security': [
    { name: 'Multi-Factor Authentication', points: 13, type: 'Feature' },
    { name: 'Network Segmentation', points: 13, type: 'Feature' },
    { name: 'Identity & Access Management', points: 13, type: 'Feature' }
  ],
  'Enhance Audit & Reporting Capabilities': [
    { name: 'Audit Log Collection System', points: 13, type: 'Feature' },
    { name: 'Compliance Reporting Automation', points: 8, type: 'Feature' }
  ]
};

const STORY_TEMPLATES = [
  // Software Development Stories
  { template: 'As a developer, I want to {action} so that {benefit}', type: 'Story' },
  { template: 'As a user, I want to {action} so that {benefit}', type: 'Story' },
  { template: 'As an admin, I want to {action} so that {benefit}', type: 'Story' },
  // Project Management Stories
  { template: 'As a project manager, I want to {action} so that {benefit}', type: 'Story' },
  { template: 'As a team lead, I want to {action} so that {benefit}', type: 'Story' }
];

async function createIssue(data) {
  try {
    const result = await client.createJiraIssue(PROJECT_KEY, data);
    console.log(`✅ Created ${data.issueType}: ${data.summary}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to create ${data.issueType}: ${data.summary}`, error.message);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function populateData() {
  console.log('🚀 Starting data population for local Jira...\n');
  console.log(`📅 Today's date: ${TODAY.toISOString().split('T')[0]}\n`);

  for (const pi of PIs) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 ${pi.name}: ${pi.theme}`);
    console.log(`📅 ${pi.startDate} to ${pi.endDate}`);
    console.log(`📊 Status: ${pi.status}`);
    console.log(`${'='.repeat(60)}\n`);

    // Create PI Objectives (as Epics)
    for (const objective of pi.objectives) {
      console.log(`\n📌 Objective: ${objective.title} (Business Value: ${objective.businessValue}/10)`);

      const epicData = {
        summary: `${pi.name}: ${objective.title}`,
        description: `Business Value: ${objective.businessValue}/10\nPI: ${pi.name}\nTheme: ${pi.theme}`,
        issueType: 'Epic',
        labels: [pi.label, 'PI-Objective'],
        priority: objective.businessValue >= 9 ? 'Highest' : objective.businessValue >= 7 ? 'High' : 'Medium'
      };

      const epic = await createIssue(epicData);
      await sleep(500);

      // Create Features under this Objective
      const features = FEATURES_TEMPLATES[objective.title] || [];

      for (const feature of features) {
        console.log(`  📋 Feature: ${feature.name} (${feature.points} pts)`);

        const featureData = {
          summary: feature.name,
          description: `Part of: ${objective.title}\nPI: ${pi.name}\nStory Points: ${feature.points}`,
          issueType: 'Task',
          labels: [pi.label, 'Feature'],
          priority: pi.status === 'In Progress' ? 'High' : pi.status === 'Done' ? 'Medium' : 'Low'
        };

        const featureIssue = await createIssue(featureData);
        await sleep(500);

        // Create 2-3 Stories per Feature
        const numStories = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < numStories; i++) {
          const storyActions = [
            { action: 'implement database schema', benefit: 'we can store data efficiently' },
            { action: 'create REST API endpoints', benefit: 'frontend can consume the data' },
            { action: 'design user interface mockups', benefit: 'stakeholders can review the design' },
            { action: 'write unit tests', benefit: 'code quality is maintained' },
            { action: 'configure CI/CD pipeline', benefit: 'deployments are automated' },
            { action: 'create documentation', benefit: 'team members can understand the system' },
            { action: 'perform security audit', benefit: 'vulnerabilities are identified' },
            { action: 'optimize database queries', benefit: 'application performance improves' },
            { action: 'implement error handling', benefit: 'system is more resilient' },
            { action: 'add monitoring and logging', benefit: 'issues can be detected early' }
          ];

          const storyAction = storyActions[Math.floor(Math.random() * storyActions.length)];
          const storyTemplate = STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
          const storySummary = storyTemplate.template
            .replace('{action}', storyAction.action)
            .replace('{benefit}', storyAction.benefit);

          const storyData = {
            summary: storySummary,
            description: `Feature: ${feature.name}\nPI: ${pi.name}`,
            issueType: 'Story',
            labels: [pi.label],
            priority: 'Medium'
          };

          await createIssue(storyData);
          await sleep(300);
        }
      }
    }

    // Add some Risks for current and future PIs
    if (pi.status === 'In Progress' || pi.status === 'To Do') {
      console.log(`\n⚠️  Adding Risks for ${pi.name}...`);

      const risks = [
        {
          title: 'Resource Constraint - Key Developer Availability',
          roam: 'ROAM-Owned',
          priority: 'High',
          description: 'Senior developer scheduled for parental leave during sprint 3'
        },
        {
          title: 'Technical Dependency - Third-party API Integration',
          roam: 'ROAM-Mitigated',
          priority: 'Medium',
          description: 'Working with vendor to ensure API stability before integration'
        },
        {
          title: 'Budget Overrun Risk - Infrastructure Costs',
          roam: 'ROAM-Accepted',
          priority: 'Low',
          description: 'Cloud costs may exceed budget by 15%, accepted by leadership'
        }
      ];

      for (const risk of risks) {
        const riskData = {
          summary: `RISK: ${risk.title}`,
          description: risk.description,
          issueType: 'Task',
          labels: [pi.label, 'Risk', risk.roam],
          priority: risk.priority
        };

        await createIssue(riskData);
        await sleep(500);
      }
    }

    // Add some general project management tasks
    if (pi.status === 'In Progress') {
      console.log(`\n📝 Adding PM Tasks for ${pi.name}...`);

      const pmTasks = [
        'PI Planning - Sprint Review & Retrospective',
        'Stakeholder Communication - Weekly Status Update',
        'Risk Assessment & Mitigation Planning',
        'Resource Capacity Planning for Next Quarter',
        'Team Performance Review & Feedback Session'
      ];

      for (const task of pmTasks) {
        const taskData = {
          summary: task,
          description: `Project management activity for ${pi.name}`,
          issueType: 'Task',
          labels: [pi.label, 'PM-Task'],
          priority: 'Medium'
        };

        await createIssue(taskData);
        await sleep(300);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Data population complete!');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log('- 5 PIs created (2 past, 1 current, 2 future)');
  console.log('- Multiple objectives/epics per PI');
  console.log('- Features with story points');
  console.log('- Stories under each feature');
  console.log('- Risks for current and future PIs');
  console.log('- Project management tasks\n');
}

// Run the script
populateData().catch(console.error);
