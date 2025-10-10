// src/ollama-integration.js
// Robust two-stage approach: Ollama classifies intent, JavaScript builds queries

/**
 * Call Ollama API for chat completion
 */
async function callOllama(prompt, systemPrompt = '', model = 'llama3.2:3b') {
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        stream: false,
        temperature: 0.1  // Low temperature for more consistent output
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Ollama API error:', error);
    throw new Error(`Failed to connect to Ollama: ${error.message}`);
  }
}

/**
 * Intent classification using Ollama
 * Returns a simple intent string, not JQL
 */
async function classifyIntent(query) {
  const systemPrompt = `You are an intent classifier for Jira and Confluence queries.
Classify the user's query into ONE of these intents. Respond with ONLY the intent name, nothing else.

IMPORTANT RULES:
- HIGH_PRIORITY_SPRINT: ONLY if query mentions BOTH high priority AND sprint together
- HIGH_PRIORITY: if query mentions high priority but NOT sprint
- Use HIGH_PRIORITY for general high priority queries without sprint context

Available intents:
- LIST_BUGS: User wants to see bugs
- LIST_TASKS: User wants to see tasks  
- LIST_STORIES: User wants to see stories
- PROJECT_SUMMARY: User wants project statistics/overview
- HIGH_PRIORITY: User wants high priority issues
- HIGH_PRIORITY_SPRINT: User wants high priority issues in sprint
- MY_ISSUES: User wants their assigned issues
- IN_PROGRESS: User wants in-progress issues
- SEARCH_ISSUES: User wants to search for specific content
- CONFLUENCE_SEARCH: User wants to search Confluence pages
- CONFLUENCE_CREATE_PAGE: User wants to create a Confluence page
- CONFLUENCE_LIST_PAGES: User wants to list Confluence pages
- SPRINT_INFO: User wants sprint information
- NEXT_PI: User wants next Program Increment
- CURRENT_PI: User wants current PI
- PI_REPORT: User wants PI report or summary
- GENERATE_PI_REPORT: User wants to generate/create a report for a PI
- CURRENT_PI_REPORT: User wants a report for the current PI
- NEXT_PI_REPORT: User wants a report for the next PI
- PUBLISH_REPORT_TO_CONFLUENCE: User wants to publish a report to Confluence
- HELP: User is asking for help or guidance
- UNKNOWN: Cannot determine intent

Examples:
"show me bugs" -> LIST_BUGS
"הצג באגים" -> LIST_BUGS
"תן לי סיכום פרויקט" -> PROJECT_SUMMARY
"project summary" -> PROJECT_SUMMARY
"find issues about database" -> SEARCH_ISSUES
"high priority" -> HIGH_PRIORITY
"עדיפות גבוהה" -> HIGH_PRIORITY
"הצג נושאים בעדיפות גבוהה" -> HIGH_PRIORITY
"נושאים בעדיפות גבוהה בספרינט" -> HIGH_PRIORITY_SPRINT
"עדיפות גבוהה בספרינט הקרוב" -> HIGH_PRIORITY_SPRINT
"high priority in sprint" -> HIGH_PRIORITY_SPRINT
"high priority issues in current sprint" -> HIGH_PRIORITY_SPRINT
"show next PI" -> NEXT_PI
"next program increment" -> NEXT_PI
"current PI" -> CURRENT_PI
"generate PI report" -> GENERATE_PI_REPORT  
"create report for current PI" -> CURRENT_PI_REPORT
"create summary for next PI" -> NEXT_PI_REPORT
"make a report for PI-26.1" -> GENERATE_PI_REPORT
"PI report" -> GENERATE_PI_REPORT
"current PI summary" -> CURRENT_PI_REPORT
"next PI report" -> NEXT_PI_REPORT
"צור דוח עבור PI נוכחי" -> CURRENT_PI_REPORT
"צור סיכום עבור PI הבא" -> NEXT_PI_REPORT
"הצג דפי confluence" -> CONFLUENCE_LIST_PAGES
"show confluence pages" -> CONFLUENCE_LIST_PAGES
"list all confluence pages" -> CONFLUENCE_LIST_PAGES
"רשימת דפי confluence" -> CONFLUENCE_LIST_PAGES
"חפש ב-confluence ארכיטקטורה" -> CONFLUENCE_SEARCH
"search confluence for testing" -> CONFLUENCE_SEARCH
"find confluence pages about API" -> CONFLUENCE_SEARCH
"צור דף confluence" -> CONFLUENCE_CREATE_PAGE
"create confluence page" -> CONFLUENCE_CREATE_PAGE
"help" -> HELP
"עזרה" -> HELP
"איך להשתמש" -> HELP
"מה אפשר לעשות" -> HELP
"what can you do" -> HELP

Respond with ONLY the intent name.`;

  try {
    const response = await callOllama(query, systemPrompt);
    const intent = response.trim().toUpperCase().replace(/[^A-Z_]/g, '');
    
    // Validate intent
    const validIntents = [
      'LIST_BUGS', 'LIST_TASKS', 'LIST_STORIES',
      'PROJECT_SUMMARY', 'HIGH_PRIORITY', 'HIGH_PRIORITY_SPRINT',
      'MY_ISSUES', 'IN_PROGRESS',
      'SEARCH_ISSUES', 'CONFLUENCE_SEARCH', 'CONFLUENCE_LIST_PAGES', 
      'CONFLUENCE_CREATE_PAGE', 'PUBLISH_REPORT_TO_CONFLUENCE',
      'SPRINT_INFO',
      'NEXT_PI', 'CURRENT_PI', 'PI_REPORT',
      'GENERATE_PI_REPORT', 'CURRENT_PI_REPORT', 'NEXT_PI_REPORT',
      'HELP',
      'UNKNOWN'
    ];  

    if (validIntents.includes(intent)) {
      return intent;
    }
    
    // If invalid, try to find closest match
    for (const validIntent of validIntents) {
      if (intent.includes(validIntent) || validIntent.includes(intent)) {
        return validIntent;
      }
    }
    
    return 'UNKNOWN';
  } catch (error) {
    console.error('Intent classification error:', error);
    return 'UNKNOWN';
  }
}

