#!/usr/bin/env node

/**
 * Create Jira content directly via Atlassian REST API
 * This bypasses MCP and uses direct API calls
 */

import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Rich content to create
const CONTENT = {
  epics: [
    {
      summary: 'Q4 2025 Product Roadmap',
      description: `h2. Overview
Major product initiatives and features planned for Q4 2025

h3. Goals
* Deliver key features for enterprise customers
* Achieve 95% uptime
* 50% performance improvement
* 100% test coverage

h3. Key Deliverables
# OAuth 2.0 Authentication
# Database Migration to PostgreSQL
# Real-time Notifications System
# API Rate Limiting
# Mobile App Performance`,
      issueType: 'Story'
    },
    {
      summary: 'Customer Portal Redesign',
      description: `h2. Overview
Complete UX/UI overhaul of the customer-facing portal

h3. Objectives
* Modern, responsive design
* WCAG 2.1 Level AA compliance
* Improved user engagement by 40%

h3. Key Features
# New dashboard with real-time metrics
# Advanced search and filtering
# Personalization engine
# Accessibility improvements`,
      issueType: 'Story'
    },
    {
      summary: 'API v2.0 Migration',
      description: `h2. Overview
Migrate all endpoints to REST API v2.0 with GraphQL support

h3. Technical Requirements
* GraphQL endpoint implementation
* REST API deprecation plan
* Backward compatibility for 6 months
* Performance improvements

h3. Deliverables
# GraphQL schema definition
# API documentation portal
# Migration guides
# SDK updates`,
      issueType: 'Story'
    },
    {
      summary: 'מעבר לענן - Q4 2025',
      description: `h2. סקירה כללית
מעבר מלא של התשתית לענן AWS/Azure

h3. יעדים
* מעבר ללא השבתה (Zero downtime)
* חיסכון של 30% בעלויות
* שיפור ביצועים ב-50%
* יתירות מלאה

h3. אבני דרך
# הגדרת VPC ורשתות
# מעבר שרתים ל-EC2
# הגדרת RDS למסדי נתונים
# יישום Auto-scaling`,
      issueType: 'Story'
    }
  ],

  stories: [
    {
      summary: 'Implement OAuth 2.0 Authentication',
      description: `h2. User Story
As a user, I want to login with my Google/Microsoft account so that I don't need to remember another password.

h3. Acceptance Criteria
* Support Google OAuth 2.0
* Support Microsoft Azure AD
* Implement refresh token rotation
* Add MFA support
* Session management

h3. Technical Notes
* Use Passport.js for Node.js implementation
* Store refresh tokens securely
* Implement PKCE flow`,
      issueType: 'Story'
    },
    {
      summary: 'Database Migration - MongoDB to PostgreSQL',
      description: `h2. User Story
As a developer, I want to use PostgreSQL for better relational data handling and ACID compliance.

h3. Acceptance Criteria
* Zero downtime migration
* Data integrity validation
* Performance benchmarks showing improvement
* Rollback procedure documented

h3. Migration Plan
# Export MongoDB data
# Transform documents to relational model
# Import to PostgreSQL
# Validate data integrity
# Switch application connections`,
      issueType: 'Story'
    },
    {
      summary: 'Real-time Notifications System',
      description: `h2. User Story
As a user, I want to receive real-time notifications about important events.

h3. Acceptance Criteria
* WebSocket implementation
* Push notifications for mobile
* Email notifications
* In-app notification center
* User preferences management

h3. Technical Architecture
* Use Socket.io for WebSockets
* Redis for pub/sub
* Firebase for push notifications`,
      issueType: 'Story'
    },
    {
      summary: 'GraphQL API Implementation',
      description: `h2. User Story
As a frontend developer, I want to use GraphQL to fetch exactly the data I need.

h3. Acceptance Criteria
* Complete schema definition
* All REST endpoints available via GraphQL
* Subscription support for real-time data
* Performance equal or better than REST

h3. Implementation
* Apollo Server setup
* Type definitions for all entities
* Resolver implementation
* DataLoader for N+1 prevention`,
      issueType: 'Story'
    },
    {
      summary: 'Mobile App Performance Optimization',
      description: `h2. User Story
As a mobile user, I want the app to load quickly and respond instantly.

h3. Acceptance Criteria
* App startup time < 2 seconds
* Bundle size reduced by 40%
* Implement lazy loading
* Offline mode support
* 60 FPS animations

h3. Optimization Techniques
* Code splitting
* Image optimization
* Caching strategy
* React Native performance tools`,
      issueType: 'Story'
    },
    {
      summary: 'פיתוח אפליקציית מובייל - React Native',
      description: `h2. סיפור משתמש
כמשתמש, אני רוצה להשתמש באפליקציה במכשיר הנייד שלי

h3. קריטריוני קבלה
* תמיכה ב-iOS ו-Android
* תמיכה מלאה ב-RTL
* ממשק בעברית וערבית
* מצב אופליין
* התראות Push

h3. דרישות טכניות
* React Native 0.72+
* TypeScript
* Redux Toolkit
* React Navigation`,
      issueType: 'Story'
    }
  ],

  bugs: [
    {
      summary: 'Critical: Login fails with special characters in password',
      description: `h2. Bug Description
Users cannot login when password contains special characters (@, #, $, %)

h3. Environment
* Production
* All browsers
* API v1.5

h3. Steps to Reproduce
# Navigate to login page
# Enter valid username
# Enter password containing @ symbol
# Click login button
# Observe error 500

h3. Expected Result
User should be able to login with special characters

h3. Actual Result
Server returns 500 Internal Server Error

h3. Priority: CRITICAL
Affects 30% of users`,
      priority: 'Highest',
      issueType: 'Bug'
    },
    {
      summary: 'High: Memory leak in WebSocket service',
      description: `h2. Bug Description
WebSocket connections not properly cleaned up causing memory leak

h3. Environment
* Production & Staging
* Node.js v18
* Socket.io v4.5

h3. Steps to Reproduce
# Connect 1000 WebSocket clients
# Disconnect all clients
# Monitor memory usage
# Memory continues to grow

h3. Impact
Server requires restart every 48 hours

h3. Proposed Solution
Implement proper cleanup in disconnect handler`,
      priority: 'High',
      issueType: 'Bug'
    },
    {
      summary: 'Medium: Search pagination broken on mobile',
      description: `h2. Bug Description
Pagination buttons not responding on mobile devices

h3. Affected Devices
* iOS Safari
* Chrome Mobile
* Screen size < 768px

h3. Steps to Reproduce
# Search for any term on mobile
# Get more than 10 results
# Try to navigate to page 2
# Buttons don't respond

h3. Workaround
Use desktop version`,
      priority: 'Medium',
      issueType: 'Bug'
    },
    {
      summary: 'באג: טקסט עברי מוצג הפוך ב-PDF',
      description: `h2. תיאור הבאג
בעת ייצוא דוחות ל-PDF, טקסט בעברית מוצג מימין לשמאל

h3. סביבה
* Production
* כל הדפדפנים
* PDF Generator v2.1

h3. שלבי שחזור
# צור דוח עם טקסט בעברית
# לחץ על "ייצוא ל-PDF"
# פתח את קובץ ה-PDF
# הטקסט מופיע הפוך

h3. השפעה
כל הלקוחות הישראלים מושפעים`,
      priority: 'High',
      issueType: 'Bug'
    },
    {
      summary: 'Low: Dark mode CSS issues on settings page',
      description: `h2. Bug Description
Text not visible in dark mode on settings page

h3. Steps to Reproduce
# Enable dark mode
# Navigate to settings
# Some text appears black on black background

h3. Affected Elements
* Input labels
* Help text
* Error messages`,
      priority: 'Low',
      issueType: 'Bug'
    }
  ],

  tasks: [
    {
      summary: 'Update API documentation for v2.0',
      description: `h2. Task Description
Document all new endpoints and deprecations for API v2.0

h3. Deliverables
* OpenAPI 3.0 specification
* Postman collection
* Migration guide
* Code examples in 5 languages

h3. Documentation Sections
# Authentication
# Endpoints reference
# Error codes
# Rate limiting
# Webhooks`,
      issueType: 'Task'
    },
    {
      summary: 'Configure Redis cluster for caching',
      description: `h2. Task Description
Set up Redis cluster with high availability

h3. Requirements
* 3-node cluster minimum
* Sentinel for automatic failover
* Persistence enabled
* Monitoring setup

h3. Configuration
* Max memory: 8GB per node
* Eviction policy: LRU
* AOF persistence
* TLS enabled`,
      issueType: 'Task'
    },
    {
      summary: 'Performance testing - Load test all APIs',
      description: `h2. Task Description
Comprehensive load testing of all API endpoints

h3. Test Scenarios
* 1000 concurrent users
* 10,000 requests per second
* Sustained load for 1 hour
* Spike testing

h3. Success Criteria
* p99 latency < 200ms
* Error rate < 0.1%
* No memory leaks
* Graceful degradation`,
      issueType: 'Task'
    },
    {
      summary: 'Set up monitoring dashboards in Grafana',
      description: `h2. Task Description
Create comprehensive monitoring dashboards

h3. Dashboards Required
* Application metrics
* Infrastructure metrics
* Business KPIs
* Error tracking

h3. Metrics to Track
* Response times
* Error rates
* CPU/Memory usage
* Active users
* Transaction volume`,
      issueType: 'Task'
    },
    {
      summary: 'תרגום ממשק המערכת לעברית',
      description: `h2. תיאור המשימה
תרגום מלא של כל הממשק לעברית

h3. היקף העבודה
* כל הודעות המערכת
* כל הכפתורים והתפריטים
* הודעות שגיאה
* טקסטי עזרה

h3. דרישות
* עברית תקנית
* עקביות במונחים
* תמיכה ב-RTL
* בדיקה על ידי דובר שפת אם`,
      issueType: 'Task'
    },
    {
      summary: 'Security audit - OWASP Top 10',
      description: `h2. Task Description
Conduct security audit based on OWASP Top 10

h3. Areas to Test
* SQL Injection
* XSS vulnerabilities
* Authentication weaknesses
* Sensitive data exposure
* XXE attacks

h3. Deliverables
* Vulnerability report
* Risk assessment
* Remediation plan
* Retest results`,
      issueType: 'Task'
    }
  ]
};

