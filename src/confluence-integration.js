// src/confluence-integration.js
// Confluence content management module

/**
 * Get space ID for a space key
 */
export async function getSpaceId(mcpClient, cloudId, spaceKey = 'KP') {
  try {
    const result = await mcpClient.callTool({
      name: 'getConfluenceSpaces',
      arguments: {
        cloudId: cloudId,
        keys: [spaceKey]
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    if (data.results && data.results.length > 0) {
      return data.results[0].id;
    }
    
    throw new Error(`Space ${spaceKey} not found`);
  } catch (error) {
    console.error('Error getting space ID:', error);
    throw error;
  }
}

/**
 * Create a new Confluence page
 */
export async function createConfluencePage(mcpClient, cloudId, title, content, spaceKey = 'KP', isLiveDoc = false) {
  try {
    console.log(`📝 Creating Confluence page: ${title}`);
    
    // Get space ID
    const spaceId = await getSpaceId(mcpClient, cloudId, spaceKey);
    console.log(`Found space ID: ${spaceId}`);
    
    const result = await mcpClient.callTool({
      name: 'createConfluencePage',
      arguments: {
        cloudId: cloudId,
        spaceId: spaceId,
        title: title,
        body: content,
        subtype: isLiveDoc ? 'live' : undefined
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    return {
      success: true,
      pageId: data.id,
      url: data._links?.webui || data._links?.self,
      title: data.title,
      message: `✅ דף "${title}" נוצר בהצלחה ב-Confluence`
    };
    
  } catch (error) {
    console.error('Error creating Confluence page:', error);
    return {
      success: false,
      error: error.message,
      message: `❌ שגיאה ביצירת דף: ${error.message}`
    };
  }
}

/**
 * List pages in a Confluence space
 */
export async function listConfluencePages(mcpClient, cloudId, spaceKey = 'KP', limit = 20) {
  try {
    console.log(`📚 Listing pages in space ${spaceKey}`);
    
    // Get space ID
    const spaceId = await getSpaceId(mcpClient, cloudId, spaceKey);
    
    const result = await mcpClient.callTool({
      name: 'getPagesInConfluenceSpace',
      arguments: {
        cloudId: cloudId,
        spaceId: spaceId,
        limit: limit,
        status: 'current'
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    return {
      success: true,
      pages: data.results || [],
      total: data.results?.length || 0,
      message: `📚 נמצאו ${data.results?.length || 0} דפים במרחב ${spaceKey}`
    };
    
  } catch (error) {
    console.error('Error listing Confluence pages:', error);
    return {
      success: false,
      error: error.message,
      pages: [],
      message: `❌ שגיאה בקריאת דפים: ${error.message}`
    };
  }
}

/**
 * Search Confluence content
 */
export async function searchConfluence(mcpClient, cloudId, query, spaceKey = null) {
  try {
    console.log(`🔍 Searching Confluence for: ${query}`);
    
    let cql = `type = page AND text ~ "${query}"`;
    if (spaceKey) {
      cql = `space = ${spaceKey} AND ${cql}`;
    }
    
    const result = await mcpClient.callTool({
      name: 'searchConfluenceUsingCql',
      arguments: {
        cloudId: cloudId,
        cql: cql,
        limit: 20
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    return {
      success: true,
      results: data.results || [],
      total: data.results?.length || 0,
      message: `🔍 נמצאו ${data.results?.length || 0} תוצאות עבור "${query}"`
    };
    
  } catch (error) {
    console.error('Error searching Confluence:', error);
    return {
      success: false,
      error: error.message,
      results: [],
      message: `❌ שגיאה בחיפוש: ${error.message}`
    };
  }
}

/**
 * Get a specific Confluence page
 */
export async function getConfluencePage(mcpClient, cloudId, pageId) {
  try {
    console.log(`📄 Getting Confluence page: ${pageId}`);
    
    const result = await mcpClient.callTool({
      name: 'getConfluencePage',
      arguments: {
        cloudId: cloudId,
        pageId: pageId
      }
    });
    
    const data = JSON.parse(result.content[0].text);
    return {
      success: true,
      page: data,
      message: `📄 דף "${data.title}" נטען בהצלחה`
    };
    
  } catch (error) {
    console.error('Error getting Confluence page:', error);
    return {
      success: false,
      error: error.message,
      message: `❌ שגיאה בטעינת דף: ${error.message}`
    };
  }
}

/**
 * Create a PI report page in Confluence
 */
export async function publishReportToConfluence(mcpClient, cloudId, reportData, spaceKey = 'KP') {
  try {
    const { metadata, statistics, issues, highlights, timeline } = reportData;
    
    // Generate Confluence-formatted content (Markdown)
    const content = generateConfluenceContent(reportData);
    
    // Create the page
    const title = `דוח ${metadata.piName} - ${new Date().toLocaleDateString('he-IL')}`;
    const result = await createConfluencePage(mcpClient, cloudId, title, content, spaceKey, false);
    
    return result;
    
  } catch (error) {
    console.error('Error publishing report to Confluence:', error);
    return {
      success: false,
      error: error.message,
      message: `❌ שגיאה בפרסום הדוח: ${error.message}`
    };
  }
}

/**
 * Generate Confluence-formatted content from report data
 */
function generateConfluenceContent(reportData) {
  const { metadata, statistics, issues, highlights, timeline } = reportData;
  
  return `
# דוח ${metadata.piName}

## מידע כללי
- **פרויקט:** ${metadata.projectKey}
- **תאריך:** ${metadata.generatedAtFormatted}
- **סה"כ נושאים:** ${metadata.totalIssues}
- **אחוז השלמה:** ${metadata.completionPercentage}%

---

## סיכום מנהלים

### סטטיסטיקות
| מדד | ערך |
|-----|-----|
| סה"כ נושאים | ${metadata.totalIssues} |
| הושלמו | ${timeline.done.length} |
| בביצוע | ${timeline.inProgress.length} |
| ממתינים | ${timeline.upcoming.length} |
| אחוז השלמה | ${metadata.completionPercentage}% |

### התפלגות לפי סוג
${Object.entries(statistics.byType).map(([type, count]) => 
  `- **${type}:** ${count}`).join('\n')}

---

## נקודות מרכזיות

${highlights.highPriority.length > 0 ? `### 🔴 נושאים בעדיפות גבוהה (${highlights.highPriority.length})
${highlights.highPriority.map(issue => 
  `- [${issue.key}] ${issue.summary}`).join('\n')}` : ''}

${highlights.blocked.length > 0 ? `### ⚠️ נושאים חסומים (${highlights.blocked.length})
${highlights.blocked.map(issue => 
  `- [${issue.key}] ${issue.summary}`).join('\n')}` : ''}

${highlights.completed.length > 0 ? `### ✅ הושלמו לאחרונה (${highlights.completed.length})
${highlights.completed.slice(0, 10).map(issue => 
  `- [${issue.key}] ${issue.summary}`).join('\n')}` : ''}

---

## רשימת נושאים מפורטת

${issues.bugs.length > 0 ? `### 🐛 באגים (${issues.bugs.length})
| מזהה | תיאור | עדיפות | סטטוס | אחראי |
|------|-------|---------|-------|-------|
${issues.bugs.map(issue => 
  `| ${issue.key} | ${issue.summary} | ${issue.priority} | ${issue.status} | ${issue.assignee} |`
).join('\n')}` : ''}

${issues.stories.length > 0 ? `### 📖 סטוריז (${issues.stories.length})
| מזהה | תיאור | נקודות | סטטוס | אחראי |
|------|-------|---------|-------|-------|
${issues.stories.map(issue => 
  `| ${issue.key} | ${issue.summary} | ${issue.storyPoints || '-'} | ${issue.status} | ${issue.assignee} |`
).join('\n')}` : ''}

${issues.tasks.length > 0 ? `### 📋 משימות (${issues.tasks.length})
| מזהה | תיאור | סטטוס | אחראי |
|------|-------|-------|-------|
${issues.tasks.map(issue => 
  `| ${issue.key} | ${issue.summary} | ${issue.status} | ${issue.assignee} |`
).join('\n')}` : ''}

---

## חלוקה לפי צוות
| חבר צוות | נושאים משויכים |
|----------|-----------------|
${Object.entries(statistics.byAssignee)
  .sort((a, b) => b[1] - a[1])
  .map(([assignee, count]) => `| ${assignee} | ${count} |`)
  .join('\n')}

---

*נוצר אוטומטית על ידי Atlassian Intelligence Platform*
*${metadata.generatedAtFormatted}*
`;
}

/**
 * Create a knowledge base article
 */
export async function createKnowledgeArticle(mcpClient, cloudId, title, content, category = 'general', spaceKey = 'KP') {
  try {
    // Add metadata to content
    const enrichedContent = `
# ${title}

**קטגוריה:** ${getCategoryLabel(category)}  
**תאריך יצירה:** ${new Date().toLocaleDateString('he-IL')}

---

${content}

---

*מסמך זה נוצר באמצעות Atlassian Intelligence Platform*
`;
    
    return await createConfluencePage(mcpClient, cloudId, title, enrichedContent, spaceKey, false);
    
  } catch (error) {
    console.error('Error creating knowledge article:', error);
    return {
      success: false,
      error: error.message,
      message: `❌ שגיאה ביצירת מאמר: ${error.message}`
    };
  }
}

/**
 * Get category label in Hebrew
 */
function getCategoryLabel(category) {
  const labels = {
    'general': 'כללי',
    'technical': 'טכני',
    'process': 'תהליכים',
    'design': 'עיצוב',
    'architecture': 'ארכיטקטורה',
    'testing': 'בדיקות',
    'deployment': 'פריסה'
  };
  
  return labels[category] || category;
}

/**
 * Create project documentation structure
 */
export async function createProjectStructure(mcpClient, cloudId, projectName = 'KP Project', spaceKey = 'KP') {
  try {
    console.log(`🏗️ Creating project structure for ${projectName}`);
    
    const pages = [
      {
        title: `${projectName} - דף ראשי`,
        content: `# ברוכים הבאים ל-${projectName}

## על הפרויקט
מרחב זה מכיל את כל התיעוד הקשור לפרויקט ${projectName}.

## קישורים חשובים
- [דוחות PI](/wiki/spaces/${spaceKey}/pages)
- [תיעוד טכני](/wiki/spaces/${spaceKey}/pages)
- [תהליכי עבודה](/wiki/spaces/${spaceKey}/pages)

## צוות הפרויקט
- מנהל פרויקט
- צוות פיתוח
- צוות QA
- צוות DevOps`
      },
      {
        title: 'תבנית דוח PI',
        content: `# תבנית דוח PI

## מבנה הדוח
1. סיכום מנהלים
2. התקדמות משימות
3. בעיות וחסמים
4. הישגים מרכזיים
5. תכנון להמשך`
      },
      {
        title: 'מדריך למשתמש',
        content: `# מדריך למשתמש

## שימוש במערכת
1. כניסה למערכת
2. ניווט בממשק
3. יצירת משימות
4. מעקב אחר התקדמות`
      }
    ];
    
    const results = [];
    for (const page of pages) {
      const result = await createConfluencePage(
        mcpClient, 
        cloudId, 
        page.title, 
        page.content, 
        spaceKey, 
        false
      );
      results.push(result);
    }
    
    return {
      success: true,
      created: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      message: `✅ נוצרו ${results.filter(r => r.success).length} דפים במבנה הפרויקט`
    };
    
  } catch (error) {
    console.error('Error creating project structure:', error);
    return {
      success: false,
      error: error.message,
      message: `❌ שגיאה ביצירת מבנה הפרויקט: ${error.message}`
    };
  }
}