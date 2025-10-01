/**
 * Hebrew Content Examples for Atlassian MCP Hackathon
 * This file contains Hebrew test data, queries, and UI content
 */

// Hebrew Natural Language Queries for Web UI Testing
export const HEBREW_QUERIES = {
  // Basic Queries
  basicQueries: [
    "הצג לי את כל הבאגים",
    "תן לי סיכום של הפרויקט",
    "מצא נושאים על מסד נתונים",
    "מה הסטטוס של הספרינט הנוכחי?",
    "הראה לי את כל המשימות הפתוחות",
    "חפש באגים עם עדיפות גבוהה",
    "מי עובד על מה עכשיו?",
    "מה המשימות שלי להיום?",
    "הצג את כל הסיפורים בספרינט",
    "מה חסום כרגע?"
  ],

  // Advanced Queries
  advancedQueries: [
    "צור דוח ספרינט לשבועיים האחרונים",
    "תן לי סיכום של כל הבאגים שנסגרו החודש",
    "מה ההתקדמות באפיק 'פורטל לקוחות'?",
    "כמה באגים קריטיים יש לנו?",
    "הראה לי את כל המשימות שלא הוקצו",
    "מי צריך הכי הרבה עזרה עכשיו?",
    "מה המשימות שפג תוקפן?",
    "צור רשימת משימות לבדיקה",
    "הצג את כל השינויים מהשבוע האחרון",
    "מה הדברים הדחופים לגרסה הבאה?"
  ],

  // Report Generation Queries
  reportQueries: [
    "צור דוח מנהלים על מצב הפרויקט",
    "הכן סיכום ספרינט עם גרפים",
    "צור מסמך של הערות גרסה",
    "הכן דוח באגים למנהל המוצר",
    "צור סיכום ביצועי צוות",
    "הכן דוח עומסים לשבוע הבא",
    "צור רשימת משימות לבדיקת איכות",
    "הכן דוח התקדמות חודשי"
  ]
};

