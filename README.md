# Make.com Automation Toolkit 🚀

Advanced toolkit for automating Make.com scenario development, including AI-powered builders, API integrations, and enterprise deployment tools.

## 🎯 Overview

This repository provides a comprehensive suite of tools to transform Make.com from a manual workflow builder into a programmatically managed automation platform. Built for businesses scaling their automation capabilities, particularly those implementing AI-driven workflow optimization.

## 📋 Features

### Core Capabilities
- **Scenario Template Generator** - Programmatically create Make scenarios via API
- **AI-Powered Scenario Builder** - Generate scenarios from natural language using MCP
- **Make Bridge Development Pipeline** - Local development and CI/CD integration
- **Custom App Factory** - Streamline creation of reusable Make.com apps
- **Scenario Monitoring & Self-Healing** - Automated maintenance and optimization
- **Blueprint Version Control** - Git-like versioning for scenarios
- **Multi-Tenant Management** - Deploy and manage scenarios across multiple clients

### Quick Links
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Documentation](./docs/api-reference.md)
- [Templates Library](./templates/)
- [Examples](./examples/)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/JoshOsullivan-au/make-automation-toolkit.git
cd make-automation-toolkit

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Make.com credentials
```

## 🚀 Quick Start

### 1. Configure Make.com API Access
```javascript
const MakeClient = require('./src/api/make-client');

const client = new MakeClient({
  apiKey: process.env.MAKE_API_KEY,
  zone: 'eu2.make.com' // Your Make zone
});
```

### 2. Generate a Scenario from Template
```javascript
const { ScenarioGenerator } = require('./src/generators/scenario-generator');

const generator = new ScenarioGenerator(client);
const scenario = await generator.fromTemplate('crm-sync', {
  clientName: 'ACME Corp',
  interval: 15
});
```

### 3. Deploy with AI Assistance
```javascript
const { AIScenarioBuilder } = require('./src/ai/scenario-builder');

const builder = new AIScenarioBuilder();
const scenario = await builder.generate(
  "Create a workflow that syncs new Salesforce leads to Google Sheets and sends a Slack notification"
);
```

## 📁 Project Structure

```
make-automation-toolkit/
├── src/
│   ├── api/              # Make.com API wrappers
│   ├── generators/       # Scenario generation tools
│   ├── ai/              # AI-powered builders
│   ├── bridge/          # Make Bridge integration
│   ├── monitoring/      # Scenario monitoring tools
│   ├── templates/       # Core template engine
│   └── utils/           # Utility functions
├── templates/           # Scenario templates library
├── examples/           # Example implementations
├── tests/              # Test suites
├── docs/               # Documentation
└── config/             # Configuration files
```

## 🔧 Core Components

### Scenario Template Generator
Create scenarios programmatically from JSON templates:
- Pre-built templates for common workflows
- Dynamic variable substitution
- Bulk deployment capabilities

### AI Scenario Builder
Natural language to Make.com scenario conversion:
- Claude MCP integration
- Iterative refinement
- Auto-documentation

### Monitoring & Self-Healing
Automated scenario maintenance:
- Health checks and alerts
- Auto-restart on failure
- Performance optimization

## 📚 Documentation

- [API Reference](./docs/api-reference.md)
- [Template Development Guide](./docs/template-guide.md)
- [MCP Integration Setup](./docs/mcp-setup.md)
- [Best Practices](./docs/best-practices.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏗️ Built By

[Workabl AI](https://workabl.ai) - Helping growth-stage businesses eliminate inefficiency and scale without hiring by deploying AI agents that replace entire workflows.

## 🔗 Resources

- [Make.com Developer Documentation](https://developers.make.com)
- [Make.com API Reference](https://developers.make.com/api-documentation)
- [MCP Server Documentation](https://developers.make.com/mcp-server)

---

**Ready to automate your automation?** Star this repo and get started with the examples in the [Quick Start](#quick-start) section!