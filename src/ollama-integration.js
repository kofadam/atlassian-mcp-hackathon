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

Available intents:
- LIST_BUGS: User wants to see bugs
- LIST_TASKS: User wants to see tasks  
- LIST_STORIES: User wants to see stories
- PROJECT_SUMMARY: User wants project statistics/overview
- HIGH_PRIORITY: User wants high priority issues
- MY_ISSUES: User wants their assigned issues
- IN_PROGRESS: User wants in-progress issues
- SEARCH_ISSUES: User wants to search for specific content
- CONFLUENCE_SEARCH: User wants to search Confluence pages
- SPRINT_INFO: User wants sprint information
- NEXT_PI: User wants next Program Increment
- CURRENT_PI: User wants current PI
- PI_REPORT: User wants PI report or summary
- UNKNOWN: Cannot determine intent

Examples:
"show me bugs" -> LIST_BUGS
"הצג באגים" -> LIST_BUGS
"תן לי סיכום פרויקט" -> PROJECT_SUMMARY
"project summary" -> PROJECT_SUMMARY
"find issues about database" -> SEARCH_ISSUES
"high priority" -> HIGH_PRIORITY
"show next PI" -> NEXT_PI
"next program increment" -> NEXT_PI
"current PI" -> CURRENT_PI
"PI report" -> PI_REPORT

Respond with ONLY the intent name.`;

  try {
    const response = await callOllama(query, systemPrompt);
    const intent = response.trim().toUpperCase().replace(/[^A-Z_]/g, '');
    
    // Validate intent - ADD THE NEW INTENTS HERE
    const validIntents = [
      'LIST_BUGS', 'LIST_TASKS', 'LIST_STORIES', 'PROJECT_SUMMARY',
      'HIGH_PRIORITY', 'MY_ISSUES', 'IN_PROGRESS', 'SEARCH_ISSUES',
      'CONFLUENCE_SEARCH', 'SPRINT_INFO', 
      'NEXT_PI', 'CURRENT_PI', 'PI_REPORT',  // ← ADD THESE
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
    MY_ISSUES: `${baseProject} AND assignee = currentUser() AND status != Done ORDER BY priority DESC`,
    IN_PROGRESS: `${baseProject} AND status = "In Progress" ORDER BY updated DESC`,
    SEARCH_ISSUES: keywords 
      ? `${baseProject} AND (summary ~ "${keywords}" OR description ~ "${keywords}") ORDER BY created DESC`
      : `${baseProject} ORDER BY created DESC`,
    SPRINT_INFO: `${baseProject} AND sprint in openSprints() ORDER BY rank`,
    NEXT_PI: `${baseProject} AND labels = "PI-26.1" ORDER BY priority DESC, created DESC`,
    CURRENT_PI: `${baseProject} AND labels = "PI-25.4" ORDER BY priority DESC, created DESC`,
    PI_REPORT: `${baseProject} AND labels IN ("PI-26.1", "PI-25.4") ORDER BY labels DESC, priority DESC`,
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
    LIST_BUGS: 'Listing all open bugs',
    LIST_TASKS: 'Listing all open tasks',
    LIST_STORIES: 'Listing all open stories',
    PROJECT_SUMMARY: 'Showing project summary',
    HIGH_PRIORITY: 'Showing high priority issues',
    MY_ISSUES: 'Showing your assigned issues',
    IN_PROGRESS: 'Showing in-progress issues',
    SEARCH_ISSUES: keywords ? `Searching for: ${keywords}` : 'Showing all issues',
    CONFLUENCE_SEARCH: keywords ? `Searching Confluence for: ${keywords}` : 'Showing Confluence pages',
    SPRINT_INFO: 'Showing current sprint information',
    NEXT_PI: 'Showing next Program Increment (PI-26.1)',
    CURRENT_PI: 'Showing current Program Increment (PI-25.4)',
    PI_REPORT: 'Showing PI report across increments',
    UNKNOWN: 'Showing recent issues'
  };
  
  return explanations[intent] || explanations.UNKNOWN;
}

/**
 * Main parse function - orchestrates the two-stage process
 */
export async function parseQuery(query, projectKey = 'KMD') {
  try {
    console.log('🎯 Stage 1: Classifying intent...');
    
    // Stage 1: Classify intent using Ollama
    const intent = await classifyIntent(query);
    console.log('📋 Classified intent:', intent);
    
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
      // Unknown intent - try pattern matching fallback
      const fallback = patternMatchingFallback(query, projectKey);
      if (fallback) {
        return fallback;
      }
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
    return patternMatchingFallback(query, projectKey) || {
      intent: 'UNKNOWN',
      jql: `project = ${projectKey} ORDER BY created DESC`,
      explanation: 'Showing recent issues (fallback)'
    };
  }
}

/**
 * Pattern matching fallback for when Ollama fails
 */
function patternMatchingFallback(query, projectKey) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('באג') || lowerQuery.includes('bug')) {
    return {
      intent: 'LIST_BUGS',
      jql: buildJQL('LIST_BUGS', projectKey),
      explanation: 'Listing all open bugs (fallback)'
    };
  }
  
  if (lowerQuery.includes('סיכום') || lowerQuery.includes('summary')) {
    return {
      intent: 'PROJECT_SUMMARY',
      jql: buildJQL('PROJECT_SUMMARY', projectKey),
      explanation: 'Showing project summary (fallback)'
    };
  }
  
  if (lowerQuery.includes('עדיפות גבוהה') || lowerQuery.includes('high priority')) {
    return {
      intent: 'HIGH_PRIORITY',
      jql: buildJQL('HIGH_PRIORITY', projectKey),
      explanation: 'Showing high priority issues (fallback)'
    };
  }
  
  if (lowerQuery.includes('confluence')) {
    return {
      intent: 'CONFLUENCE_SEARCH',
      cql: buildCQL(),
      explanation: 'Searching Confluence (fallback)'
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