// Hebrew Jira Issues Content
export const HEBREW_JIRA_CONTENT = {
  epics: [
    {
      summary: "שדרוג תשתית ענן - רבעון 4 2025",
      description: `כאפיק אסטרטגי, אנחנו צריכים לשדרג את כל התשתית שלנו לענן.
      
      מטרות:
      - מעבר ל-AWS/Azure
      - שיפור ביצועים ב-50%
      - הורדת עלויות ב-30%
      - יתירות מלאה`,
      stories: [
        "הגדרת VPC ורשתות בענן",
        "מעבר שרתי יישומים ל-EC2",
        "הגדרת RDS למסדי נתונים",
        "יישום Load Balancers",
        "הגדרת מערכת גיבויים אוטומטית"
      ]
    },
    {
      summary: "פיתוח אפליקציה מובילת - iOS ו-Android",
      description: `פיתוח אפליקציה חדשה למכשירים ניידים עם תמיכה מלאה בעברית וערבית.
      
      דרישות:
      - React Native
      - תמיכה ב-RTL
      - התחברות עם OAuth
      - מצב אופליין
      - התראות Push`,
      stories: [
        "הגדרת פרויקט React Native",
        "מימוש מסכי התחברות",
        "פיתוח דשבורד ראשי",
        "מימוש התראות",
        "בדיקות משתמשים"
      ]
    },
    {
      summary: "מערכת ניהול לקוחות CRM חדשה",
      description: "פיתוח מערכת CRM מתקדמת עם יכולות AI לחיזוי התנהגות לקוחות",
      stories: [
        "מודול ניהול אנשי קשר",
        "מעקב אחר פעילות לקוחות",
        "דוחות וניתוחים",
        "אינטגרציה עם מערכות חיצוניות",
        "מודל AI לחיזוי"
      ]
    }
  ],

  bugs: [
    {
      summary: "כפתור 'שלח' לא עובד בטופס הרשמה בעברית",
      description: `כאשר הממשק בעברית, הכפתור 'שלח' בטופס ההרשמה לא מגיב ללחיצה.
      
      סביבה: Chrome 119, Windows 11
      גרסה: 2.1.0
      
      השפעה: משתמשים חדשים לא יכולים להירשם כשהממשק בעברית`,
      priority: "Highest",
      stepsToReproduce: `1. החלף שפת ממשק לעברית
2. נווט לדף הרשמה
3. מלא את כל השדות
4. לחץ על כפתור 'שלח'
5. הכפתור לא מגיב`
    },
    {
      summary: "טקסט עברי מוצג הפוך בדוחות PDF",
      description: `כשמייצאים דוח עם טקסט עברי ל-PDF, הטקסט מופיע מימין לשמאל במקום משמאל לימין.
      
      בעיה ב-PDF generation library שלא תומכת ב-RTL.`,
      priority: "High",
      stepsToReproduce: `1. צור דוח עם טקסט עברי
2. לחץ על 'ייצוא ל-PDF'
3. פתח את קובץ ה-PDF
4. הטקסט העברי מופיע הפוך`
    },
    {
      summary: "שגיאת תרגום - 'Cancel' מתורגם ל'סרטן' במקום 'ביטול'",
      description: "תרגום אוטומטי שגוי גורם למילה Cancel להתרגם לסרטן במקום ביטול",
      priority: "Medium",
      stepsToReproduce: `1. החלף שפה לעברית
2. פתח כל דיאלוג
3. כפתור Cancel מוצג כ'סרטן'`
    },
    {
      summary: "תאריכים בעברית לא מוצגים נכון",
      description: "תאריכים בפורמט עברי (כ\"ה בתשרי תשפ\"ו) לא מוצגים כראוי",
      priority: "Low"
    },
    {
      summary: "חיפוש בעברית לא מוצא תוצאות עם ניקוד",
      description: "כשמחפשים מילה עם ניקוד, החיפוש לא מוצא תוצאות למרות שהן קיימות",
      priority: "Medium"
    },
    {
      summary: "כפתורי RTL/LTR לא מחליפים כיוון טקסט",
      description: "הכפתורים לשינוי כיוון טקסט בעורך לא פועלים",
      priority: "Medium"
    }
  ],

  tasks: [
    {
      summary: "תרגום כל הודעות השגיאה לעברית",
      description: "תרגום מלא של כל הודעות השגיאה במערכת לעברית תקנית"
    },
    {
      summary: "בדיקת נגישות לקוראי מסך בעברית",
      description: "וידוא שכל הרכיבים נגישים לקוראי מסך בעברית כולל NVDA ו-JAWS"
    },
    {
      summary: "הכנת מדריך משתמש בעברית",
      description: "כתיבת מדריך משתמש מלא בעברית כולל צילומי מסך"
    },
    {
      summary: "לוקליזציה של ממשק הניהול",
      description: "התאמת כל ממשק הניהול לעברית כולל תפריטים וכפתורים"
    },
    {
      summary: "יצירת מילון מונחים טכניים עברי-אנגלי",
      description: "מילון מונחים לכל המונחים הטכניים במערכת"
    },
    {
      summary: "בדיקות ביצועים עם תוכן בעברית",
      description: "בדיקת ביצועים כשהמערכת מלאה בתוכן בעברית"
    },
    {
      summary: "התאמת חיפוש לעברית עם וללא ניקוד",
      description: "שיפור אלגוריתם החיפוש לתמיכה בעברית עם וללא ניקוד"
    }
  ]
};

