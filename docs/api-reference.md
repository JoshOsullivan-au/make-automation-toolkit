# API Reference

## MakeClient

The main client for interacting with Make.com API.

### Constructor

```javascript
const client = new MakeClient({
  apiKey: 'your-api-key',
  zone: 'eu2.make.com'
});
```

### Methods

#### listScenarios(teamId)
List all scenarios for a team.

```javascript
const scenarios = await client.listScenarios('team-id');
```

#### getScenario(scenarioId)
Get details for a specific scenario.

```javascript
const scenario = await client.getScenario('scenario-id');
```

#### createScenario(blueprint, teamId)
Create a new scenario from a blueprint.

```javascript
const scenario = await client.createScenario(blueprint, 'team-id');
```

#### updateScenario(scenarioId, updates)
Update an existing scenario.

```javascript
const updated = await client.updateScenario('scenario-id', {
  name: 'New Name',
  scheduling: { interval: 30 }
});
```

#### deleteScenario(scenarioId)
Delete a scenario.

```javascript
const result = await client.deleteScenario('scenario-id');
```

#### runScenario(scenarioId, data)
Manually trigger a scenario execution.

```javascript
const execution = await client.runScenario('scenario-id', {
  input: 'data'
});
```

#### getExecutionHistory(scenarioId, limit)
Get execution history for a scenario.

```javascript
const history = await client.getExecutionHistory('scenario-id', 50);
```

## ScenarioGenerator

Generates scenarios from templates.

### Constructor

```javascript
const generator = new ScenarioGenerator(makeClient);
```

### Methods

#### fromTemplate(templateName, variables, options)
Generate a scenario from a template.

```javascript
const scenario = await generator.fromTemplate('crm-sync', {
  clientName: 'ACME Corp',
  spreadsheetId: '1234567890',
  interval: 15
}, {
  deploy: true,
  teamId: 'team-id'
});
```

#### batchGenerate(batchConfig)
Generate multiple scenarios.

```javascript
const results = await generator.batchGenerate([
  {
    name: 'Client A CRM Sync',
    template: 'crm-sync',
    variables: { clientName: 'Client A' },
    options: { teamId: 'team-a' }
  },
  {
    name: 'Client B CRM Sync',
    template: 'crm-sync',
    variables: { clientName: 'Client B' },
    options: { teamId: 'team-b' }
  }
]);
```

#### listTemplates()
List available templates.

```javascript
const templates = await generator.listTemplates();
```

## AIScenarioBuilder

Generates scenarios from natural language.

### Constructor

```javascript
const builder = new AIScenarioBuilder({
  openaiKey: 'your-openai-key'
});
```

### Methods

#### generate(description, context)
Generate a scenario from description.

```javascript
const result = await builder.generate(
  "Sync new Salesforce leads to Google Sheets and notify via Slack",
  {
    availableConnections: ['salesforce', 'google-sheets', 'slack'],
    constraints: { maxModules: 5 }
  }
);
```

#### refine(blueprint, feedback)
Refine an existing scenario.

```javascript
const refined = await builder.refine(blueprint, 
  "Add error handling and filter only qualified leads"
);
```

#### optimize(blueprint)
Analyze and optimize a scenario.

```javascript
const analysis = await builder.optimize(blueprint);
console.log(analysis.suggestions);
```

## ScenarioMonitor

Monitors scenario health and performance.

### Constructor

```javascript
const monitor = new ScenarioMonitor(makeClient, {
  checkInterval: 300000, // 5 minutes
  alertThreshold: 0.8,   // 80% failure rate
  retryAttempts: 3
});
```

### Methods

#### start()
Start monitoring.

```javascript
monitor.start();
```

#### stop()
Stop monitoring.

```javascript
monitor.stop();
```

#### addScenario(scenarioId, config)
Add a scenario to monitoring.

```javascript
monitor.addScenario('scenario-id', {
  autoRestart: true,
  autoHeal: true
});
```

#### getHealthReport()
Get health report for all monitored scenarios.

```javascript
const report = monitor.getHealthReport();
console.log(report.aggregate);
```

### Events

The monitor emits various events:

```javascript
monitor.on('alert', (alert) => {
  console.log(`Alert: ${alert.message}`);
});

monitor.on('healthCheck', (scenarioId, health) => {
  console.log(`Health check for ${scenarioId}:`, health);
});

monitor.on('scenarioRestarted', (scenarioId) => {
  console.log(`Scenario ${scenarioId} was restarted`);
});
```