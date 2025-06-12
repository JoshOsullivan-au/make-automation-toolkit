/**
 * JSON Blueprint Generator
 * Converts natural language workflow descriptions to Make.com JSON blueprints
 * Based on Make.com scenario import structure (version 2)
 */

class JSONBlueprintGenerator {
  constructor() {
    this.moduleRegistry = this._initializeModuleRegistry();
  }

  /**
   * Generate a Make.com JSON blueprint from natural language description
   * @param {string} description - Natural language workflow description
   * @returns {object} - Make.com compatible JSON blueprint
   */
  generateBlueprint(description) {
    // Parse the description to identify required modules
    const workflow = this._parseWorkflow(description);
    
    // Build the JSON structure
    const blueprint = {
      metadata: {
        version: 2,
        description: this._generateDescription(workflow)
      },
      name: this._generateScenarioName(workflow),
      scheduling: {
        interval: workflow.scheduling || 15
      },
      modules: this._buildModules(workflow),
      connections: this._buildConnections(workflow)
    };

    return blueprint;
  }

  /**
   * Parse workflow description to identify components
   * @private
   */
  _parseWorkflow(description) {
    const workflow = {
      trigger: null,
      actions: [],
      conditions: [],
      outputs: [],
      scheduling: 15
    };

    // Identify trigger
    if (description.match(/when\s+new\s+(\w+)/i)) {
      workflow.trigger = this._identifyTrigger(description);
    }

    // Identify actions
    workflow.actions = this._identifyActions(description);

    // Identify conditions
    if (description.match(/if|when|filter|condition/i)) {
      workflow.conditions = this._identifyConditions(description);
    }

    // Identify outputs
    workflow.outputs = this._identifyOutputs(description);

    return workflow;
  }

  /**
   * Build modules array for the blueprint
   * @private
   */
  _buildModules(workflow) {
    const modules = [];
    let moduleId = 1;

    // Add trigger module
    if (workflow.trigger) {
      modules.push({
        id: moduleId++,
        module: workflow.trigger.module,
        version: workflow.trigger.version || 1,
        parameters: workflow.trigger.parameters,
        mapper: {},
        metadata: {
          designer: {
            x: 0,
            y: 0
          }
        }
      });
    }

    // Add condition modules (routers)
    workflow.conditions.forEach((condition, index) => {
      modules.push({
        id: moduleId++,
        module: 'flow.router',
        version: 1,
        parameters: {},
        routes: condition.routes,
        mapper: {},
        metadata: {
          designer: {
            x: 300 * (index + 1),
            y: 0
          }
        }
      });
    });

    // Add action modules
    workflow.actions.forEach((action, index) => {
      modules.push({
        id: moduleId++,
        module: action.module,
        version: action.version || 1,
        parameters: action.parameters,
        mapper: action.mapper || {},
        metadata: {
          designer: {
            x: 300 * (index + 2),
            y: 0
          }
        }
      });
    });

    // Add output modules
    workflow.outputs.forEach((output, index) => {
      modules.push({
        id: moduleId++,
        module: output.module,
        version: output.version || 1,
        parameters: output.parameters,
        mapper: output.mapper || {},
        metadata: {
          designer: {
            x: 300 * (modules.length),
            y: 0
          }
        }
      });
    });

    return modules;
  }

  /**
   * Build connections array
   * @private
   */
  _buildConnections(workflow) {
    const connections = [];
    const modules = this._buildModules(workflow);

    // Connect modules sequentially
    for (let i = 0; i < modules.length - 1; i++) {
      const currentModule = modules[i];
      const nextModule = modules[i + 1];

      // Handle router connections specially
      if (currentModule.module === 'flow.router') {
        // Router connections are handled via routes
        continue;
      }

      connections.push({
        source: {
          moduleId: currentModule.id
        },
        target: {
          moduleId: nextModule.id
        }
      });
    }

    return connections;
  }