/**
 * Extract keywords for search queries
 */
async function extractKeywords(query) {
  const systemPrompt = `Extract the main search keywords from this query. 
Respond with ONLY the keywords, separated by spaces, nothing else.
Remove words like: show, find, get, search, me, all, the, a, an
Keep only the meaningful search terms.

Examples:
"find issues about database" -> database
"search for OAuth problems" -> OAuth problems
"חפש נושאים על אבטחה" -> אבטחה`;

  try {
    const response = await callOllama(query, systemPrompt);
    return response.trim();
  } catch (error) {
    console.error('Keyword extraction error:', error);
    // Fallback: simple word extraction
    return query
      .replace(/find|search|show|get|me|all|the|a|an|חפש|הצג|תן|לי/gi, '')
      .trim();
  }
}

/**
 * Build JQL query from classified intent
 * This is deterministic and always produces valid JQL
 */
function buildJQL(intent, projectKey, keywords = '') {
  const baseProject = `project = ${projectKey}`;
  
  const queries = {
    LIST_BUGS: `${baseProject} AND type = Bug AND status != Done ORDER BY priority DESC, created DESC`,
    LIST_TASKS: `${baseProject} AND type = Task AND status != Done ORDER BY created DESC`,
    LIST_STORIES: `${baseProject} AND type = Story AND status != Done ORDER BY created DESC`,
    PROJECT_SUMMARY: `${baseProject} ORDER BY created DESC`,
    HIGH_PRIORITY: `${baseProject} AND priority IN (Highest, High) AND status != Done ORDER BY priority DESC`,
    HIGH_PRIORITY_SPRINT: `${baseProject} AND priority IN (Highest, High) AND sprint in openSprints() AND status != Done ORDER BY priority DESC`,
    MY_ISSUES: `${baseProject} AND assignee = currentUser() AND status != Done ORDER BY priority DESC`,
    IN_PROGRESS: `${baseProject} AND status = "In Progress" ORDER BY updated DESC`,
    SEARCH_ISSUES: keywords 
      ? `${baseProject} AND (summary ~ "${keywords}" OR description ~ "${keywords}") ORDER BY created DESC`
      : `${baseProject} ORDER BY created DESC`,
    SPRINT_INFO: `${baseProject} AND sprint in openSprints() ORDER BY rank`,
    NEXT_PI: `${baseProject} AND labels = "PI-26.1" ORDER BY priority DESC, created DESC`,
    CURRENT_PI: `${baseProject} AND labels = "PI-25.4" ORDER BY priority DESC, created DESC`,
    PI_REPORT: `${baseProject} AND labels IN ("PI-26.1", "PI-25.4") ORDER BY labels DESC, priority DESC`,
    CURRENT_PI_REPORT: `${baseProject} AND labels = "PI-25.4" ORDER BY priority DESC, type DESC`,
    NEXT_PI_REPORT: `${baseProject} AND labels = "PI-26.1" ORDER BY priority DESC, type DESC`,
    GENERATE_PI_REPORT: keywords ? 
      `${baseProject} AND labels = "${keywords}" ORDER BY priority DESC, type DESC` :
      `${baseProject} AND labels in ("PI-25.4", "PI-26.1") ORDER BY priority DESC, type DESC`,
    HELP: null,
    UNKNOWN: `${baseProject} ORDER BY created DESC`
  };
  
  return queries[intent] || queries.UNKNOWN;
}

