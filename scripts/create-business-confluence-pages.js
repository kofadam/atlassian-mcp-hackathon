#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const businessPages = [
  {
    title: 'Q1 2025 Business Strategy',
    content: `<h1>Q1 2025 Business Strategy</h1>
<p>Strategic initiatives for the first quarter of 2025</p>

<h2>Key Objectives</h2>
<ul>
  <li>Increase customer acquisition by 25%</li>
  <li>Launch new product features based on customer feedback</li>
  <li>Expand to 3 new markets</li>
  <li>Improve customer retention rate to 95%</li>
</ul>

<h2>Market Analysis</h2>
<p>Our target market shows strong growth potential with 40% YoY increase in demand. Key competitors are focusing on feature parity, giving us an opportunity to differentiate through user experience.</p>

<h2>Revenue Targets</h2>
<ul>
  <li>Monthly Recurring Revenue: $500K</li>
  <li>Average Deal Size: $15K</li>
  <li>Customer Lifetime Value: $75K</li>
</ul>

<h2>Success Metrics</h2>
<p>We will measure success through NPS scores, customer acquisition cost, and time-to-value metrics.</p>`
  },
  {
    title: 'Product Roadmap 2025',
    content: `<h1>Product Roadmap 2025</h1>
<p>Comprehensive product development plan for 2025</p>

<h2>Q1 Features</h2>
<ul>
  <li><strong>Advanced Analytics Dashboard</strong> - Real-time insights and reporting</li>
  <li><strong>Mobile App V2</strong> - Complete redesign with offline support</li>
  <li><strong>API Enhancements</strong> - RESTful API with webhooks</li>
</ul>

<h2>Q2 Features</h2>
<ul>
  <li><strong>AI-Powered Recommendations</strong> - Machine learning integration</li>
  <li><strong>Multi-language Support</strong> - Hebrew, English, Spanish, French</li>
  <li><strong>Enterprise SSO</strong> - SAML and OAuth integration</li>
</ul>

<h2>Q3-Q4 Features</h2>
<ul>
  <li><strong>Workflow Automation</strong> - No-code automation builder</li>
  <li><strong>Advanced Permissions</strong> - Role-based access control</li>
  <li><strong>Data Export Tools</strong> - Compliance and analytics exports</li>
</ul>

<h2>Technical Debt</h2>
<p>Allocating 20% of engineering capacity to address technical debt, focusing on database optimization and legacy code refactoring.</p>`
  },
  {
    title: 'Customer Success Playbook',
    content: `<h1>Customer Success Playbook</h1>
<p>Best practices for customer onboarding and support</p>

<h2>Onboarding Process</h2>
<ol>
  <li><strong>Welcome Email</strong> - Sent within 1 hour of signup</li>
  <li><strong>Initial Setup Call</strong> - Scheduled within 48 hours</li>
  <li><strong>Training Session</strong> - 1-hour product walkthrough</li>
  <li><strong>30-Day Check-in</strong> - Ensure successful adoption</li>
</ol>

<h2>Support Tiers</h2>
<ul>
  <li><strong>Basic</strong> - Email support, 24-hour response</li>
  <li><strong>Professional</strong> - Priority email + chat, 4-hour response</li>
  <li><strong>Enterprise</strong> - Dedicated CSM + 1-hour response</li>
</ul>

<h2>Customer Health Metrics</h2>
<p>We track engagement scores, feature adoption, and support ticket frequency to identify at-risk customers early.</p>

<h2>Expansion Opportunities</h2>
<p>Focus on customers who have reached 80% feature adoption as candidates for upsell conversations.</p>`
  },
  {
    title: 'Marketing Campaign Analysis',
    content: `<h1>Marketing Campaign Analysis - December 2024</h1>
<p>Performance review of Q4 marketing initiatives</p>

<h2>Campaign Performance</h2>
<table>
  <tr>
    <th>Campaign</th>
    <th>Budget</th>
    <th>Leads</th>
    <th>Conversions</th>
    <th>ROI</th>
  </tr>
  <tr>
    <td>LinkedIn Ads</td>
    <td>$25,000</td>
    <td>450</td>
    <td>35</td>
    <td>3.2x</td>
  </tr>
  <tr>
    <td>Content Marketing</td>
    <td>$15,000</td>
    <td>800</td>
    <td>60</td>
    <td>4.5x</td>
  </tr>
  <tr>
    <td>Email Campaigns</td>
    <td>$5,000</td>
    <td>200</td>
    <td>28</td>
    <td>5.1x</td>
  </tr>
</table>

<h2>Key Insights</h2>
<ul>
  <li>Content marketing delivers highest ROI</li>
  <li>LinkedIn quality improved with better targeting</li>
  <li>Email campaigns show strong engagement with existing leads</li>
</ul>

<h2>Q1 2025 Recommendations</h2>
<p>Double down on content marketing while optimizing LinkedIn targeting. Test new channels including podcast sponsorships and webinar series.</p>`
  },
  {
    title: 'Competitive Analysis Report',
    content: `<h1>Competitive Analysis Report</h1>
<p>Analysis of key competitors and market positioning</p>

<h2>Main Competitors</h2>
<ul>
  <li><strong>CompetitorA</strong> - Market leader, 35% market share</li>
  <li><strong>CompetitorB</strong> - Fast-growing startup, 15% market share</li>
  <li><strong>CompetitorC</strong> - Enterprise-focused, 20% market share</li>
</ul>

<h2>Our Competitive Advantages</h2>
<ul>
  <li><strong>User Experience</strong> - Rated 4.8/5 vs industry average of 3.9/5</li>
  <li><strong>Implementation Speed</strong> - 2 weeks vs industry average of 6 weeks</li>
  <li><strong>Customer Support</strong> - 95% satisfaction vs industry average of 78%</li>
  <li><strong>Pricing Flexibility</strong> - More affordable for mid-market segment</li>
</ul>

<h2>Areas for Improvement</h2>
<p>We need to match competitor features in advanced analytics and expand our integration marketplace.</p>

<h2>Market Opportunities</h2>
<p>Growing demand in healthcare and financial services sectors where competitors have limited presence.</p>`
  },
  {
    title: 'Sales Playbook - Enterprise Deals',
    content: `<h1>Sales Playbook - Enterprise Deals</h1>
<p>Guide for closing enterprise contracts</p>

<h2>Qualification Criteria (BANT)</h2>
<ul>
  <li><strong>Budget</strong> - Minimum $50K annual contract value</li>
  <li><strong>Authority</strong> - Access to VP-level decision makers</li>
  <li><strong>Need</strong> - Clear pain points our solution addresses</li>
  <li><strong>Timeline</strong> - Decision expected within 6 months</li>
</ul>

<h2>Enterprise Sales Process</h2>
<ol>
  <li><strong>Discovery Call</strong> - Understand requirements and challenges</li>
  <li><strong>Technical Demo</strong> - Customized demo showing relevant features</li>
  <li><strong>Proof of Concept</strong> - 30-day trial with success criteria</li>
  <li><strong>Proposal & Negotiation</strong> - Custom pricing and terms</li>
  <li><strong>Security Review</strong> - SOC2, GDPR compliance verification</li>
  <li><strong>Contract Signature</strong> - Legal review and execution</li>
</ol>

<h2>Common Objections & Responses</h2>
<p><strong>"Too expensive"</strong> - Show TCO analysis and ROI calculations<br/>
<strong>"Need more integrations"</strong> - Roadmap preview and custom integration options<br/>
<strong>"Security concerns"</strong> - Share compliance certifications and security whitepaper</p>

<h2>Success Stories</h2>
<p>Reference accounts available in healthcare, finance, and manufacturing sectors with 90%+ retention rates.</p>`
  },
  {
    title: 'Employee Onboarding Guide',
    content: `<h1>Employee Onboarding Guide</h1>
<p>Welcome to the team! Your first 90 days</p>

<h2>Week 1: Getting Started</h2>
<ul>
  <li>Complete HR paperwork and benefits enrollment</li>
  <li>Set up development environment and access</li>
  <li>Meet your team and key stakeholders</li>
  <li>Review company mission, values, and culture</li>
</ul>

<h2>Week 2-4: Learning & Training</h2>
<ul>
  <li>Product deep-dive training sessions</li>
  <li>Shadow team members in your department</li>
  <li>Complete security and compliance training</li>
  <li>Start working on first small project</li>
</ul>

<h2>Month 2: Contributing</h2>
<ul>
  <li>Take ownership of projects aligned with your role</li>
  <li>Participate in sprint planning and standups</li>
  <li>Begin contributing to team goals and OKRs</li>
</ul>

<h2>Month 3: Thriving</h2>
<ul>
  <li>Lead projects independently</li>
  <li>Mentor newer team members</li>
  <li>Provide feedback on processes and tools</li>
  <li>90-day performance review with manager</li>
</ul>

<h2>Resources</h2>
<p>Employee handbook, engineering docs, product specs, and team contacts are available in our knowledge base.</p>`
  },
  {
    title: 'Security & Compliance Overview',
    content: `<h1>Security & Compliance Overview</h1>
<p>Our commitment to data security and regulatory compliance</p>

<h2>Certifications & Standards</h2>
<ul>
  <li><strong>SOC 2 Type II</strong> - Annual audit completed</li>
  <li><strong>GDPR Compliant</strong> - Full EU data protection compliance</li>
  <li><strong>ISO 27001</strong> - Information security management</li>
  <li><strong>HIPAA Ready</strong> - Healthcare data handling capabilities</li>
</ul>

<h2>Data Security Measures</h2>
<ul>
  <li><strong>Encryption</strong> - AES-256 at rest, TLS 1.3 in transit</li>
  <li><strong>Access Control</strong> - Role-based access with MFA required</li>
  <li><strong>Monitoring</strong> - 24/7 security monitoring and alerts</li>
  <li><strong>Backups</strong> - Automated daily backups with 30-day retention</li>
</ul>

<h2>Incident Response</h2>
<p>We maintain a 15-minute response time for critical security incidents with a dedicated security team on-call 24/7.</p>

<h2>Employee Training</h2>
<p>All employees complete annual security awareness training and phishing simulation exercises.</p>

<h2>Vendor Management</h2>
<p>All third-party vendors undergo security assessments before integration.</p>`
  }
];

