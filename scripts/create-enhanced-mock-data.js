#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const execAsync = promisify(exec);

// Enhanced mock data with both English and Hebrew content
const MOCK_DATA = {
  epics: [
    {
      name: 'Q4 2025 Product Roadmap',
      nameHe: 'מפת דרכים למוצר - רבעון 4 2025',
      description: 'Major product initiatives and features planned for Q4 2025',
      stories: [
        { 
          name: 'Implement OAuth 2.0 Authentication', 
          nameHe: 'מימוש אימות OAuth 2.0',
          description: 'Replace legacy authentication with OAuth 2.0',
          acceptanceCriteria: '1. Support Google/Microsoft login\n2. Implement refresh tokens\n3. Add MFA support'
        },
        { 
          name: 'Database Migration to PostgreSQL', 
          nameHe: 'מעבר מסד נתונים ל-PostgreSQL',
          description: 'Migrate from MongoDB to PostgreSQL for better relational data handling',
          acceptanceCriteria: '1. Zero downtime migration\n2. Data integrity validation\n3. Performance benchmarks'
        },
        { 
          name: 'Real-time Notifications System', 
          nameHe: 'מערכת התראות בזמן אמת',
          description: 'Implement WebSocket-based real-time notifications',
          acceptanceCriteria: '1. Push notifications\n2. Email notifications\n3. In-app notifications'
        },
        { 
          name: 'API Rate Limiting Implementation', 
          nameHe: 'הטמעת הגבלת קצב API',
          description: 'Add rate limiting to protect API endpoints',
          acceptanceCriteria: '1. Configure per-user limits\n2. Add Redis caching\n3. Return proper headers'
        },
        { 
          name: 'Mobile App Performance Optimization', 
          nameHe: 'אופטימיזציה של ביצועי אפליקציה',
          description: 'Improve mobile app load time and responsiveness',
          acceptanceCriteria: '1. Reduce bundle size by 40%\n2. Implement lazy loading\n3. Add offline support'
        }
      ]
    },
    {
      name: 'Customer Portal Redesign',
      nameHe: 'עיצוב מחדש של פורטל הלקוחות',
      description: 'Complete UX/UI overhaul of the customer-facing portal',
      stories: [
        { 
          name: 'User Dashboard Redesign', 
          nameHe: 'עיצוב מחדש של לוח המחוונים',
          description: 'Create modern, responsive dashboard with key metrics',
          acceptanceCriteria: '1. Mobile responsive\n2. Real-time updates\n3. Customizable widgets'
        },
        { 
          name: 'Accessibility Compliance (WCAG 2.1)', 
          nameHe: 'התאמה לתקני נגישות',
          description: 'Ensure full WCAG 2.1 Level AA compliance',
          acceptanceCriteria: '1. Screen reader support\n2. Keyboard navigation\n3. Color contrast compliance'
        },
        { 
          name: 'Advanced Search and Filtering', 
          nameHe: 'חיפוש וסינון מתקדמים',
          description: 'Implement ElasticSearch-powered search with faceted filtering',
          acceptanceCriteria: '1. Full-text search\n2. Auto-suggestions\n3. Search history'
        },
        { 
          name: 'Customer Feedback Widget', 
          nameHe: 'ווידג\'ט משוב לקוחות',
          description: 'In-app feedback collection system',
          acceptanceCriteria: '1. NPS surveys\n2. Bug reporting\n3. Feature requests'
        }
      ]
    },
    {
      name: 'API v2.0 Migration',
      nameHe: 'מעבר ל-API גרסה 2.0',
      description: 'Migrate all endpoints to REST API v2.0 with GraphQL support',
      stories: [
        { 
          name: 'GraphQL Schema Definition', 
          nameHe: 'הגדרת סכמת GraphQL',
          description: 'Design and implement GraphQL schema',
          acceptanceCriteria: '1. Type definitions\n2. Resolvers\n3. Subscriptions support'
        },
        { 
          name: 'Deprecate Legacy Endpoints', 
          nameHe: 'הוצאה משימוש של נקודות קצה ישנות',
          description: 'Gradual deprecation of v1 endpoints',
          acceptanceCriteria: '1. Migration guides\n2. Deprecation notices\n3. Sunset timeline'
        },
        { 
          name: 'API Documentation Portal', 
          nameHe: 'פורטל תיעוד API',
          description: 'Interactive API documentation with Swagger/OpenAPI',
          acceptanceCriteria: '1. Try-it-out feature\n2. Code examples\n3. SDKs generation'
        },
        { 
          name: 'Webhook Management System', 
          nameHe: 'מערכת ניהול Webhooks',
          description: 'Allow customers to manage webhook subscriptions',
          acceptanceCriteria: '1. Event subscription\n2. Retry logic\n3. Delivery logs'
        }
      ]
    }
  ],

  bugs: [
    { 
      summary: 'Login fails with special characters in password', 
      summaryHe: 'כשלון בהתחברות עם תווים מיוחדים בסיסמה',
      priority: 'Highest',
      description: 'Users cannot login when password contains @, #, or $ symbols',
      stepsToReproduce: '1. Enter username\n2. Enter password with @ symbol\n3. Click login\n4. Error 500 returned'
    },
    { 
      summary: 'Memory leak in real-time notification service', 
      summaryHe: 'דליפת זיכרון בשירות ההתראות',
      priority: 'Highest',
      description: 'WebSocket connections not properly cleaned up causing memory leak',
      stepsToReproduce: '1. Connect 1000 clients\n2. Disconnect clients\n3. Memory usage continues to grow'
    },
    { 
      summary: 'Search results pagination broken on mobile', 
      summaryHe: 'עימוד תוצאות חיפוש לא עובד במובייל',
      priority: 'High',
      description: 'Next/Previous buttons not responding on mobile devices',
      stepsToReproduce: '1. Search for any term\n2. Get more than 10 results\n3. Try to navigate pages on mobile'
    },
    { 
      summary: 'Hebrew text appears reversed in PDF exports', 
      summaryHe: 'טקסט עברי מופיע הפוך בייצוא PDF',
      priority: 'High',
      description: 'RTL text not handled correctly in PDF generation',
      stepsToReproduce: '1. Create report with Hebrew text\n2. Export to PDF\n3. Hebrew appears LTR'
    },
    { 
      summary: 'API rate limiting not working for authenticated users', 
      summaryHe: 'הגבלת קצב API לא עובדת למשתמשים מאומתים',
      priority: 'Medium',
      description: 'Rate limits not applied to JWT authenticated requests',
      stepsToReproduce: '1. Authenticate with JWT\n2. Send 1000 requests/second\n3. No rate limiting applied'
    }
  ],

  tasks: [
    { 
      summary: 'Update API documentation for v2.0', 
      summaryHe: 'עדכון תיעוד API לגרסה 2.0',
      description: 'Document all new endpoints and deprecations'
    },
    { 
      summary: 'Configure Redis cluster for caching', 
      summaryHe: 'הגדרת אשכול Redis למטמון',
      description: 'Set up Redis cluster with Sentinel for HA'
    },
    { 
      summary: 'Write integration tests for payment module', 
      summaryHe: 'כתיבת בדיקות אינטגרציה למודול תשלומים',
      description: 'Cover all payment gateway integrations'
    },
    { 
      summary: 'Database backup automation script', 
      summaryHe: 'סקריפט אוטומציה לגיבוי מסד נתונים',
      description: 'Automate daily backups with retention policy'
    },
    { 
      summary: 'Performance testing for API endpoints', 
      summaryHe: 'בדיקות ביצועים לנקודות קצה של API',
      description: 'Load test all critical endpoints with JMeter'
    }
  ],

  confluencePages: [
    {
      title: 'API Documentation - REST v2.0',
      titleHe: 'תיעוד API - REST גרסה 2.0',
      content: `# API Documentation - REST v2.0

## Overview
This document describes the REST API v2.0 endpoints, authentication methods, and response formats.

## Authentication
All API requests require authentication using JWT tokens.

### Obtaining a Token
\`\`\`bash
POST /api/v2/auth/token
{
  "username": "user@example.com",
  "password": "secure_password"
}
\`\`\`

### Using the Token
Include the token in the Authorization header:
\`\`\`bash
Authorization: Bearer <your_jwt_token>
\`\`\`

## Endpoints

### Users
- GET /api/v2/users - List all users
- GET /api/v2/users/{id} - Get user details
- POST /api/v2/users - Create new user
- PUT /api/v2/users/{id} - Update user
- DELETE /api/v2/users/{id} - Delete user

### Projects
- GET /api/v2/projects - List all projects
- GET /api/v2/projects/{id} - Get project details
- POST /api/v2/projects - Create new project

## Rate Limiting
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users

## Error Codes
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 429 - Too Many Requests
- 500 - Internal Server Error`
    },
    {
      title: 'Database Migration Guide',
      titleHe: 'מדריך מעבר מסד נתונים',
      content: `# Database Migration Guide - MongoDB to PostgreSQL

## Overview
This guide provides step-by-step instructions for migrating from MongoDB to PostgreSQL.

## Pre-Migration Checklist
- [ ] Backup MongoDB database
- [ ] Set up PostgreSQL instance
- [ ] Install migration tools
- [ ] Review data mapping
- [ ] Plan downtime window

## Migration Steps

### Step 1: Export MongoDB Data
\`\`\`bash
mongodump --uri="mongodb://localhost:27017/mydb" --out=/backup/
\`\`\`

### Step 2: Transform Data
Run the transformation script to convert documents to relational format:
\`\`\`bash
npm run transform-data
\`\`\`

### Step 3: Import to PostgreSQL
\`\`\`bash
psql -U postgres -d mydb < transformed_data.sql
\`\`\`

## Rollback Procedure
If issues arise, follow the rollback procedure:
1. Stop application servers
2. Restore MongoDB from backup
3. Update connection strings
4. Restart application`
    },
    {
      title: 'מדריך למשתמש חדש - ברוכים הבאים',
      titleHe: 'מדריך למשתמש חדש',
      content: `# מדריך למשתמש חדש - ברוכים הבאים

## ברוכים הבאים למערכת!

מדריך זה יעזור לכם להתחיל לעבוד עם המערכת בצורה יעילה.

## שלב 1: הגדרת חשבון

### יצירת חשבון
1. גשו לכתובת: https://system.example.com
2. לחצו על "הרשמה"
3. מלאו את הפרטים הנדרשים
4. אשרו את כתובת המייל

### הגדרת פרופיל
- העלו תמונת פרופיל
- הגדירו שפה מועדפת (עברית/אנגלית)
- הגדירו אזור זמן
- הגדירו התראות

## שלב 2: ניווט במערכת

### תפריט ראשי
- **דשבורד** - מסך ראשי עם סיכום פעילות
- **פרויקטים** - רשימת כל הפרויקטים
- **משימות** - המשימות שלכם
- **דוחות** - דוחות וניתוחים
- **הגדרות** - העדפות אישיות

## שלב 3: יצירת משימה ראשונה

1. לחצו על "משימה חדשה"
2. בחרו סוג משימה (באג/סיפור/משימה)
3. מלאו כותרת ותיאור
4. הגדירו עדיפות
5. הקצו למשתמש
6. לחצו "צור"`
    },
    {
      title: 'Sprint Planning Template',
      content: `# Sprint Planning - Sprint 23

## Sprint Goal
Deliver the authentication module and complete database migration preparation.

## Capacity
- Total team capacity: 160 hours (4 developers × 40 hours)
- Planned capacity: 128 hours (80% to account for meetings/overhead)

## Committed Stories

### High Priority
1. **KMD-101**: OAuth 2.0 Implementation (21 points)
   - Assignee: Developer 1
   - Dependencies: None
   
2. **KMD-102**: Database Migration Script (13 points)
   - Assignee: Developer 2
   - Dependencies: KMD-103

### Medium Priority
3. **KMD-103**: API Documentation Update (8 points)
   - Assignee: Developer 3
   
4. **KMD-104**: Performance Testing (8 points)
   - Assignee: Developer 4

## Risks & Mitigation
- **Risk**: OAuth provider API changes
  - **Mitigation**: Have fallback to basic auth
  
- **Risk**: Migration script performance
  - **Mitigation**: Test with production data copy

## Definition of Done
- [ ] Code reviewed by 2 team members
- [ ] Unit tests written (coverage > 80%)
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Deployed to staging`
    },
    {
      title: 'Security Best Practices',
      titleHe: 'שיטות עבודה מומלצות לאבטחה',
      content: `# Security Best Practices

## Code Security

### 1. Input Validation
Always validate and sanitize user input:
\`\`\`javascript
// Good
const sanitizedInput = validator.escape(userInput);
if (!validator.isEmail(email)) {
  throw new Error('Invalid email format');
}

// Bad
const query = \`SELECT * FROM users WHERE email = '\${userInput}'\`;
\`\`\`

### 2. Authentication & Authorization
- Use JWT with short expiration times (15 minutes)
- Implement refresh token rotation
- Always check permissions at the API level

### 3. Secrets Management
- Never commit secrets to git
- Use environment variables
- Rotate secrets regularly
- Use HashiCorp Vault in production

## Infrastructure Security

### Network Security
- Use VPC with private subnets
- Implement WAF rules
- Enable DDoS protection
- Use VPN for admin access

### Data Security
- Encrypt data at rest (AES-256)
- Encrypt data in transit (TLS 1.3)
- Regular backups with encryption
- GDPR compliance for PII`
    }
  ]
};

