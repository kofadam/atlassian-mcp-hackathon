// report-generator.js - PI Report Generation Module
// Place this file in src/report-generator.js

/**
 * Generate a comprehensive PI report
 * @param {Object} mcpClient - MCP client instance
 * @param {string} piLabel - PI label (e.g., "PI-26.1")
 * @param {string} piName - Human-readable PI name (e.g., "Next PI")
 * @param {string} projectKey - Jira project key
 * @returns {Object} Report data and HTML
 */
export async function generatePIReport(mcpClient, piLabel, piName, projectKey = 'KMD') {
  console.log(`📊 Generating report for ${piName} (${piLabel})`);
  
  try {
    // Fetch all issues for this PI using MCP client directly
    const jql = `project = ${projectKey} AND labels = "${piLabel}" ORDER BY priority DESC, type DESC`;
    
    const result = await mcpClient.callTool({
      name: 'searchJiraIssuesUsingJql',
      arguments: {
        cloudId: '252a1017-b96e-41fc-8035-a3c27ec05bb5', // Your CloudID
        jql: jql,
        fields: ['summary', 'status', 'issuetype', 'priority', 'assignee', 'created', 'labels', 'duedate', 'reporter', 'description'],
        maxResults: 100
      }
    });
    
    // Parse the result
    const data = JSON.parse(result.content[0].text);
    const issues = data.issues || [];
    
    // Process and categorize issues
    const reportData = processIssuesForReport(issues, piLabel, piName, projectKey);
    
    // Generate HTML report
    const htmlReport = generateHTMLReport(reportData);
    
    // Generate downloadable formats
    const downloads = {
      html: htmlReport,
      markdown: generateMarkdownReport(reportData),
      json: JSON.stringify(reportData, null, 2)
    };
    
    return {
      success: true,
      reportData,
      htmlReport,
      downloads,
      summary: generateSummaryText(reportData)
    };
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Process issues into structured report data
 */
function processIssuesForReport(issues, piLabel, piName, projectKey) {
  const now = new Date();
  
  // Initialize report structure
  const report = {
    metadata: {
      piLabel,
      piName: piName.replace('Current PI', 'PI נוכחי').replace('Next PI', 'PI הבא'),
      projectKey,
      generatedAt: now.toISOString(),
      generatedAtFormatted: now.toLocaleString('he-IL'),
      totalIssues: issues.length
    },
    statistics: {
      byType: {},
      byStatus: {},
      byPriority: {},
      byAssignee: {}
    },
    issues: {
      epics: [],
      features: [],
      stories: [],
      bugs: [],
      tasks: [],
      other: []
    },
    highlights: {
      highPriority: [],
      blocked: [],
      atRisk: [],
      completed: []
    },
    timeline: {
      upcoming: [],
      inProgress: [],
      done: []
    }
  };
  
  // Process each issue
  issues.forEach(issue => {
    const fields = issue.fields || {};
    
    // Basic issue info
    const processedIssue = {
      key: issue.key,
      summary: fields.summary,
      type: fields.issuetype?.name || 'Unknown',
      status: fields.status?.name || 'Unknown',
      priority: fields.priority?.name || 'Medium',
      assignee: fields.assignee?.displayName || 'Unassigned',
      reporter: fields.reporter?.displayName || 'Unknown',
      created: fields.created,
      updated: fields.updated,
      dueDate: fields.duedate,
      labels: fields.labels || [],
      storyPoints: fields.customfield_10016 || fields.storyPoints || 0,
      description: fields.description || '',
      epicLink: fields.customfield_10014 || fields.epicLink || null,
      components: fields.components?.map(c => c.name) || [],
      fixVersions: fields.fixVersions?.map(v => v.name) || []
    };
    
    // Update statistics
    updateStatistics(report.statistics, processedIssue);
    
    // Categorize by type
    categorizeByType(report.issues, processedIssue);
    
    // Identify highlights
    identifyHighlights(report.highlights, processedIssue);
    
    // Add to timeline
    addToTimeline(report.timeline, processedIssue);
  });
  
  // Calculate completion percentage
  report.metadata.completionPercentage = calculateCompletionPercentage(report.statistics.byStatus);
  
  // Sort highlights by priority
  report.highlights.highPriority.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
  
  return report;
}

/**
 * Update statistics counters
 */
function updateStatistics(stats, issue) {
  // By Type
  stats.byType[issue.type] = (stats.byType[issue.type] || 0) + 1;
  
  // By Status
  stats.byStatus[issue.status] = (stats.byStatus[issue.status] || 0) + 1;
  
  // By Priority
  stats.byPriority[issue.priority] = (stats.byPriority[issue.priority] || 0) + 1;
  
  // By Assignee
  stats.byAssignee[issue.assignee] = (stats.byAssignee[issue.assignee] || 0) + 1;
}

/**
 * Categorize issue by type
 */
function categorizeByType(issues, issue) {
  const type = issue.type.toLowerCase();
  
  if (type.includes('epic')) {
    issues.epics.push(issue);
  } else if (type.includes('feature')) {
    issues.features.push(issue);
  } else if (type.includes('story') || type.includes('user story')) {
    issues.stories.push(issue);
  } else if (type.includes('bug')) {
    issues.bugs.push(issue);
  } else if (type.includes('task')) {
    issues.tasks.push(issue);
  } else {
    issues.other.push(issue);
  }
}

/**
 * Identify issues for highlights section
 */
function identifyHighlights(highlights, issue) {
  const priority = issue.priority.toLowerCase();
  const status = issue.status.toLowerCase();
  
  // High priority issues
  if (priority === 'highest' || priority === 'high' || priority === 'critical') {
    highlights.highPriority.push(issue);
  }
  
  // Blocked issues
  if (status === 'blocked' || issue.labels.includes('blocked')) {
    highlights.blocked.push(issue);
  }
  
  // At risk issues (overdue or flagged)
  if (issue.labels.includes('at-risk') || issue.labels.includes('flagged') || 
      (issue.dueDate && new Date(issue.dueDate) < new Date())) {
    highlights.atRisk.push(issue);
  }
  
  // Completed issues
  if (status === 'done' || status === 'closed' || status === 'resolved') {
    highlights.completed.push(issue);
  }
}

/**
 * Add issue to timeline
 */
function addToTimeline(timeline, issue) {
  const status = issue.status.toLowerCase();
  
  if (status === 'todo' || status === 'to do' || status === 'backlog' || status === 'open') {
    timeline.upcoming.push(issue);
  } else if (status === 'in progress' || status === 'in development' || status === 'in review') {
    timeline.inProgress.push(issue);
  } else if (status === 'done' || status === 'closed' || status === 'resolved') {
    timeline.done.push(issue);
  }
}

/**
 * Calculate completion percentage
 */
function calculateCompletionPercentage(statusStats) {
  const total = Object.values(statusStats).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  
  const completed = (statusStats['Done'] || 0) + (statusStats['Closed'] || 0) + (statusStats['Resolved'] || 0);
  return Math.round((completed / total) * 100);
}

/**
 * Get priority weight for sorting
 */
function getPriorityWeight(priority) {
  const weights = {
    'highest': 5,
    'critical': 5,
    'high': 4,
    'medium': 3,
    'low': 2,
    'lowest': 1
  };
  return weights[priority.toLowerCase()] || 3;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(reportData) {
  const { metadata, statistics, issues, highlights, timeline } = reportData;
  
  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>דוח PI - ${metadata.piName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #172B4D;
      background: #F4F5F7;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      padding: 40px;
    }
    
    .header {
      border-bottom: 3px solid #0052CC;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    h1 {
      color: #0052CC;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .metadata {
      color: #5E6C84;
      font-size: 0.9em;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .stat-card {
      background: #F4F5F7;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #0052CC;
    }
    
    .stat-card h3 {
      color: #5E6C84;
      font-size: 0.9em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    
    .stat-card .value {
      font-size: 2em;
      font-weight: bold;
      color: #172B4D;
    }
    
    .section {
      margin: 40px 0;
    }
    
    .section h2 {
      color: #172B4D;
      font-size: 1.8em;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #DFE1E6;
    }
    
    .progress-bar {
      width: 100%;
      height: 30px;
      background: #DFE1E6;
      border-radius: 15px;
      overflow: hidden;
      margin: 20px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00B8D9 0%, #0052CC 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      transition: width 0.5s ease;
    }
    
    .issue-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .issue-table th {
      background: #F4F5F7;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #5E6C84;
      border-bottom: 2px solid #DFE1E6;
    }
    
    .issue-table td {
      padding: 12px;
      border-bottom: 1px solid #DFE1E6;
    }
    
    .issue-table tr:hover {
      background: #F4F5F7;
    }
    
    .issue-key {
      font-family: monospace;
      font-weight: bold;
      color: #0052CC;
    }
    
    .priority-highest, .priority-critical {
      color: #DE350B;
      font-weight: bold;
    }
    
    .priority-high {
      color: #FF5630;
      font-weight: bold;
    }
    
    .priority-medium {
      color: #FFAB00;
    }
    
    .priority-low {
      color: #36B37E;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 600;
    }
    
    .status-done {
      background: #00875A;
      color: white;
    }
    
    .status-in-progress {
      background: #0052CC;
      color: white;
    }
    
    .status-todo {
      background: #5E6C84;
      color: white;
    }
    
    .chart-container {
      margin: 20px 0;
      padding: 20px;
      background: #F4F5F7;
      border-radius: 8px;
    }
    
    .highlights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    
    .highlight-card {
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #DFE1E6;
    }
    
    .highlight-card.critical {
      border-color: #DE350B;
      background: #FFF5F4;
    }
    
    .highlight-card.warning {
      border-color: #FFAB00;
      background: #FFFBF5;
    }
    
    .highlight-card.success {
      border-color: #00875A;
      background: #F3FFF8;
    }
    
    .highlight-card h3 {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #DFE1E6;
      text-align: center;
      color: #5E6C84;
      font-size: 0.9em;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        padding: 20px;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📊 דוח ${metadata.piName}</h1>
      <div class="metadata">
        <strong>פרויקט:</strong> ${metadata.projectKey} | 
        <strong>PI:</strong> ${metadata.piLabel} | 
        <strong>נוצר:</strong> ${metadata.generatedAtFormatted} | 
        <strong>סה"כ נושאים:</strong> ${metadata.totalIssues}
      </div>
    </div>
    
    <!-- Executive Summary -->
    <div class="section">
      <h2>סיכום מנהלים</h2>
      
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${metadata.completionPercentage}%">
          ${metadata.completionPercentage}% הושלם
        </div>
      </div>
      
      <!-- Statistics Grid -->
      <div class="summary-grid">
        <div class="stat-card">
          <h3>סה"כ נושאים</h3>
          <div class="value">${metadata.totalIssues}</div>
        </div>
        <div class="stat-card">
          <h3>הושלמו</h3>
          <div class="value">${timeline.done.length}</div>
        </div>
        <div class="stat-card">
          <h3>בביצוע</h3>
          <div class="value">${timeline.inProgress.length}</div>
        </div>
        <div class="stat-card">
          <h3>ממתינים</h3>
          <div class="value">${timeline.upcoming.length}</div>
        </div>
      </div>
    </div>
    
    <!-- Highlights -->
    <div class="section">
      <h2>נקודות מרכזיות</h2>
      <div class="highlights-grid">
        ${highlights.highPriority.length > 0 ? `
        <div class="highlight-card critical">
          <h3>🔴 עדיפות גבוהה (${highlights.highPriority.length})</h3>
          <ul>
            ${highlights.highPriority.slice(0, 3).map(issue => 
              `<li><span class="issue-key">${issue.key}</span>: ${issue.summary}</li>`
            ).join('')}
          </ul>
        </div>` : ''}
        
        ${highlights.blocked.length > 0 ? `
        <div class="highlight-card warning">
          <h3>⚠️ חסומים (${highlights.blocked.length})</h3>
          <ul>
            ${highlights.blocked.slice(0, 3).map(issue => 
              `<li><span class="issue-key">${issue.key}</span>: ${issue.summary}</li>`
            ).join('')}
          </ul>
        </div>` : ''}
        
        ${highlights.completed.length > 0 ? `
        <div class="highlight-card success">
          <h3>✅ הושלמו לאחרונה (${highlights.completed.length})</h3>
          <ul>
            ${highlights.completed.slice(0, 3).map(issue => 
              `<li><span class="issue-key">${issue.key}</span>: ${issue.summary}</li>`
            ).join('')}
          </ul>
        </div>` : ''}
      </div>
    </div>
    
    <!-- Issues by Type -->
    <div class="section">
      <h2>נושאים לפי סוג</h2>
      <div class="chart-container">
        <div class="summary-grid">
          ${Object.entries(statistics.byType).map(([type, count]) => `
          <div class="stat-card">
            <h3>${type}</h3>
            <div class="value">${count}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    
    <!-- Detailed Issue Lists -->
    ${issues.bugs.length > 0 ? `
    <div class="section">
      <h2>🐛 באגים (${issues.bugs.length})</h2>
      <table class="issue-table">
        <thead>
          <tr>
            <th>מזהה</th>
            <th>תיאור</th>
            <th>עדיפות</th>
            <th>סטטוס</th>
            <th>אחראי</th>
          </tr>
        </thead>
        <tbody>
          ${issues.bugs.map(issue => `
          <tr>
            <td class="issue-key">${issue.key}</td>
            <td>${issue.summary}</td>
            <td class="priority-${issue.priority.toLowerCase()}">${issue.priority}</td>
            <td><span class="status-badge status-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span></td>
            <td>${issue.assignee}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}
    
    ${issues.stories.length > 0 ? `
    <div class="section">
      <h2>📖 סטוריז (${issues.stories.length})</h2>
      <table class="issue-table">
        <thead>
          <tr>
            <th>מזהה</th>
            <th>תיאור</th>
            <th>נקודות</th>
            <th>סטטוס</th>
            <th>אחראי</th>
          </tr>
        </thead>
        <tbody>
          ${issues.stories.map(issue => `
          <tr>
            <td class="issue-key">${issue.key}</td>
            <td>${issue.summary}</td>
            <td>${issue.storyPoints || '-'}</td>
            <td><span class="status-badge status-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span></td>
            <td>${issue.assignee}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}
    
    <!-- Team Distribution -->
    <div class="section">
      <h2>חלוקה לפי צוות</h2>
      <table class="issue-table">
        <thead>
          <tr>
            <th>חבר צוות</th>
            <th>נושאים משויכים</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(statistics.byAssignee)
            .sort((a, b) => b[1] - a[1])
            .map(([assignee, count]) => `
          <tr>
            <td>${assignee}</td>
            <td>${count}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      נוצר על ידי Atlassian Intelligence Platform | ${metadata.generatedAtFormatted}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(reportData) {
  const { metadata, statistics, issues, highlights, timeline } = reportData;
  
  return `
# דוח ${metadata.piName}

**פרויקט:** ${metadata.projectKey}  
**PI:** ${metadata.piLabel}  
**נוצר:** ${metadata.generatedAtFormatted}  
**סה"כ נושאים:** ${metadata.totalIssues}

---

## סיכום מנהלים

**אחוז השלמה:** ${metadata.completionPercentage}%

- **סה"כ נושאים:** ${metadata.totalIssues}
- **הושלמו:** ${timeline.done.length}
- **בביצוע:** ${timeline.inProgress.length}
- **ממתינים:** ${timeline.upcoming.length}

## נקודות מרכזיות

${highlights.highPriority.length > 0 ? `### 🔴 נושאים בעדיפות גבוהה (${highlights.highPriority.length})
${highlights.highPriority.slice(0, 5).map(issue => 
  `- **${issue.key}**: ${issue.summary}`).join('\n')}
` : ''}

${highlights.blocked.length > 0 ? `### ⚠️ נושאים חסומים (${highlights.blocked.length})
${highlights.blocked.slice(0, 5).map(issue => 
  `- **${issue.key}**: ${issue.summary}`).join('\n')}
` : ''}

${highlights.completed.length > 0 ? `### ✅ הושלמו לאחרונה (${highlights.completed.length})
${highlights.completed.slice(0, 5).map(issue => 
  `- **${issue.key}**: ${issue.summary}`).join('\n')}
` : ''}

## נושאים לפי סוג

${Object.entries(statistics.byType).map(([type, count]) => 
  `- **${type}:** ${count}`).join('\n')}

## נושאים לפי עדיפות

${Object.entries(statistics.byPriority).map(([priority, count]) => 
  `- **${priority}:** ${count}`).join('\n')}

## חלוקה לפי צוות

| חבר צוות | נושאים משויכים |
|----------|-----------------|
${Object.entries(statistics.byAssignee)
  .sort((a, b) => b[1] - a[1])
  .map(([assignee, count]) => `| ${assignee} | ${count} |`)
  .join('\n')}

${issues.bugs.length > 0 ? `
## 🐛 באגים (${issues.bugs.length})

| מזהה | תיאור | עדיפות | סטטוס | אחראי |
|-----|-------|--------|-------|-------|
${issues.bugs.map(issue => 
  `| ${issue.key} | ${issue.summary} | ${issue.priority} | ${issue.status} | ${issue.assignee} |`
).join('\n')}` : ''}

${issues.stories.length > 0 ? `
## 📖 סטוריז (${issues.stories.length})

| מזהה | תיאור | נקודות | סטטוס | אחראי |
|-----|-------|---------|-------|-------|
${issues.stories.map(issue => 
  `| ${issue.key} | ${issue.summary} | ${issue.storyPoints || '-'} | ${issue.status} | ${issue.assignee} |`
).join('\n')}` : ''}

---

*נוצר על ידי Atlassian Intelligence Platform*  
*${metadata.generatedAtFormatted}*
  `.trim();
}

/**
 * Generate summary text for chat display
 */
function generateSummaryText(reportData) {
  const { metadata, statistics, highlights } = reportData;
  
  return `📊 **דוח ${metadata.piName} נוצר בהצלחה**

**סיכום:**
• סה"כ נושאים: ${metadata.totalIssues}
• אחוז השלמה: ${metadata.completionPercentage}%
• עדיפות גבוהה: ${highlights.highPriority.length} נושאים
• חסומים: ${highlights.blocked.length} נושאים

**סוגי נושאים:**
${Object.entries(statistics.byType).map(([type, count]) => 
  `• ${type}: ${count}`).join('\n')}

**פעולות זמינות:**
• הצג דוח מלא בדפדפן
• הורד כ-HTML/PDF
• ייצוא ל-Confluence (בקרוב)`;
}

// Exports already declared with function definitions above