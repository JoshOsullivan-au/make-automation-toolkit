# Flow Control Module Reference

## Overview
Flow control modules are essential for creating complex logic in Make.com scenarios. They allow branching, looping, aggregating, and controlling the execution flow.

## Available Modules

### flow.router
**Version**: 1  
**Description**: Routes execution to different paths based on conditions.

#### Parameters
```json
{
  "routes": [
    {
      "id": "number",
      "label": "string",
      "filter": {
        "name": "string",
        "conditions": [
          [
            {
              "a": "string",    // Left operand
              "b": "string",    // Right operand
              "o": "string"     // Operator
            }
          ]
        ]
      }
    }
  ]
}
```

#### Operators
- `equal`: Equals
- `notEqual`: Not equals
- `greater`: Greater than
- `greaterEqual`: Greater than or equal
- `less`: Less than
- `lessEqual`: Less than or equal
- `contains`: Contains text
- `notContains`: Does not contain
- `startsWith`: Starts with
- `endsWith`: Ends with
- `matches`: Matches pattern
- `notMatches`: Does not match pattern
- `in`: In array
- `notIn`: Not in array
- `exist`: Exists (not null/empty)
- `notExist`: Does not exist (null/empty)

#### Example: Multi-Path Router
```json
{
  "id": 3,
  "module": "flow.router",
  "version": 1,
  "parameters": {
    "routes": [
      {
        "id": 1,
        "label": "High Priority",
        "filter": {
          "name": "Priority Check",
          "conditions": [
            [
              {
                "a": "{{2.priority}}",
                "b": "high",
                "o": "equal"
              }
            ]
          ]
        }
      },
      {
        "id": 2,
        "label": "Medium Priority",
        "filter": {
          "name": "Priority Check",
          "conditions": [
            [
              {
                "a": "{{2.priority}}",
                "b": "medium",
                "o": "equal"
              }
            ]
          ]
        }
      },
      {
        "id": 3,
        "label": "Low Priority",
        "filter": {
          "name": "Priority Check",
          "conditions": [
            [
              {
                "a": "{{2.priority}}",
                "b": "low",
                "o": "equal"
              }
            ]
          ]
        }
      }
    ]
  }
}
```

### flow.aggregator
**Version**: 1  
**Description**: Combines multiple bundles into a single output.

#### Parameters
```json
{
  "targetStructure": [         // Define output structure
    {
      "name": "string",
      "type": "string"
    }
  ],
  "groupBy": "string",          // Optional: Group results by field
  "stopProcessing": "boolean",  // Stop after aggregation
  "outputEmpty": "boolean"      // Output even if no data
}
```

#### Example: Aggregate Order Items
```json
{
  "id": 5,
  "module": "flow.aggregator",
  "version": 1,
  "parameters": {
    "targetStructure": [
      {
        "name": "orderId",
        "type": "text"
      },
      {
        "name": "items",
        "type": "array"
      },
      {
        "name": "totalAmount",
        "type": "number"
      }
    ],
    "groupBy": "{{4.orderId}}"
  }
}
```

### flow.iterator
**Version**: 1  
**Description**: Splits an array into individual items for processing.

#### Parameters
```json
{
  "array": "array"  // Array to iterate over
}
```

#### Example: Process Array Items
```json
{
  "id": 2,
  "module": "flow.iterator",
  "version": 1,
  "parameters": {
    "array": "{{1.items}}"
  }
}
```

### flow.converger
**Version**: 1  
**Description**: Waits for multiple execution paths to complete before continuing.

#### Example: Wait for All Paths
```json
{
  "id": 10,
  "module": "flow.converger",
  "version": 1,
  "parameters": {}
}
```

### flow.sleep
**Version**: 1  
**Description**: Pauses execution for a specified duration.

#### Parameters
```json
{
  "delay": "number"  // Delay in seconds (max: 300)
}
```

#### Example: Rate Limiting
```json
{
  "id": 6,
  "module": "flow.sleep",
  "version": 1,
  "parameters": {
    "delay": 2  // Wait 2 seconds
  }
}
```

### flow.throw
**Version**: 1  
**Description**: Throws a custom error to stop execution.

#### Parameters
```json
{
  "message": "string",      // Error message
  "statusCode": "number"   // HTTP status code (optional)
}
```

#### Example: Validation Error
```json
{
  "id": 7,
  "module": "flow.throw",
  "version": 1,
  "parameters": {
    "message": "Invalid input: Email address is required",
    "statusCode": 400
  }
}
```

### flow.break
**Version**: 1  
**Description**: Stops processing current bundle and continues with next.

#### Example
```json
{
  "id": 8,
  "module": "flow.break",
  "version": 1,
  "parameters": {}
}
```

### flow.commit
**Version**: 1  
**Description**: Commits the current transaction.

#### Example
```json
{
  "id": 9,
  "module": "flow.commit",
  "version": 1,
  "parameters": {}
}
```

