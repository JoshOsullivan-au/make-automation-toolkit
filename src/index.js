/**
 * Make.com Automation Toolkit
 * Main entry point
 */

require('dotenv').config();

const MakeClient = require('./api/make-client');
const ScenarioGenerator = require('./generators/scenario-generator');
const AIScenarioBuilder = require('./ai/scenario-builder');
const ScenarioMonitor = require('./monitoring/scenario-monitor');

// Export main classes
module.exports = {
  MakeClient,
  ScenarioGenerator,
  AIScenarioBuilder,
  ScenarioMonitor,
};

// CLI interface if run directly
if (require.main === module) {
  const program = require('./cli');
  program.parse(process.argv);
}