/**
 * Build CQL query for Confluence
 */
function buildCQL(keywords = '') {
  if (keywords) {
    return `type = page AND text ~ "${keywords}"`;
  }
  return 'type = page ORDER BY lastmodified DESC';
}

/**
 * Generate human-readable explanation
 */
function getExplanation(intent, keywords = '') {
  const explanations = {
    LIST_BUGS: '🐛 מציג את כל הבאגים הפתוחים',
    LIST_TASKS: '📋 מציג את כל המשימות הפתוחות',
    LIST_STORIES: '📖 מציג את כל הסטוריז',
    PROJECT_SUMMARY: '📊 סיכום הפרויקט',
    HIGH_PRIORITY: '🔴 מציג נושאים בעדיפות גבוהה',
    HIGH_PRIORITY_SPRINT: '🔴🏃 מציג נושאים בעדיפות גבוהה בספרינט הנוכחי',
    MY_ISSUES: '👤 מציג את הנושאים שלך',
    IN_PROGRESS: '🔄 מציג נושאים בעבודה',
    SEARCH_ISSUES: keywords ? `🔍 מחפש נושאים על ${keywords}` : '🔍 מחפש נושאים',
    CONFLUENCE_SEARCH: keywords ? `📚 מחפש דפי Confluence על ${keywords}` : '📚 מחפש דפי Confluence',
    CONFLUENCE_LIST_PAGES: '📚 מציג את כל דפי Confluence',
    CONFLUENCE_CREATE_PAGE: '➕ יוצר דף Confluence חדש',
    PUBLISH_REPORT_TO_CONFLUENCE: '📤 מפרסם דוח ל-Confluence',
    SPRINT_INFO: '🏃 מידע על הספרינט',
    NEXT_PI: '📅 מציג נושאים של PI הבא (PI-26.1)',
    CURRENT_PI: '📅 מציג נושאים של PI נוכחי (PI-25.4)',
    PI_REPORT: '📊 דוח Program Increment',
    CURRENT_PI_REPORT: '📊 יוצר דוח מקיף עבור PI נוכחי (PI-25.4)',
    NEXT_PI_REPORT: '📊 יוצר דוח מקיף עבור PI הבא (PI-26.1)',
    GENERATE_PI_REPORT: keywords ? 
      `📊 יוצר דוח PI עבור ${keywords}` :
      '📊 יוצר דוח Program Increment',
    HELP: '💡 הנה מה שאני יכול לעשות עבורך',
    UNKNOWN: keywords ? `🔍 מציג נושאים קשורים ל-${keywords}` : '📋 מציג נושאים אחרונים'
  };
  
  return explanations[intent] || explanations.UNKNOWN;
}

/**
 * Check if intent is a report intent
 */
export function isReportIntent(intent) {
  return ['GENERATE_PI_REPORT', 'CURRENT_PI_REPORT', 'NEXT_PI_REPORT'].includes(intent);
}

/**
 * Get PI details from intent
 */
