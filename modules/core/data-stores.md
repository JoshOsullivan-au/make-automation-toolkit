# Data Stores Module Reference

## Overview
Data stores in Make.com provide persistent storage within scenarios, acting as a simple database for storing and retrieving information across executions.

## Available Modules

### datastore.addRecord
**Version**: 1  
**Description**: Adds a new record to a data store.

#### Parameters
```json
{
  "dataStore": "string",    // Data store name
  "data": {                 // Record data
    "field1": "value1",
    "field2": "value2"
  },
  "overwrite": "boolean"    // Overwrite if key exists
}
```

#### Example: Add Customer Record
```json
{
  "id": 1,
  "module": "datastore.addRecord",
  "version": 1,
  "parameters": {
    "dataStore": "CustomerData",
    "data": {
      "customerId": "{{webhook.customerId}}",
      "email": "{{webhook.email}}",
      "name": "{{webhook.name}}",
      "totalPurchases": 0,
      "lastActivity": "{{now}}",
      "status": "active"
    },
    "overwrite": false
  }
}
```

### datastore.searchRecords
**Version**: 1  
**Description**: Searches for records in a data store based on filters.

#### Parameters
```json
{
  "dataStore": "string",
  "filter": {              // Search conditions
    "conditions": [
      [
        {
          "a": "fieldName",
          "b": "value",
          "o": "operator"
        }
      ]
    ]
  },
  "limit": "number",       // Max records to return
  "sort": [                // Sort order
    {
      "field": "string",
      "direction": "asc|desc"
    }
  ]
}
```

#### Example: Search Active Customers
```json
{
  "id": 2,
  "module": "datastore.searchRecords",
  "version": 1,
  "parameters": {
    "dataStore": "CustomerData",
    "filter": {
      "conditions": [
        [
          {
            "a": "status",
            "b": "active",
            "o": "equal"
          },
          {
            "a": "totalPurchases",
            "b": 100,
            "o": "greater"
          }
        ]
      ]
    },
    "limit": 50,
    "sort": [
      {
        "field": "totalPurchases",
        "direction": "desc"
      }
    ]
  }
}
```

### datastore.updateRecord
**Version**: 1  
**Description**: Updates an existing record in a data store.

#### Parameters
```json
{
  "dataStore": "string",
  "recordId": "string",     // ID of record to update
  "data": {                 // Updated data
    "field1": "newValue1"
  },
  "upsert": "boolean"       // Create if doesn't exist
}
```

#### Example: Update Purchase Count
```json
{
  "id": 3,
  "module": "datastore.updateRecord",
  "version": 1,
  "parameters": {
    "dataStore": "CustomerData",
    "recordId": "{{2.customerId}}",
    "data": {
      "totalPurchases": "{{2.totalPurchases + 1}}",
      "lastActivity": "{{now}}",
      "lastOrderAmount": "{{webhook.orderAmount}}"
    }
  }
}
```

### datastore.deleteRecord
**Version**: 1  
**Description**: Deletes a record from a data store.

#### Parameters
```json
{
  "dataStore": "string",
  "recordId": "string"      // ID of record to delete
}
```

#### Example: Remove Inactive Customer
```json
{
  "id": 4,
  "module": "datastore.deleteRecord",
  "version": 1,
  "parameters": {
    "dataStore": "CustomerData",
    "recordId": "{{inactiveCustomer.id}}"
  }
}
```

### datastore.getRecord
**Version**: 1  
**Description**: Retrieves a specific record by ID.

#### Parameters
```json
{
  "dataStore": "string",
  "recordId": "string"
}
```

#### Example: Get Customer Details
```json
{
  "id": 5,
  "module": "datastore.getRecord",
  "version": 1,
  "parameters": {
    "dataStore": "CustomerData",
    "recordId": "{{webhook.customerId}}"
  }
}
```

### datastore.clearDataStore
**Version**: 1  
**Description**: Removes all records from a data store.

#### Parameters
```json
{
  "dataStore": "string"
}
```

#### Example: Clear Temporary Data
```json
{
  "id": 6,
  "module": "datastore.clearDataStore",
  "version": 1,
  "parameters": {
    "dataStore": "TempProcessingData"
  }
}
```

## Data Store Structure

### Creating a Data Store
Data stores must be created in Make.com before use:

```json
{
  "name": "CustomerData",
  "structure": {
    "customerId": {
      "type": "text",
      "required": true,
      "unique": true
    },
    "email": {
      "type": "email",
      "required": true
    },
    "name": {
      "type": "text"
    },
    "totalPurchases": {
      "type": "number",
      "default": 0
    },
    "tags": {
      "type": "array"
    },
    "metadata": {
      "type": "collection"
    },
    "createdAt": {
      "type": "date"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  },
  "maxRecords": 10000,
  "sizeLimit": "10MB"
}
```

## Common Patterns

### Pattern 1: Caching API Responses
```json
[
  {
    "id": 1,
    "module": "datastore.searchRecords",
    "version": 1,
    "parameters": {
      "dataStore": "APICache",
      "filter": {
        "conditions": [[{
          "a": "endpoint",
          "b": "{{requestEndpoint}}",
          "o": "equal"
        }, {
          "a": "expiresAt",
          "b": "{{now}}",
          "o": "greater"
        }]]
      },
      "limit": 1
    }
  },
  {
    "id": 2,
    "module": "flow.router",
    "version": 1,
    "parameters": {
      "routes": [
        {
          "label": "Cache Hit",
          "filter": {
            "conditions": [[{
              "a": "{{1.length}}",
              "b": 0,
              "o": "greater"
            }]]
          }
        },
        {
          "label": "Cache Miss",
          "filter": {
            "conditions": [[{
              "a": "{{1.length}}",
              "b": 0,
              "o": "equal"
            }]]
          }
        }
      ]
    }
  },
  {
    "id": 3,
    "module": "http.makeRequest",
    "version": 3,
    "parameters": {
      "url": "{{requestEndpoint}}",
      "method": "GET"
    },
    "route": 2
  },
  {
    "id": 4,
    "module": "datastore.addRecord",
    "version": 1,
    "parameters": {
      "dataStore": "APICache",
      "data": {
        "endpoint": "{{requestEndpoint}}",
        "response": "{{3.data}}",
        "cachedAt": "{{now}}",
        "expiresAt": "{{addMinutes(now; 60)}}"
      },
      "overwrite": true
    },
    "route": 2
  }
]
```

