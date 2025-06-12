#!/usr/bin/env node

const { NaturalLanguageParser } = require('./natural-language-parser');
const { ScenarioBuilder } = require('./scenario-builder');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Make.com Automation Toolkit - Scenario Generator\n');
console.log('Describe your automation in natural language, and I\'ll generate the JSON blueprint.\n');
console.log('Examples:');
console.log('- "When a new order comes in Shopify, add it to Google Sheets and notify Slack"');
console.log('- "Monitor Gmail for emails from clients, parse with AI, and create tasks in Trello"');
console.log('- "Every hour, fetch data from API, process with OpenAI, and update Airtable"\n');

rl.question('Describe your automation: ', (description) => {
  try {
    const parser = new NaturalLanguageParser();
    const builder = parser.parse(description);
    const scenario = builder.build();
    
    // Save to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scenario-${timestamp}.json`;
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeFileSync(filepath, JSON.stringify(scenario, null, 2));
    
    console.log('\n✅ Scenario generated successfully!');
    console.log(`📄 Saved to: ${filename}\n`);
    console.log('Preview:');
    console.log(JSON.stringify(scenario, null, 2).substring(0, 500) + '...\n');
    console.log('Next steps:');
    console.log('1. Review and update the placeholder values (IDs, API keys, etc.)');
    console.log('2. Import the JSON file into Make.com');
    console.log('3. Configure your connections and test the scenario\n');
    
  } catch (error) {
    console.error('\n❌ Error generating scenario:', error.message);
  }
  
  rl.close();
});