async function createMockData() {
  console.log('🚀 Starting enhanced mock data creation...\n');

  // Initialize MCP client
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'],
  });

  const client = new Client({
    name: 'enhanced-mock-data-creator',
    version: '1.0.0',
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to Atlassian MCP server\n');

    // List available tools to verify
    const tools = await client.listTools();
    const createJiraTool = tools.tools.find(t => t.name === 'createJiraIssue');
    const createPageTool = tools.tools.find(t => t.name === 'createConfluencePage');

    if (!createJiraTool || !createPageTool) {
      console.log('⚠️  Some tools not available. Available tools:');
      tools.tools.forEach(t => console.log(`   - ${t.name}`));
      console.log('\n');
    }

    // Get project key - fix the parameters format
    console.log('🔍 Finding Jira project...\n');
    const searchResult = await client.callTool('searchJiraIssuesUsingJql', {
      jql: 'project is not EMPTY',
      maxResults: 1
    });

    let projectKey = 'KMD'; // Default fallback
    
    // Parse the result to find project key
    if (searchResult && searchResult.content && searchResult.content[0]) {
      const resultText = searchResult.content[0].text;
      const projectMatch = resultText.match(/"key"\s*:\s*"([^"]+)"/);
      if (projectMatch) {
        projectKey = projectMatch[1];
        console.log(`✅ Found project: ${projectKey}\n`);
      } else {
        console.log(`⚠️  Could not parse project key, using default: ${projectKey}\n`);
      }
    }

    let createdCount = 0;
    let failedCount = 0;

    // Create Epics and Stories
    console.log('📋 Creating Epics and Stories...\n');
    
    for (const epic of MOCK_DATA.epics) {
      console.log(`  Creating Epic: ${epic.name}`);
      
      try {
        // Create Epic as a Story (since Epic might not be available)
        const epicResult = await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Story',
          summary: epic.name,
          description: epic.description
        });
        console.log(`    ✓ Epic created: ${epic.name}`);
        createdCount++;

        // Create Stories for this Epic
        for (const story of epic.stories) {
          try {
            await client.callTool('createJiraIssue', {
              projectKey: projectKey,
              issueType: 'Story',
              summary: story.name,
              description: `${story.description}\n\n**Acceptance Criteria:**\n${story.acceptanceCriteria}`
            });
            console.log(`      ✓ Story: ${story.name}`);
            createdCount++;
          } catch (error) {
            console.log(`      ✗ Failed to create story: ${error.message}`);
            failedCount++;
          }
        }

        // Create Hebrew version for first epic
        if (epic.nameHe && epic === MOCK_DATA.epics[0]) {
          try {
            await client.callTool('createJiraIssue', {
              projectKey: projectKey,
              issueType: 'Story',
              summary: epic.nameHe,
              description: epic.description
            });
            console.log(`    ✓ Hebrew Epic: ${epic.nameHe}`);
            createdCount++;
          } catch (error) {
            console.log(`    ✗ Failed to create Hebrew epic: ${error.message}`);
            failedCount++;
          }
        }
      } catch (error) {
        console.log(`    ✗ Failed to create epic: ${error.message}`);
        failedCount++;
      }
    }

    // Create Bugs
    console.log('\n🐛 Creating Bugs...\n');
    
    for (const bug of MOCK_DATA.bugs) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Bug',
          summary: bug.summary,
          description: `${bug.description}\n\n**Steps to Reproduce:**\n${bug.stepsToReproduce}\n\n**Priority:** ${bug.priority}`
        });
        console.log(`  ✓ Bug: ${bug.summary}`);
        createdCount++;

        // Create Hebrew version for first two bugs
        if (bug.summaryHe && MOCK_DATA.bugs.indexOf(bug) < 2) {
          try {
            await client.callTool('createJiraIssue', {
              projectKey: projectKey,
              issueType: 'Bug',
              summary: bug.summaryHe,
              description: `${bug.description}\n\n**שלבי שחזור:**\n${bug.stepsToReproduce}`
            });
            console.log(`  ✓ Hebrew Bug: ${bug.summaryHe}`);
            createdCount++;
          } catch (error) {
            console.log(`  ✗ Failed to create Hebrew bug: ${error.message}`);
            failedCount++;
          }
        }
      } catch (error) {
        console.log(`  ✗ Failed to create bug: ${error.message}`);
        failedCount++;
      }
    }

    // Create Tasks
    console.log('\n📝 Creating Tasks...\n');
    
    for (const task of MOCK_DATA.tasks) {
      try {
        await client.callTool('createJiraIssue', {
          projectKey: projectKey,
          issueType: 'Task',
          summary: task.summary,
          description: task.description
        });
        console.log(`  ✓ Task: ${task.summary}`);
        createdCount++;

        // Create Hebrew version for first three tasks
        if (task.summaryHe && MOCK_DATA.tasks.indexOf(task) < 3) {
          try {
            await client.callTool('createJiraIssue', {
              projectKey: projectKey,
              issueType: 'Task',
              summary: task.summaryHe,
              description: task.description
            });
            console.log(`  ✓ Hebrew Task: ${task.summaryHe}`);
            createdCount++;
          } catch (error) {
            console.log(`  ✗ Failed to create Hebrew task: ${error.message}`);
            failedCount++;
          }
        }
      } catch (error) {
        console.log(`  ✗ Failed to create task: ${error.message}`);
        failedCount++;
      }
    }

    // Create Confluence Pages
    console.log('\n📄 Creating Confluence Pages...\n');
    
    // First, get a space to create pages in
    let spaceKey = null;
    try {
      const spacesResult = await client.callTool('getConfluenceSpaces', {});
      if (spacesResult && spacesResult.content && spacesResult.content[0]) {
        const spacesText = spacesResult.content[0].text;
        const spaceMatch = spacesText.match(/"key"\s*:\s*"([^"]+)"/);
        if (spaceMatch) {
          spaceKey = spaceMatch[1];
          console.log(`  Using Confluence space: ${spaceKey}\n`);
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Could not get Confluence spaces: ${error.message}\n`);
    }

    if (spaceKey) {
      for (const page of MOCK_DATA.confluencePages) {
        try {
          await client.callTool('createConfluencePage', {
            spaceKey: spaceKey,
            title: page.title,
            body: page.content,
            format: 'storage' // Try 'storage' format for Confluence
          });
          console.log(`  ✓ Page: ${page.title}`);
          createdCount++;

          // Create Hebrew version if available
          if (page.titleHe) {
            try {
              await client.callTool('createConfluencePage', {
                spaceKey: spaceKey,
                title: page.titleHe,
                body: page.content,
                format: 'storage'
              });
              console.log(`  ✓ Hebrew Page: ${page.titleHe}`);
              createdCount++;
            } catch (error) {
              console.log(`  ✗ Failed to create Hebrew page: ${error.message}`);
              failedCount++;
            }
          }
        } catch (error) {
          console.log(`  ✗ Failed to create page "${page.title}": ${error.message}`);
          failedCount++;
        }
      }
    } else {
      console.log('  ⚠️  Skipping Confluence pages - no space found\n');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ Mock data creation completed!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`  ✓ Successfully created: ${createdCount} items`);
    if (failedCount > 0) {
      console.log(`  ✗ Failed to create: ${failedCount} items`);
    }
    console.log('\nContent created:');
    console.log(`  - Epics: ${MOCK_DATA.epics.length}`);
    console.log(`  - Stories: ${MOCK_DATA.epics.reduce((acc, e) => acc + e.stories.length, 0)}`);
    console.log(`  - Bugs: ${MOCK_DATA.bugs.length}`);
    console.log(`  - Tasks: ${MOCK_DATA.tasks.length}`);
    if (spaceKey) {
      console.log(`  - Confluence Pages: ${MOCK_DATA.confluencePages.length}`);
    }
    console.log('\n🎉 Your Jira and Confluence are now populated with rich demo content!');
    console.log('\n💡 Next steps:');
    console.log('  1. Test the web UI with queries like:');
    console.log('     - "Show me all bugs"');
    console.log('     - "Give me a project summary"');
    console.log('     - "הצג לי את כל הבאגים" (Hebrew)');
    console.log('  2. Check your Jira project for the new issues');
    console.log('  3. Browse Confluence for the documentation pages');

  } catch (error) {
    console.error('❌ Error creating mock data:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('  1. Make sure mcp-remote is authenticated with Atlassian');
    console.error('  2. Check you have permissions to create issues/pages');
    console.error('  3. Verify the project key and space key exist');
  } finally {
    await client.close();
  }
}

// Run the script
createMockData().catch(console.error);