export function getPIDetailsFromIntent(intent, keywords) {
  const piMappings = {
    CURRENT_PI_REPORT: { label: 'PI-25.4', name: 'PI נוכחי' },
    NEXT_PI_REPORT: { label: 'PI-26.1', name: 'PI הבא' },
    GENERATE_PI_REPORT: keywords ? 
      { label: keywords, name: `PI ${keywords}` } :
      { label: 'PI-25.4', name: 'PI נוכחי' }  // default to current
  };
  
  return piMappings[intent] || null;
}

/**
 * Get help response
 */
export function getHelpResponse() {
  return {
    success: true,
    message: `💡 **ברוך הבא למערכת Atlassian Intelligence!**

אני יכול לעזור לך עם:

**🔍 חיפושים ושאילתות:**
• "הצג את כל הבאגים" - רשימת כל הבאגים הפתוחים
• "נושאים בעדיפות גבוהה" - נושאים קריטיים  
• "המשימות שלי" - נושאים משויכים אליך
• "סיכום פרויקט" - סטטיסטיקות כלליות

**📊 דוחות PI:**
• "צור דוח עבור PI נוכחי" - דוח מלא ל-PI-25.4
• "צור סיכום עבור PI הבא" - דוח מלא ל-PI-26.1
• "דוח PI" - יצירת דוח Program Increment

**📋 סוגי נושאים:**
• "הצג סטוריז" - כל הסטוריז
• "הצג משימות" - כל המשימות
• "נושאים בעבודה" - מה בביצוע כרגע

**🔎 חיפוש מתקדם:**
• "חפש נושאים על OAuth" - חיפוש לפי מילת מפתח
• "דפי Confluence" - חיפוש בתיעוד

פשוט תכתוב מה שאתה צריך בשפה טבעית!`,
    aiThinking: 'הנה מה שאני יכול לעשות עבורך',
    toolUsed: 'help',
    result: {
      type: 'help',
      data: null
    }
  };
}

/**
 * Main parse function - orchestrates the two-stage process
 */
export async function parseQuery(query, projectKey = 'KMD') {
  try {
    console.log('🎯 Stage 1: Classifying intent...');
    
    // Check pattern matching FIRST before Ollama
    const fallback = patternMatchingFallback(query, projectKey);
    if (fallback) {
      console.log('📋 Pattern matched:', fallback.intent);
      return fallback;
    }
    
    // Stage 1: Classify intent using Ollama - returns just a string
    const intent = await classifyIntent(query);
    console.log('📋 Classified intent:', intent);
    
    // Handle HELP intent specially
    if (intent === 'HELP') {
      return getHelpResponse();
    }
    
    // Stage 2: Build queries using deterministic JavaScript
    let jql = '';
    let cql = '';
    let keywords = '';
    
    if (intent === 'CONFLUENCE_SEARCH') {
      // Confluence search
      keywords = await extractKeywords(query);
      cql = buildCQL(keywords);
    } else if (intent === 'SEARCH_ISSUES') {
      // Jira search with keywords
      keywords = await extractKeywords(query);
      jql = buildJQL(intent, projectKey, keywords);
    } else if (intent !== 'UNKNOWN') {
      // Standard Jira query
      jql = buildJQL(intent, projectKey);
    } else {
      // Unknown intent - already tried pattern matching
      jql = buildJQL('UNKNOWN', projectKey);
    }
    
    // Validate that we have at least one query
    if (!jql && !cql) {
      throw new Error('Could not generate a valid query');
    }
    
    const result = {
      intent: intent,
      jql: jql,
      cql: cql,
      keywords: keywords,
      explanation: getExplanation(intent, keywords)
    };
    
    console.log('✅ Query built:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Parse error:', error);
    // Ultimate fallback
    return {
      intent: 'UNKNOWN',
      jql: `project = ${projectKey} ORDER BY created DESC`,
      cql: '',
      keywords: '',
      explanation: 'מציג נושאים אחרונים (fallback)'
    };
  }
}

/**
 * Pattern matching fallback for when Ollama fails
 */
