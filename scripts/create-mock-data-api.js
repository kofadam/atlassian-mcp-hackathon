#!/usr/bin/env node

/**
 * Create mock data using the web server API
 * This script sends requests to your running web server to create Jira issues
 */

import fetch from 'node-fetch';

const WEB_SERVER_URL = 'http://localhost:3000';

// Enhanced mock data
const MOCK_DATA = {
  epics: [
    {
      type: 'Story',
      summary: 'Q4 2025 Product Roadmap',
      description: 'Major product initiatives and features planned for Q4 2025\n\n' +
        '**Goal:** Deliver key features for enterprise customers\n\n' +
        '**Success Metrics:**\n' +
        '- 95% uptime\n' +
        '- 50% performance improvement\n' +
        '- 100% test coverage',
      stories: [
        {
          summary: 'Implement OAuth 2.0 Authentication',
          description: 'Replace legacy authentication with OAuth 2.0\n\n**Acceptance Criteria:**\n1. Support Google/Microsoft login\n2. Implement refresh tokens\n3. Add MFA support'
        },
        {
          summary: 'Database Migration to PostgreSQL',
          description: 'Migrate from MongoDB to PostgreSQL for better relational data handling\n\n**Acceptance Criteria:**\n1. Zero downtime migration\n2. Data integrity validation\n3. Performance benchmarks'
        },
        {
          summary: 'Real-time Notifications System',
          description: 'Implement WebSocket-based real-time notifications\n\n**Acceptance Criteria:**\n1. Push notifications\n2. Email notifications\n3. In-app notifications'
        },
        {
          summary: 'API Rate Limiting Implementation',
          description: 'Add rate limiting to protect API endpoints\n\n**Acceptance Criteria:**\n1. Configure per-user limits\n2. Add Redis caching\n3. Return proper headers'
        },
        {
          summary: 'Mobile App Performance Optimization',
          description: 'Improve mobile app load time and responsiveness\n\n**Acceptance Criteria:**\n1. Reduce bundle size by 40%\n2. Implement lazy loading\n3. Add offline support'
        }
      ]
    },
    {
      type: 'Story',
      summary: 'Customer Portal Redesign',
      description: 'Complete UX/UI overhaul of the customer-facing portal\n\n' +
        '**Objectives:**\n' +
        '- Modern, responsive design\n' +
        '- WCAG 2.1 compliance\n' +
        '- Improved user engagement',
      stories: [
        {
          summary: 'User Dashboard Redesign',
          description: 'Create modern, responsive dashboard with key metrics\n\n**Acceptance Criteria:**\n1. Mobile responsive\n2. Real-time updates\n3. Customizable widgets'
        },
        {
          summary: 'Accessibility Compliance (WCAG 2.1)',
          description: 'Ensure full WCAG 2.1 Level AA compliance\n\n**Acceptance Criteria:**\n1. Screen reader support\n2. Keyboard navigation\n3. Color contrast compliance'
        },
        {
          summary: 'Advanced Search and Filtering',
          description: 'Implement ElasticSearch-powered search with faceted filtering\n\n**Acceptance Criteria:**\n1. Full-text search\n2. Auto-suggestions\n3. Search history'
        }
      ]
    },
    {
      type: 'Story',
      summary: 'API v2.0 Migration',
      description: 'Migrate all endpoints to REST API v2.0 with GraphQL support\n\n' +
        '**Key Features:**\n' +
        '- GraphQL endpoint\n' +
        '- Improved performance\n' +
        '- Better documentation',
      stories: [
        {
          summary: 'GraphQL Schema Definition',
          description: 'Design and implement GraphQL schema\n\n**Acceptance Criteria:**\n1. Type definitions\n2. Resolvers\n3. Subscriptions support'
        },
        {
          summary: 'API Documentation Portal',
          description: 'Interactive API documentation with Swagger/OpenAPI\n\n**Acceptance Criteria:**\n1. Try-it-out feature\n2. Code examples\n3. SDKs generation'
        }
      ]
    }
  ],

  hebrewEpics: [
    {
      type: 'Story',
      summary: 'שדרוג תשתית ענן - רבעון 4 2025',
      description: 'כאפיק אסטרטגי, אנחנו צריכים לשדרג את כל התשתית שלנו לענן.\n\n' +
        '**מטרות:**\n' +
        '- מעבר ל-AWS/Azure\n' +
        '- שיפור ביצועים ב-50%\n' +
        '- הורדת עלויות ב-30%\n' +
        '- יתירות מלאה',
      stories: [
        {
          summary: 'הגדרת VPC ורשתות בענן',
          description: 'הגדרת רשת וירטואלית פרטית ב-AWS\n\n**קריטריונים:**\n1. הגדרת subnets\n2. Security groups\n3. NAT gateway'
        },
        {
          summary: 'מעבר שרתי יישומים ל-EC2',
          description: 'מיגרציה של כל השרתים ל-EC2\n\n**קריטריונים:**\n1. Auto-scaling\n2. Load balancing\n3. Monitoring'
        }
      ]
    },
    {
      type: 'Story',
      summary: 'פיתוח אפליקציה מובילת - iOS ו-Android',
      description: 'פיתוח אפליקציה חדשה למכשירים ניידים עם תמיכה מלאה בעברית וערבית.\n\n' +
        '**דרישות:**\n' +
        '- React Native\n' +
        '- תמיכה ב-RTL\n' +
        '- התחברות עם OAuth\n' +
        '- מצב אופליין\n' +
        '- התראות Push',
      stories: [
        {
          summary: 'הגדרת פרויקט React Native',
          description: 'יצירת פרויקט והגדרת סביבת פיתוח\n\n**קריטריונים:**\n1. הגדרת CI/CD\n2. קוד בסיס\n3. סביבות פיתוח'
        },
        {
          summary: 'מימוש מסכי התחברות',
          description: 'פיתוח מסכי התחברות והרשמה\n\n**קריטריונים:**\n1. OAuth integration\n2. ולידציה\n3. שחזור סיסמה'
        }
      ]
    }
  ],

  bugs: [
    {
      type: 'Bug',
      summary: 'Login fails with special characters in password',
      description: 'Users cannot login when password contains @, #, or $ symbols\n\n' +
        '**Environment:** Production\n' +
        '**Severity:** Critical\n' +
        '**Steps to Reproduce:**\n' +
        '1. Enter username\n' +
        '2. Enter password with @ symbol\n' +
        '3. Click login\n' +
        '4. Error 500 returned'
    },
    {
      type: 'Bug',
      summary: 'Memory leak in real-time notification service',
      description: 'WebSocket connections not properly cleaned up causing memory leak\n\n' +
        '**Environment:** Staging\n' +
        '**Severity:** High\n' +
        '**Steps to Reproduce:**\n' +
        '1. Connect 1000 clients\n' +
        '2. Disconnect clients\n' +
        '3. Memory usage continues to grow'
    },
    {
      type: 'Bug',
      summary: 'Search results pagination broken on mobile',
      description: 'Next/Previous buttons not responding on mobile devices\n\n' +
        '**Environment:** Production\n' +
        '**Severity:** Medium\n' +
        '**Steps to Reproduce:**\n' +
        '1. Search for any term\n' +
        '2. Get more than 10 results\n' +
        '3. Try to navigate pages on mobile'
    },
    {
      type: 'Bug',
      summary: 'Dashboard widgets randomly fail to load',
      description: 'Race condition causes widgets to fail loading intermittently\n\n' +
        '**Environment:** All\n' +
        '**Severity:** Medium\n' +
        '**Steps to Reproduce:**\n' +
        '1. Navigate to dashboard\n' +
        '2. Refresh page multiple times\n' +
        '3. Random widgets show error'
    },
    {
      type: 'Bug',
      summary: 'Export to PDF shows blank pages',
      description: 'PDF export functionality produces empty documents\n\n' +
        '**Environment:** Production\n' +
        '**Severity:** High\n' +
        '**Steps to Reproduce:**\n' +
        '1. Generate any report\n' +
        '2. Click Export to PDF\n' +
        '3. PDF is blank'
    }
  ],

  hebrewBugs: [
    {
      type: 'Bug',
      summary: 'כפתור שלח לא עובד בטופס הרשמה בעברית',
      description: 'כאשר הממשק בעברית, הכפתור שלח בטופס ההרשמה לא מגיב ללחיצה.\n\n' +
        '**סביבה:** Production\n' +
        '**חומרה:** קריטי\n' +
        '**שלבי שחזור:**\n' +
        '1. החלף שפת ממשק לעברית\n' +
        '2. נווט לדף הרשמה\n' +
        '3. מלא את כל השדות\n' +
        '4. לחץ על כפתור שלח\n' +
        '5. הכפתור לא מגיב'
    },
    {
      type: 'Bug',
      summary: 'טקסט עברי מוצג הפוך בדוחות PDF',
      description: 'כשמייצאים דוח עם טקסט עברי ל-PDF, הטקסט מופיע מימין לשמאל במקום משמאל לימין.\n\n' +
        '**סביבה:** Production\n' +
        '**חומרה:** גבוה\n' +
        '**בעיה:** PDF generation library לא תומכת ב-RTL'
    },
    {
      type: 'Bug',
      summary: 'חיפוש בעברית לא מוצא תוצאות עם ניקוד',
      description: 'כשמחפשים מילה עם ניקוד, החיפוש לא מוצא תוצאות למרות שהן קיימות\n\n' +
        '**סביבה:** כל הסביבות\n' +
        '**חומרה:** בינוני'
    }
  ],

  tasks: [
    {
      type: 'Task',
      summary: 'Update API documentation for v2.0',
      description: 'Document all new endpoints and deprecations\n\n' +
        '**Deliverables:**\n' +
        '- OpenAPI spec\n' +
        '- Migration guide\n' +
        '- Code examples'
    },
    {
      type: 'Task',
      summary: 'Configure Redis cluster for caching',
      description: 'Set up Redis cluster with Sentinel for HA\n\n' +
        '**Requirements:**\n' +
        '- 3 node cluster\n' +
        '- Automatic failover\n' +
        '- Monitoring setup'
    },
    {
      type: 'Task',
      summary: 'Write integration tests for payment module',
      description: 'Cover all payment gateway integrations\n\n' +
        '**Coverage needed:**\n' +
        '- Stripe integration\n' +
        '- PayPal integration\n' +
        '- Refund flows'
    },
    {
      type: 'Task',
      summary: 'Performance testing for API endpoints',
      description: 'Load test all critical endpoints with JMeter\n\n' +
        '**Target metrics:**\n' +
        '- 1000 req/sec\n' +
        '- p99 < 200ms\n' +
        '- Error rate < 0.1%'
    },
    {
      type: 'Task',
      summary: 'Set up monitoring dashboards',
      description: 'Create Grafana dashboards for all services\n\n' +
        '**Dashboards needed:**\n' +
        '- Application metrics\n' +
        '- Infrastructure metrics\n' +
        '- Business KPIs'
    }
  ],

  hebrewTasks: [
    {
      type: 'Task',
      summary: 'תרגום כל הודעות השגיאה לעברית',
      description: 'תרגום מלא של כל הודעות השגיאה במערכת לעברית תקנית\n\n' +
        '**דרישות:**\n' +
        '- תרגום מקצועי\n' +
        '- עקביות במונחים\n' +
        '- בדיקת הקשר'
    },
    {
      type: 'Task',
      summary: 'בדיקת נגישות לקוראי מסך בעברית',
      description: 'וידוא שכל הרכיבים נגישים לקוראי מסך בעברית כולל NVDA ו-JAWS\n\n' +
        '**בדיקות נדרשות:**\n' +
        '- כל הכפתורים\n' +
        '- טפסים\n' +
        '- ניווט'
    },
    {
      type: 'Task',
      summary: 'הכנת מדריך משתמש בעברית',
      description: 'כתיבת מדריך משתמש מלא בעברית כולל צילומי מסך\n\n' +
        '**נושאים:**\n' +
        '- התחלת עבודה\n' +
        '- תכונות עיקריות\n' +
        '- פתרון בעיות'
    }
  ]
};