### flow.rollback
**Version**: 1  
**Description**: Rolls back the current transaction.

#### Example
```json
{
  "id": 11,
  "module": "flow.rollback",
  "version": 1,
  "parameters": {}
}
```

## Complex Patterns

### Pattern 1: Conditional Processing with Fallback
```json
[
  {
    "id": 1,
    "module": "flow.router",
    "version": 1,
    "parameters": {
      "routes": [
        {
          "id": 1,
          "label": "Has Email",
          "filter": {
            "conditions": [[{
              "a": "{{input.email}}",
              "o": "exist"
            }]]
          }
        },
        {
          "id": 2,
          "label": "No Email - Use Default",
          "filter": {
            "conditions": [[{
              "a": "{{input.email}}",
              "o": "notExist"
            }]]
          }
        }
      ]
    }
  }
]
```

### Pattern 2: Batch Processing with Iterator
```json
[
  {
    "id": 1,
    "module": "flow.iterator",
    "version": 1,
    "parameters": {
      "array": "{{webhook.items}}"
    }
  },
  {
    "id": 2,
    "module": "flow.sleep",
    "version": 1,
    "parameters": {
      "delay": 1  // Rate limit: 1 second between items
    }
  },
  {
    "id": 3,
    "module": "http.makeRequest",
    "version": 3,
    "parameters": {
      "url": "https://api.example.com/process",
      "method": "POST",
      "body": "{{1.item}}"
    }
  },
  {
    "id": 4,
    "module": "flow.aggregator",
    "version": 1,
    "parameters": {
      "targetStructure": [
        {
          "name": "processedItems",
          "type": "array"
        },
        {
          "name": "totalProcessed",
          "type": "number"
        }
      ]
    }
  }
]
```

### Pattern 3: Error Handling with Recovery
```json
[
  {
    "id": 1,
    "module": "flow.router",
    "version": 1,
    "parameters": {
      "routes": [
        {
          "id": 1,
          "label": "Valid Data",
          "filter": {
            "conditions": [
              [
                {
                  "a": "{{input.email}}",
                  "o": "matches",
                  "b": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                }
              ]
            ]
          }
        },
        {
          "id": 2,
          "label": "Invalid Data",
          "filter": {
            "conditions": [
              [
                {
                  "a": "{{input.email}}",
                  "o": "notMatches",
                  "b": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                }
              ]
            ]
          }
        }
      ]
    }
  },
  {
    "id": 2,
    "module": "flow.throw",
    "version": 1,
    "parameters": {
      "message": "Invalid email format: {{input.email}}",
      "statusCode": 422
    },
    "route": 2
  }
]
```

### Pattern 4: Parallel Processing with Converger
```json
[
  {
    "id": 1,
    "module": "flow.router",
    "version": 1,
    "parameters": {
      "routes": [
        {
          "id": 1,
          "label": "Process Type A"
        },
        {
          "id": 2,
          "label": "Process Type B"
        },
        {
          "id": 3,
          "label": "Process Type C"
        }
      ]
    }
  },
  // ... parallel processing modules ...
  {
    "id": 10,
    "module": "flow.converger",
    "version": 1,
    "parameters": {}
  },
  {
    "id": 11,
    "module": "flow.aggregator",
    "version": 1,
    "parameters": {
      "targetStructure": [
        {
          "name": "combinedResults",
          "type": "collection"
        }
      ]
    }
  }
]
```

## Best Practices

1. **Use Meaningful Route Labels**: Makes debugging easier
   ```json
   {"label": "Customer Exists", "filter": {...}}
   ```

2. **Combine Conditions Logically**: Use AND/OR appropriately
   ```json
   {
     "conditions": [
       [  // OR between arrays
         {"a": "{{status}}", "b": "active", "o": "equal"},
         {"a": "{{status}}", "b": "pending", "o": "equal"}
       ],
       [  // AND within array
         {"a": "{{type}}", "b": "premium", "o": "equal"}
       ]
     ]
   }
   ```

3. **Handle Edge Cases**: Always include fallback routes

4. **Optimize Aggregation**: Set appropriate group-by fields

5. **Limit Sleep Duration**: Maximum 300 seconds, use webhooks for longer waits

## Common Issues

### Issue: Router Not Matching
**Solution**: Check operator logic and data types
```json
{
  "a": "{{parseNumber(value)}}",  // Ensure number comparison
  "b": 100,
  "o": "greater"
}
```

### Issue: Aggregator Missing Data
**Solution**: Ensure all required fields are mapped
```json
{
  "targetStructure": [
    {
      "name": "id",
      "type": "text",
      "required": true  // Mark required fields
    }
  ]
}
```

### Issue: Iterator Performance
**Solution**: Process in batches for large arrays
```json
{
  "array": "{{slice(fullArray; 0; 100)}}"  // Process first 100 items
}
```