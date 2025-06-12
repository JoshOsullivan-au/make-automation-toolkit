# Make.com Module Reference

Comprehensive reference for all Make.com modules organized by category.

## Module Categories

### 🔧 Core Tools
- [Webhooks](./core/webhooks.md)
- [HTTP Requests](./core/http.md)
- [Flow Control](./core/flow-control.md)
- [Data Stores](./core/data-stores.md)
- [Text Parser](./core/text-parser.md)
- [JSON](./core/json.md)
- [CSV](./core/csv.md)
- [XML](./core/xml.md)

### 📊 Productivity
- [Google Sheets](./productivity/google-sheets.md)
- [Google Drive](./productivity/google-drive.md)
- [Google Calendar](./productivity/google-calendar.md)
- [Microsoft 365](./productivity/microsoft-365.md)
- [Notion](./productivity/notion.md)
- [Airtable](./productivity/airtable.md)

### 💬 Communication
- [Slack](./communication/slack.md)
- [Discord](./communication/discord.md)
- [Email (SMTP/IMAP)](./communication/email.md)
- [SendGrid](./communication/sendgrid.md)
- [Twilio](./communication/twilio.md)
- [WhatsApp Business](./communication/whatsapp.md)
- [Telegram](./communication/telegram.md)

### 🏢 CRM & Sales
- [Salesforce](./crm/salesforce.md)
- [HubSpot](./crm/hubspot.md)
- [Pipedrive](./crm/pipedrive.md)
- [Zoho CRM](./crm/zoho.md)
- [Monday.com Sales CRM](./crm/monday-sales.md)

### 🛒 E-commerce
- [Shopify](./ecommerce/shopify.md)
- [WooCommerce](./ecommerce/woocommerce.md)
- [Stripe](./ecommerce/stripe.md)
- [PayPal](./ecommerce/paypal.md)
- [Square](./ecommerce/square.md)

### 🗄️ Databases
- [MongoDB](./database/mongodb.md)
- [MySQL](./database/mysql.md)
- [PostgreSQL](./database/postgresql.md)
- [Redis](./database/redis.md)
- [Firebase](./database/firebase.md)

### 🤖 AI & ML
- [OpenAI](./ai/openai.md)
- [Anthropic Claude](./ai/anthropic.md)
- [Google AI](./ai/google-ai.md)
- [Hugging Face](./ai/huggingface.md)
- [Replicate](./ai/replicate.md)

### 📱 Social Media
- [Twitter/X](./social/twitter.md)
- [Facebook](./social/facebook.md)
- [Instagram](./social/instagram.md)
- [LinkedIn](./social/linkedin.md)
- [YouTube](./social/youtube.md)
- [TikTok](./social/tiktok.md)

### 📁 File Storage
- [Google Drive](./storage/google-drive.md)
- [Dropbox](./storage/dropbox.md)
- [Box](./storage/box.md)
- [OneDrive](./storage/onedrive.md)
- [AWS S3](./storage/aws-s3.md)

### 📋 Project Management
- [Asana](./project/asana.md)
- [Trello](./project/trello.md)
- [ClickUp](./project/clickup.md)
- [Monday.com](./project/monday.md)
- [Jira](./project/jira.md)
- [Linear](./project/linear.md)

### 💻 Development
- [GitHub](./dev/github.md)
- [GitLab](./dev/gitlab.md)
- [Bitbucket](./dev/bitbucket.md)
- [Jenkins](./dev/jenkins.md)
- [CircleCI](./dev/circleci.md)

### 📈 Analytics
- [Google Analytics](./analytics/google-analytics.md)
- [Mixpanel](./analytics/mixpanel.md)
- [Segment](./analytics/segment.md)
- [Amplitude](./analytics/amplitude.md)

### 📧 Marketing
- [Mailchimp](./marketing/mailchimp.md)
- [ActiveCampaign](./marketing/activecampaign.md)
- [ConvertKit](./marketing/convertkit.md)
- [Klaviyo](./marketing/klaviyo.md)

### 💰 Accounting
- [QuickBooks](./accounting/quickbooks.md)
- [Xero](./accounting/xero.md)
- [Wave](./accounting/wave.md)
- [FreshBooks](./accounting/freshbooks.md)

### 🎫 Support
- [Zendesk](./support/zendesk.md)
- [Intercom](./support/intercom.md)
- [Freshdesk](./support/freshdesk.md)
- [Help Scout](./support/helpscout.md)

## Module Structure

Each module documentation includes:

1. **Module Identifier**: The exact string used in JSON blueprints
2. **Available Actions**: List of all actions/operations
3. **Parameters**: Required and optional parameters for each action
4. **Data Mapping**: How to reference data from other modules
5. **Examples**: Real-world usage examples
6. **Best Practices**: Tips for optimal usage
7. **Common Errors**: Troubleshooting guide

## Quick Reference

### Most Used Modules

```javascript
// Webhook Trigger
"webhook.customWebhook"

// HTTP Request
"http.makeRequest"

// Google Sheets
"google-sheets.addRow"
"google-sheets.updateRow"
"google-sheets.searchRows"

// Slack
"slack.postMessage"
"slack.watchMessages"

// Flow Control
"flow.router"
"flow.aggregator"
"flow.iterator"

// Data Store
"datastore.addRecord"
"datastore.searchRecords"
"datastore.updateRecord"

// OpenAI
"openai.createCompletion"
"openai.createChatCompletion"
```

## Data Types

### Basic Types
- `text`: String values
- `number`: Numeric values
- `boolean`: True/false
- `date`: Date/time values
- `array`: Lists of items
- `collection`: Object/dictionary

### Special Types
- `binary`: File/image data
- `url`: Web addresses
- `email`: Email addresses
- `phone`: Phone numbers

## Connection Syntax

```json
{
  "source": 1,
  "target": 2,
  "route": 1  // Optional: for router branches
}
```

## Variable References

```
{{moduleId.fieldName}}      // Reference specific field
{{moduleId}}                // Reference entire output
{{now}}                     // Current timestamp
{{timestamp}}               // Unix timestamp
{{random}}                  // Random number
```