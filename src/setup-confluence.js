// src/setup-confluence.js
// Quick setup script to populate your KMD Confluence space

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { 
  createConfluencePage,
  createProjectStructure,
  getSpaceId 
} from './confluence-integration.js';

const CLOUD_ID = '252a1017-b96e-41fc-8035-a3c27ec05bb5';
const SPACE_KEY = 'KP';

async function setupConfluence() {
  console.log('🚀 Setting up Confluence space for KMD Project...\n');
  
  // Initialize MCP client
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse']
  });

  const client = new Client({
    name: 'confluence-setup',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  console.log('✅ Connected to MCP\n');

  try {
    // Verify space exists
    console.log(`📍 Checking space ${SPACE_KEY}...`);
    const spaceId = await getSpaceId(client, CLOUD_ID, SPACE_KEY);
    console.log(`✅ Found space ID: ${spaceId}\n`);

    // Create project structure
    console.log('🏗️ Creating initial project structure...');
    const structureResult = await createProjectStructure(client, CLOUD_ID, 'KMD Project', SPACE_KEY);
    console.log(structureResult.message + '\n');

    // Create additional sample pages
    console.log('📄 Creating additional content...\n');

    const additionalPages = [
      {
        title: 'ארכיטקטורת המערכת',
        content: `# ארכיטקטורת המערכת

## סקירה כללית
מסמך זה מתאר את הארכיטקטורה של פרויקט KMD.

## רכיבים מרכזיים

### 1. Frontend
- React.js
- Material-UI
- Redux לניהול State

### 2. Backend
- Node.js + Express
- MongoDB לאחסון נתונים
- JWT לאימות

### 3. Integration Layer
- Atlassian MCP לחיבור עם Jira/Confluence
- REST APIs
- WebSocket לעדכונים בזמן אמת

## דיאגרמת מערכת
\`\`\`
[Frontend] <--> [API Gateway] <--> [Backend Services]
                                        |
                                   [Database]
\`\`\`

## אבטחה
- אימות דו-שלבי
- הצפנת SSL
- Rate limiting
- Input validation`
      },
      {
        title: 'מדריך פיתוח',
        content: `# מדריך פיתוח

## הגדרת סביבת הפיתוח

### דרישות מקדימות
- Node.js v20+
- Git
- Docker (אופציונלי)

### התקנה
\`\`\`bash
git clone https://github.com/project/kmd
cd kmd
npm install
\`\`\`

### הרצה מקומית
\`\`\`bash
npm run dev
\`\`\`

## מבנה הפרויקט
\`\`\`
src/
├── components/     # React components
├── services/       # Business logic
├── utils/          # Utility functions
└── tests/          # Test files
\`\`\`

## קונבנציות קוד
- ESLint לבדיקת קוד
- Prettier לפורמט
- Conventional commits

## תהליך העבודה
1. צור branch חדש מ-develop
2. בצע את השינויים
3. הרץ בדיקות
4. פתח Pull Request
5. המתן ל-Code Review`
      },
      {
        title: 'תוכנית בדיקות',
        content: `# תוכנית בדיקות

## סקירה כללית
מסמך זה מגדיר את אסטרטגיית הבדיקות לפרויקט KMD.

## סוגי בדיקות

### 1. בדיקות יחידה (Unit Tests)
- כיסוי מינימלי: 80%
- כלים: Jest, React Testing Library
- תדירות: בכל commit

### 2. בדיקות אינטגרציה
- בדיקת APIs
- בדיקת חיבור למסד נתונים
- תדירות: יומית

### 3. בדיקות E2E
- כלים: Cypress
- תרחישים עיקריים
- תדירות: לפני כל release

### 4. בדיקות ביצועים
- Load testing עם K6
- יעד: 1000 משתמשים במקביל
- Response time < 2 שניות

## תרחישי בדיקה עיקריים
1. הרשמה והתחברות
2. יצירת וניהול משימות
3. חיפוש ודיווח
4. ייצוא נתונים

## ניהול באגים
- דיווח ב-Jira
- עדיפויות: Critical, High, Medium, Low
- SLA לפי עדיפות`
      },
      {
        title: 'מילון מונחים',
        content: `# מילון מונחים - KMD Project

## מונחים טכניים

**API (Application Programming Interface)**  
ממשק תכנות יישומים - דרך לתקשורת בין מערכות

**MCP (Model Context Protocol)**  
פרוטוקול של Atlassian לחיבור עם Jira ו-Confluence

**PI (Program Increment)**  
תקופת תכנון בשיטת SAFe, בדרך כלל 8-12 שבועות

**Sprint**  
מחזור פיתוח קצר, בדרך כלל 2 שבועות

**JQL (Jira Query Language)**  
שפת שאילתות לחיפוש ב-Jira

**CQL (Confluence Query Language)**  
שפת שאילתות לחיפוש ב-Confluence

## מונחים עסקיים

**MVP (Minimum Viable Product)**  
מוצר מינימלי בר-קיימא

**ROI (Return on Investment)**  
החזר השקעה

**SLA (Service Level Agreement)**  
הסכם רמת שירות

**KPI (Key Performance Indicator)**  
מדד ביצוע מרכזי`
      }
    ];

    for (const page of additionalPages) {
      try {
        const result = await createConfluencePage(
          client,
          CLOUD_ID,
          page.title,
          page.content,
          SPACE_KEY,
          false
        );
        console.log(`✅ Created: ${page.title}`);
      } catch (error) {
        console.log(`❌ Failed to create: ${page.title} - ${error.message}`);
      }
    }

    console.log('\n✅ Confluence setup complete!');
    console.log(`📚 Visit your Confluence space to see the created content`);

  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await transport.close();
    process.exit(0);
  }
}

// Run setup
setupConfluence().catch(console.error);