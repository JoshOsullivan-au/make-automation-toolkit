# HTTP Module Reference

## Overview
The HTTP module enables Make.com scenarios to interact with any REST API or web service, making it one of the most versatile modules available.

## Available Modules

### http.makeRequest
**Version**: 3  
**Description**: Makes HTTP requests to any endpoint with full control over method, headers, body, and authentication.

#### Parameters
```json
{
  "url": "string",                    // Required: Target URL
  "method": "string",                 // GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
  "headers": [                        // Optional: Request headers
    {
      "name": "string",
      "value": "string"
    }
  ],
  "queryString": [                    // Optional: Query parameters
    {
      "name": "string",
      "value": "string"
    }
  ],
  "bodyType": "string",               // raw, application/x-www-form-urlencoded, multipart/form-data
  "body": "any",                      // Request body (format depends on bodyType)
  "timeout": "number",                // Request timeout in seconds (default: 40)
  "certificateValidation": "boolean", // Validate SSL certificates (default: true)
  "followRedirect": "boolean",        // Follow HTTP redirects (default: true)
  "followAllRedirects": "boolean",    // Follow all redirects including POST
  "useProxySettings": "boolean",      // Use Make.com proxy settings
  "parseResponse": "boolean",         // Parse JSON response automatically (default: true)
  "username": "string",               // Basic auth username
  "password": "string",               // Basic auth password
  "authType": "string"                // none, basic, digest, bearer, apikey, oauth2
}
```

#### Example: Simple GET Request
```json
{
  "id": 1,
  "module": "http.makeRequest",
  "version": 3,
  "parameters": {
    "url": "https://api.example.com/users",
    "method": "GET",
    "headers": [
      {
        "name": "Accept",
        "value": "application/json"
      }
    ]
  }
}
```

#### Example: POST Request with JSON Body
```json
{
  "id": 2,
  "module": "http.makeRequest",
  "version": 3,
  "parameters": {
    "url": "https://api.example.com/users",
    "method": "POST",
    "headers": [
      {
        "name": "Content-Type",
        "value": "application/json"
      },
      {
        "name": "Authorization",
        "value": "Bearer {{apiToken}}"
      }
    ],
    "bodyType": "raw",
    "body": {
      "name": "{{userName}}",
      "email": "{{userEmail}}",
      "role": "user"
    }
  }
}
```

#### Example: Form Data Upload
```json
{
  "id": 3,
  "module": "http.makeRequest",
  "version": 3,
  "parameters": {
    "url": "https://api.example.com/upload",
    "method": "POST",
    "bodyType": "multipart/form-data",
    "body": {
      "file": "{{binaryData}}",
      "description": "File upload via Make.com"
    }
  }
}
```

### http.retrieveHeaders
**Version**: 1  
**Description**: Extracts headers from a previous HTTP response.

#### Parameters
```json
{
  "url": "string"  // URL to retrieve headers from
}
```

## Authentication Methods

### 1. API Key Authentication
```json
{
  "headers": [
    {
      "name": "X-API-Key",
      "value": "{{apiKey}}"
    }
  ]
}
```

### 2. Bearer Token
```json
{
  "headers": [
    {
      "name": "Authorization",
      "value": "Bearer {{accessToken}}"
    }
  ]
}
```

### 3. Basic Authentication
```json
{
  "authType": "basic",
  "username": "{{username}}",
  "password": "{{password}}"
}
```

### 4. OAuth 2.0
```json
{
  "authType": "oauth2",
  "headers": [
    {
      "name": "Authorization",
      "value": "Bearer {{oauth2Token}}"
    }
  ]
}
```

## Advanced Features

### Query Parameters
```json
{
  "url": "https://api.example.com/search",
  "queryString": [
    {
      "name": "q",
      "value": "{{searchTerm}}"
    },
    {
      "name": "limit",
      "value": "10"
    },
    {
      "name": "offset",
      "value": "{{page * 10}}"
    }
  ]
}
```