// Hebrew Confluence Pages Content
export const HEBREW_CONFLUENCE_CONTENT = {
  pages: [
    {
      title: "מדריך למשתמש חדש - ברוכים הבאים",
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

### קיצורי מקלדת
- \`Ctrl + /\` - חיפוש מהיר
- \`Alt + N\` - יצירת משימה חדשה
- \`Alt + P\` - מעבר לפרויקטים
- \`Esc\` - סגירת חלונות

## שלב 3: יצירת משימה ראשונה

\`\`\`
1. לחצו על "משימה חדשה"
2. בחרו סוג משימה (באג/סיפור/משימה)
3. מלאו כותרת ותיאור
4. הגדירו עדיפות
5. הקצו למשתמש
6. לחצו "צור"
\`\`\`

## תמיכה

אם נתקלתם בבעיה:
- בדקו את [מרכז העזרה]
- פנו לתמיכה: support@example.com
- Slack: #help-hebrew

## טיפים למשתמשים חדשים

💡 **טיפ 1**: השתמשו בחיפוש החכם - פשוט הקלידו מה שאתם מחפשים בעברית

💡 **טיפ 2**: הגדירו מועדפים לגישה מהירה לפרויקטים חשובים

💡 **טיפ 3**: השתמשו בתבניות לחסוך זמן ביצירת משימות

💡 **טיפ 4**: הפעילו התראות כדי לא לפספס עדכונים חשובים

## קישורים שימושיים
- [מדריך וידאו בעברית](https://youtube.com/...)
- [שאלות נפוצות](FAQ)
- [מילון מונחים](Glossary)

---
*מסמך זה עודכן לאחרונה: אוקטובר 2025*`
    },
    {
      title: "נוהל פיתוח ובדיקות",
      content: `# נוהל פיתוח ובדיקות

## מטרת הנוהל
להגדיר תהליך אחיד לפיתוח ובדיקות תוכנה בארגון.

## תהליך הפיתוח

### 1. תכנון
- קבלת דרישות ממנהל המוצר
- הערכת זמנים
- חלוקה למשימות
- הגדרת Definition of Done

### 2. פיתוח
\`\`\`javascript
// כל קוד חייב לעבור את הבדיקות הבאות:
- קוד נקי וקריא
- תיעוד מלא
- בדיקות יחידה (>80% כיסוי)
- Code Review על ידי 2 מפתחים
\`\`\`

### 3. בדיקות

#### בדיקות יחידה (Unit Tests)
- כיסוי מינימלי: 80%
- להשתמש ב-Jest/Mocha
- לרוץ ב-CI

#### בדיקות אינטגרציה
- בדיקת כל ה-APIs
- בדיקת זרימות מלאות
- בדיקת קצוות

#### בדיקות משתמש (UAT)
- בדיקה על ידי נציג הלקוח
- תיעוד כל הבאגים
- אישור לפני Production

### 4. פריסה

#### סביבות
1. **Development** - פיתוח מקומי
2. **Staging** - בדיקות אינטגרציה
3. **UAT** - בדיקות לקוח
4. **Production** - ייצור

#### תהליך פריסה
\`\`\`bash
# 1. יצירת tag
git tag -a v2.1.0 -m "Release version 2.1.0"

# 2. פריסה ל-staging
./deploy.sh staging

# 3. בדיקות עשן
npm run smoke-tests

# 4. פריסה לייצור
./deploy.sh production
\`\`\`

## ניהול באגים

### סיווג באגים
- **קריטי** - המערכת לא עובדת
- **גבוה** - פונקציונליות עיקרית לא עובדת
- **בינוני** - פונקציונליות משנית
- **נמוך** - שיפורים קוסמטיים

### זמני תיקון (SLA)
- קריטי: 4 שעות
- גבוה: 24 שעות
- בינוני: 72 שעות
- נמוך: Sprint הבא

## כלים

### פיתוח
- IDE: VS Code / WebStorm
- Git: GitLab / GitHub
- Docker: לסביבות מקומיות

### בדיקות
- Jest - בדיקות יחידה
- Cypress - בדיקות E2E
- Postman - בדיקות API
- BrowserStack - בדיקות דפדפנים

### ניטור
- Sentry - ניטור שגיאות
- New Relic - ביצועים
- ELK Stack - לוגים

## אנשי קשר
- מנהל פיתוח: david@example.com
- מנהל QA: sarah@example.com
- DevOps: devops@example.com

---
*נוהל זה מחייב את כל צוותי הפיתוח*`
    },
    {
      title: "מילון מונחים טכניים עברית-אנגלית",
      content: `# מילון מונחים טכניים עברית-אנגלית

## תכנות כללי

| עברית | English | הסבר |
|--------|---------|------|
| משתנה | Variable | מקום באחסון להחזקת ערך |
| פונקציה | Function | בלוק קוד הניתן לשימוש חוזר |
| מחלקה | Class | תבנית ליצירת אובייקטים |
| ממשק | Interface | חוזה המגדיר מתודות |
| מערך | Array | אוסף של פריטים |
| לולאה | Loop | חזרה על בלוק קוד |
| תנאי | Condition | ביטוי בוליאני |
| מצביע | Pointer | הפניה לכתובת בזיכרון |
| ירושה | Inheritance | העברת תכונות ממחלקת אב |
| עריכת קוד | Refactoring | שיפור קוד קיים |

## בסיסי נתונים

| עברית | English | הסבר |
|--------|---------|------|
| מסד נתונים | Database | מאגר מידע מאורגן |
| טבלה | Table | מבנה נתונים דו-ממדי |
| שדה | Field/Column | עמודה בטבלה |
| רשומה | Record/Row | שורה בטבלה |
| מפתח ראשי | Primary Key | מזהה ייחודי |
| מפתח זר | Foreign Key | קישור לטבלה אחרת |
| שאילתה | Query | בקשת מידע ממסד הנתונים |
| אינדקס | Index | מבנה לחיפוש מהיר |
| גיבוי | Backup | עותק של הנתונים |
| שחזור | Restore | החזרת נתונים מגיבוי |

## רשתות ואבטחה

| עברית | English | הסבר |
|--------|---------|------|
| כתובת רשת | IP Address | מזהה ייחודי ברשת |
| נתב | Router | מכשיר לניתוב תעבורה |
| חומת אש | Firewall | הגנה על הרשת |
| הצפנה | Encryption | קידוד מידע |
| פענוח | Decryption | פתיחת מידע מוצפן |
| אימות | Authentication | זיהוי משתמש |
| הרשאות | Authorization | קביעת גישה |
| פרוטוקול | Protocol | כללי תקשורת |
| יציאה | Port | נקודת חיבור לוגית |
| תעבורה | Traffic | זרימת נתונים |

## DevOps

| עברית | English | הסבר |
|--------|---------|------|
| פריסה | Deployment | העלאת קוד לשרת |
| אינטגרציה רציפה | CI (Continuous Integration) | מיזוג קוד אוטומטי |
| משלוח רציף | CD (Continuous Delivery) | פריסה אוטומטית |
| מיכל | Container | סביבה מבודדת לאפליקציה |
| תזמור | Orchestration | ניהול מיכלים |
| ניטור | Monitoring | מעקב אחר המערכת |
| לוג | Log | רישום אירועים |
| גרסה | Version | מצב קוד בנקודת זמן |
| ענף | Branch | גרסת פיתוח נפרדת |
| מיזוג | Merge | איחוד ענפים |

## ממשק משתמש

| עברית | English | הסבר |
|--------|---------|------|
| לחצן | Button | אלמנט לפעולה |
| טופס | Form | אוסף שדות קלט |
| תיבת טקסט | Text Box | שדה להקלדת טקסט |
| תפריט נפתח | Dropdown | רשימת אפשרויות |
| תיבת סימון | Checkbox | בחירה מרובה |
| כפתור רדיו | Radio Button | בחירה יחידה |
| סרגל גלילה | Scrollbar | ניווט בתוכן |
| חלון קופץ | Popup/Modal | חלון נוסף |
| סרגל התקדמות | Progress Bar | הצגת התקדמות |
| הודעת מערכת | Toast/Notification | הודעה זמנית |

## מתודולוגיות

| עברית | English | הסבר |
|--------|---------|------|
| זריז | Agile | מתודולוגיה גמישה |
| ספרינט | Sprint | מחזור פיתוח קצר |
| סקרם | Scrum | מסגרת עבודה אג'ילית |
| לוח קנבן | Kanban Board | כלי לניהול משימות |
| עומס צבר | Backlog | רשימת משימות עתידיות |
| סיפור משתמש | User Story | תיאור דרישה |
| נקודות סיפור | Story Points | הערכת מורכבות |
| פגישת עמידה | Stand-up | סנכרון יומי |
| רטרוספקטיבה | Retrospective | סיכום ספרינט |
| בעל מוצר | Product Owner | מגדיר דרישות |

---
*מילון זה מתעדכן באופן שוטף*`
    },
    {
      title: "תבנית דוח מצב פרויקט - חודשי",
      content: `# דוח מצב פרויקט - אוקטובר 2025

## סיכום מנהלים

### מצב כללי: 🟢 ירוק
הפרויקט מתקדם לפי התוכנית עם סטייה קלה בלוחות הזמנים.

## התקדמות

### הושלם החודש
✅ מעבר למסד נתונים PostgreSQL  
✅ הטמעת OAuth 2.0  
✅ שדרוג ממשק המשתמש  
✅ תיקון 23 באגים קריטיים  

### בעבודה
🔄 פיתוח אפליקציה מובילת (70% הושלם)  
🔄 מערכת התראות בזמן אמת (40% הושלם)  
🔄 אינטגרציה עם מערכות חיצוניות (25% הושלם)  

### מתוכנן לחודש הבא
📋 השלמת אפליקציה  
📋 בדיקות ביצועים מקיפות  
📋 פריסה לסביבת UAT  

## מדדי ביצוע (KPIs)

| מדד | יעד | בפועל | סטטוס |
|-----|-----|--------|-------|
| Story Points | 120 | 115 | 🟡 |
| כיסוי בדיקות | 80% | 82% | 🟢 |
| באגים פתוחים | <50 | 47 | 🟢 |
| זמן תגובה ממוצע | <200ms | 185ms | 🟢 |
| זמינות המערכת | 99.9% | 99.95% | 🟢 |

## סיכונים ובעיות

### סיכונים פעילים
⚠️ **עיכוב באספקת שרתים** - השפעה: בינונית  
   פעולה: הזמנת שרתים חלופיים מ-AWS  

⚠️ **מחסור במפתחי React Native** - השפעה: גבוהה  
   פעולה: גיוס freelancers לתקופה קצרה  

### בעיות שנפתרו
✅ בעיית ביצועים במסד הנתונים - נפתרה ע"י אופטימיזציה  
✅ תאימות לדפדפנים ישנים - נוספה תמיכה ל-IE11  

## תקציב

- תקציב כולל: ₪2,500,000
- נוצל עד כה: ₪1,850,000 (74%)
- צפי עד סוף הפרויקט: ₪2,450,000 (98%)

## צוות

### נוכחות
- מפתחים: 8/8
- QA: 3/3
- DevOps: 2/2
- UI/UX: 2/2

### ביצועים יוצאי דופן
🌟 דוד כהן - השלים מיגרציה ללא downtime  
🌟 שרה לוי - זיהתה וטיפלה ב-15 באגים קריטיים  

## המלצות

1. להוסיף מפתח React Native נוסף
2. להתחיל בדיקות עומסים מוקדם יותר
3. לתכנן הדרכות למשתמשים
4. להכין תוכנית rollback מפורטת

## נקודות לדיון בישיבה הבאה

- אישור תקציב נוסף להדרכות
- החלטה על תאריך Go-Live
- אסטרטגיית תמיכה לאחר העלייה לאוויר

---
*הוכן על ידי: יוסי ישראלי, מנהל הפרויקט*  
*תאריך: 31/10/2025*`
    }
  ]
};

