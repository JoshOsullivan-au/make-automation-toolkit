# Webhooks Module Reference

## Overview
Webhooks are the foundation of many Make.com scenarios, allowing external applications to trigger automations.

## Available Modules

### webhook.customWebhook
**Version**: 1  
**Description**: Creates a custom webhook endpoint that can receive data from any source.

#### Parameters
```json
{
  "name": "string",              // Name of the webhook
  "dataStructure": {             // Optional: Define expected data structure
    "type": "collection",
    "spec": [
      {
        "name": "fieldName",
        "type": "text",
        "required": true
      }
    ]
  },
  "rawBody": "boolean"          // Optional: Receive raw body data
}
```

#### Example Usage
```json
{
  "id": 1,
  "module": "webhook.customWebhook",
  "version": 1,
  "parameters": {
    "name": "Order Processing Webhook",
    "dataStructure": {
      "type": "collection",
      "spec": [
        {
          "name": "orderId",
          "type": "text",
          "required": true
        },
        {
          "name": "customerEmail",
          "type": "email",
          "required": true
        },
        {
          "name": "amount",
          "type": "number",
          "required": true
        },
        {
          "name": "items",
          "type": "array"
        }
      ]
    }
  }
}
```

### webhook.respond
**Version**: 1  
**Description**: Sends a response back to the webhook caller.

#### Parameters
```json
{
  "body": "any",                // Response body (text, JSON, etc.)
  "status": "number",           // HTTP status code (200, 201, 400, etc.)
  "headers": [                  // Optional: Custom response headers
    {
      "key": "string",
      "value": "string"
    }
  ]
}
```

#### Example Usage
```json
{
  "id": 2,
  "module": "webhook.respond",
  "version": 1,
  "parameters": {
    "body": {
      "success": true,
      "message": "Order processed successfully",
      "orderId": "{{1.orderId}}"
    },
    "status": 200,
    "headers": [
      {
        "key": "Content-Type",
        "value": "application/json"
      },
      {
        "key": "X-Processed-By",
        "value": "Make.com"
      }
    ]
  }
}
```

## Data Structure Types

### Basic Types
- `text`: String values
- `number`: Numeric values (integer or decimal)
- `boolean`: True/false values
- `date`: Date/time values
- `email`: Email addresses (validated)
- `url`: Web addresses (validated)
- `phone`: Phone numbers

### Complex Types
- `array`: List of items
- `collection`: Object/dictionary with nested properties
- `binary`: File/image data

## Best Practices

1. **Always Define Data Structure**: While optional, defining a data structure helps with:
   - Data validation
   - Better mapping in subsequent modules
   - Clear documentation of expected inputs

2. **Use Meaningful Names**: Give webhooks descriptive names that indicate their purpose

3. **Implement Response Handling**: Always include a webhook.respond module to acknowledge receipt

4. **Security Considerations**:
   - Use HTTPS endpoints only
   - Implement authentication where needed
   - Validate incoming data
   - Consider IP whitelisting for sensitive webhooks

5. **Error Handling**: Include error response paths:
```json
{
  "module": "webhook.respond",
  "parameters": {
    "body": {
      "error": "Invalid request format",
      "details": "{{error.message}}"
    },
    "status": 400
  }
}
```

## Common Patterns

### Pattern 1: Simple Data Reception
```json
[
  {
    "id": 1,
    "module": "webhook.customWebhook",
    "parameters": {
      "name": "Simple Webhook"
    }
  },
  {
    "id": 2,
    "module": "webhook.respond",
    "parameters": {
      "body": "Received",
      "status": 200
    }
  }
]
```

### Pattern 2: Webhook with Validation
```json
[
  {
    "id": 1,
    "module": "webhook.customWebhook",
    "parameters": {
      "name": "Validated Webhook",
      "dataStructure": {
        "type": "collection",
        "spec": [
          {
            "name": "apiKey",
            "type": "text",
            "required": true
          },
          {
            "name": "data",
            "type": "collection",
            "required": true
          }
        ]
      }
    }
  },
  {
    "id": 2,
    "module": "flow.router",
    "parameters": {
      "routes": [
        {
          "label": "Valid API Key",
          "filter": {
            "conditions": [[{
              "a": "{{1.apiKey}}",
              "b": "YOUR_VALID_API_KEY",
              "o": "equal"
            }]]
          }
        },
        {
          "label": "Invalid API Key",
          "filter": {
            "conditions": [[{
              "a": "{{1.apiKey}}",
              "b": "YOUR_VALID_API_KEY",
              "o": "notEqual"
            }]]
          }
        }
      ]
    }
  }
]
```

## Testing Webhooks

1. **Get Webhook URL**: After creating the scenario, Make.com provides a unique webhook URL
2. **Test with cURL**:
```bash
curl -X POST https://hook.make.com/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

3. **Test with Postman**: Import the webhook URL and send test payloads

4. **Use Make.com's Testing Tool**: The platform provides built-in testing capabilities

## Troubleshooting

- **No data received**: Check if the webhook URL is correct and the scenario is active
- **Data structure mismatch**: Verify the incoming data matches the defined structure
- **Timeout errors**: Ensure webhook.respond is used to acknowledge receipt quickly
- **Authentication failures**: Verify any authentication tokens or headers are correct