/**
 * Create Mock Confluence Documents for PIs and Epics
 *
 * Creates realistic Confluence pages that correspond to Jira PIs:
 * - PI Planning documents for each PI
 * - Epic specifications for major features
 * - Architecture decision records
 * - Sprint retrospectives
 *
 * These documents contain full content text that can be searched via REST API
 */

import AtlassianRestClient from '../src/atlassian-rest-client.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new AtlassianRestClient({
  email: process.env.ATLASSIAN_EMAIL,
  apiToken: process.env.ATLASSIAN_API_TOKEN,
  domain: process.env.ATLASSIAN_DOMAIN,
  confluenceBaseUrl: process.env.CONFLUENCE_BASE_URL || 'http://confluence.homelab.local:8090'
});

const SPACE_KEY = 'KMD'; // Must match Jira project key

// PI Planning Documents
const PI_PLANNING_DOCS = [
  {
    piLabel: 'PI-24.4',
    title: 'PI 24.4 Planning - Foundation &amp; Process Improvement',
    content: `
<h1>Program Increment 24.4 Planning</h1>
<p><strong>Duration</strong> October 1, 2024 - December 31, 2024</p>
<p><strong>Theme</strong> Foundation &amp; Process Improvement</p>
<p><strong>Status</strong> DONE Completed</p>

<h2>Executive Summary</h2>
<p>PI 24.4 focused on establishing foundational development processes and basic automation capabilities. This increment laid the groundwork for future cloud migration and advanced automation initiatives.</p>

<h2>PI Objectives</h2>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Objective 1: Standardize Development Processes</strong> (Business Value: 8/10)</p>
    <ul>
      <li>Code Review Workflow Implementation</li>
      <li>Documentation Standards &amp; Templates</li>
    </ul>
    <p><strong>Objective 2: Implement Basic Automation</strong> (Business Value: 7/10)</p>
    <ul>
      <li>Automated Testing Framework</li>
      <li>Build Automation Pipeline</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Key Features Delivered</h2>
<table>
  <tr>
    <th>Feature</th>
    <th>Story Points</th>
    <th>Status</th>
  </tr>
  <tr>
    <td>Code Review Workflow Implementation</td>
    <td>8</td>
    <td>DONE Done</td>
  </tr>
  <tr>
    <td>Documentation Standards &amp; Templates</td>
    <td>5</td>
    <td>DONE Done</td>
  </tr>
  <tr>
    <td>Automated Testing Framework</td>
    <td>13</td>
    <td>DONE Done</td>
  </tr>
  <tr>
    <td>Build Automation Pipeline</td>
    <td>8</td>
    <td>DONE Done</td>
  </tr>
</table>

<h2>Outcomes &amp; Metrics</h2>
<ul>
  <li>Code review adoption: 100% of pull requests</li>
  <li>Test coverage increased from 45% to 78%</li>
  <li>Build time reduced by 35%</li>
  <li>Documentation completeness: 90%</li>
</ul>

<h2>Risks &amp; Issues</h2>
<p>No major risks identified. Minor delays in documentation template adoption were mitigated through training sessions.</p>

<h2>Retrospective Highlights</h2>
<p><strong>What Went Well</strong></p>
<ul>
  <li>Strong team collaboration during process standardization</li>
  <li>Quick adoption of automated testing framework</li>
  <li>Clear documentation standards improved onboarding</li>
</ul>

<p><strong>Areas for Improvement</strong></p>
<ul>
  <li>Need more cross-team communication during planning</li>
  <li>Build pipeline configuration was more complex than expected</li>
</ul>
`
  },
  {
    piLabel: 'PI-25.1',
    title: 'PI 25.1 Planning - Cloud Migration &amp; Infrastructure',
    content: `
<h1>Program Increment 25.1 Planning</h1>
<p><strong>Duration</strong> January 1, 2025 - March 31, 2025</p>
<p><strong>Theme</strong> Cloud Migration &amp; Infrastructure</p>
<p><strong>Status</strong> DONE Completed</p>

<h2>Executive Summary</h2>
<p>PI 25.1 represented a major architectural shift, migrating our core services from on-premises infrastructure to AWS. This increment established the foundation for scalability, reliability, and modern DevOps practices.</p>

<h2>PI Objectives</h2>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Objective 1: Migrate Core Services to AWS</strong> (Business Value: 10/10)</p>
    <ul>
      <li>EC2 Infrastructure Setup - 13 points</li>
      <li>RDS Database Migration - 21 points</li>
      <li>S3 Storage Integration - 8 points</li>
      <li>CloudFront CDN Configuration - 8 points</li>
    </ul>
    <p><strong>Objective 2: Implement CI/CD Pipeline</strong> (Business Value: 9/10)</p>
    <ul>
      <li>GitHub Actions Workflow - 13 points</li>
      <li>Automated Deployment Pipeline - 13 points</li>
    </ul>
    <p><strong>Objective 3: Database Modernization</strong> (Business Value: 8/10)</p>
    <ul>
      <li>Schema Optimization - 13 points</li>
      <li>Query Performance Tuning - 8 points</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Architecture Decision Records</h2>
<p><strong>ADR-001: AWS as Cloud Provider</strong></p>
<p>Selected AWS over Azure and GCP due to mature service ecosystem, strong PostgreSQL support via RDS, and existing team expertise.</p>

<p><strong>ADR-002: GitHub Actions for CI/CD</strong></p>
<p>Chose GitHub Actions over Jenkins for tighter integration with our version control system and simpler configuration management.</p>

<h2>Migration Strategy</h2>
<ol>
  <li><strong>Phase 1</strong> Infrastructure provisioning and networking setup</li>
  <li><strong>Phase 2</strong> Database migration with minimal downtime</li>
  <li><strong>Phase 3</strong> Application deployment and load testing</li>
  <li><strong>Phase 4</strong> DNS cutover and monitoring</li>
</ol>

<h2>Technical Achievements</h2>
<ul>
  <li>Zero-downtime database migration using RDS read replicas</li>
  <li>99.99% uptime during transition period</li>
  <li>40% reduction in infrastructure costs</li>
  <li>Deployment time reduced from 2 hours to 15 minutes</li>
  <li>Database query performance improved by 60%</li>
</ul>

<h2>Risks (ROAM)</h2>
<table>
  <tr>
    <th>Risk</th>
    <th>Status</th>
    <th>Mitigation</th>
  </tr>
  <tr>
    <td>Data migration consistency issues</td>
    <td>RESOLVED</td>
    <td>Comprehensive validation scripts and rollback procedures</td>
  </tr>
  <tr>
    <td>Network latency impact on user experience</td>
    <td>MITIGATED</td>
    <td>CloudFront CDN deployment across multiple regions</td>
  </tr>
  <tr>
    <td>Team AWS expertise gaps</td>
    <td>OWNED</td>
    <td>Dedicated training program and AWS certification path</td>
  </tr>
</table>

<h2>Lessons Learned</h2>
<p><strong>What Went Well</strong></p>
<ul>
  <li>Thorough planning and dry-run migrations prevented issues</li>
  <li>Cross-functional team collaboration was excellent</li>
  <li>Automated deployment pipeline exceeded expectations</li>
</ul>

<p><strong>Areas for Improvement</strong></p>
<ul>
  <li>Initial cost estimates were too optimistic</li>
  <li>Monitoring setup should have been prioritized earlier</li>
  <li>Need better load testing tools for pre-production validation</li>
</ul>
`
  },
  {
    piLabel: 'PI-25.2',
    title: 'PI 25.2 Planning - AI &amp; Analytics Platform',
    content: `
<h1>Program Increment 25.2 Planning</h1>
<p><strong>Duration</strong> April 1, 2025 - June 30, 2025</p>
<p><strong>Theme</strong> AI &amp; Analytics Platform</p>
<p><strong>Status</strong> DONE Completed</p>

<h2>Executive Summary</h2>
<p>PI 25.2 introduced machine learning and advanced analytics capabilities to our platform. The Natural Language Interface feature became a game-changer for user experience, allowing non-technical users to query data using plain English.</p>

<h2>PI Objectives</h2>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Objective 1: Build ML-Powered Analytics Dashboard</strong> (Business Value: 10/10)</p>
    <ul>
      <li>Machine Learning Model Development - 21 points</li>
      <li>Interactive Dashboard UI - 13 points</li>
      <li>Real-time Data Pipeline - 13 points</li>
    </ul>
    <p><strong>Objective 2: Implement Predictive Analytics</strong> (Business Value: 9/10)</p>
    <ul>
      <li>Forecasting Algorithm - 21 points</li>
      <li>Predictive Dashboard Integration - 13 points</li>
    </ul>
    <p><strong>Objective 3: Natural Language Interface</strong> (Business Value: 8/10)</p>
    <ul>
      <li>NLP Engine Development - 21 points</li>
      <li>Query Interface UI - 8 points</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Innovation Highlights</h2>

<h3>Natural Language Query Engine</h3>
<p>The NLP engine allows users to ask questions like:</p>
<ul>
  <li>"Show me all high-priority bugs from last week"</li>
  <li>"What are the PI 25.2 objectives?"</li>
  <li>"Generate a sprint report for Sprint 25.2.3"</li>
</ul>
<p>This eliminated the need for users to learn JQL (Jira Query Language) or complex query syntax.</p>

<h3>Predictive Analytics Capabilities</h3>
<ul>
  <li>Sprint velocity forecasting with 85% accuracy</li>
  <li>Defect prediction based on code complexity metrics</li>
  <li>Resource utilization optimization recommendations</li>
</ul>

<h2>Technical Architecture</h2>
<p><strong>ML Stack</strong></p>
<ul>
  <li>Python with scikit-learn and TensorFlow for model development</li>
  <li>AWS SageMaker for model training and hosting</li>
  <li>Redis for real-time prediction caching</li>
</ul>

<p><strong>NLP Pipeline</strong></p>
<ul>
  <li>Pattern matching with regex for intent detection</li>
  <li>Entity extraction for query parameters</li>
  <li>JQL generation from natural language input</li>
  <li>Support for both English and Hebrew queries</li>
</ul>

<h2>Performance Metrics</h2>
<table>
  <tr>
    <th>Metric</th>
    <th>Target</th>
    <th>Achieved</th>
  </tr>
  <tr>
    <td>NLP Query Accuracy</td>
    <td>90%</td>
    <td>94%</td>
  </tr>
  <tr>
    <td>Dashboard Load Time</td>
    <td>&amp;lt; 2s</td>
    <td>1.2s</td>
  </tr>
  <tr>
    <td>Prediction Latency</td>
    <td>&amp;lt; 500ms</td>
    <td>320ms</td>
  </tr>
  <tr>
    <td>User Adoption Rate</td>
    <td>60%</td>
    <td>78%</td>
  </tr>
</table>

<h2>User Feedback</h2>
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#deebff</ac:parameter>
  <ac:rich-text-body>
    <p><em>"The natural language interface is a game-changer. I can finally get the data I need without bothering the engineering team!"</em></p>
    <p>- Product Manager, Customer Success Team</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Risks &amp; Mitigation</h2>
<ul>
  <li><strong>Data Privacy</strong> Implemented strict data access controls and audit logging</li>
  <li><strong>Model Accuracy</strong> Continuous monitoring and retraining pipeline established</li>
  <li><strong>Scalability</strong> Load testing validated system can handle 10x current usage</li>
</ul>
`
  },
  {
    piLabel: 'PI-25.3',
    title: 'PI 25.3 Planning - Customer Experience &amp; Mobile',
    content: `
<h1>Program Increment 25.3 Planning</h1>
<p><strong>Duration</strong> July 1, 2025 - September 30, 2025</p>
<p><strong>Theme</strong> Customer Experience &amp; Mobile</p>
<p><strong>Status</strong> DONE Completed</p>

<h2>Executive Summary</h2>
<p>PI 25.3 transformed our customer-facing capabilities with the launch of a self-service portal and native mobile applications. These enhancements significantly reduced support ticket volume and improved customer satisfaction scores.</p>

<h2>PI Objectives</h2>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Objective 1: Launch Customer Self-Service Portal</strong> (Business Value: 10/10)</p>
    <ul>
      <li>User Authentication System - 13 points</li>
      <li>Ticket Management Module - 13 points</li>
      <li>Knowledge Base Search - 8 points</li>
      <li>Live Chat Integration - 8 points</li>
    </ul>
    <p><strong>Objective 2: Mobile App Development</strong> (Business Value: 9/10)</p>
    <ul>
      <li>iOS App Development - 21 points</li>
      <li>Android App Development - 21 points</li>
      <li>Offline Sync Capability - 13 points</li>
    </ul>
    <p><strong>Objective 3: Real-time Notifications System</strong> (Business Value: 7/10)</p>
    <ul>
      <li>Push Notification Service - 13 points</li>
      <li>Email/SMS Integration - 5 points</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Self-Service Portal Features</h2>
<ul>
  <li><strong>Account Management</strong> Profile updates, password reset, billing information</li>
  <li><strong>Ticket Management</strong> Create, track, and respond to support tickets</li>
  <li><strong>Knowledge Base</strong> Searchable documentation with AI-powered recommendations</li>
  <li><strong>Live Chat</strong> Real-time support with intelligent routing</li>
  <li><strong>Analytics</strong> Usage statistics and service health dashboard</li>
</ul>

<h2>Mobile App Capabilities</h2>
<h3>iOS &amp; Android Apps</h3>
<ul>
  <li>Full feature parity with web portal</li>
  <li>Biometric authentication (Face ID, Touch ID, fingerprint)</li>
  <li>Offline mode with local data caching</li>
  <li>Push notifications for important updates</li>
  <li>Dark mode support</li>
</ul>

<h3>Offline Sync Architecture</h3>
<p>Implemented conflict-free replicated data type (CRDT) for seamless offline/online transitions:</p>
<ul>
  <li>Queue local changes when offline</li>
  <li>Automatic sync when connection restored</li>
  <li>Conflict resolution with last-write-wins strategy</li>
  <li>Background sync every 5 minutes when online</li>
</ul>

<h2>Impact Metrics</h2>
<table>
  <tr>
    <th>Metric</th>
    <th>Before</th>
    <th>After</th>
    <th>Change</th>
  </tr>
  <tr>
    <td>Support Ticket Volume</td>
    <td>1,200/month</td>
    <td>650/month</td>
    <td>-46%</td>
  </tr>
  <tr>
    <td>Average Resolution Time</td>
    <td>48 hours</td>
    <td>18 hours</td>
    <td>-62%</td>
  </tr>
  <tr>
    <td>Customer Satisfaction (CSAT)</td>
    <td>3.2/5</td>
    <td>4.6/5</td>
    <td>+44%</td>
  </tr>
  <tr>
    <td>Mobile App Downloads</td>
    <td>N/A</td>
    <td>12,000</td>
    <td>NEW</td>
  </tr>
  <tr>
    <td>Mobile App Rating</td>
    <td>N/A</td>
    <td>4.8/5</td>
    <td>NEW</td>
  </tr>
</table>

<h2>Customer Testimonials</h2>
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#e3fcef</ac:parameter>
  <ac:rich-text-body>
    <p><em>"Finally! I can manage my account from my phone. The offline mode is a lifesaver during my commute."</em></p>
    <p>- Enterprise Customer</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Technical Challenges &amp; Solutions</h2>
<p><strong>Challenge</strong> iOS and Android feature parity</p>
<p><strong>Solution</strong> Used React Native for shared codebase while maintaining native performance</p>

<p><strong>Challenge</strong> Real-time sync across devices</p>
<p><strong>Solution</strong> Implemented WebSocket-based sync with fallback to polling</p>

<p><strong>Challenge</strong> Offline data consistency</p>
<p><strong>Solution</strong> CRDT-based conflict resolution with user notification for manual review</p>
`
  },
  {
    piLabel: 'PI-25.4',
    title: 'PI 25.4 Planning - Security, Compliance &amp; Scale',
    content: `
<h1>Program Increment 25.4 Planning</h1>
<p><strong>Duration</strong> October 1, 2025 - December 31, 2025</p>
<p><strong>Theme</strong> Security, Compliance &amp; Scale</p>
<p><strong>Status</strong> IN PROGRESS In Progress (Day 4 of Sprint 25.4.2)</p>

<h2>Executive Summary</h2>
<p>PI 25.4 focuses on enterprise-grade security, regulatory compliance, and infrastructure scaling to support 10x growth. We are currently in Sprint 25.4.2, with SOC2 audit preparation well underway.</p>

<h2>PI Objectives</h2>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Objective 1: Achieve SOC2 Compliance</strong> (Business Value: 10/10)</p>
    <ul>
      <li>Security Audit &amp; Gap Analysis - 13 points</li>
      <li>Access Control &amp; RBAC Implementation - 13 points</li>
      <li>Audit Logging &amp; Monitoring - 8 points</li>
    </ul>
    <p><strong>Objective 2: Implement Zero-Trust Security</strong> (Business Value: 9/10)</p>
    <ul>
      <li>Network Segmentation - 13 points</li>
      <li>Identity &amp; Access Management (IAM) - 13 points</li>
      <li>Encryption at Rest &amp; in Transit - 8 points</li>
    </ul>
    <p><strong>Objective 3: Scale for 10x Growth</strong> (Business Value: 10/10)</p>
    <ul>
      <li>Auto-scaling Infrastructure - 13 points</li>
      <li>Database Sharding Strategy - 21 points</li>
      <li>CDN &amp; Caching Optimization - 8 points</li>
    </ul>
    <p><strong>Objective 4: Performance Optimization</strong> (Business Value: 8/10)</p>
    <ul>
      <li>Frontend Performance Tuning - 8 points</li>
      <li>API Response Time Optimization - 13 points</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Current Progress (as of October 4, 2025)</h2>

<h3>Sprint 25.4.1 (Completed)</h3>
<ul>
  <li>DONE Security gap analysis completed</li>
  <li>DONE SOC2 documentation framework established</li>
  <li>DONE Network segmentation design approved</li>
  <li>DONE Auto-scaling infrastructure deployed to staging</li>
</ul>

<h3>Sprint 25.4.2 (In Progress - Day 4)</h3>
<ul>
  <li>IN PROGRESS RBAC implementation - 60% complete</li>
  <li>IN PROGRESS Audit logging system - integration phase</li>
  <li>IN PROGRESS IAM policies definition - in review</li>
  <li>PLANNED Database sharding PoC - scheduled for next week</li>
</ul>

<h2>SOC2 Compliance Roadmap</h2>
<table>
  <tr>
    <th>Control Area</th>
    <th>Status</th>
    <th>Target Date</th>
  </tr>
  <tr>
    <td>Access Controls</td>
    <td>IN PROGRESS In Progress</td>
    <td>Nov 15, 2025</td>
  </tr>
  <tr>
    <td>Encryption</td>
    <td>PLANNED Planned</td>
    <td>Nov 30, 2025</td>
  </tr>
  <tr>
    <td>Audit Logging</td>
    <td>IN PROGRESS In Progress</td>
    <td>Nov 20, 2025</td>
  </tr>
  <tr>
    <td>Incident Response</td>
    <td>PLANNED Planned</td>
    <td>Dec 5, 2025</td>
  </tr>
  <tr>
    <td>External Audit</td>
    <td>PLANNED Scheduled</td>
    <td>Dec 15-20, 2025</td>
  </tr>
</table>

<h2>Zero-Trust Architecture</h2>
<p>Implementing comprehensive zero-trust security model:</p>
<ul>
  <li><strong>Network Segmentation</strong> Microsegmentation with AWS Security Groups</li>
  <li><strong>Identity Verification</strong> Multi-factor authentication for all users</li>
  <li><strong>Least Privilege Access</strong> Fine-grained RBAC policies</li>
  <li><strong>Continuous Monitoring</strong> Real-time threat detection and response</li>
  <li><strong>Encryption</strong> TLS 1.3 for transit, AES-256 for data at rest</li>
</ul>

<h2>Scalability Strategy</h2>

<h3>Database Sharding Plan</h3>
<p>Horizontal partitioning strategy to support 10x user growth:</p>
<ul>
  <li>Shard by customer ID for data isolation</li>
  <li>Cross-shard query optimization using materialized views</li>
  <li>Automated shard rebalancing based on load</li>
</ul>

<h3>Infrastructure Auto-scaling</h3>
<ul>
  <li>CPU-based scaling for application servers</li>
  <li>Queue depth-based scaling for background workers</li>
  <li>Scheduled scaling for predictable peak loads</li>
  <li>Target: Support 100,000 concurrent users</li>
</ul>

<h2>Current Risks (ROAM)</h2>
<table>
  <tr>
    <th>Risk</th>
    <th>Status</th>
    <th>Mitigation Plan</th>
  </tr>
  <tr>
    <td>SOC2 audit delays could push certification to Q1 2026</td>
    <td>OWNED</td>
    <td>Weekly checkpoint meetings with auditor, buffer time in schedule</td>
  </tr>
  <tr>
    <td>Database sharding complexity higher than estimated</td>
    <td>MITIGATED</td>
    <td>Hired database specialist consultant, extended timeline by 2 weeks</td>
  </tr>
  <tr>
    <td>Zero-trust implementation may impact user experience</td>
    <td>ACCEPTED</td>
    <td>Comprehensive user training and gradual rollout plan</td>
  </tr>
</table>

<h2>Key Performance Indicators</h2>
<table>
  <tr>
    <th>KPI</th>
    <th>Current</th>
    <th>Target (End of PI)</th>
  </tr>
  <tr>
    <td>Security Incidents</td>
    <td>2/month</td>
    <td>0/month</td>
  </tr>
  <tr>
    <td>Max Concurrent Users</td>
    <td>10,000</td>
    <td>100,000</td>
  </tr>
  <tr>
    <td>P99 API Latency</td>
    <td>850ms</td>
    <td>&amp;lt;500ms</td>
  </tr>
  <tr>
    <td>SOC2 Compliance</td>
    <td>65%</td>
    <td>100%</td>
  </tr>
</table>

<h2>Upcoming Milestones</h2>
<ul>
  <li><strong>Oct 15</strong> RBAC implementation complete</li>
  <li><strong>Oct 28</strong> Sprint 25.4.2 demo - audit logging system</li>
  <li><strong>Nov 11</strong> Zero-trust network segmentation complete</li>
  <li><strong>Nov 25</strong> Database sharding PoC validation</li>
  <li><strong>Dec 10</strong> Performance optimization complete</li>
  <li><strong>Dec 20</strong> SOC2 external audit</li>
</ul>
`
  },
  {
    piLabel: 'PI-26.1',
    title: 'PI 26.1 Planning - Innovation &amp; Market Expansion',
    content: `
<h1>Program Increment 26.1 Planning</h1>
<p><strong>Duration</strong> January 1, 2026 - March 31, 2026</p>
<p><strong>Theme</strong> Innovation &amp; Market Expansion</p>
<p><strong>Status</strong> PLANNED Planned</p>

<h2>Executive Summary</h2>
<p>PI 26.1 will focus on launching new product lines and expanding into EMEA markets. This strategic initiative aims to double our revenue and establish presence in three new geographic regions.</p>

<h2>PI Objectives</h2>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Objective 1: Launch New Product Line</strong> (Business Value: 10/10)</p>
    <ul>
      <li>Product Discovery &amp; Market Research - 8 points</li>
      <li>MVP Development - 21 points</li>
      <li>Beta Testing Program - 13 points</li>
      <li>Go-to-Market Strategy - 5 points</li>
    </ul>
    <p><strong>Objective 2: Expand to EMEA Markets</strong> (Business Value: 9/10)</p>
    <ul>
      <li>Multi-region Infrastructure - 13 points</li>
      <li>Localization &amp; i18n - 13 points</li>
      <li>GDPR Compliance - 13 points</li>
    </ul>
    <p><strong>Objective 3: Partner Integration Platform</strong> (Business Value: 8/10)</p>
    <ul>
      <li>API Gateway &amp; Developer Portal - 13 points</li>
      <li>Partner Onboarding Workflow - 8 points</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Strategic Goals</h2>
<ul>
  <li>Launch new SaaS product in Q1 2026</li>
  <li>Acquire 50 enterprise customers in EMEA</li>
  <li>Establish partnerships with 10 technology vendors</li>
  <li>Achieve $5M ARR from new product line by Q2 2026</li>
</ul>

<h2>Market Research Insights</h2>
<p>Preliminary analysis indicates strong demand for enterprise workflow automation in the following sectors:</p>
<ul>
  <li>Financial Services (40% growth YoY)</li>
  <li>Healthcare (35% growth YoY)</li>
  <li>Manufacturing (28% growth YoY)</li>
</ul>

<h2>EMEA Expansion Strategy</h2>
<h3>Phase 1: UK &amp; Ireland</h3>
<ul>
  <li>Data center: AWS eu-west-2 (London)</li>
  <li>Local sales team (5 reps)</li>
  <li>Target: 20 enterprise customers</li>
</ul>

<h3>Phase 2: Germany &amp; France</h3>
<ul>
  <li>Data center: AWS eu-central-1 (Frankfurt)</li>
  <li>Localization: German and French UI</li>
  <li>Target: 20 enterprise customers</li>
</ul>

<h3>Phase 3: Nordic Countries</h3>
<ul>
  <li>Data center: AWS eu-north-1 (Stockholm)</li>
  <li>Partnership with local system integrators</li>
  <li>Target: 10 enterprise customers</li>
</ul>

<h2>Partner Ecosystem</h2>
<p>Building a robust partner integration platform to enable third-party developers and service providers:</p>
<ul>
  <li>RESTful API with OpenAPI 3.0 specification</li>
  <li>OAuth 2.0 authentication</li>
  <li>Comprehensive developer documentation</li>
  <li>Sandbox environment for testing</li>
  <li>Revenue sharing model: 70/30 split</li>
</ul>

<h2>Risk Assessment</h2>
<ul>
  <li><strong>Market Risk</strong> Competition from established EMEA players</li>
  <li><strong>Regulatory Risk</strong> GDPR and data residency requirements</li>
  <li><strong>Execution Risk</strong> Simultaneous product launch and market expansion</li>
  <li><strong>Resource Risk</strong> Need to hire 20+ employees across EMEA</li>
</ul>

<h2>Dependencies</h2>
<ul>
  <li>SOC2 certification must be complete (PI 25.4)</li>
  <li>Scalability improvements must be validated (PI 25.4)</li>
  <li>Legal review of GDPR compliance requirements</li>
  <li>Executive approval for budget allocation ($2M)</li>
</ul>
`
  },
  {
    piLabel: 'PI-26.2',
    title: 'PI 26.2 Planning - AI-First &amp; Automation',
    content: `
<h1>Program Increment 26.2 Planning</h1>
<p><strong>Duration</strong> April 1, 2026 - June 30, 2026</p>
<p><strong>Theme</strong> AI-First &amp; Automation</p>
<p><strong>Status</strong> PLANNED Planned</p>

<h2>Executive Summary</h2>
<p>PI 26.2 will leverage advanced AI and automation to transform customer support, internal operations, and resource management. This increment represents our vision for an AI-first organization.</p>

<h2>PI Objectives</h2>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Objective 1: AI-Powered Customer Support</strong> (Business Value: 10/10)</p>
    <ul>
      <li>Conversational AI Chatbot - 21 points</li>
      <li>Sentiment Analysis Engine - 13 points</li>
      <li>Automated Ticket Routing - 8 points</li>
    </ul>
    <p><strong>Objective 2: Full Process Automation</strong> (Business Value: 9/10)</p>
    <ul>
      <li>Workflow Automation Engine - 21 points</li>
      <li>RPA Integration - 13 points</li>
      <li>Decision Automation Framework - 13 points</li>
    </ul>
    <p><strong>Objective 3: Intelligent Resource Optimization</strong> (Business Value: 8/10)</p>
    <ul>
      <li>AI-based Capacity Planning - 13 points</li>
      <li>Cost Optimization Recommendations - 8 points</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>AI-Powered Customer Support Vision</h2>
<h3>Conversational AI Capabilities</h3>
<ul>
  <li>Natural language understanding in 12 languages</li>
  <li>Context-aware responses using conversation history</li>
  <li>Seamless handoff to human agents when needed</li>
  <li>Personalized recommendations based on user behavior</li>
  <li>Target: 80% automation rate for Tier 1 support</li>
</ul>

<h3>Sentiment Analysis</h3>
<ul>
  <li>Real-time emotion detection in customer interactions</li>
  <li>Automatic escalation for negative sentiment</li>
  <li>Trend analysis for product improvement insights</li>
  <li>Integration with customer success workflows</li>
</ul>

<h2>Process Automation Strategy</h2>
<h3>Target Processes for Automation</h3>
<table>
  <tr>
    <th>Process</th>
    <th>Current Manual Effort</th>
    <th>Expected Automation</th>
    <th>Time Savings</th>
  </tr>
  <tr>
    <td>Invoice Processing</td>
    <td>20 hrs/week</td>
    <td>95%</td>
    <td>19 hrs/week</td>
  </tr>
  <tr>
    <td>Employee Onboarding</td>
    <td>8 hrs/employee</td>
    <td>70%</td>
    <td>5.6 hrs/employee</td>
  </tr>
  <tr>
    <td>Security Incident Response</td>
    <td>Variable</td>
    <td>60%</td>
    <td>~15 hrs/week</td>
  </tr>
  <tr>
    <td>Report Generation</td>
    <td>30 hrs/week</td>
    <td>90%</td>
    <td>27 hrs/week</td>
  </tr>
</table>

<h3>RPA Integration</h3>
<p>Robotic Process Automation for repetitive tasks:</p>
<ul>
  <li>Data entry and migration</li>
  <li>Cross-system reconciliation</li>
  <li>Scheduled report generation</li>
  <li>Compliance monitoring and reporting</li>
</ul>

<h2>Intelligent Resource Optimization</h2>
<h3>AI-Based Capacity Planning</h3>
<ul>
  <li>Machine learning models for demand forecasting</li>
  <li>Automatic scaling recommendations</li>
  <li>Resource allocation optimization</li>
  <li>Anomaly detection for unusual usage patterns</li>
</ul>

<h3>Cost Optimization</h3>
<ul>
  <li>Identify underutilized cloud resources</li>
  <li>Reserved instance purchase recommendations</li>
  <li>Automatic shutdown of idle development environments</li>
  <li>Target: 30% reduction in cloud infrastructure costs</li>
</ul>

<h2>Expected Business Impact</h2>
<table>
  <tr>
    <th>Metric</th>
    <th>Current</th>
    <th>Target (End of PI)</th>
    <th>Annual Impact</th>
  </tr>
  <tr>
    <td>Support Ticket Resolution (Automated)</td>
    <td>25%</td>
    <td>80%</td>
    <td>$800K savings</td>
  </tr>
  <tr>
    <td>Process Automation Rate</td>
    <td>15%</td>
    <td>70%</td>
    <td>$1.2M savings</td>
  </tr>
  <tr>
    <td>Infrastructure Costs</td>
    <td>$400K/month</td>
    <td>$280K/month</td>
    <td>$1.44M savings</td>
  </tr>
  <tr>
    <td>Customer Satisfaction</td>
    <td>4.6/5</td>
    <td>4.8/5</td>
    <td>Higher retention</td>
  </tr>
</table>

<h2>Technology Stack</h2>
<ul>
  <li><strong>AI/ML</strong> OpenAI GPT-4, TensorFlow, PyTorch</li>
  <li><strong>NLP</strong> spaCy, Hugging Face Transformers</li>
  <li><strong>RPA</strong> UiPath, Automation Anywhere</li>
  <li><strong>Orchestration</strong> Apache Airflow, Temporal</li>
  <li><strong>Monitoring</strong> Prometheus, Grafana, DataDog</li>
</ul>

<h2>Ethical AI Considerations</h2>
<ul>
  <li>Bias detection and mitigation in ML models</li>
  <li>Transparent AI decision-making processes</li>
  <li>Human oversight for critical automated decisions</li>
  <li>Data privacy and GDPR compliance</li>
  <li>Regular AI ethics reviews</li>
</ul>

<h2>Success Criteria</h2>
<ul>
  <li>80% of Tier 1 support tickets resolved by AI</li>
  <li>70% automation rate for identified processes</li>
  <li>30% reduction in infrastructure costs</li>
  <li>Customer satisfaction maintained above 4.6/5</li>
  <li>Zero AI-related compliance violations</li>
</ul>
`
  }
];