// Hebrew UI Content for Web Interface
export const HEBREW_UI_CONTENT = {
  // Suggestion chips for the web UI
  suggestionChips: [
    "הצג לי את כל הבאגים",
    "תן לי סיכום פרויקט",
    "מה עובדים עליו עכשיו?",
    "באגים בעדיפות גבוהה",
    "משימות שלא הוקצו",
    "צור דוח ספרינט",
    "הראה דפי Confluence",
    "מה חסום כרגע?"
  ],

  // UI Labels and Messages
  labels: {
    title: "עוזר Jira & Confluence חכם",
    subtitle: "שאלו אותי כל דבר על הפרויקטים שלכם",
    inputPlaceholder: "הקלידו שאלה בעברית או באנגלית...",
    sendButton: "שלח",
    clearButton: "נקה",
    loadingMessage: "מחפש תשובה...",
    errorMessage: "אופס! משהו השתבש. נסו שוב.",
    noResultsMessage: "לא נמצאו תוצאות. נסו ניסוח אחר.",
    welcomeMessage: "שלום! אני כאן לעזור לכם עם Jira ו-Confluence. תשאלו אותי כל דבר!",
    resultsTitle: "הנה מה שמצאתי:",
    suggestionsTitle: "נסו גם:",
    statisticsTitle: "סטטיסטיקה",
    recentActivityTitle: "פעילות אחרונה"
  },

  // Error messages in Hebrew
  errorMessages: {
    connectionError: "בעיית חיבור לשרת. בדקו את החיבור לאינטרנט.",
    authError: "בעיית הרשאה. אנא התחברו מחדש.",
    timeoutError: "הבקשה לקחה יותר מדי זמן. נסו שוב.",
    invalidQuery: "השאלה לא ברורה. נסו לנסח אחרת.",
    serverError: "שגיאת שרת. הצוות הטכני עובד על תיקון.",
    noPermission: "אין לכם הרשאה לצפות במידע זה."
  },

  // Success messages
  successMessages: {
    issueCreated: "המשימה נוצרה בהצלחה!",
    issueUpdated: "המשימה עודכנה בהצלחה!",
    reportGenerated: "הדוח נוצר בהצלחה!",
    pageSaved: "הדף נשמר ב-Confluence!",
    searchComplete: "החיפוש הושלם!",
    dataExported: "הנתונים יוצאו בהצלחה!"
  },

  // Tooltips
  tooltips: {
    highPriority: "עדיפות גבוהה - טפלו מיד",
    blocked: "חסום - דורש התערבות",
    overdue: "באיחור - חרג מהתאריך יעד",
    assigned: "מוקצה ל",
    unassigned: "לא מוקצה",
    inProgress: "בעבודה",
    done: "הושלם",
    new: "חדש"
  }
};