  /**
   * Initialize module registry with common Make.com modules
   * @private
   */
  _initializeModuleRegistry() {
    return {
      // Google Workspace
      'google-sheets': [
        'searchRows', 'updateRow', 'addRow', 'deleteRow', 'clearRow',
        'updateCell', 'clearCell', 'bulkAddRows', 'bulkUpdateRows'
      ],
      'gmail': [
        'sendEmail', 'createDraft', 'searchEmails', 'markAsRead',
        'addLabel', 'removeLabel', 'moveToTrash'
      ],
      'google-drive': [
        'uploadFile', 'downloadFile', 'createFolder', 'moveFile',
        'copyFile', 'deleteFile', 'shareFile'
      ],
      
      // Microsoft 365
      'microsoft365-email': [
        'sendEmail', 'createDraft', 'searchEmails', 'moveEmail'
      ],
      'microsoft365-excel': [
        'addRow', 'updateRow', 'getRow', 'deleteRow'
      ],
      'onedrive': [
        'uploadFile', 'downloadFile', 'createFolder', 'deleteFile'
      ],
      
      // CRM Platforms
      'salesforce': [
        'searchRecords', 'createRecord', 'updateRecord', 'deleteRecord'
      ],
      'hubspot': [
        'createContact', 'updateContact', 'searchContacts', 'createDeal'
      ],
      
      // Communication
      'slack': [
        'postMessage', 'uploadFile', 'createChannel', 'addReaction'
      ],
      'discord': [
        'sendMessage', 'createChannel', 'addRole'
      ],
      'twilio': [
        'sendSMS', 'makeCall', 'sendWhatsApp'
      ],
      
      // AI/ML
      'openai': [
        'createCompletion', 'createChatCompletion', 'createImage',
        'createEmbedding', 'createTranscription'
      ],
      
      // Utilities
      'http': [
        'makeRequest', 'makeBasicAuthRequest', 'makeOAuth2Request'
      ],
      'flow': [
        'router', 'aggregator', 'iterator', 'repeater', 'sleep'
      ],
      'tools': [
        'setVariable', 'setMultipleVariables', 'increment',
        'compose', 'switch'
      ],
      
      // Databases
      'airtable': [
        'searchRecords', 'createRecord', 'updateRecord', 'deleteRecord'
      ],
      'mongodb': [
        'insertDocument', 'findDocuments', 'updateDocument', 'deleteDocument'
      ],
      
      // E-commerce
      'shopify': [
        'createProduct', 'updateProduct', 'createOrder', 'fulfillOrder'
      ],
      'woocommerce': [
        'createProduct', 'updateProduct', 'createOrder', 'updateOrder'
      ]
    };
  }

  /**
   * Identify trigger module from description
   * @private
   */
  _identifyTrigger(description) {
    const triggerPatterns = [
      {
        pattern: /new\s+email/i,
        module: 'gmail.watchEmails',
        parameters: {
          folder: 'INBOX',
          maxResults: 10
        }
      },
      {
        pattern: /new\s+row.*sheet/i,
        module: 'google-sheets.watchRows',
        parameters: {
          spreadsheetId: '{{spreadsheetId}}',
          sheetName: '{{sheetName}}'
        }
      },
      {
        pattern: /webhook|http\s+request/i,
        module: 'http.webhook',
        parameters: {
          name: 'Webhook Trigger'
        }
      },
      {
        pattern: /new\s+salesforce\s+(lead|contact|opportunity)/i,
        module: 'salesforce.watchRecords',
        parameters: {
          object: 'Lead',
          query: 'SELECT Id, Name, Email FROM Lead'
        }
      },
      {
        pattern: /scheduled|every\s+\d+\s+(minute|hour|day)/i,
        module: 'schedule.trigger',
        parameters: {}
      }
    ];

    for (const trigger of triggerPatterns) {
      if (trigger.pattern.test(description)) {
        return trigger;
      }
    }

    // Default to webhook trigger
    return {
      module: 'http.webhook',
      parameters: {
        name: 'Manual Trigger'
      }
    };
  }