// Epic Specification Documents
const EPIC_DOCS = [
  {
    title: 'Epic Specification: Natural Language Interface for Jira',
    content: `
<h1>Epic Specification: Natural Language Interface for Jira</h1>
<p><strong>Epic ID</strong> KMD-XXX</p>
<p><strong>PI</strong> 25.2</p>
<p><strong>Status</strong> DONE Done</p>

<h2>Problem Statement</h2>
<p>Users without technical expertise struggle to extract meaningful data from Jira because they don't know JQL (Jira Query Language). This creates dependencies on technical team members and slows down decision-making.</p>

<h2>Proposed Solution</h2>
<p>Build a natural language processing engine that translates plain English (and Hebrew) queries into JQL, allowing users to ask questions like:</p>
<ul>
  <li>"Show me all bugs from last week"</li>
  <li>"What are the PI 25.2 objectives?"</li>
  <li>"Generate a sprint report for the current sprint"</li>
</ul>

<h2>Technical Approach</h2>

<h3>Architecture</h3>
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">javascript</ac:parameter>
  <ac:plain-text-body><![CDATA[
// NLP Processor Flow
User Query (Natural Language)
  ↓
Pattern Matching &amp; Intent Detection
  ↓
Entity Extraction
  ↓
JQL Query Generation
  ↓
Jira REST API
  ↓
Results Display
  ]]></ac:plain-text-body>
</ac:structured-macro>

<h3>Components</h3>
<ol>
  <li><strong>Pattern Matcher</strong> Regex-based intent detection</li>
  <li><strong>Entity Extractor</strong> Identify PI labels, sprint names, issue types, priorities</li>
  <li><strong>JQL Generator</strong> Convert extracted entities into valid JQL</li>
  <li><strong>Query Executor</strong> Execute JQL via Jira REST API</li>
  <li><strong>Response Formatter</strong> Present results in user-friendly format</li>
</ol>

<h2>Supported Query Types</h2>
<table>
  <tr>
    <th>Category</th>
    <th>Example Queries</th>
  </tr>
  <tr>
    <td>Bug Queries</td>
    <td>"Show all bugs", "Find high priority bugs"</td>
  </tr>
  <tr>
    <td>PI Queries</td>
    <td>"Show PI 25.2", "PI 25.2 objectives", "PI risks"</td>
  </tr>
  <tr>
    <td>Sprint Queries</td>
    <td>"Current sprint", "Sprint 25.2.3 stories"</td>
  </tr>
  <tr>
    <td>Report Generation</td>
    <td>"Generate sprint report", "Create PI 25.2 report"</td>
  </tr>
  <tr>
    <td>Confluence Search</td>
    <td>"Search confluence for security", "Find docs about OAuth"</td>
  </tr>
</table>

<h2>Implementation Details</h2>

<h3>Pattern Examples</h3>
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">javascript</ac:parameter>
  <ac:plain-text-body><![CDATA[
// PI Pattern Matching
const piPattern = /PI[-\\s]?(\\d{2}\\.\\d)/i;
const match = query.match(piPattern);
if (match) {
  const piLabel = "PI-" + match[1];
  jql = 'labels = "' + piLabel + '"';
}

// Bug Priority Pattern
if (/high\\s*priority/i.test(query)) {
  jql = 'type = Bug AND priority in (Highest, High)';
}
  ]]></ac:plain-text-body>
</ac:structured-macro>

<h2>Multi-language Support</h2>
<p>The system supports both English and Hebrew queries:</p>
<ul>
  <li>Hebrew: "הצג באגים", "מה יש ב-PI 25.2"</li>
  <li>English: "Show bugs", "What's in PI 25.2"</li>
</ul>

<h2>Performance Requirements</h2>
<ul>
  <li>Query processing latency: &amp;lt; 200ms</li>
  <li>JQL execution timeout: 10 seconds</li>
  <li>Query accuracy target: 90%+</li>
  <li>Support for 100 concurrent users</li>
</ul>

<h2>User Stories</h2>
<table>
  <tr>
    <th>Story ID</th>
    <th>Description</th>
    <th>Points</th>
    <th>Status</th>
  </tr>
  <tr>
    <td>KMD-XXX-1</td>
    <td>As a PM, I want to query bugs using natural language</td>
    <td>8</td>
    <td>DONE Done</td>
  </tr>
  <tr>
    <td>KMD-XXX-2</td>
    <td>As a user, I want to search PI objectives without knowing labels</td>
    <td>5</td>
    <td>DONE Done</td>
  </tr>
  <tr>
    <td>KMD-XXX-3</td>
    <td>As a manager, I want to generate reports via natural language</td>
    <td>8</td>
    <td>DONE Done</td>
  </tr>
</table>

<h2>Testing Strategy</h2>
<ul>
  <li>Unit tests for pattern matching (95% coverage)</li>
  <li>Integration tests with Jira API</li>
  <li>User acceptance testing with 20+ queries</li>
  <li>Performance testing with load simulation</li>
</ul>

<h2>Success Metrics</h2>
<ul>
  <li>DONE 94% query accuracy (exceeded 90% target)</li>
  <li>DONE 78% user adoption in first month</li>
  <li>DONE Average query time: 150ms (below 200ms target)</li>
  <li>DONE Zero critical bugs in production</li>
</ul>
`
  },
  {
    title: 'Architecture Decision Record: REST API vs MCP for Atlassian Integration',
    content: `
<h1>Architecture Decision Record: REST API vs MCP</h1>
<p><strong>Date</strong> October 4, 2025</p>
<p><strong>Status</strong> DONE Accepted</p>
<p><strong>Decision Makers</strong> Engineering Team, Product Leadership</p>

<h2>Context</h2>
<p>We needed to decide between two approaches for integrating with Atlassian Jira and Confluence:</p>
<ol>
  <li><strong>MCP (Model Context Protocol)</strong> Atlassian's hosted service providing structured tool-based access</li>
  <li><strong>Direct REST API</strong> Native HTTP calls to Jira/Confluence REST APIs</li>
</ol>

<h2>Decision</h2>
<p>We chose to use <strong>Direct REST API</strong> approach with local Docker deployment of Jira and Confluence.</p>

<h2>Rationale</h2>

<h3>Critical Limitation: Confluence Content Search</h3>
<ac:structured-macro ac:name="warning">
  <ac:rich-text-body>
    <p><strong>MCP's searchConfluenceUsingCql only returns metadata</strong> (titles, IDs, links) - it CANNOT search actual document content/body.</p>
    <p>For a real enterprise AI assistant, we need to search INSIDE Confluence pages - the actual text content, not just titles.</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h3>REST API Advantages</h3>
<table>
  <tr>
    <th>Capability</th>
    <th>MCP</th>
    <th>REST API</th>
  </tr>
  <tr>
    <td>Confluence Full-Text Search</td>
    <td>FAILED No (metadata only)</td>
    <td>DONE Yes (complete content)</td>
  </tr>
  <tr>
    <td>Page Body Retrieval</td>
    <td>FAILED Limited</td>
    <td>DONE Full storage format</td>
  </tr>
  <tr>
    <td>Air-Gap Deployment</td>
    <td>FAILED No (requires cloud)</td>
    <td>DONE Yes (fully local)</td>
  </tr>
  <tr>
    <td>Trial Account Limits</td>
    <td>WARNING Yes (API restrictions)</td>
    <td>DONE No (full control)</td>
  </tr>
  <tr>
    <td>API Version Control</td>
    <td>WARNING Limited (v3 only)</td>
    <td>DONE Flexible (v2, v3)</td>
  </tr>
</table>

<h2>Implementation Details</h2>

<h3>REST API Capabilities We Use</h3>
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">bash</ac:parameter>
  <ac:plain-text-body><![CDATA[
# Full Confluence content search
GET /wiki/rest/api/content/search?cql=text~"keyword"

# Retrieve complete page body
GET /wiki/rest/api/content/{id}?expand=body.storage

# Create pages with full formatting
POST /wiki/rest/api/content
{
  "type": "page",
  "title": "PI 25.4 Report",
  "space": {"key": "KMD"},
  "body": {
    "storage": {
      "value": "<h1>Full HTML content</h1>",
      "representation": "storage"
    }
  }
}
  ]]></ac:plain-text-body>
</ac:structured-macro>

<h3>Local Docker Deployment</h3>
<p>We deploy Jira and Confluence locally using Docker Compose:</p>
<ul>
  <li>Jira: http://jira.homelab.local:8088</li>
  <li>Confluence: http://confluence.homelab.local:8090</li>
  <li>PostgreSQL: Port 5432</li>
  <li>No internet dependency</li>
  <li>Complete data control</li>
</ul>

<h2>Consequences</h2>

<h3>Positive</h3>
<ul>
  <li>DONE Full-text search in Confluence documents</li>
  <li>DONE Complete API control and flexibility</li>
  <li>DONE No cloud service dependencies</li>
  <li>DONE Enterprise-ready air-gap deployment</li>
  <li>DONE No trial account limitations</li>
  <li>DONE Supports both API v2 and v3</li>
</ul>

<h3>Negative</h3>
<ul>
  <li>WARNING More initial setup complexity (Docker, configuration)</li>
  <li>WARNING Need to manage authentication ourselves</li>
  <li>WARNING Requires local infrastructure maintenance</li>
</ul>

<h2>Alternatives Considered</h2>

<h3>Option 1: MCP with Workarounds</h3>
<p><strong>Rejected because</strong></p>
<ul>
  <li>No technical workaround for Confluence content search limitation</li>
  <li>Would require maintaining two parallel systems</li>
  <li>Still dependent on cloud services</li>
</ul>

<h3>Option 2: Hybrid Approach</h3>
<p><strong>Rejected because</strong></p>
<ul>
  <li>Added complexity without solving core issue</li>
  <li>Inconsistent user experience</li>
  <li>More failure points</li>
</ul>

<h2>Related Decisions</h2>
<ul>
  <li>ADR-003: Use REST API v2 for local Jira (v3 not fully supported)</li>
  <li>ADR-004: HTTP (not HTTPS) for local deployment</li>
  <li>ADR-005: Password authentication instead of Personal Access Tokens</li>
</ul>

<h2>Notes</h2>
<p>This architectural decision was fundamental to meeting our enterprise requirements. The ability to search full Confluence content is not a "nice-to-have" - it's essential for an AI assistant that needs to understand organizational knowledge.</p>

<p><em>Last Updated: October 4, 2025</em></p>
`
  }
];