// Test functions for Hebrew support
export const HEBREW_TESTS = {
  // Test RTL rendering
  testRTL: function(text) {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  },

  // Test mixed Hebrew-English
  testMixedContent: function(text) {
    const hasHebrew = /[\u0590-\u05FF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    return hasHebrew && hasEnglish;
  },

  // Format date in Hebrew
  formatHebrewDate: function(date) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      calendar: 'hebrew'
    };
    return new Date(date).toLocaleDateString('he-IL', options);
  },

  // Test queries to validate
  testQueries: [
    {
      hebrew: "הצג לי את כל הבאגים",
      expected: "type = Bug",
      description: "Should translate to JQL for bugs"
    },
    {
      hebrew: "משימות בעדיפות גבוהה",
      expected: "priority in (High, Highest)",
      description: "Should find high priority tasks"
    },
    {
      hebrew: "מה נסגר השבוע?",
      expected: "resolved >= -7d",
      description: "Should find recently closed issues"
    },
    {
      hebrew: "משימות של דוד",
      expected: "assignee = david",
      description: "Should find David's tasks"
    },
    {
      hebrew: "אפיקים פתוחים",
      expected: "type = Epic AND status != Done",
      description: "Should find open epics"
    }
  ]
};

// Export function to integrate Hebrew content into the system
export function integrateHebrewContent(client) {
  console.log('🇮🇱 Integrating Hebrew content support...\n');
  
  // Add Hebrew query patterns to the NLU system
  const hebrewPatterns = {
    'הצג|הראה|תן|מצא': 'SHOW',
    'באגים|תקלות|בעיות': 'BUGS',
    'משימות|סיפורים|מטלות': 'TASKS',
    'עדיפות גבוהה|דחוף|קריטי': 'HIGH_PRIORITY',
    'פתוח|פתוחים|פעיל': 'OPEN',
    'סגור|סגורים|הושלם': 'CLOSED',
    'היום|עכשיו|כרגע': 'TODAY',
    'השבוע|השבוע הזה': 'THIS_WEEK',
    'החודש|החודש הזה': 'THIS_MONTH',
    'דוח|סיכום|ניתוח': 'REPORT'
  };

  // Add RTL support to UI
  const addRTLSupport = () => {
    const style = document.createElement('style');
    style.textContent = `
      .rtl {
        direction: rtl;
        text-align: right;
      }
      .mixed-content {
        unicode-bidi: plaintext;
      }
      .hebrew-font {
        font-family: 'Segoe UI', 'Arial Hebrew', Arial, sans-serif;
      }
    `;
    document.head.appendChild(style);
  };

  return {
    patterns: hebrewPatterns,
    uiContent: HEBREW_UI_CONTENT,
    jiraContent: HEBREW_JIRA_CONTENT,
    confluenceContent: HEBREW_CONFLUENCE_CONTENT,
    queries: HEBREW_QUERIES,
    tests: HEBREW_TESTS,
    addRTLSupport
  };
}

// CLI tool to test Hebrew support
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🇮🇱 Hebrew Content Examples Loaded Successfully!\n');
  console.log('Available exports:');
  console.log('  - HEBREW_QUERIES: Natural language queries in Hebrew');
  console.log('  - HEBREW_JIRA_CONTENT: Jira issues in Hebrew');
  console.log('  - HEBREW_CONFLUENCE_CONTENT: Confluence pages in Hebrew');
  console.log('  - HEBREW_UI_CONTENT: UI labels and messages');
  console.log('  - HEBREW_TESTS: Testing utilities');
  console.log('  - integrateHebrewContent(): Function to integrate Hebrew support\n');
  console.log('Usage: import { HEBREW_QUERIES } from "./hebrew-content-examples.js"');
}`