#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const pagesTitles = [
  'Q1 2025 Business Strategy',
  'Product Roadmap 2025',
  'Customer Success Playbook',
  'Marketing Campaign Analysis',
  'Competitive Analysis Report',
  'Sales Playbook - Enterprise Deals',
  'Employee Onboarding Guide',
  'Security & Compliance Overview'
];

async function updatePages() {
  console.log('🔄 Updating Confluence Pages Format\n');
  console.log('=' .repeat(50));

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'mcp-remote', 'https://mcp.atlassian.com/v1/sse'],
  });

  const client = new Client({
    name: 'confluence-pages-updater',
    version: '1.0.0',
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to Atlassian MCP\n');

    // Get cloud ID
    const resourcesResult = await client.callTool({
      name: 'getAccessibleAtlassianResources',
      arguments: {}
    });
    const cloudId = JSON.parse(resourcesResult.content[0].text)[0].id;
    console.log(`📚 Using cloudId: ${cloudId}\n`);

    // Update each page
    for (let i = 0; i < pagesTitles.length; i++) {
      const title = pagesTitles[i];
      console.log(`\n📄 Updating page ${i + 1}/${pagesTitles.length}: ${title}`);

      try {
        // Search for the page
        const searchResult = await client.callTool({
          name: 'searchConfluenceUsingCql',
          arguments: {
            cloudId: cloudId,
            cql: `type=page AND title = "${title}"`,
            limit: 1
          }
        });

        const results = JSON.parse(searchResult.content[0].text).results;

        if (!results || results.length === 0) {
          console.log(`   ⚠️  Page not found, skipping`);
          continue;
        }

        const pageId = results[0].content.id;
        console.log(`   Found page ID: ${pageId}`);

        // Get current page to get version and current body
        const pageResult = await client.callTool({
          name: 'getConfluencePage',
          arguments: {
            cloudId: cloudId,
            pageId: pageId
          }
        });

        const page = JSON.parse(pageResult.content[0].text);
        const currentVersion = page.version.number;
        const currentBody = page.body.storage.value;

        console.log(`   Current version: ${currentVersion}`);

        // Wrap current HTML in rich text body tags if not already wrapped
        let newBody = currentBody;
        if (!currentBody.includes('<ac:rich-text-body>')) {
          newBody = `<ac:rich-text-body>${currentBody}</ac:rich-text-body>`;
          console.log(`   Wrapping content in rich-text-body tags`);
        } else {
          console.log(`   Already has rich-text-body tags, skipping`);
          continue;
        }

        // Update the page
        const updateResult = await client.callTool({
          name: 'updateConfluencePage',
          arguments: {
            cloudId: cloudId,
            pageId: pageId,
            title: title,
            body: newBody,
            version: currentVersion + 1
          }
        });

        console.log(`   ✅ Updated successfully`);

        // Wait a bit between updates
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Finished updating pages!\n`);

    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updatePages();
