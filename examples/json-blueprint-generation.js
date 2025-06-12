/**
 * JSON Blueprint Generation Examples
 * Demonstrates how to use the JSON Blueprint Generator
 */

const JSONBlueprintGenerator = require('../src/utils/json-blueprint-generator');

// Initialize the generator
const generator = new JSONBlueprintGenerator();

// Example 1: CRM to Spreadsheet Sync
console.log('\n=== Example 1: CRM to Spreadsheet Sync ===\n');

const crmSyncDescription = `
  When a new Salesforce lead is created, 
  add the lead information to a Google Sheet 
  and send a Slack notification to the sales team
`;

const crmSyncBlueprint = generator.generateBlueprint(crmSyncDescription);
console.log(JSON.stringify(crmSyncBlueprint, null, 2));

// Example 2: Email Automation with AI
console.log('\n=== Example 2: Email Automation with AI ===\n');

const emailAIDescription = `
  When a new email arrives in Gmail, 
  use OpenAI to analyze the sentiment and urgency,
  if it's urgent, create a task in Asana and notify via Slack,
  otherwise just log it to a spreadsheet
`;

const emailAIBlueprint = generator.generateBlueprint(emailAIDescription);
console.log(JSON.stringify(emailAIBlueprint, null, 2));

// Example 3: E-commerce Order Processing
console.log('\n=== Example 3: E-commerce Order Processing ===\n');

const ecommerceDescription = `
  When a new Shopify order is placed,
  create an invoice in QuickBooks,
  add the customer to the email list in Mailchimp,
  and send a confirmation email with tracking info
`;

const ecommerceBlueprint = generator.generateBlueprint(ecommerceDescription);
console.log(JSON.stringify(ecommerceBlueprint, null, 2));

// Example 4: Social Media Content Pipeline
console.log('\n=== Example 4: Social Media Content Pipeline ===\n');

const socialMediaDescription = `
  Every day at 9 AM,
  fetch trending topics from Twitter,
  use OpenAI to generate relevant content ideas,
  create draft posts in Buffer,
  and send a summary report via email
`;

const socialMediaBlueprint = generator.generateBlueprint(socialMediaDescription);
console.log(JSON.stringify(socialMediaBlueprint, null, 2));

// Example 5: Customer Support Automation
console.log('\n=== Example 5: Customer Support Automation ===\n');

const supportDescription = `
  When a webhook is received from the support form,
  check if the customer exists in Salesforce,
  if yes, update their record with the issue,
  if no, create a new lead,
  then create a ticket in Zendesk and send an auto-reply email
`;

const supportBlueprint = generator.generateBlueprint(supportDescription);
console.log(JSON.stringify(supportBlueprint, null, 2));

// Example usage in code
console.log('\n=== Programmatic Usage Example ===\n');

// Function to generate and validate blueprint
function createAutomation(description) {
  try {
    const blueprint = generator.generateBlueprint(description);
    
    // Validate blueprint structure
    if (!blueprint.metadata || blueprint.metadata.version !== 2) {
      throw new Error('Invalid blueprint version');
    }
    
    if (!blueprint.modules || blueprint.modules.length === 0) {
      throw new Error('No modules generated');
    }
    
    console.log(`✅ Successfully generated blueprint: ${blueprint.name}`);
    console.log(`   Modules: ${blueprint.modules.length}`);
    console.log(`   Connections: ${blueprint.connections.length}`);
    
    return blueprint;
  } catch (error) {
    console.error(`❌ Error generating blueprint: ${error.message}`);
    return null;
  }
}

// Test the function
const testDescription = `
  When a new row is added to Google Sheets,
  send the data to a webhook URL,
  and log the response to another sheet
`;

const testBlueprint = createAutomation(testDescription);

// Export for use in other scripts
module.exports = {
  generator,
  createAutomation,
  examples: {
    crmSyncBlueprint,
    emailAIBlueprint,
    ecommerceBlueprint,
    socialMediaBlueprint,
    supportBlueprint
  }
};