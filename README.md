# Make.com Automation Toolkit 🚀

A comprehensive toolkit for building Make.com (formerly Integromat) automations, including JSON blueprint generators, module references, and AI-powered scenario builders.

## 🎯 Features

- **Complete Module Reference**: All Make.com modules categorized by type
- **JSON Blueprint Generator**: Convert natural language to Make.com scenarios
- **AI Agent Builder**: Create intelligent automation agents
- **MCP Integration**: Claude Desktop integration for scenario generation
- **Error Handling Patterns**: Production-ready error management
- **Best Practices**: Performance optimization and security guidelines

## 📚 Documentation

- [Getting Started](./docs/getting-started.md)
- [Module Reference](./modules/README.md)
- [Blueprint Generator](./generator/README.md)
- [Examples](./examples/README.md)
- [AI Agents](./ai-agents/README.md)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/JoshOsullivan-au/make-automation-toolkit.git

# Install dependencies
cd make-automation-toolkit
npm install

# Run the blueprint generator
node generator/cli.js
```

## 📦 What's Included

### Module Categories

- **Core Tools**: Webhooks, HTTP, Flow Control, Data Stores
- **Productivity**: Google Workspace, Microsoft 365, Notion
- **Communication**: Slack, Discord, Email, SMS
- **CRM/Sales**: Salesforce, HubSpot, Pipedrive
- **E-commerce**: Shopify, WooCommerce, Stripe
- **Database**: MongoDB, MySQL, PostgreSQL, Airtable
- **AI/ML**: OpenAI, Anthropic, Google AI
- **Social Media**: Twitter, Facebook, LinkedIn, Instagram
- **File Storage**: Google Drive, Dropbox, Box
- **Project Management**: Asana, Trello, ClickUp, Monday.com
- **Development**: GitHub, GitLab, Jira
- **Analytics**: Google Analytics, Mixpanel
- **Marketing**: Mailchimp, SendGrid, ActiveCampaign
- **Accounting**: QuickBooks, Xero, Wave
- **Support**: Zendesk, Intercom, Freshdesk

## 🛠️ Tools Included

1. **JSON Blueprint Generator** - Convert descriptions to Make.com scenarios
2. **Module Catalog** - Complete reference of all available modules
3. **Connection Builder** - Visual tool for creating module connections
4. **Error Handler Generator** - Add robust error handling to scenarios
5. **AI Agent Framework** - Build intelligent automation agents
6. **MCP Server** - Claude Desktop integration
7. **Validation Tools** - Verify blueprint syntax and structure
8. **Migration Scripts** - Convert from other platforms

## 📝 Usage Examples

### Generate a Simple Scenario

```javascript
const { ScenarioBuilder } = require('./generator');

const scenario = new ScenarioBuilder()
  .addWebhook('Customer Order')
  .addGoogleSheets('Update Inventory')
  .addSlack('Notify Team')
  .build();

console.log(JSON.stringify(scenario, null, 2));
```

### Create an AI Agent

```javascript
const { AIAgentBuilder } = require('./ai-agents');

const agent = new AIAgentBuilder()
  .setName('Customer Support Agent')
  .addTool('searchKnowledgeBase')
  .addTool('createTicket')
  .addTool('sendResponse')
  .build();
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Support

If you find this toolkit helpful, please give it a star ⭐

For questions or support:
- Open an [issue](https://github.com/JoshOsullivan-au/make-automation-toolkit/issues)
- Check the [documentation](./docs)
- Join our [Discord community](https://discord.gg/makeautomation)

---

Built with ❤️ for the Make.com community