async function createBusinessPages() {
  console.log('🚀 Creating Business Confluence Pages\n');
  console.log('=' .repeat(50));

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'],
  });

  const client = new Client({
    name: 'confluence-pages-creator',
    version: '1.0.0',
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to Atlassian MCP\n');

    // Get cloud ID first
    const resourcesResult = await client.callTool({
      name: 'getAccessibleAtlassianResources',
      arguments: {}
    });
    const cloudId = JSON.parse(resourcesResult.content[0].text)[0].id;
    console.log(`📚 Using cloudId: ${cloudId}\n`);

    // Get Confluence space using search (same as web-server.js)
    const searchResult = await client.callTool({
      name: 'searchConfluenceUsingCql',
      arguments: {
        cloudId: cloudId,
        cql: 'type=page',
        limit: 1
      }
    });

    const searchData = JSON.parse(searchResult.content[0].text);

    if (!searchData.results || searchData.results.length === 0) {
      console.error('❌ No Confluence pages found. Please create at least one page in Confluence first.');
      process.exit(1);
    }

    const firstPage = searchData.results[0];

    // Extract space ID and key
    let spaceId = null;
    let spaceKey = null;

    // Try to get space ID from content
    if (firstPage.content && firstPage.content.id) {
      // Get the page details to extract space ID
      const pageResult = await client.callTool({
        name: 'getConfluencePage',
        arguments: {
          cloudId: cloudId,
          pageId: firstPage.content.id
        }
      });

      const pageData = JSON.parse(pageResult.content[0].text);
      if (pageData.spaceId) {
        spaceId = pageData.spaceId;
      }
      if (pageData._expandable && pageData._expandable.space) {
        const match = pageData._expandable.space.match(/\/space\/([A-Z0-9]+)/);
        if (match) {
          spaceKey = match[1];
        }
      }
    }

    // Fallback: extract space key from URL
    if (!spaceKey && firstPage.resultGlobalContainer && firstPage.resultGlobalContainer.displayUrl) {
      const match = firstPage.resultGlobalContainer.displayUrl.match(/\/spaces\/([A-Z0-9]+)/);
      if (match) {
        spaceKey = match[1];
      }
    }

    if (!spaceKey && firstPage._expandable && firstPage._expandable.space) {
      const match = firstPage._expandable.space.match(/\/space\/([A-Z0-9]+)/);
      if (match) {
        spaceKey = match[1];
      }
    }

    if (!spaceId || !spaceKey) {
      console.error('❌ Could not extract space ID/key from Confluence search results');
      console.log('First page:', JSON.stringify(firstPage, null, 2));
      process.exit(1);
    }

    console.log(`📚 Using space: ${spaceKey} (ID: ${spaceId})\n`);

    // Create each page
    for (let i = 0; i < businessPages.length; i++) {
      const page = businessPages[i];
      console.log(`\n📄 Creating page ${i + 1}/${businessPages.length}: ${page.title}`);

      try {
        // Wrap HTML in Confluence storage format
        const confluenceBody = `<ac:rich-text-body>${page.content}</ac:rich-text-body>`;

        const result = await client.callTool({
          name: 'createConfluencePage',
          arguments: {
            cloudId: cloudId,
            spaceId: spaceId,
            title: page.title,
            body: confluenceBody
          }
        });

        const resultText = result.content[0].text;
        const createdPage = JSON.parse(resultText);
        console.log(`   ✅ Created: ${createdPage._links?.webui || createdPage.id}`);

        // Wait a bit between pages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('   (Page already exists, skipping)');
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Successfully created ${businessPages.length} business pages!`);
    console.log('\nYou can now test Confluence search with queries like:');
    console.log('  - "חפש ב-Confluence אסטרטגיה"');
    console.log('  - "Find pages about product roadmap"');
    console.log('  - "Search Confluence for marketing"');
    console.log('  - "Show pages about security"\n');

    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createBusinessPages();