async function createIssue(issueData) {
  try {
    const query = `Create a Jira ${issueData.type} with title "${issueData.summary}" and description "${issueData.description.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`;
    
    const response = await fetch(`${WEB_SERVER_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to create issue: ${error.message}`);
    return null;
  }
}

async function createMockData() {
  console.log('🚀 Creating Mock Data via Web API\n');
  console.log('Make sure your web server is running on port 3000!\n');
  console.log('=' .repeat(50));

  let createdCount = 0;
  let failedCount = 0;

  // Test connection first
  try {
    const response = await fetch(`${WEB_SERVER_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test connection' })
    });
    
    if (!response.ok) {
      console.error('❌ Cannot connect to web server at', WEB_SERVER_URL);
      console.error('Please run: npm run web');
      return;
    }
    console.log('✅ Connected to web server\n');
  } catch (error) {
    console.error('❌ Cannot connect to web server:', error.message);
    console.error('Please make sure the web server is running: npm run web');
    return;
  }

  // Create English Epics and Stories
  console.log('📋 Creating English Epics and Stories...\n');
  for (const epic of MOCK_DATA.epics) {
    console.log(`Creating Epic: ${epic.summary}`);
    const result = await createIssue(epic);
    if (result) {
      console.log(`  ✓ Created epic`);
      createdCount++;
    } else {
      console.log(`  ✗ Failed to create epic`);
      failedCount++;
    }

    // Create stories for this epic
    for (const story of epic.stories) {
      const storyData = { ...story, type: 'Story' };
      const storyResult = await createIssue(storyData);
      if (storyResult) {
        console.log(`    ✓ Created story: ${story.summary.substring(0, 40)}...`);
        createdCount++;
      } else {
        failedCount++;
      }
    }
  }

  // Create Hebrew Epics and Stories
  console.log('\n📋 Creating Hebrew Epics and Stories...\n');
  for (const epic of MOCK_DATA.hebrewEpics) {
    console.log(`Creating Hebrew Epic: ${epic.summary}`);
    const result = await createIssue(epic);
    if (result) {
      console.log(`  ✓ Created Hebrew epic`);
      createdCount++;
    } else {
      console.log(`  ✗ Failed to create Hebrew epic`);
      failedCount++;
    }

    // Create stories for this epic
    for (const story of epic.stories) {
      const storyData = { ...story, type: 'Story' };
      const storyResult = await createIssue(storyData);
      if (storyResult) {
        console.log(`    ✓ Created Hebrew story: ${story.summary}`);
        createdCount++;
      } else {
        failedCount++;
      }
    }
  }

  // Create English Bugs
  console.log('\n🐛 Creating English Bugs...\n');
  for (const bug of MOCK_DATA.bugs) {
    console.log(`Creating Bug: ${bug.summary}`);
    const result = await createIssue(bug);
    if (result) {
      console.log(`  ✓ Created bug`);
      createdCount++;
    } else {
      console.log(`  ✗ Failed to create bug`);
      failedCount++;
    }
  }

  // Create Hebrew Bugs
  console.log('\n🐛 Creating Hebrew Bugs...\n');
  for (const bug of MOCK_DATA.hebrewBugs) {
    console.log(`Creating Hebrew Bug: ${bug.summary}`);
    const result = await createIssue(bug);
    if (result) {
      console.log(`  ✓ Created Hebrew bug`);
      createdCount++;
    } else {
      console.log(`  ✗ Failed to create Hebrew bug`);
      failedCount++;
    }
  }

  // Create English Tasks
  console.log('\n📝 Creating English Tasks...\n');
  for (const task of MOCK_DATA.tasks) {
    console.log(`Creating Task: ${task.summary}`);
    const result = await createIssue(task);
    if (result) {
      console.log(`  ✓ Created task`);
      createdCount++;
    } else {
      console.log(`  ✗ Failed to create task`);
      failedCount++;
    }
  }

  // Create Hebrew Tasks
  console.log('\n📝 Creating Hebrew Tasks...\n');
  for (const task of MOCK_DATA.hebrewTasks) {
    console.log(`Creating Hebrew Task: ${task.summary}`);
    const result = await createIssue(task);
    if (result) {
      console.log(`  ✓ Created Hebrew task`);
      createdCount++;
    } else {
      console.log(`  ✗ Failed to create Hebrew task`);
      failedCount++;
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('✨ Mock Data Creation Complete!');
  console.log('=' .repeat(50));
  console.log('\n📊 Results:');
  console.log(`  ✓ Successfully created: ${createdCount} issues`);
  if (failedCount > 0) {
    console.log(`  ✗ Failed to create: ${failedCount} issues`);
  }
  
  console.log('\n🎉 Your Jira is now populated with:');
  console.log('  - Product roadmap epics with stories');
  console.log('  - Realistic bugs with different severities');
  console.log('  - Technical tasks');
  console.log('  - Hebrew content for bilingual demo');
  
  console.log('\n💡 Test these queries in the web UI:');
  console.log('  English:');
  console.log('    - "Show me all bugs"');
  console.log('    - "What\'s in the Q4 roadmap?"');
  console.log('    - "Show me authentication related issues"');
  console.log('  Hebrew:');
  console.log('    - "הצג לי את כל הבאגים"');
  console.log('    - "מה המשימות בעברית?"');
  console.log('    - "הראה לי את האפיקים"');
}

// Check if fetch is available, if not, install node-fetch
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

async function checkDependencies() {
  try {
    await import('node-fetch');
  } catch (error) {
    console.log('Installing node-fetch...');
    await execAsync('npm install node-fetch');
    console.log('✓ node-fetch installed\n');
  }
}

// Run the script
checkDependencies().then(() => {
  createMockData().catch(console.error);
});