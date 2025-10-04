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
      he: /(?:הצג|הראה|תן|מצא|רוצה לראות|תציג)(?: לי)?(?: את)?(?: כל)? (?:הבאגים|באגים|התקלות|בעיות|הבאגס)/
    },

    // Fixed/Completed bugs patterns
    fixedBugs: {
      en: /(?:fixed|resolved|completed|done|closed)(?: bugs?| issues?)?/i,
      he: /(?:באגים|בעיות|התקלות)(?: ש)?(?:תוקנו|נפתרו|נסגרו|הושלמו|סגור)/
    },

    // High priority patterns
    highPriority: {
      en: /(?:high|critical|urgent|important|highest)(?: priority)? (?:issues?|bugs?|items?|tasks?)/i,
      he: /(?:עדיפות גבוהה|דחוף|קריטי|חשוב|בעדיפות גבוהה|עדיפות גבוה)/
    },

    // Quarter/Quarterly patterns (רבעון)
    quarterly: {
      en: /(?:quarter|quarterly|Q[1-4]|quarter [1-4])/i,
      he: /(?:רבעון|רבעוני|ר[1-4]|רבעון [1-4]|רבע שנתי)/
    },

    // Epic patterns (expanded)
    epics: {
      en: /(?:epics?|initiatives?|features?|big items|major features)/i,
      he: /(?:אפיק|אפיקים|יוזמה|יוזמות|פיצ\'ר גדול|פיצ\'רים גדולים|תכונות מרכזיות|תכונה מרכזית)/
    },

    // Story patterns (expanded)
    stories: {
      en: /(?:show|list|get)(?: me)?(?: all)?(?: the)? stor(?:y|ies)|user stories/i,
      he: /(?:הצג|הראה|תן|מצא)(?: לי)?(?: את)?(?: כל)? (?:הסטורי|הסטוריז|סיפור|סיפורים|סיפור משתמש|סיפורי משתמש|יוזר סטורי)/
    },

    // Task patterns (expanded)
    tasks: {
      en: /(?:show|list|get)(?: me)?(?: all)?(?: the)? tasks?/i,
      he: /(?:הצג|הראה|תן|מצא)(?: לי)?(?: את)?(?: כל)? (?:המשימות|משימות|משימה|טאסק|טאסקים|המשימה)/
    },

    // Sprint patterns (expanded)
    sprint: {
      en: /(?:show|what's in|display|get)(?: me)?(?: the)? (?:current |active |next |future )?sprint/i,
      he: /(?:הצג|הראה|מה יש|תן לי|מה יש לנו)(?: את)?(?: ב)?(?:ספרינט|הספרינט|ספרינטים)(?: הנוכחי| הפעיל| הבא| הקודם| עתידי| עתידיים)?/
    },

    // Future sprints pattern
    futureSprints: {
      en: /(?:future|upcoming|next) sprints?/i,
      he: /(?:ספרינטים עתידיים|ספרינט עתידי|ספרינט הבא|ספרינטים הבאים)/
    },
    
    // Summary/Dashboard patterns
    projectSummary: {
      en: /(?:project summary|summary|dashboard|overview|status|give me a summary|project status)/i,
      he: /(?:סיכום פרויקט|סיכום|סטטוס|מצב הפרויקט|תן לי סיכום|מצב|תמונת מצב|דשבורד|לוח בקרה)/
    },

    // Confluence summarization patterns
    summarizeConfluence: {
      en: /(?:summarize|summarise|summary of|give me a summary of|sum up)(?: the)?(?: confluence)?(?: page| document| doc)?(?:\s+(?:titled|named|called))?\s+(.+)/i,
      he: /(?:סכם|תן סיכום|לסכם)(?: את)?(?: עמוד)?(?: המסמך)?(?: מ)?(?:קונפלואנס)?\s+(.+)/
    },

    // Backlog patterns
    backlog: {
      en: /(?:backlog|product backlog|show backlog)/i,
      he: /(?:בקלוג|בקלוג מוצר|תור|תור משימות|רשימת משימות|הצג בקלוג)/
    },

    // Planning/Roadmap patterns
    roadmap: {
      en: /(?:roadmap|product roadmap|planning|future plans)/i,
      he: /(?:מפת דרכים|רודמאפ|תכנון|תוכניות עתידיות|לוח זמנים|מה מתוכנן)/
    },

    // Assignee patterns
    assignee: {
      en: /(?:assigned|assignee|my issues|my tasks|who is working on)/i,
      he: /(?:משויך|המשימות שלי|הנושאים שלי|מי עובד על|משוייך אליי)/
    },

    // Status-specific patterns
    statusSpecific: {
      en: /(?:in review|in testing|ready for|waiting for)/i,
      he: /(?:בבדיקה|בריוויו|בטסטינג|מוכן ל|ממתין ל|מחכה ל)/
    },

    // Time-based patterns
    timeBased: {
      en: /(?:this week|last week|this month|today|yesterday|overdue)/i,
      he: /(?:השבוע|שבוע שעבר|החודש|חודש שעבר|היום|אתמול|באיחור|פיגור|מאוחר)/
    },

    // Labels/Tags patterns
    labels: {
      en: /(?:labeled|tagged|with label|with tag)/i,
      he: /(?:מתויג|עם תגית|תווית|לייבל|תג)/
    },

    // Component patterns
    components: {
      en: /(?:component|module|area|subsystem)/i,
      he: /(?:קומפוננטה|רכיב|מודול|תת-מערכת|אזור)/
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
    
    // Add to patterns object
    inProgress: {
      en: /(?:show|get|list)(?: me)?(?: only)?(?: the)? in[\s-]?progress (?:tasks?|issues?|items?|work)/i,
      he: /(?:הצג|הראה)(?: לי)?(?: רק)? (?:משימות|נושאים) בעבודה/
    },

    todo: {
      en: /(?:show|get|list)(?: me)?(?: only)?(?: the)? (?:to[\s-]?do|todo|pending|open) (?:tasks?|issues?|items?)/i,
      he: /(?:הצג|הראה)(?: לי)? (?:משימות|נושאים) (?:לביצוע|פתוחים)/
    },

    done: {
      en: /(?:show|get|list)(?: me)?(?: only)?(?: the)? (?:done|completed|finished|closed) (?:tasks?|issues?|items?)/i,
      he: /(?:הצג|הראה)(?: לי)? (?:משימות|נושאים) (?:שהושלמו|סגורים)/
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
    },

    // PI (Program Increment) patterns
    piObjectives: {
      en: /(?:(?:show|list|get|display|what are)(?: me)?(?: all)?(?: the)? )?PI[- ]?(\d+)\.(\d+)\s*(?:objectives?|goals?)/i,
      he: /(?:הצג|הראה|מה|תן לי)(?: את)? (?:יעדי|מטרות) PI\s*(\d+)\.(\d+)/
    },

    piRisks: {
      en: /(?:show|list|get|display|what are)(?: me)?(?: all)?(?: the)? (?:PI|program increment)[- ]?(\d+)\.(\d+)\s*(?:risks?|roam)/i,
      he: /(?:הצג|הראה|מה|תן לי)(?: את)? (?:סיכונים|ריסקים) PI\s*(\d+)\.(\d+)/
    },

    piFeatures: {
      en: /(?:show|list|get|display|what are)(?: me)?(?: all)?(?: the)? (?:PI|program increment)[- ]?(\d+)\.(\d+)\s*(?:features?|capabilities?)/i,
      he: /(?:הצג|הראה|מה|תן לי)(?: את)? (?:פיצ'רים|תכונות) PI\s*(\d+)\.(\d+)/
    },

    piGeneral: {
      en: /(?:show|display|what is|tell me about|info about)(?: me)?(?: the)? (?:PI|program increment)[- ]?(\d+)\.(\d+)/i,
      he: /(?:הצג|הראה|מה|ספר לי)(?: על)? PI\s*(\d+)\.(\d+)/
    },

    piCurrent: {
      en: /(?:current|active|latest) (?:PI|program increment)/i,
      he: /PI (?:נוכחי|פעיל|הנוכחי)/
    },

    piROAM: {
      en: /(?:roam|resolved|owned|accepted|mitigated) (?:risks?|items?)/i,
      he: /(?:סיכונים|ריסקים) (?:פתורים|בבעלות|מקובלים|ממותנים)/
    }
  };

  // Simple PI pattern fallback - matches just "PI X.Y" or "PI X.Y something"
  const simplePIMatch = lowerQuery.match(/pi[- ]?(\d+)\.(\d+)(?:\s+(.+))?/i);
  if (simplePIMatch) {
    const piVersion = `${simplePIMatch[1]}.${simplePIMatch[2]}`;
    const suffix = simplePIMatch[3] || '';
    
    let jql = `project = KMD AND labels = "PI-${piVersion}"`;
    let description = `PI ${piVersion}`;
    
    if (suffix.includes('objective')) {
      jql += ' AND labels = "PI-Objective"';
      description += ' objectives';
    } else if (suffix.includes('risk')) {
      jql += ' AND labels = "Risk"';
      description += ' risks';
    } else if (suffix.includes('feature')) {
      jql += ' AND labels = "Feature"';
      description += ' features';
    } else {
      description = `All PI ${piVersion} items`;
    }
    
    return {
      intent: 'search',
      jql: jql,
      description: description
    };
  }

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

  // *** CHECK FOR PI (Program Increment) PATTERNS ***
  // PI Objectives
  let piMatch = lowerQuery.match(patterns.piObjectives.en);
  if (piMatch) {
    const piVersion = `${piMatch[1]}.${piMatch[2]}`;
    return {
      intent: 'search',
      jql: `project = KMD AND labels = "PI-${piVersion}" AND labels = "PI-Objective"`,
      description: `PI ${piVersion} objectives`,
      piVersion: piVersion,
      piType: 'objectives'
    };
  }

  // PI Risks
  piMatch = lowerQuery.match(patterns.piRisks.en);
  if (piMatch) {
    const piVersion = `${piMatch[1]}.${piMatch[2]}`;
    return {
      intent: 'search',
      jql: `project = KMD AND labels = "PI-${piVersion}" AND labels = "Risk"`,
      description: `PI ${piVersion} risks`,
      piVersion: piVersion,
      piType: 'risks'
    };
  }

  // PI Features
  piMatch = lowerQuery.match(patterns.piFeatures.en);
  if (piMatch) {
    const piVersion = `${piMatch[1]}.${piMatch[2]}`;
    return {
      intent: 'search',
      jql: `project = KMD AND labels = "PI-${piVersion}" AND labels = "Feature"`,
      description: `PI ${piVersion} features`,
      piVersion: piVersion,
      piType: 'features'
    };
  }

  // PI General (all PI items)
  piMatch = lowerQuery.match(patterns.piGeneral.en);
  if (piMatch) {
    const piVersion = `${piMatch[1]}.${piMatch[2]}`;
    return {
      intent: 'search',
      jql: `project = KMD AND labels = "PI-${piVersion}"`,
      description: `All PI ${piVersion} items`,
      piVersion: piVersion,
      piType: 'all'
    };
  }

  // Current PI
  if (patterns.piCurrent.en.test(lowerQuery) || patterns.piCurrent.he.test(query)) {
    return {
      intent: 'search',
      jql: 'project = KMD AND labels = "PI-25.1"',
      description: 'Current PI (25.1) items',
      piVersion: '25.1',
      piType: 'all'
    };
  }

  // Generic PI query - "show PI" without specific number
  if (lowerQuery.match(/^(?:show|what['']?s|current|display)\s*(?:the\s*)?pi\s*$|^pi\s*$|^pi dashboard|^pi status/i)) {
    return {
      intent: 'pi-dashboard',
      description: 'Program Increment Dashboard'
    };
  }
  
  // ROAM Risks
  if (patterns.piROAM.en.test(lowerQuery) || patterns.piROAM.he.test(query)) {
    let roamStatus = null;
    if (lowerQuery.includes('resolved') || query.includes('פתור')) {
      roamStatus = 'ROAM-Resolved';
    } else if (lowerQuery.includes('owned') || query.includes('בבעלות')) {
      roamStatus = 'ROAM-Owned';
    } else if (lowerQuery.includes('accepted') || query.includes('מקובל')) {
      roamStatus = 'ROAM-Accepted';
    } else if (lowerQuery.includes('mitigated') || query.includes('ממותן')) {
      roamStatus = 'ROAM-Mitigated';
    }

    let jql = 'project = KMD AND labels = "Risk"';
    let description = 'All PI risks';

    if (roamStatus) {
      jql += ` AND labels = "${roamStatus}"`;
      description = `${roamStatus.replace('ROAM-', '')} risks`;
    }

    return {
      intent: 'search',
      jql: jql,
      description: description,
      piType: 'risks',
      roamStatus: roamStatus
    };
  }

  // *** CHECK FOR CONFLUENCE SUMMARIZATION FIRST ***
  const summarizeMatch = patterns.summarizeConfluence.en.test(lowerQuery) ||
                        (isHebrew && patterns.summarizeConfluence.he.test(query));

  if (summarizeMatch) {
    const match = lowerQuery.match(patterns.summarizeConfluence.en) || query.match(patterns.summarizeConfluence.he);
    if (match && match[1]) {
      const pageTitle = match[1].trim();
      return {
        intent: 'summarize-confluence',
        pageTitle: pageTitle,
        description: `Summarize Confluence page: "${pageTitle}"`
      };
    }
  }

  // *** CHECK FOR CONFLUENCE FIRST - before any Jira patterns ***
  // This ensures "initiatives from confluence" goes to Confluence, not Jira epics
  if (lowerQuery.includes('confluence') || lowerQuery.includes('קונפלואנס') ||
      (lowerQuery.includes('from confluence')) || (query.includes('מ-confluence'))) {
    // Check if there's a specific term to search for
    // Pattern 1: "search confluence for X" or "חפש ב-confluence X"
    let searchTermMatch = lowerQuery.match(/(?:show|get|find|search|חפש|הצג|מצא)(?:\s+(?:me|all|את))?\s*confluence\s+(?:for|about|regarding|ב|על|בנושא)\s+(.+)/i);
    // Pattern 2: "show X from confluence"
    if (!searchTermMatch) {
      searchTermMatch = lowerQuery.match(/(?:show|get|find|search|חפש|הצג|מצא)(?:\s+(?:me|all|את))?\s+(?:all\s+)?(.+?)\s+(?:from|in|on|ב|מ-|מתוך)\s*confluence/i);
    }

    if (searchTermMatch) {
      const searchTerm = searchTermMatch[1].trim().replace(/information|content|data|pages?/gi, '').trim();
      if (searchTerm && searchTerm.length > 2) {
        return {
          intent: 'confluence',
          cql: `type=page AND text ~ "${searchTerm}"`,
          description: `Confluence pages about "${searchTerm}"`
        };
      }
    }
    // General Confluence search
    return {
      intent: 'confluence',
      cql: 'type=page',
      description: 'Confluence documentation'
    };
  }

  // Check Hebrew patterns first if Hebrew detected
  if (isHebrew) {
    // Check for fixed/completed bugs first (more specific)
    if (patterns.fixedBugs.he.test(query)) {
      return {
        intent: 'search',
        jql: 'project = KMD AND type = Bug AND status = Done ORDER BY updated DESC',
        description: 'מציג באגים שתוקנו'
      };
    }

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

  // Check for Quarterly (רבעון)
  if (patterns.quarterly.en.test(lowerQuery) || patterns.quarterly.he.test(query)) {
    const quarterMatch = lowerQuery.match(/(?:q|quarter|רבעון|ר)\s*([1-4])/i);
    const quarter = quarterMatch ? quarterMatch[1] : '4';
    return {
      intent: 'search',
      jql: `project = KMD AND (summary ~ "Q${quarter}" OR summary ~ "רבעון ${quarter}" OR summary ~ "Quarter ${quarter}")`,
      description: `נושאים לרבעון ${quarter}`
    };
  }

  // Check for Backlog
  if (patterns.backlog.en.test(lowerQuery) || patterns.backlog.he.test(query)) {
    return {
      intent: 'search',
      jql: 'project = KMD AND status = "To Do" ORDER BY priority DESC, created DESC',
      description: 'בקלוג המוצר - משימות ממתינות'
    };
  }

  // Check for Roadmap
  if (patterns.roadmap.en.test(lowerQuery) || patterns.roadmap.he.test(query)) {
    return {
      intent: 'search',
      jql: 'project = KMD AND (type = Epic OR labels = roadmap OR summary ~ "roadmap" OR summary ~ "מפת דרכים")',
      description: 'מפת דרכים ותכנון עתידי'
    };
  }

  // Check for time-based queries
  if (patterns.timeBased.en.test(lowerQuery) || patterns.timeBased.he.test(query)) {
    if (lowerQuery.includes('week') || query.includes('שבוע')) {
      return {
        intent: 'search',
        jql: 'project = KMD AND created >= -7d ORDER BY created DESC',
        description: 'נושאים מהשבוע האחרון'
      };
    } else if (lowerQuery.includes('month') || query.includes('חודש')) {
      return {
        intent: 'search',
        jql: 'project = KMD AND created >= -30d ORDER BY created DESC',
        description: 'נושאים מהחודש האחרון'
      };
    } else if (lowerQuery.includes('overdue') || query.includes('איחור') || query.includes('מאוחר')) {
      return {
        intent: 'search',
        jql: 'project = KMD AND duedate < now() AND status != Done ORDER BY duedate ASC',
        description: 'נושאים באיחור'
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

  // Fixed/Completed bugs (check before general bugs)
  if (patterns.fixedBugs.en.test(lowerQuery)) {
    return {
      intent: 'search',
      jql: 'project = KMD AND type = Bug AND status = Done ORDER BY updated DESC',
      description: 'Fixed/completed bugs'
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

  // Check for future sprints with optional filters
  if (patterns.futureSprints.en.test(lowerQuery) || patterns.futureSprints.he.test(query)) {
    let jql = 'project = KMD AND sprint in futureSprints()';
    let description = 'משימות בספרינטים עתידיים';
    let filterByAssignee = null;

    // Check for status filter
    if (lowerQuery.includes('in progress') || query.includes('בביצוע') || query.includes('בתהליך')) {
      jql += ' AND status = "In Progress"';
      description = 'משימות בביצוע בספרינטים עתידיים';
    } else if (lowerQuery.includes('to do') || query.includes('לביצוע')) {
      jql += ' AND status = "To Do"';
      description = 'משימות לביצוע בספרינטים עתידיים';
    }

    // Check for assignee filter
    const nameMatch = query.match(/(?:to|for|של|assigned to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (nameMatch) {
      const personName = nameMatch[1];
      jql += ' AND assignee is not EMPTY';
      description += ` משויכים ל-${personName}`;
      filterByAssignee = personName;
    }

    jql += ' ORDER BY updated DESC';

    return {
      intent: 'search',
      jql: jql,
      description: description,
      filterByAssignee: filterByAssignee
    };
  }

  // Check for assignee-related queries (must come before general tasks/issues)
  if (patterns.assignee.en.test(lowerQuery) || patterns.assignee.he.test(query)) {
    // Check if query mentions a specific person's name
    const nameMatch = query.match(/(?:to|for|של)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);

    if (nameMatch) {
      const personName = nameMatch[1];

      // Check if query also mentions sprint
      const sprintMatch = query.match(/(?:sprint|ספרינט)\s+([\d.]+)/i);

      let jql = 'project = KMD AND assignee is not EMPTY';
      let description = `נושאים משויכים ל-${personName}`;

      if (sprintMatch) {
        const sprintNum = sprintMatch[1];
        jql += ` AND labels = "Sprint-${sprintNum}"`;
        description += ` בספרינט ${sprintNum}`;
      }

      jql += ' ORDER BY updated DESC';

      return {
        intent: 'search',
        jql: jql,
        description: description,
        filterByAssignee: personName // Client-side filter hint
      };
    }

    // Check if they want assigned items (not unassigned)
    if (lowerQuery.includes('assigned') || lowerQuery.includes('working on') || query.includes('משויך') || query.includes('עובד על')) {
      return {
        intent: 'search',
        jql: 'project = KMD AND assignee is not EMPTY ORDER BY updated DESC',
        description: 'נושאים משויכים'
      };
    } else if (lowerQuery.includes('my') || lowerQuery.includes('שלי')) {
      return {
        intent: 'search',
        jql: 'project = KMD AND assignee = currentUser() ORDER BY updated DESC',
        description: 'המשימות שלי'
      };
    }
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

  // Check for in-progress items
  if (patterns.inProgress.en.test(lowerQuery)) {
    return {
      intent: 'search',
      jql: 'project = KMD AND status = "In Progress"',
      description: 'In-progress tasks and issues'
    };
  }

  // Check for to-do items
  if (patterns.todo.en.test(lowerQuery)) {
    return {
      intent: 'search',
      jql: 'project = KMD AND status = "To Do"',
      description: 'To-do tasks and issues'
    };
  }

  // Check for completed items
  if (patterns.done.en.test(lowerQuery)) {
    return {
      intent: 'search',
      jql: 'project = KMD AND status = "Done"',
      description: 'Completed tasks and issues'
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

  // For specific sprint numbers (supports formats like "25", "25.4", "25.4.2")
  const sprintNumberMatch = lowerQuery.match(/sprint\s*([\d.]+)/i);
  if (sprintNumberMatch) {
    const sprintNumber = sprintNumberMatch[1];
    // Search in labels using hyphenated format (no spaces allowed in Jira labels)
    return {
      intent: 'search',
      jql: `project = KMD AND labels = "Sprint-${sprintNumber}"`,
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
 
  // Confluence check moved to top of function for priority

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