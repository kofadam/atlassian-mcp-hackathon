/**
 * Create CORRECTED Mock Data for Local Jira
 *
 * TODAY: October 4th, 2025
 *
 * Creates realistic PI structure with:
 * - Past PIs (24.4, 25.1, 25.2, 25.3) - ALL DONE
 * - Current PI (25.4 - Oct-Dec 2025) - IN PROGRESS (started 4 days ago!)
 * - Future PIs (26.1, 26.2)
 * - Sprints within each PI (6 sprints per PI, 2 weeks each)
 * - Epics, Features, and Stories
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

// TODAY: October 4, 2025
const TODAY = new Date('2025-10-04');

const PIs = [
  {
    name: 'PI 24.4',
    label: 'PI-24.4',
    status: 'Done',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    theme: 'Foundation & Process Improvement',
    sprints: ['Sprint-24.4.1', 'Sprint-24.4.2', 'Sprint-24.4.3', 'Sprint-24.4.4', 'Sprint-24.4.5', 'Sprint-24.4.6'],
    objectives: [
      { title: 'Standardize Development Processes', businessValue: 8, features: 2 },
      { title: 'Implement Basic Automation', businessValue: 7, features: 2 }
    ]
  },
  {
    name: 'PI 25.1',
    label: 'PI-25.1',
    status: 'Done',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    theme: 'Cloud Migration & Infrastructure',
    sprints: ['Sprint-25.1.1', 'Sprint-25.1.2', 'Sprint-25.1.3', 'Sprint-25.1.4', 'Sprint-25.1.5', 'Sprint-25.1.6'],
    objectives: [
      { title: 'Migrate Core Services to AWS', businessValue: 10, features: 4 },
      { title: 'Implement CI/CD Pipeline', businessValue: 9, features: 2 },
      { title: 'Database Modernization', businessValue: 8, features: 2 }
    ]
  },
  {
    name: 'PI 25.2',
    label: 'PI-25.2',
    status: 'Done',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    theme: 'AI & Analytics Platform',
    sprints: ['Sprint-25.2.1', 'Sprint-25.2.2', 'Sprint-25.2.3', 'Sprint-25.2.4', 'Sprint-25.2.5', 'Sprint-25.2.6'],
    objectives: [
      { title: 'Build ML-Powered Analytics Dashboard', businessValue: 10, features: 3 },
      { title: 'Implement Predictive Analytics', businessValue: 9, features: 2 },
      { title: 'Natural Language Interface', businessValue: 8, features: 2 }
    ]
  },
  {
    name: 'PI 25.3',
    label: 'PI-25.3',
    status: 'Done',
    startDate: '2025-07-01',
    endDate: '2025-09-30',
    theme: 'Customer Experience & Mobile',
    sprints: ['Sprint-25.3.1', 'Sprint-25.3.2', 'Sprint-25.3.3', 'Sprint-25.3.4', 'Sprint-25.3.5', 'Sprint-25.3.6'],
    objectives: [
      { title: 'Launch Customer Self-Service Portal', businessValue: 10, features: 4 },
      { title: 'Mobile App Development', businessValue: 9, features: 3 },
      { title: 'Real-time Notifications System', businessValue: 7, features: 2 }
    ]
  },
  {
    name: 'PI 25.4',
    label: 'PI-25.4',
    status: 'In Progress',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    theme: 'Security, Compliance & Scale',
    sprints: [
      'Sprint-25.4.1', // Oct 1-14 (DONE)
      'Sprint-25.4.2', // Oct 15-28 (IN PROGRESS - we're on day 4 of this sprint!)
      'Sprint-25.4.3', // Oct 29 - Nov 11
      'Sprint-25.4.4', // Nov 12-25
      'Sprint-25.4.5', // Nov 26 - Dec 9
      'Sprint-25.4.6'  // Dec 10-23
    ],
    objectives: [
      { title: 'Achieve SOC2 Compliance', businessValue: 10, features: 3 },
      { title: 'Implement Zero-Trust Security', businessValue: 9, features: 3 },
      { title: 'Scale for 10x Growth', businessValue: 10, features: 3 },
      { title: 'Performance Optimization', businessValue: 8, features: 2 }
    ]
  },
  {
    name: 'PI 26.1',
    label: 'PI-26.1',
    status: 'To Do',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    theme: 'Innovation & Market Expansion',
    sprints: ['Sprint-26.1.1', 'Sprint-26.1.2', 'Sprint-26.1.3', 'Sprint-26.1.4', 'Sprint-26.1.5', 'Sprint-26.1.6'],
    objectives: [
      { title: 'Launch New Product Line', businessValue: 10, features: 4 },
      { title: 'Expand to EMEA Markets', businessValue: 9, features: 3 },
      { title: 'Partner Integration Platform', businessValue: 8, features: 2 }
    ]
  },
  {
    name: 'PI 26.2',
    label: 'PI-26.2',
    status: 'To Do',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    theme: 'AI-First & Automation',
    sprints: ['Sprint-26.2.1', 'Sprint-26.2.2', 'Sprint-26.2.3', 'Sprint-26.2.4', 'Sprint-26.2.5', 'Sprint-26.2.6'],
    objectives: [
      { title: 'AI-Powered Customer Support', businessValue: 10, features: 3 },
      { title: 'Full Process Automation', businessValue: 9, features: 3 },
      { title: 'Intelligent Resource Optimization', businessValue: 8, features: 2 }
    ]
  }
];

const FEATURES_BY_OBJECTIVE = {
  // PI 24.4
  'Standardize Development Processes': [
    { name: 'Code Review Workflow Implementation', points: 8 },
    { name: 'Documentation Standards & Templates', points: 5 }
  ],
  'Implement Basic Automation': [
    { name: 'Automated Testing Framework', points: 13 },
    { name: 'Build Automation Pipeline', points: 8 }
  ],

  // PI 25.1
  'Migrate Core Services to AWS': [
    { name: 'EC2 Infrastructure Setup', points: 13 },
    { name: 'RDS Database Migration', points: 21 },
    { name: 'S3 Storage Integration', points: 8 },
    { name: 'CloudFront CDN Configuration', points: 8 }
  ],
  'Implement CI/CD Pipeline': [
    { name: 'GitHub Actions Workflow', points: 13 },
    { name: 'Automated Deployment Pipeline', points: 13 }
  ],
  'Database Modernization': [
    { name: 'Schema Optimization', points: 13 },
    { name: 'Query Performance Tuning', points: 8 }
  ],

  // PI 25.2
  'Build ML-Powered Analytics Dashboard': [
    { name: 'Machine Learning Model Development', points: 21 },
    { name: 'Interactive Dashboard UI', points: 13 },
    { name: 'Real-time Data Pipeline', points: 13 }
  ],
  'Implement Predictive Analytics': [
    { name: 'Forecasting Algorithm', points: 21 },
    { name: 'Predictive Dashboard Integration', points: 13 }
  ],
  'Natural Language Interface': [
    { name: 'NLP Engine Development', points: 21 },
    { name: 'Query Interface UI', points: 8 }
  ],

  // PI 25.3
  'Launch Customer Self-Service Portal': [
    { name: 'User Authentication System', points: 13 },
    { name: 'Ticket Management Module', points: 13 },
    { name: 'Knowledge Base Search', points: 8 },
    { name: 'Live Chat Integration', points: 8 }
  ],
  'Mobile App Development': [
    { name: 'iOS App Development', points: 21 },
    { name: 'Android App Development', points: 21 },
    { name: 'Offline Sync Capability', points: 13 }
  ],
  'Real-time Notifications System': [
    { name: 'Push Notification Service', points: 13 },
    { name: 'Email/SMS Integration', points: 5 }
  ],

  // PI 25.4 (CURRENT!)
  'Achieve SOC2 Compliance': [
    { name: 'Security Audit & Gap Analysis', points: 13 },
    { name: 'Policy Documentation & Training', points: 8 },
    { name: 'Compliance Monitoring Dashboard', points: 13 }
  ],
  'Implement Zero-Trust Security': [
    { name: 'Multi-Factor Authentication', points: 13 },
    { name: 'Network Segmentation', points: 13 },
    { name: 'Identity & Access Management', points: 13 }
  ],
  'Scale for 10x Growth': [
    { name: 'Auto-scaling Infrastructure', points: 21 },
    { name: 'Load Balancing Optimization', points: 13 },
    { name: 'Database Sharding Implementation', points: 21 }
  ],
  'Performance Optimization': [
    { name: 'Caching Strategy Implementation', points: 13 },
    { name: 'Code Optimization & Refactoring', points: 13 }
  ],

  // PI 26.1
  'Launch New Product Line': [
    { name: 'Product Requirements & Design', points: 13 },
    { name: 'Core Feature Development', points: 21 },
    { name: 'Beta Testing Program', points: 8 },
    { name: 'Marketing & Launch Plan', points: 5 }
  ],
  'Expand to EMEA Markets': [
    { name: 'Localization & i18n', points: 13 },
    { name: 'GDPR Compliance', points: 13 },
    { name: 'Regional Infrastructure Setup', points: 13 }
  ],
  'Partner Integration Platform': [
    { name: 'API Gateway Development', points: 13 },
    { name: 'Partner Portal UI', points: 13 }
  ],

  // PI 26.2
  'AI-Powered Customer Support': [
    { name: 'AI Chatbot Development', points: 21 },
    { name: 'Sentiment Analysis Engine', points: 13 },
    { name: 'Automated Ticket Routing', points: 13 }
  ],
  'Full Process Automation': [
    { name: 'Workflow Automation Engine', points: 21 },
    { name: 'RPA Implementation', points: 13 },
    { name: 'Integration Connectors', points: 13 }
  ],
  'Intelligent Resource Optimization': [
    { name: 'AI Resource Allocation', points: 21 },
    { name: 'Optimization Dashboard', points: 8 }
  ]
};

async function createIssue(data) {
  try {
    const result = await client.createJiraIssue(PROJECT_KEY, data);
    console.log(`✅ Created ${data.issueType}: ${data.summary}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed: ${data.summary}`, error.message);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function populateData() {
  console.log('🚀 Creating CORRECTED PI Data with Sprints...\n');
  console.log(`📅 TODAY: ${TODAY.toISOString().split('T')[0]} (October 4th, 2025)\n`);

  for (const pi of PIs) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📦 ${pi.name}: ${pi.theme}`);
    console.log(`📅 ${pi.startDate} to ${pi.endDate}`);
    console.log(`📊 Status: ${pi.status}`);
    console.log(`🏃 Sprints: ${pi.sprints.length} sprints (${pi.sprints[0]} to ${pi.sprints[pi.sprints.length-1]})`);
    console.log(`${'='.repeat(70)}\n`);

    // Create PI Objectives (as Epics)
    for (let objIndex = 0; objIndex < pi.objectives.length; objIndex++) {
      const objective = pi.objectives[objIndex];
      console.log(`\n📌 Objective ${objIndex + 1}/${pi.objectives.length}: ${objective.title}`);
      console.log(`   Business Value: ${objective.businessValue}/10`);

      const epicData = {
        summary: `${pi.name}: ${objective.title}`,
        description: `Business Value: ${objective.businessValue}/10\\nPI: ${pi.name}\\nTheme: ${pi.theme}`,
        issueType: 'Epic',
        labels: [pi.label, 'PI-Objective'],
        priority: objective.businessValue >= 9 ? 'Highest' : objective.businessValue >= 7 ? 'High' : 'Medium'
      };

      await createIssue(epicData);
      await sleep(300);

      // Create Features for this Objective
      const features = FEATURES_BY_OBJECTIVE[objective.title] || [];

      for (let featIndex = 0; featIndex < features.length; featIndex++) {
        const feature = features[featIndex];

        // Distribute features across sprints
        const sprintIndex = Math.floor((featIndex / features.length) * pi.sprints.length);
        const sprint = pi.sprints[Math.min(sprintIndex, pi.sprints.length - 1)];

        console.log(`   📋 Feature: ${feature.name} (${feature.points} pts) - ${sprint}`);

        const featureData = {
          summary: feature.name,
          description: `Part of: ${objective.title}\\nPI: ${pi.name}\\nSprint: ${sprint}\\nStory Points: ${feature.points}`,
          issueType: 'Task',
          labels: [pi.label, sprint, 'Feature'],
          priority: pi.status === 'In Progress' ? 'High' : pi.status === 'Done' ? 'Medium' : 'Low'
        };

        await createIssue(featureData);
        await sleep(200);

        // Create 2-3 Stories per Feature
        const numStories = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < numStories; i++) {
          const storyTemplates = [
            `As a developer, I want to implement ${feature.name.toLowerCase()} so that we meet requirements`,
            `As a PM, I want to validate ${feature.name.toLowerCase()} so that it meets business goals`,
            `As a user, I want to use ${feature.name.toLowerCase()} so that I can be more productive`,
            `As a team lead, I want to review ${feature.name.toLowerCase()} so that quality is maintained`
          ];

          const storyData = {
            summary: storyTemplates[i % storyTemplates.length],
            description: `Feature: ${feature.name}\\nPI: ${pi.name}\\nSprint: ${sprint}`,
            issueType: 'Story',
            labels: [pi.label, sprint],
            priority: 'Medium'
          };

          await createIssue(storyData);
          await sleep(100);
        }
      }
    }

    // Add Risks for current and future PIs
    if (pi.status === 'In Progress' || pi.status === 'To Do') {
      console.log(`\n⚠️  Adding Risks for ${pi.name}...`);

      const risks = [
        { title: 'Resource Constraint - Developer Availability', roam: 'ROAM-Owned', priority: 'High' },
        { title: 'Technical Dependency - Third-party Service', roam: 'ROAM-Mitigated', priority: 'Medium' },
        { title: 'Budget Risk - Infrastructure Costs', roam: 'ROAM-Accepted', priority: 'Low' }
      ];

      for (const risk of risks) {
        const riskData = {
          summary: `RISK: ${risk.title}`,
          description: `ROAM Status: ${risk.roam}\\nPI: ${pi.name}`,
          issueType: 'Task',
          labels: [pi.label, 'Risk', risk.roam],
          priority: risk.priority
        };

        await createIssue(riskData);
        await sleep(200);
      }
    }

    // Add PM Tasks for current PI
    if (pi.status === 'In Progress') {
      console.log(`\n📝 Adding PM Tasks for ${pi.name} (CURRENT PI!)...`);

      const pmTasks = [
        { task: 'PI Planning - Sprint Review & Retrospective', sprint: pi.sprints[1] },
        { task: 'Stakeholder Communication - Weekly Status Update', sprint: pi.sprints[1] },
        { task: 'Risk Assessment & Mitigation Planning', sprint: pi.sprints[1] },
        { task: 'Resource Capacity Planning for Q1 2026', sprint: pi.sprints[2] },
        { task: 'Team Performance Review & 1-on-1s', sprint: pi.sprints[2] }
      ];

      for (const pmTask of pmTasks) {
        const taskData = {
          summary: pmTask.task,
          description: `Project management activity for ${pi.name}\\nSprint: ${pmTask.sprint}`,
          issueType: 'Task',
          labels: [pi.label, pmTask.sprint, 'PM-Task'],
          priority: 'Medium'
        };

        await createIssue(taskData);
        await sleep(200);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ CORRECTED Data Population Complete!');
  console.log('='.repeat(70));
  console.log('\n📊 Summary:');
  console.log(`- TODAY: October 4th, 2025`);
  console.log(`- 7 PIs created (4 past, 1 CURRENT, 2 future)`);
  console.log(`- CURRENT PI: 25.4 (Oct-Dec 2025) - Started 4 days ago!`);
  console.log(`- Current Sprint: 25.4.2 (Oct 15-28)`);
  console.log(`- Each PI has 6 sprints (2 weeks each)`);
  console.log(`- Features distributed across sprints`);
  console.log(`- Stories linked to features and sprints`);
  console.log(`- Risks for current and future PIs`);
  console.log(`- PM tasks for current PI\n`);
}

populateData().catch(console.error);
