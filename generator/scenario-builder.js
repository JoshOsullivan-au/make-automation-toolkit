const MODULE_CATALOG = require('../modules/complete-reference.json');

class ScenarioBuilder {
  constructor() {
    this.metadata = {
      version: 2,
      name: 'Generated Scenario',
      description: 'Created by Make.com Automation Toolkit'
    };
    this.modules = [];
    this.connections = [];
    this.variables = [];
    this.dataStores = [];
    this.currentId = 1;
  }

  setName(name) {
    this.metadata.name = name;
    return this;
  }

  setDescription(description) {
    this.metadata.description = description;
    return this;
  }

  addModule(moduleType, parameters = {}) {
    const module = {
      id: this.currentId++,
      module: moduleType,
      version: this.getModuleVersion(moduleType),
      parameters: parameters
    };
    
    this.modules.push(module);
    
    // Auto-connect to previous module
    if (this.modules.length > 1) {
      this.connections.push({
        source: this.modules[this.modules.length - 2].id,
        target: module.id
      });
    }
    
    return this;
  }

  addWebhook(name, dataStructure = null) {
    return this.addModule('webhook.customWebhook', {
      name: name,
      dataStructure: dataStructure || {
        type: 'collection',
        spec: [
          { name: 'data', type: 'text', required: true }
        ]
      }
    });
  }

  addHTTP(url, method = 'GET', headers = [], body = null) {
    return this.addModule('http.makeRequest', {
      url: url,
      method: method,
      headers: headers,
      body: body
    });
  }

  addGoogleSheets(action, spreadsheetId, sheetName, data = {}) {
    const actions = {
      'add': 'google-sheets.addRow',
      'update': 'google-sheets.updateRow',
      'search': 'google-sheets.searchRows',
      'delete': 'google-sheets.deleteRow'
    };
    
    const moduleType = actions[action] || action;
    const parameters = {
      spreadsheetId: spreadsheetId,
      sheetId: sheetName,
      ...data
    };
    
    return this.addModule(moduleType, parameters);
  }

  addSlack(channel, text, attachments = []) {
    return this.addModule('slack.postMessage', {
      channel: channel,
      text: text,
      attachments: attachments
    });
  }

  addOpenAI(model = 'gpt-4', messages, temperature = 0.7) {
    return this.addModule('openai.createCompletion', {
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: 2000
    });
  }

  addRouter(routes) {
    const routerModule = {
      id: this.currentId++,
      module: 'flow.router',
      version: 1,
      parameters: {
        routes: routes.map((route, index) => ({
          id: index + 1,
          label: route.label,
          filter: {
            name: route.name || route.label,
            conditions: [[{
              a: route.field,
              b: route.value,
              o: route.operator || 'equal'
            }]]
          }
        }))
      }
    };
    
    this.modules.push(routerModule);
    
    // Connect to previous module
    if (this.modules.length > 1) {
      this.connections.push({
        source: this.modules[this.modules.length - 2].id,
        target: routerModule.id
      });
    }
    
    return this;
  }

  addAggregator(targetStructure, groupBy = null) {
    return this.addModule('flow.aggregator', {
      targetStructure: targetStructure,
      groupBy: groupBy
    });
  }

  addIterator(arrayField) {
    return this.addModule('flow.iterator', {
      array: arrayField
    });
  }

  addDataStore(action, dataStoreName, data = {}) {
    const actions = {
      'add': 'datastore.addRecord',
      'search': 'datastore.searchRecords',
      'update': 'datastore.updateRecord',
      'delete': 'datastore.deleteRecord'
    };
    
    return this.addModule(actions[action], {
      dataStore: dataStoreName,
      ...data
    });
  }

  addVariable(name, value) {
    this.variables.push({ name, value });
    return this.addModule('util.setVariable', {
      name: name,
      value: value
    });
  }

  addSleep(seconds) {
    return this.addModule('flow.sleep', {
      delay: seconds
    });
  }

  addTextParser(text, pattern) {
    return this.addModule('util.textParser', {
      text: text,
      pattern: pattern
    });
  }

  addJSONParser(jsonString) {
    return this.addModule('util.jsonParser', {
      jsonString: jsonString
    });
  }

  connectModules(sourceId, targetId, route = null) {
    const connection = {
      source: sourceId,
      target: targetId
    };
    
    if (route !== null) {
      connection.route = route;
    }
    
    this.connections.push(connection);
    return this;
  }

  addErrorHandler(moduleId, errorHandler) {
    const module = this.modules.find(m => m.id === moduleId);
    if (module) {
      module.errorHandler = errorHandler;
    }
    return this;
  }

  addSchedule(interval = 900) {
    if (!this.settings) {
      this.settings = {};
    }
    this.settings.scheduling = {
      interval: interval
    };
    return this;
  }

  setSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    return this;
  }

  getModuleVersion(moduleType) {
    // Search through all categories for the module
    for (const category of Object.values(MODULE_CATALOG.categories)) {
      for (const [appName, modules] of Object.entries(category.modules)) {
        for (const [moduleName, moduleInfo] of Object.entries(modules)) {
          if (moduleType === `${appName}.${moduleName}`) {
            return moduleInfo.version;
          }
        }
      }
    }
    return 1; // Default version
  }

  validate() {
    const errors = [];
    
    // Check for at least one module
    if (this.modules.length === 0) {
      errors.push('Scenario must have at least one module');
    }
    
    // Check for duplicate IDs
    const ids = this.modules.map(m => m.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('Duplicate module IDs found');
    }
    
    // Check connections
    this.connections.forEach(conn => {
      if (!ids.includes(conn.source) || !ids.includes(conn.target)) {
        errors.push(`Invalid connection: ${conn.source} -> ${conn.target}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  build() {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`Invalid scenario: ${validation.errors.join(', ')}`);
    }
    
    const scenario = {
      metadata: this.metadata,
      modules: this.modules,
      connections: this.connections
    };
    
    if (this.variables.length > 0) {
      scenario.variables = this.variables;
    }
    
    if (this.dataStores.length > 0) {
      scenario.dataStores = this.dataStores;
    }
    
    if (this.settings) {
      scenario.settings = this.settings;
    }
    
    return scenario;
  }

  toJSON() {
    return JSON.stringify(this.build(), null, 2);
  }
}

module.exports = { ScenarioBuilder };