async function createJiraContent() {
  console.log('\n📋 Jira Direct API Content Creator\n');
  console.log('This will create rich content directly in your Jira project.\n');
  
  // Get credentials
  const domain = await question('Enter your Atlassian domain (e.g., your-domain.atlassian.net): ');
  const email = await question('Enter your Atlassian email: ');
  const apiToken = await question('Enter your Atlassian API token (create at https://id.atlassian.com/manage/api-tokens): ');
  const projectKey = await question('Enter your project key (e.g., KMD): ');
  
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const baseUrl = `https://${domain}/rest/api/3`;
  
  console.log('\n🚀 Starting content creation...\n');
  
  let created = 0;
  let failed = 0;
  
  // Create all content
  for (const category of ['epics', 'stories', 'bugs', 'tasks']) {
    console.log(`\n📁 Creating ${category}...`);
    
    for (const item of CONTENT[category]) {
      try {
        const body = {
          fields: {
            project: { key: projectKey },
            summary: item.summary,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: item.description
                    }
                  ]
                }
              ]
            },
            issuetype: { name: item.issueType }
          }
        };
        
        // Add priority if specified
        if (item.priority) {
          body.fields.priority = { name: item.priority };
        }
        
        const response = await fetch(`${baseUrl}/issue`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`  ✅ Created: ${item.summary.substring(0, 50)}... (${result.key})`);
          created++;
        } else {
          const error = await response.text();
          console.log(`  ❌ Failed: ${item.summary.substring(0, 50)}...`);
          console.log(`     Error: ${error.substring(0, 100)}`);
          failed++;
        }
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`  ❌ Error creating ${item.summary}: ${error.message}`);
        failed++;
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✨ Content Creation Complete!');
  console.log('='.repeat(50));
  console.log(`\n📊 Results:`);
  console.log(`  ✅ Successfully created: ${created} issues`);
  if (failed > 0) {
    console.log(`  ❌ Failed: ${failed} issues`);
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. Check your Jira project to see the new issues');
  console.log('2. Test your natural language queries:');
  console.log('   - "Show me all bugs"');
  console.log('   - "What\'s in the Q4 roadmap?"');
  console.log('   - "Show authentication stories"');
  console.log('   - "הצג באגים בעברית"');
  console.log('3. The priority field might need to be enabled in your project settings');
  
  rl.close();
}

// Helper function to check if we have the required modules
async function checkDependencies() {
  try {
    await import('node-fetch');
  } catch {
    console.log('Installing node-fetch...');
    const { execSync } = await import('child_process');
    execSync('npm install node-fetch');
  }
}

// Run the script
checkDependencies().then(() => {
  createJiraContent().catch(console.error);
});