function patternMatchingFallback(query, projectKey) {
  const lowerQuery = query.toLowerCase();
  
  // Help patterns
  if (lowerQuery === 'עזרה' || lowerQuery === 'help' || lowerQuery.includes('מה אפשר') || lowerQuery.includes('what can')) {
    return getHelpResponse();
  }
  
  // Confluence search patterns - be more specific
  if ((lowerQuery.includes('חפש') || lowerQuery.includes('search') || lowerQuery.includes('find')) && 
      (lowerQuery.includes('confluence') || lowerQuery.includes('קונפלואנס')) &&
      !lowerQuery.includes('דפי')) {  // Not listing pages
    // Extract search terms
    const searchTerms = query
      .replace(/חפש|ב-confluence|בconfluence|ב-קונפלואנס|search|in confluence|find/gi, '')
      .trim();
    
    return {
      intent: 'CONFLUENCE_SEARCH',
      jql: '',
      cql: `space = KP AND type = page AND text ~ "${searchTerms}"`,  // Added space = KP
      keywords: searchTerms,
      explanation: `📚 מחפש דפי Confluence על ${searchTerms}`
    };
  }
  
  // Confluence list patterns - be very specific
  if ((lowerQuery.includes('הצג') || lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('רשימת')) && 
      (lowerQuery.includes('דפי confluence') || lowerQuery.includes('confluence pages') || lowerQuery.includes('דפי קונפלואנס'))) {
    return {
      intent: 'CONFLUENCE_LIST_PAGES',
      jql: '',
      cql: '',
      keywords: '',
      explanation: getExplanation('CONFLUENCE_LIST_PAGES')
    };
  }
  
  // Confluence create patterns
  if ((lowerQuery.includes('צור') || lowerQuery.includes('create')) && 
      lowerQuery.includes('דף confluence') || lowerQuery.includes('confluence page')) {
    return {
      intent: 'CONFLUENCE_CREATE_PAGE',
      jql: '',
      cql: '',
      keywords: '',
      explanation: getExplanation('CONFLUENCE_CREATE_PAGE')
    };
  }
  
  // High priority in sprint patterns
  if ((lowerQuery.includes('עדיפות גבוהה') || lowerQuery.includes('high priority')) && 
      (lowerQuery.includes('ספרינט') || lowerQuery.includes('sprint'))) {
    return {
      intent: 'HIGH_PRIORITY_SPRINT',
      jql: buildJQL('HIGH_PRIORITY_SPRINT', projectKey),
      cql: '',
      keywords: '',
      explanation: getExplanation('HIGH_PRIORITY_SPRINT')
    };
  }
  
  // Report patterns
  if (lowerQuery.includes('דוח') || lowerQuery.includes('report')) {
    if (lowerQuery.includes('נוכחי') || lowerQuery.includes('current')) {
      return {
        intent: 'CURRENT_PI_REPORT',
        jql: buildJQL('CURRENT_PI_REPORT', projectKey),
        cql: '',
        keywords: '',
        explanation: getExplanation('CURRENT_PI_REPORT')
      };
    }
    if (lowerQuery.includes('הבא') || lowerQuery.includes('next')) {
      return {
        intent: 'NEXT_PI_REPORT',
        jql: buildJQL('NEXT_PI_REPORT', projectKey),
        cql: '',
        keywords: '',
        explanation: getExplanation('NEXT_PI_REPORT')
      };
    }
  }
  
  if (lowerQuery.includes('באג') || lowerQuery.includes('bug')) {
    return {
      intent: 'LIST_BUGS',
      jql: buildJQL('LIST_BUGS', projectKey),
      cql: '',
      keywords: '',
      explanation: 'מציג את כל הבאגים הפתוחים (fallback)'
    };
  }
  
  if (lowerQuery.includes('סיכום') || lowerQuery.includes('summary')) {
    return {
      intent: 'PROJECT_SUMMARY',
      jql: buildJQL('PROJECT_SUMMARY', projectKey),
      cql: '',
      keywords: '',
      explanation: 'מציג סיכום פרויקט (fallback)'
    };
  }
  
  if (lowerQuery.includes('עדיפות גבוהה') || lowerQuery.includes('high priority')) {
    return {
      intent: 'HIGH_PRIORITY',
      jql: buildJQL('HIGH_PRIORITY', projectKey),
      cql: '',
      keywords: '',
      explanation: 'מציג נושאים בעדיפות גבוהה (fallback)'
    };
  }
  
  return null;
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get available Ollama models
 */
export async function getAvailableModels() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Failed to get models:', error);
    return [];
  }
}