### Pattern 2: Rate Limiting
```json
[
  {
    "id": 1,
    "module": "datastore.searchRecords",
    "version": 1,
    "parameters": {
      "dataStore": "RateLimits",
      "filter": {
        "conditions": [[{
          "a": "userId",
          "b": "{{webhook.userId}}",
          "o": "equal"
        }, {
          "a": "windowStart",
          "b": "{{addMinutes(now; -60)}}",
          "o": "greater"
        }]]
      }
    }
  },
  {
    "id": 2,
    "module": "flow.router",
    "version": 1,
    "parameters": {
      "routes": [
        {
          "label": "Within Limit",
          "filter": {
            "conditions": [[{
              "a": "{{1.length}}",
              "b": 100,
              "o": "less"
            }]]
          }
        },
        {
          "label": "Rate Limited",
          "filter": {
            "conditions": [[{
              "a": "{{1.length}}",
              "b": 100,
              "o": "greaterEqual"
            }]]
          }
        }
      ]
    }
  },
  {
    "id": 3,
    "module": "datastore.addRecord",
    "version": 1,
    "parameters": {
      "dataStore": "RateLimits",
      "data": {
        "userId": "{{webhook.userId}}",
        "action": "{{webhook.action}}",
        "windowStart": "{{now}}"
      }
    },
    "route": 1
  },
  {
    "id": 4,
    "module": "flow.throw",
    "version": 1,
    "parameters": {
      "message": "Rate limit exceeded. Please try again later.",
      "statusCode": 429
    },
    "route": 2
  }
]
```

### Pattern 3: Session Management
```json
[
  {
    "id": 1,
    "module": "datastore.searchRecords",
    "version": 1,
    "parameters": {
      "dataStore": "UserSessions",
      "filter": {
        "conditions": [[{
          "a": "sessionToken",
          "b": "{{webhook.headers.authorization}}",
          "o": "equal"
        }, {
          "a": "expiresAt",
          "b": "{{now}}",
          "o": "greater"
        }]]
      },
      "limit": 1
    }
  },
  {
    "id": 2,
    "module": "datastore.updateRecord",
    "version": 1,
    "parameters": {
      "dataStore": "UserSessions",
      "recordId": "{{1[0].id}}",
      "data": {
        "lastActivity": "{{now}}",
        "expiresAt": "{{addMinutes(now; 30)}}"
      }
    }
  }
]
```

## Best Practices

1. **Design Efficient Keys**: Use unique identifiers for quick lookups
   ```json
   {"customerId": "{{email}}_{{timestamp}}"}
   ```

2. **Implement TTL**: Clean up old records regularly
   ```json
   {
     "expiresAt": "{{addDays(now; 30)}}",
     "cleanup": "Check expiry in scheduled scenario"
   }
   ```

3. **Use Appropriate Data Types**: Match field types to data
   - `text`: General strings
   - `number`: Integers and decimals
   - `boolean`: True/false flags
   - `date`: Timestamps
   - `array`: Lists of values
   - `collection`: Nested objects

4. **Handle Concurrent Access**: Use unique constraints and upsert
   ```json
   {
     "upsert": true,
     "overwrite": false
   }
   ```

5. **Monitor Storage Limits**: Keep within size constraints
   - Default: 10,000 records
   - Size limit: 10MB per data store

## Performance Optimization

### Indexing Strategy
- Use unique fields as primary keys
- Create composite keys for complex queries
- Limit search result sets

### Batch Operations
```json
[
  {
    "id": 1,
    "module": "flow.iterator",
    "version": 1,
    "parameters": {
      "array": "{{webhook.records}}"
    }
  },
  {
    "id": 2,
    "module": "datastore.addRecord",
    "version": 1,
    "parameters": {
      "dataStore": "BatchData",
      "data": "{{1.item}}",
      "overwrite": true
    }
  },
  {
    "id": 3,
    "module": "flow.aggregator",
    "version": 1,
    "parameters": {
      "targetStructure": [{
        "name": "recordsProcessed",
        "type": "number"
      }]
    }
  }
]
```

## Common Issues & Solutions

### Issue: Record Not Found
**Solution**: Check if record exists before updating
```json
{
  "filter": {
    "conditions": [[{
      "a": "id",
      "b": "{{recordId}}",
      "o": "equal"
    }]]
  },
  "limit": 1
}
```

### Issue: Duplicate Records
**Solution**: Use unique constraints or check before insert
```json
{
  "overwrite": true,  // Replace if exists
  "data": {
    "uniqueKey": "{{generateUniqueId}}"
  }
}
```

### Issue: Performance Degradation
**Solution**: Implement archiving for old records
```json
[
  {
    "module": "datastore.searchRecords",
    "parameters": {
      "filter": {
        "conditions": [[{
          "a": "createdAt",
          "b": "{{addDays(now; -90)}}",
          "o": "less"
        }]]
      }
    }
  },
  {
    "module": "datastore.deleteRecord",
    "parameters": {
      "recordId": "{{item.id}}"
    }
  }
]
```