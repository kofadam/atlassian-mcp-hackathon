/**
 * Simple Confluence Test - Create minimal pages to verify API works
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

const SPACE_KEY = 'KMD';

async function createSimplePages() {
  console.log('Creating simple test pages...\n');

  // Test 1: Very simple page
  try {
    const page1 = await client.createConfluencePage(
      SPACE_KEY,
      'Test Page 1 - Simple',
      '<p>This is a simple test page.</p>'
    );
    console.log('✅ Created: Test Page 1');
  } catch (error) {
    console.error('❌ Failed Test Page 1:', error.message);
  }

  // Test 2: Page with heading
  try {
    const page2 = await client.createConfluencePage(
      SPACE_KEY,
      'Test Page 2 - With Heading',
      '<h1>Test Heading</h1><p>Some content here.</p>'
    );
    console.log('✅ Created: Test Page 2');
  } catch (error) {
    console.error('❌ Failed Test Page 2:', error.message);
  }

  // Test 3: Page with list
  try {
    const page3 = await client.createConfluencePage(
      SPACE_KEY,
      'Test Page 3 - With List',
      '<h1>Test List</h1><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
    );
    console.log('✅ Created: Test Page 3');
  } catch (error) {
    console.error('❌ Failed Test Page 3:', error.message);
  }

  // Test 4: Page with table
  try {
    const page4 = await client.createConfluencePage(
      SPACE_KEY,
      'Test Page 4 - With Table',
      '<h1>Test Table</h1><table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Data 1</td><td>Data 2</td></tr></table>'
    );
    console.log('✅ Created: Test Page 4');
  } catch (error) {
    console.error('❌ Failed Test Page 4:', error.message);
  }

  console.log('\nTest complete!');
}

createSimplePages();
