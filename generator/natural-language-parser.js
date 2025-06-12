const { ScenarioBuilder } = require('./scenario-builder');

class NaturalLanguageParser {
  constructor() {
    this.patterns = {
      trigger: [
        /when\s+(.+?)\s+(?:then|,)/i,
        /trigger(?:ed)?\s+(?:by|on|when)\s+(.+?)(?:\s+then|,|$)/i,
        /start(?:s)?\s+(?:with|when|on)\s+(.+?)(?:\s+then|,|$)/i,
        /watch(?:es)?\s+(?:for)?\s+(.+?)(?:\s+then|,|$)/i,
        /monitor(?:s)?\s+(.+?)(?:\s+then|,|$)/i
      ],
      action: [
        /then\s+(.+?)(?:\s+and|,|$)/i,
        /(?:and|,)\s*(.+?)(?:\s+and|,|$)/i,
        /update(?:s)?\s+(.+)/i,
        /create(?:s)?\s+(.+)/i,
        /send(?:s)?\s+(.+)/i,
        /post(?:s)?\s+(.+)/i,
        /add(?:s)?\s+(.+)/i,
        /search(?:es)?\s+(.+)/i,
        /get(?:s)?\s+(.+)/i,
        /fetch(?:es)?\s+(.+)/i
      ],
      condition: [
        /if\s+(.+?)\s+then/i,
        /when\s+(.+?)\s+(?:is|equals|contains)/i,
        /check(?:s)?\s+(?:if|whether)\s+(.+)/i
      ],
      apps: {
        'slack': ['slack', 'channel', 'message to slack'],
        'google-sheets': ['google sheets', 'spreadsheet', 'sheet', 'gsheet'],
        'email': ['email', 'mail', 'smtp'],
        'http': ['api', 'webhook', 'http', 'request'],
        'openai': ['openai', 'gpt', 'chatgpt', 'ai'],
        'airtable': ['airtable', 'base'],
        'notion': ['notion', 'page'],
        'shopify': ['shopify', 'order', 'product'],
        'stripe': ['stripe', 'payment', 'charge'],
        'github': ['github', 'issue', 'pull request'],
        'trello': ['trello', 'card', 'board'],
        'discord': ['discord'],
        'twilio': ['sms', 'text message', 'twilio'],
        'sendgrid': ['sendgrid'],
        'mailchimp': ['mailchimp', 'newsletter'],
        'hubspot': ['hubspot', 'contact', 'deal'],
        'salesforce': ['salesforce', 'lead', 'opportunity']
      }
    };
  }

  parse(description) {
    const builder = new ScenarioBuilder();
    const normalizedDesc = description.toLowerCase();
    
    // Extract name from description
    const name = this.extractScenarioName(description);
    builder.setName(name);
    builder.setDescription(description);
    
    // Parse trigger
    const trigger = this.extractTrigger(normalizedDesc);
    if (trigger) {
      this.addTriggerModule(builder, trigger);
    }
    
    // Parse actions
    const actions = this.extractActions(normalizedDesc);
    actions.forEach(action => {
      this.addActionModule(builder, action);
    });
    
    // Parse conditions
    const conditions = this.extractConditions(normalizedDesc);
    if (conditions.length > 0) {
      this.addRouterModule(builder, conditions);
    }
    
    return builder;
  }

  extractScenarioName(description) {
    // Try to create a meaningful name from the description
    const words = description.split(' ').slice(0, 5);
    return words.join(' ').replace(/[^a-zA-Z0-9\s]/g, '');
  }

  extractTrigger(description) {
    for (const pattern of this.patterns.trigger) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  extractActions(description) {
    const actions = [];
    const parts = description.split(/\s+(?:then|and)\s+/i);
    
    // Skip the first part if it's a trigger
    const startIndex = this.extractTrigger(description) ? 1 : 0;
    
    for (let i = startIndex; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part && !part.match(/^(if|when|check)/i)) {
        actions.push(part);
      }
    }
    
    return actions;
  }

  extractConditions(description) {
    const conditions = [];
    
    for (const pattern of this.patterns.condition) {
      const matches = [...description.matchAll(new RegExp(pattern, 'gi'))];
      matches.forEach(match => {
        conditions.push(match[1].trim());
      });
    }
    
    return conditions;
  }