### Custom Headers
```json
{
  "headers": [
    {
      "name": "X-Custom-Header",
      "value": "CustomValue"
    },
    {
      "name": "X-Request-ID",
      "value": "{{uuid}}"
    },
    {
      "name": "User-Agent",
      "value": "Make.com/1.0"
    }
  ]
}
```

### Error Handling
```json
{
  "id": 4,
  "module": "http.makeRequest",
  "version": 3,
  "parameters": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "timeout": 30
  },
  "errorHandler": {
    "type": "retry",
    "maxRetries": 3,
    "interval": 60,
    "backoff": true
  }
}
```

## Common API Patterns

### RESTful CRUD Operations

#### Create (POST)
```json
{
  "url": "https://api.example.com/resources",
  "method": "POST",
  "body": {
    "name": "New Resource",
    "data": "{{resourceData}}"
  }
}
```

#### Read (GET)
```json
{
  "url": "https://api.example.com/resources/{{resourceId}}",
  "method": "GET"
}
```

#### Update (PUT/PATCH)
```json
{
  "url": "https://api.example.com/resources/{{resourceId}}",
  "method": "PATCH",
  "body": {
    "name": "Updated Resource"
  }
}
```

#### Delete (DELETE)
```json
{
  "url": "https://api.example.com/resources/{{resourceId}}",
  "method": "DELETE"
}
```

### Pagination Handling
```json
{
  "url": "https://api.example.com/items",
  "queryString": [
    {
      "name": "page",
      "value": "{{iterator.index}}"
    },
    {
      "name": "per_page",
      "value": "100"
    }
  ]
}
```

### GraphQL Requests
```json
{
  "url": "https://api.example.com/graphql",
  "method": "POST",
  "headers": [
    {
      "name": "Content-Type",
      "value": "application/json"
    }
  ],
  "body": {
    "query": "query GetUser($id: ID!) { user(id: $id) { name email } }",
    "variables": {
      "id": "{{userId}}"
    }
  }
}
```

## Response Handling

### JSON Response
When `parseResponse` is true (default), JSON responses are automatically parsed:
```javascript
// Response available as:
{{http.data}}           // Parsed JSON object
{{http.data.field}}     // Access specific fields
{{http.statusCode}}     // HTTP status code
{{http.headers}}        // Response headers
```

### Binary Response
For file downloads:
```json
{
  "parseResponse": false,
  "headers": [
    {
      "name": "Accept",
      "value": "application/pdf"
    }
  ]
}
```

### XML Response
```json
{
  "headers": [
    {
      "name": "Accept",
      "value": "application/xml"
    }
  ]
}
```

## Best Practices

1. **Always Set Timeouts**: Prevent scenarios from hanging
   ```json
   {"timeout": 30}
   ```

2. **Use Environment Variables**: Store sensitive data securely
   ```json
   {"headers": [{"name": "Authorization", "value": "{{env.API_KEY}}"}]}
   ```

3. **Implement Retry Logic**: Handle transient failures
   ```json
   {
     "errorHandler": {
       "type": "retry",
       "maxRetries": 3,
       "interval": 60
     }
   }
   ```

4. **Validate SSL Certificates**: Keep `certificateValidation: true` for security

5. **Log Requests for Debugging**: Use data stores to log request/response pairs

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Check authentication headers and credentials
```json
{
  "headers": [
    {
      "name": "Authorization",
      "value": "Bearer {{make sure token is valid and not expired}}"
    }
  ]
}
```

### Issue: Timeout Errors
**Solution**: Increase timeout or optimize the API endpoint
```json
{
  "timeout": 120  // Increase to 2 minutes
}
```

### Issue: SSL Certificate Errors
**Solution**: Only disable validation for development
```json
{
  "certificateValidation": false  // Use only in development!
}
```

### Issue: Large Response Handling
**Solution**: Use pagination or streaming where available
```json
{
  "queryString": [
    {"name": "limit", "value": "100"},
    {"name": "offset", "value": "{{offset}}"}
  ]
}
```