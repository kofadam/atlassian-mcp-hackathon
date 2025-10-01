/**
 * Enhanced Natural Language Processor for Jira/Confluence queries
 * Drop-in replacement for the processNaturalLanguage function in web-server.js
 */

export function processNaturalLanguage(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Hebrew detection
  const isHebrew = /[\u0590-\u05FF]/.test(query);
  
  // Enhanced patterns for different intents
  const patterns = {
    // Bug-related patterns
    showBugs: {
      en: /(?:show|list|display|get|find|view|give me|what are)(?: me)?(?: all)?(?: the)? bugs?/i,
      he: /(?:הצג|הראה|תן|מצא)(?: לי)?(?: את)?(?: כל)? (?:הבאגים|באגים|התקלות|בעיות)/
    },
    
    // High priority patterns
    highPriority: {
      en: /(?:high|critical|urgent|important|highest)(?: priority)? (?:issues?|bugs?|items?|tasks?)/i,
      he: /(?:עדיפות גבוהה|דחוף|קריטי|חשוב)/
    },
    
    // Summary/Dashboard patterns
    projectSummary: {
      en: /(?:project summary|summary|dashboard|overview|status|give me a summary|project status)/i,
      he: /(?:סיכום פרויקט|סיכום|סטטוס|מצב הפרויקט|תן לי סיכום)/
    },
    
    // Q4 Roadmap patterns
    q4Roadmap: {
      en: /(?:q4|quarter 4|fourth quarter|Q4 2025)(?: roadmap| plan| features)?|roadmap.*q4/i,
      he: /(?:רבעון 4|רבעון רביעי|Q4)(?: מפת דרכים)?/
    },
    
    // Hebrew-specific patterns
    hebrewTasks: {
      he: /(?:משימות בעברית|המשימות בעברית|תן לי משימות בעברית)/
    },
    
    // Story patterns
    stories: {
      en: /(?:show|list|get)(?: me)?(?: all)?(?: the)? stor(?:y|ies)/i,
      he: /(?:הצג|הראה)(?: לי)?(?: את)? (?:הסיפורים|סיפורים)/
    },
    
    // Task patterns
    tasks: {
      en: /(?:show|list|get)(?: me)?(?: all)?(?: the)? tasks?/i,
      he: /(?:הצג|הראה)(?: לי)?(?: את)?(?: כל)? (?:המשימות|משימות)/
    },
    
    // Open issues
    openIssues: {
      en: /(?:open|active|unresolved|pending|in progress) (?:issues?|items?|tickets?)/i,
      he: /(?:פתוח|פתוחים|פעיל|פעילים|בעבודה)/
    },
    
    // Confluence patterns
    confluencePages: {
      en: /(?:confluence|documentation|docs|pages?|wiki)/i,
      he: /(?:מסמכים|תיעוד|דפים|ויקי)/
    },
    
    // Search patterns with specific terms
    searchPattern: {
      en: /(?:find|search|look for|show me)(?: issues?)?(?: about| related to| with| containing)? ([\w\s]+)/i,
      he: /(?:חפש|מצא)(?: נושאים על| בנושא)? ([\w\s]+)/
    },
    
    // Creation patterns
    createIssue: {
      en: /create (?:a |an )?(?:jira )?(bug|story|task|issue)(?: with title| called)? ["']([^"']+)["']/i,
      he: /צור (באג|סיפור|משימה) ["']([^"']+)["']/
    },
    
    // Recent/Today patterns
    recent: {
      en: /(?:recent|today|this week|latest|new) (?:issues?|bugs?|tasks?)/i,
      he: /(?:אחרון|היום|השבוע|חדש)/
    },
    
    // Blocked patterns
    blocked: {
      en: /(?:blocked|blocking|stuck|waiting|dependencies)/i,
      he: /(?:חסום|חסומים|תקוע|מחכה)/
    },
    
    // Epic patterns
    epics: {
      en: /(?:epics?|initiatives?|features?|big items)/i,
      he: /(?:אפיקים|יוזמות|פיצ׳רים)/
    },
  
    // Sprint patterns
    sprint: {
      en: /(?:show|what's in|display|get)(?: me)?(?: the)? (?:current |active )?sprint/i,
      he: /(?:הצג|הראה|מה יש)(?: ב)?ספרינט(?: הנוכחי| הפעיל)?/
    },
    // Authentication/OAuth patterns
    authentication: {
      en: /(?:auth|authentication|oauth|login|sso|security)/i,
      he: /(?:אימות|התחברות|אבטחה)/
    },
    
    // Database patterns
    database: {
      en: /(?:database|db|postgres|postgresql|mongodb|migration|data)/i,
      he: /(?:מסד נתונים|מיגרציה|נתונים)/
    },
    
    // API patterns
    api: {
      en: /(?:api|endpoint|rest|graphql|webhook)/i,
      he: /(?:ממשק|נקודת קצה)/
    },
    
    // Mobile patterns
    mobile: {
      en: /(?:mobile|app|ios|android|react native)/i,
      he: /(?:מובייל|אפליקציה|יישומון)/
    }
  };

  // Check for creation intent
  if (patterns.createIssue.en.test(lowerQuery)) {
    const match = lowerQuery.match(patterns.createIssue.en);
    const issueType = match[1];
    const title = match[2];
    return {
      intent: 'create',
      type: issueType.charAt(0).toUpperCase() + issueType.slice(1),
      title: title,
      jql: null
    };
  }

  // Check Hebrew patterns first if Hebrew detected
  if (isHebrew) {
    if (patterns.showBugs.he.test(query)) {
      return { 
        intent: 'search', 
        jql: 'project = KMD AND type = Bug ORDER BY created DESC',
        description: 'מציג את כל הבאגים'
      };
    }
    
    if (patterns.hebrewTasks.he.test(query)) {
      return { 
        intent: 'search', 
        jql: 'project = KMD AND (summary ~ "תרגום" OR summary ~ "עברית" OR summary ~ "מדריך" OR summary ~ "נגישות")',
        description: 'מציג משימות בעברית'
      };
    }
    
    if (patterns.projectSummary.he.test(query)) {
      return { 
        intent: 'summary',
        jql: 'project = KMD ORDER BY created DESC',
        description: 'סיכום הפרויקט'
      };
    }
  }

  // Check for Q4 Roadmap
  if (patterns.q4Roadmap.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND (summary ~ "Q4" OR summary ~ "2025" OR summary ~ "Roadmap" OR summary ~ "Quarter 4")',
      description: 'Q4 2025 Roadmap items'
    };
  }

  // Check for authentication/OAuth related
  if (patterns.authentication.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND (summary ~ "OAuth" OR summary ~ "Authentication" OR summary ~ "Login" OR summary ~ "SSO" OR description ~ "OAuth")',
      description: 'Authentication and security issues'
    };
  }

  // Check for database related
  if (patterns.database.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND (summary ~ "Database" OR summary ~ "PostgreSQL" OR summary ~ "MongoDB" OR summary ~ "Migration" OR description ~ "database")',
      description: 'Database related issues'
    };
  }

  // Check for API related
  if (patterns.api.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND (summary ~ "API" OR summary ~ "GraphQL" OR summary ~ "REST" OR summary ~ "endpoint" OR description ~ "API")',
      description: 'API related issues'
    };
  }

  // Check for mobile related
  if (patterns.mobile.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND (summary ~ "Mobile" OR summary ~ "App" OR summary ~ "iOS" OR summary ~ "Android" OR summary ~ "React Native")',
      description: 'Mobile app related issues'
    };
  }

  // Show bugs
  if (patterns.showBugs.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND type = Bug ORDER BY priority DESC, created DESC',
      description: 'All bugs in the project'
    };
  }

  // High priority issues
  if (patterns.highPriority.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND (priority = Highest OR priority = High) AND status != Done ORDER BY priority DESC',
      description: 'High priority issues'
    };
  }

  // Stories
  if (patterns.stories.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND type = Story ORDER BY created DESC',
      description: 'All stories in the project'
    };
  }

  // Tasks
  if (patterns.tasks.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND type = Task ORDER BY created DESC',
      description: 'All tasks in the project'
    };
  }

  // Open issues
  if (patterns.openIssues.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND status in ("To Do", "In Progress") ORDER BY priority DESC',
      description: 'Open issues'
    };
  }

  // Recent issues
  if (patterns.recent.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND created >= -7d ORDER BY created DESC',
      description: 'Issues created in the last week'
    };
  }

  // Blocked issues
  if (patterns.blocked.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND (status = Blocked OR labels = blocked)',
      description: 'Blocked issues'
    };
  }

  // Epics
  if (patterns.epics.en.test(lowerQuery)) {
    return { 
      intent: 'search', 
      jql: 'project = KMD AND (type = Epic OR (type = Story AND (summary ~ "Roadmap" OR summary ~ "Portal" OR summary ~ "Migration")))',
      description: 'Epic-level initiatives'
    };
  }
  
  // For specific sprint numbers
  const sprintNumberMatch = lowerQuery.match(/sprint\s*(\d+)/i);
  if (sprintNumberMatch) {
    const sprintNumber = sprintNumberMatch[1];
    return {
      intent: 'search', 
      jql: `project = KMD AND sprint = "Sprint ${sprintNumber}"`,
      description: `Issues in Sprint ${sprintNumber}`
    };
  }

  // Check for sprint queries
  if (patterns.sprint.en.test(lowerQuery)) {
    return {
      intent: 'search',
      jql: 'project = KMD AND sprint in openSprints()',
      description: 'Issues in the current sprint'
    };
  }
 
  // Check for Confluence with specific search terms
  if (lowerQuery.includes('documentation') || lowerQuery.includes('confluence') || lowerQuery.includes('docs') || lowerQuery.includes('pages')) {
    // Check if there's a specific term to search for
    const mentioningMatch = lowerQuery.match(/(?:mentioning|about|containing|with|regarding)\s+(.+)/i);
    if (mentioningMatch) {
      const searchTerm = mentioningMatch[1].trim();
      return {
        intent: 'confluence',
        cql: `type=page AND text ~ "${searchTerm}"`,
        description: `Confluence pages mentioning "${searchTerm}"`
      };
    }
  }
  
  // Confluence pages
  if (patterns.confluencePages.en.test(lowerQuery)) {
    return { 
      intent: 'confluence', 
      cql: 'type=page',
      description: 'Confluence documentation'
    };
  }

  // Project summary (default for general questions)
  if (patterns.projectSummary.en.test(lowerQuery)) {
    return { 
      intent: 'summary',
      jql: 'project = KMD ORDER BY created DESC',
      description: 'Project summary and statistics'
    };
  }

  // Search with specific terms
  const searchMatch = lowerQuery.match(patterns.searchPattern.en);
  if (searchMatch) {
    const searchTerm = searchMatch[1].trim();
    return { 
      intent: 'search', 
      jql: `project = KMD AND (summary ~ "${searchTerm}" OR description ~ "${searchTerm}")`,
      description: `Issues related to "${searchTerm}"`
    };
  }

  // Default - show all recent issues
  return { 
    intent: 'search', 
    jql: 'project = KMD ORDER BY created DESC',
    description: 'All recent project issues'
  };
}

// Test function to validate the processor
export function testNLPProcessor() {
  const testQueries = [
    // English queries
    "Show me all bugs",
    "What's in the Q4 roadmap?",
    "high priority issues",
    "Give me a project summary",
    "Show authentication related issues",
    "Find issues about database",
    "Show me mobile app tasks",
    "What are the open issues?",
    "Show me recent bugs",
    "List all stories",
    
    // Hebrew queries
    "הצג לי את כל הבאגים",
    "מה המשימות בעברית?",
    "תן לי סיכום פרויקט",
    
    // Specific searches
    "Find issues about OAuth",
    "Search for PostgreSQL migration",
    "Show API documentation"
  ];

  console.log('Testing Natural Language Processor:\n');
  testQueries.forEach(query => {
    const result = processNaturalLanguage(query);
    console.log(`Query: "${query}"`);
    console.log(`Result:`, result);
    console.log('---');
  });
}

// Export for use in web-server.js
export default processNaturalLanguage;