  detectApp(text) {
    const normalizedText = text.toLowerCase();
    
    for (const [app, keywords] of Object.entries(this.patterns.apps)) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword)) {
          return app;
        }
      }
    }
    
    return null;
  }

  addTriggerModule(builder, trigger) {
    const app = this.detectApp(trigger);
    
    switch (app) {
      case 'slack':
        builder.addModule('slack.watchMessages', {
          channel: '#general',
          botMention: trigger.includes('mention')
        });
        break;
      
      case 'google-sheets':
        builder.addModule('google-sheets.watchRows', {
          spreadsheetId: 'YOUR_SPREADSHEET_ID',
          sheetId: 'Sheet1',
          limit: 10
        });
        break;
      
      case 'shopify':
        builder.addModule('shopify.watchOrders', {
          status: 'any',
          limit: 10
        });
        break;
      
      case 'email':
        builder.addModule('email.watchEmails', {
          folder: 'INBOX',
          criteria: { unseen: true }
        });
        break;
      
      case 'stripe':
        builder.addModule('stripe.watchEvents', {
          events: ['payment_intent.succeeded']
        });
        break;
      
      default:
        // Default to webhook
        builder.addWebhook('Automated Trigger');
    }
  }

  addActionModule(builder, action) {
    const app = this.detectApp(action);
    
    switch (app) {
      case 'slack':
        this.addSlackAction(builder, action);
        break;
      
      case 'google-sheets':
        this.addGoogleSheetsAction(builder, action);
        break;
      
      case 'email':
      case 'sendgrid':
        this.addEmailAction(builder, action);
        break;
      
      case 'openai':
        this.addOpenAIAction(builder, action);
        break;
      
      case 'http':
        this.addHTTPAction(builder, action);
        break;
      
      case 'airtable':
        this.addAirtableAction(builder, action);
        break;
      
      case 'notion':
        this.addNotionAction(builder, action);
        break;
      
      case 'shopify':
        this.addShopifyAction(builder, action);
        break;
      
      case 'stripe':
        this.addStripeAction(builder, action);
        break;
      
      case 'github':
        this.addGitHubAction(builder, action);
        break;
      
      case 'trello':
        this.addTrelloAction(builder, action);
        break;
      
      case 'twilio':
        this.addTwilioAction(builder, action);
        break;
      
      case 'mailchimp':
        this.addMailchimpAction(builder, action);
        break;
      
      case 'hubspot':
        this.addHubSpotAction(builder, action);
        break;
      
      case 'salesforce':
        this.addSalesforceAction(builder, action);
        break;
      
      default:
        // Try to detect action type
        if (action.includes('wait') || action.includes('delay')) {
          builder.addSleep(5);
        } else if (action.includes('parse')) {
          builder.addJSONParser('{{previousModule.data}}');
        } else {
          // Default to HTTP request
          builder.addHTTP('https://api.example.com/webhook', 'POST');
        }
    }
  }

  addSlackAction(builder, action) {
    if (action.includes('message') || action.includes('post') || action.includes('send')) {
      builder.addSlack('#general', 'Automated message: {{trigger.data}}');
    } else if (action.includes('upload') || action.includes('file')) {
      builder.addModule('slack.uploadFile', {
        channels: ['#general'],
        filename: 'report.pdf',
        data: '{{previousModule.file}}'
      });
    }
  }

  addGoogleSheetsAction(builder, action) {
    if (action.includes('add') || action.includes('create') || action.includes('new')) {
      builder.addGoogleSheets('add', 'YOUR_SPREADSHEET_ID', 'Sheet1', {
        values: {
          'Column A': '{{trigger.field1}}',
          'Column B': '{{trigger.field2}}'
        }
      });
    } else if (action.includes('update')) {
      builder.addGoogleSheets('update', 'YOUR_SPREADSHEET_ID', 'Sheet1', {
        rowNumber: '{{previousModule.rowNumber}}',
        values: {
          'Status': 'Updated'
        }
      });
    } else if (action.includes('search') || action.includes('find')) {
      builder.addGoogleSheets('search', 'YOUR_SPREADSHEET_ID', 'Sheet1', {
        filter: {
          conditions: [[{
            a: 'Column A',
            b: '{{trigger.searchTerm}}',
            o: 'contains'
          }]]
        }
      });
    }
  }

  addEmailAction(builder, action) {
    const isHtml = action.includes('html') || action.includes('formatted');
    
    builder.addModule('sendgrid.sendEmail', {
      to: '{{trigger.email}}',
      from: 'noreply@example.com',
      subject: 'Automated Email',
      [isHtml ? 'html' : 'text']: 'This is an automated message.'
    });
  }

  addOpenAIAction(builder, action) {
    const messages = [{
      role: 'system',
      content: 'You are a helpful assistant.'
    }, {
      role: 'user',
      content: '{{trigger.prompt}}'
    }];
    
    builder.addOpenAI('gpt-4', messages);
  }

  addHTTPAction(builder, action) {
    const method = action.includes('get') ? 'GET' : 
                   action.includes('post') ? 'POST' : 
                   action.includes('put') ? 'PUT' : 
                   action.includes('delete') ? 'DELETE' : 'POST';
    
    builder.addHTTP('https://api.example.com/endpoint', method, [], {
      data: '{{trigger.data}}'
    });
  }

  addAirtableAction(builder, action) {
    if (action.includes('create') || action.includes('add')) {
      builder.addModule('airtable.createRecord', {
        baseId: 'YOUR_BASE_ID',
        tableId: 'Table 1',
        fields: {
          'Name': '{{trigger.name}}',
          'Status': 'New'
        }
      });
    } else if (action.includes('update')) {
      builder.addModule('airtable.updateRecord', {
        baseId: 'YOUR_BASE_ID',
        tableId: 'Table 1',
        recordId: '{{previousModule.id}}',
        fields: {
          'Status': 'Updated'
        }
      });
    }
  }

  addNotionAction(builder, action) {
    if (action.includes('create') || action.includes('add')) {
      builder.addModule('notion.createPage', {
        databaseId: 'YOUR_DATABASE_ID',
        properties: {
          'Name': {
            title: [{
              text: {
                content: '{{trigger.title}}'
              }
            }]
          }
        }
      });
    }
  }

  addShopifyAction(builder, action) {
    if (action.includes('order')) {
      builder.addModule('shopify.createOrder', {
        line_items: [{
          variant_id: '{{trigger.variant_id}}',
          quantity: 1
        }],
        customer: {
          email: '{{trigger.email}}'
        }
      });
    } else if (action.includes('inventory')) {
      builder.addModule('shopify.updateInventory', {
        inventory_item_id: '{{trigger.item_id}}',
        quantity: '{{trigger.quantity}}'
      });
    }
  }

  addStripeAction(builder, action) {
    if (action.includes('charge') || action.includes('payment')) {
      builder.addModule('stripe.createPaymentIntent', {
        amount: '{{trigger.amount}}',
        currency: 'usd',
        customer: '{{trigger.customer_id}}'
      });
    } else if (action.includes('customer')) {
      builder.addModule('stripe.createCustomer', {
        email: '{{trigger.email}}',
        name: '{{trigger.name}}'
      });
    }
  }

  addGitHubAction(builder, action) {
    if (action.includes('issue')) {
      builder.addModule('github.createIssue', {
        owner: 'username',
        repo: 'repository',
        title: '{{trigger.title}}',
        body: '{{trigger.description}}'
      });
    }
  }

  addTrelloAction(builder, action) {
    if (action.includes('card')) {
      builder.addModule('trello.createCard', {
        list_id: 'YOUR_LIST_ID',
        name: '{{trigger.title}}',
        desc: '{{trigger.description}}'
      });
    }
  }

  addTwilioAction(builder, action) {
    builder.addModule('twilio.sendSMS', {
      to: '{{trigger.phone}}',
      from: '+1234567890',
      body: 'Automated SMS: {{trigger.message}}'
    });
  }

  addMailchimpAction(builder, action) {
    builder.addModule('mailchimp.addSubscriber', {
      list_id: 'YOUR_LIST_ID',
      email_address: '{{trigger.email}}',
      merge_fields: {
        FNAME: '{{trigger.firstName}}',
        LNAME: '{{trigger.lastName}}'
      }
    });
  }

  addHubSpotAction(builder, action) {
    if (action.includes('contact')) {
      builder.addModule('hubspot.createContact', {
        email: '{{trigger.email}}',
        properties: {
          firstname: '{{trigger.firstName}}',
          lastname: '{{trigger.lastName}}'
        }
      });
    } else if (action.includes('deal')) {
      builder.addModule('hubspot.createDeal', {
        properties: {
          dealname: '{{trigger.dealName}}',
          amount: '{{trigger.amount}}'
        }
      });
    }
  }

  addSalesforceAction(builder, action) {
    const objectType = action.includes('lead') ? 'Lead' : 
                      action.includes('contact') ? 'Contact' : 
                      action.includes('opportunity') ? 'Opportunity' : 'Lead';
    
    builder.addModule('salesforce.createRecord', {
      object: objectType,
      fields: {
        LastName: '{{trigger.lastName}}',
        Company: '{{trigger.company}}',
        Email: '{{trigger.email}}'
      }
    });
  }

  addRouterModule(builder, conditions) {
    const routes = conditions.map((condition, index) => {
      // Parse condition to extract field, operator, and value
      const match = condition.match(/(.+?)\s+(is|equals|contains|greater|less)\s+(.+)/i);
      
      if (match) {
        const [, field, operator, value] = match;
        return {
          label: `Route ${index + 1}`,
          field: `{{previousModule.${field.trim()}}}`,
          value: value.trim(),
          operator: this.mapOperator(operator)
        };
      }
      
      return {
        label: `Route ${index + 1}`,
        field: '{{previousModule.status}}',
        value: 'true',
        operator: 'equal'
      };
    });
    
    builder.addRouter(routes);
  }

  mapOperator(operator) {
    const operatorMap = {
      'is': 'equal',
      'equals': 'equal',
      'contains': 'contains',
      'greater': 'greater',
      'less': 'less'
    };
    
    return operatorMap[operator.toLowerCase()] || 'equal';
  }
}

module.exports = { NaturalLanguageParser };