async function createConfluenceDocuments() {
  console.log('🚀 Creating Confluence documents for PIs and Epics...\n');

  try {
    // Create PI Planning documents
    console.log('📄 Creating PI Planning documents...');
    for (const doc of PI_PLANNING_DOCS) {
      try {
        console.log(`  Creating: ${doc.title}`);

        await client.createConfluencePage(
          SPACE_KEY,
          doc.title,
          doc.content
        );

        console.log(`  DONE Created: ${doc.title}`);
      } catch (error) {
        console.error(`  FAILED Failed to create ${doc.title}:`, error.message);
      }
    }

    console.log('\n📚 Creating Epic and ADR documents...');
    for (const doc of EPIC_DOCS) {
      try {
        console.log(`  Creating: ${doc.title}`);

        await client.createConfluencePage(
          SPACE_KEY,
          doc.title,
          doc.content
        );

        console.log(`  DONE Created: ${doc.title}`);
      } catch (error) {
        console.error(`  FAILED Failed to create ${doc.title}:`, error.message);
      }
    }

    console.log('\nDONE All Confluence documents created successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - PI Planning Documents: ${PI_PLANNING_DOCS.length}`);
    console.log(`  - Epic/ADR Documents: ${EPIC_DOCS.length}`);
    console.log(`  - Total Pages: ${PI_PLANNING_DOCS.length + EPIC_DOCS.length}`);
    console.log('\n💡 You can now search these documents using natural language queries like:');
    console.log('  - "Search confluence for security"');
    console.log('  - "Find docs about PI 25.2"');
    console.log('  - "Show me architecture decisions"');
    console.log('  - "What are the lessons learned from cloud migration?"');

  } catch (error) {
    console.error('FAILED Error creating Confluence documents:', error);
    process.exit(1);
  }
}

// Run the script
createConfluenceDocuments();
