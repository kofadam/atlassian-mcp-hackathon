/**
 * Atlassian REST API Client
 *
 * Direct REST API implementation for air-gapped/on-prem environments.
 * Works with both Atlassian Cloud and on-premise Jira/Confluence.
 */

import https from 'https';
import http from 'http';

class AtlassianRestClient {
  constructor(config) {
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.domain = config.domain; // e.g., "your-domain.atlassian.net"
    this.jiraBaseUrl = config.jiraBaseUrl || `https://${this.domain}`;
    this.confluenceBaseUrl = config.confluenceBaseUrl || `https://${this.domain}/wiki`;

    // Basic auth header
    this.authHeader = 'Basic ' + Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
  }

  /**
   * Generic HTTP request handler
   */
  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Authorization': this.authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      console.log(`REST API Request: ${options.method || 'GET'} ${url}`);

      const req = protocol.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              console.error(`REST API Error (${res.statusCode}):`, data);
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.errorMessages || parsed.message || parsed.errorMessage || JSON.stringify(parsed)}`));
            }
          } catch (e) {
            console.error(`Failed to parse response (${res.statusCode}):`, data);
            reject(new Error(`HTTP ${res.statusCode}: ${data || e.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * Search Jira issues using JQL
   */
  async searchJiraIssues(jql, options = {}) {
    const maxResults = options.maxResults || 50;
    const fields = options.fields || ['summary', 'status', 'issuetype', 'priority', 'assignee', 'created', 'updated', 'labels'];

    const params = new URLSearchParams({
      jql: jql,
      maxResults: maxResults,
      fields: fields.join(',')
    });

    const url = `${this.jiraBaseUrl}/rest/api/2/search?${params}`;
    return this.request(url);
  }

  /**
   * Get Jira issue by key
   */
  async getJiraIssue(issueKey) {
    const url = `${this.jiraBaseUrl}/rest/api/2/issue/${issueKey}`;
    return this.request(url);
  }

  /**
   * Create Jira issue
   */
  async createJiraIssue(projectKey, issueData) {
    const url = `${this.jiraBaseUrl}/rest/api/2/issue`;

    const body = {
      fields: {
        project: { key: projectKey },
        summary: issueData.summary,
        description: issueData.description || '',
        issuetype: { name: issueData.issueType || 'Task' },
        labels: issueData.labels || [],
        priority: issueData.priority ? { name: issueData.priority } : undefined
      }
    };

    return this.request(url, {
      method: 'POST',
      body: body
    });
  }

  /**
   * Search Confluence pages using CQL
   */
  async searchConfluencePages(cql, options = {}) {
    const limit = options.limit || 25;
    const params = new URLSearchParams({
      cql: cql,
      limit: limit
    });

    const url = `${this.confluenceBaseUrl}/rest/api/search?${params}`;
    return this.request(url);
  }

  /**
   * Get Confluence page content by ID
   */
  async getConfluencePage(pageId, expand = 'body.storage,version') {
    const params = new URLSearchParams({ expand });
    const url = `${this.confluenceBaseUrl}/rest/api/content/${pageId}?${params}`;
    return this.request(url);
  }

  /**
   * Get Confluence page by title
   */
  async getConfluencePageByTitle(title, spaceKey = null) {
    let cql = `title ~ "${title}"`;
    if (spaceKey) {
      cql += ` AND space = "${spaceKey}"`;
    }

    const searchResults = await this.searchConfluencePages(cql, { limit: 1 });

    if (searchResults.results && searchResults.results.length > 0) {
      const pageId = searchResults.results[0].content.id;
      return this.getConfluencePage(pageId);
    }

    return null;
  }

  /**
   * Create Confluence page
   */
  async createConfluencePage(spaceKey, title, content, parentId = null) {
    const url = `${this.confluenceBaseUrl}/rest/api/content`;

    const body = {
      type: 'page',
      title: title,
      space: { key: spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    };

    if (parentId) {
      body.ancestors = [{ id: parentId }];
    }

    return this.request(url, {
      method: 'POST',
      body: body
    });
  }

  /**
   * Get all Jira projects
   */
  async getProjects() {
    const url = `${this.jiraBaseUrl}/rest/api/2/project`;
    return this.request(url);
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      const url = `${this.jiraBaseUrl}/rest/api/2/myself`;
      const user = await this.request(url);
      return {
        success: true,
        user: user.displayName,
        email: user.emailAddress
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AtlassianRestClient;