  /**
   * Identify action modules from description
   * @private
   */
  _identifyActions(description) {
    const actions = [];
    const actionPatterns = [
      {
        patterns: [/send\s+email/i, /email\s+to/i],
        module: 'gmail.sendEmail',
        parameters: {
          to: '{{recipientEmail}}',
          subject: '{{emailSubject}}',
          content: '{{emailContent}}'
        }
      },
      {
        patterns: [/update.*sheet/i, /add.*sheet/i],
        module: 'google-sheets.addRow',
        parameters: {
          spreadsheetId: '{{spreadsheetId}}',
          sheetName: '{{sheetName}}',
          values: {
            '0': '{{column1}}',
            '1': '{{column2}}',
            '2': '{{column3}}'
          }
        }
      },
      {
        patterns: [/send.*slack/i, /notify.*slack/i],
        module: 'slack.postMessage',
        parameters: {
          channel: '#{{slackChannel}}',
          text: '{{message}}'
        }
      },
      {
        patterns: [/create.*salesforce/i, /add.*salesforce/i],
        module: 'salesforce.createRecord',
        parameters: {
          object: 'Lead',
          fields: {
            FirstName: '{{firstName}}',
            LastName: '{{lastName}}',
            Email: '{{email}}',
            Company: '{{company}}'
          }
        }
      },
      {
        patterns: [/call.*api/i, /http.*request/i],
        module: 'http.makeRequest',
        parameters: {
          url: '{{apiEndpoint}}',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {{apiKey}}'
          },
          body: '{{requestBody}}'
        }
      },
      {
        patterns: [/generate.*ai/i, /openai/i, /gpt/i],
        module: 'openai.createChatCompletion',
        parameters: {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '{{systemPrompt}}'
            },
            {
              role: 'user',
              content: '{{userPrompt}}'
            }
          ]
        }
      }
    ];

    // Check each pattern
    actionPatterns.forEach(action => {
      action.patterns.forEach(pattern => {
        if (pattern.test(description)) {
          actions.push({
            module: action.module,
            parameters: action.parameters
          });
        }
      });
    });

    return actions;
  }

  /**
   * Identify conditions/routers from description
   * @private
   */
  _identifyConditions(description) {
    const conditions = [];
    
    if (description.match(/if|when|filter|condition/i)) {
      conditions.push({
        routes: [
          {
            name: 'Condition Met',
            filter: {
              name: 'Condition',
              conditions: [
                [
                  {
                    a: '{{1.status}}',
                    b: 'approved',
                    o: 'text:equal'
                  }
                ]
              ]
            }
          },
          {
            name: 'Default',
            filter: {
              name: 'Default',
              conditions: []
            }
          }
        ]
      });
    }

    return conditions;
  }

  /**
   * Identify output modules from description
   * @private
   */
  _identifyOutputs(description) {
    const outputs = [];
    
    // Check for specific output mentions
    if (description.match(/response|return|output/i)) {
      outputs.push({
        module: 'http.webhookResponse',
        parameters: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{{responseData}}'
        }
      });
    }

    return outputs;
  }

  /**
   * Generate scenario name from workflow
   * @private
   */
  _generateScenarioName(workflow) {
    const components = [];
    
    if (workflow.trigger) {
      const triggerName = workflow.trigger.module.split('.')[0];
      components.push(this._capitalizeFirst(triggerName));
    }
    
    if (workflow.actions.length > 0) {
      const primaryAction = workflow.actions[0].module.split('.')[0];
      components.push(this._capitalizeFirst(primaryAction));
    }
    
    return components.join(' to ') + ' Automation';
  }

  /**
   * Generate description from workflow
   * @private
   */
  _generateDescription(workflow) {
    const components = [];
    
    if (workflow.trigger) {
      components.push(`Triggered by ${workflow.trigger.module}`);
    }
    
    if (workflow.actions.length > 0) {
      const actionNames = workflow.actions.map(a => a.module).join(', ');
      components.push(`performs actions: ${actionNames}`);
    }
    
    return components.join(', ');
  }

  /**
   * Capitalize first letter
   * @private
   */
  _capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = JSONBlueprintGenerator;