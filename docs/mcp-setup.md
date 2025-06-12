# Setting Up Make.com MCP with Claude Desktop

This guide walks you through integrating Make.com scenarios with Claude Desktop using the Model Context Protocol (MCP).

## Prerequisites

- Claude Desktop installed on your machine
- Make.com account with at least one scenario
- Node.js installed (for running the mcp-remote proxy)
- Administrator access to your Claude Desktop configuration

## Step 1: Prepare Your Make.com Scenarios

1. Log into Make.com and navigate to your scenarios
2. Select a scenario you want to make available to Claude
3. Edit the scenario settings:
   - Set scheduling to **"On Demand"** (this is critical - only on-demand scenarios are exposed via MCP)
   - Add a detailed description explaining what the scenario does
   - Configure Input parameters if your scenario needs data from Claude
   - Configure Output parameters to return data back to Claude

## Step 2: Generate Your MCP Token

1. Navigate to your Make.com profile:
   - Click your profile icon in the top right
   - Select "Profile"

2. Generate MCP Token:
   - Look for the MCP Token section
   - Click "Generate MCP Token"
   - Copy and securely store this token (you'll need it for configuration)

## Step 3: Identify Your Make Zone

Your Make zone is part of your Make.com URL:
- If your Make URL is `https://eu1.make.com`, your zone is `eu1.make.com`
- If your Make URL is `https://eu2.make.com`, your zone is `eu2.make.com`
- Common zones: `eu1.make.com`, `eu2.make.com`, `us1.make.com`

## Step 4: Configure Claude Desktop

Since Claude Desktop doesn't support SSE (Server-Sent Events), you'll use the Cloudflare mcp-remote proxy.

1. Locate Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Edit the configuration file (create it if it doesn't exist):

```json
{
  "mcpServers": {
    "make": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://YOUR_ZONE/mcp/api/v1/u/YOUR_MCP_TOKEN/sse"
      ]
    }
  }
}
```

3. Replace placeholders:
   - Replace `YOUR_ZONE` with your Make zone (e.g., `eu2.make.com`)
   - Replace `YOUR_MCP_TOKEN` with your generated token

Example with real values:
```json
{
  "mcpServers": {
    "make": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://eu2.make.com/mcp/api/v1/u/93dc8837-2911-4711-a766-59c1167a974d/sse"
      ]
    }
  }
}
```

## Step 5: Apply Access Controls (Optional)

To restrict which scenarios Claude can access, append query parameters to your MCP URL:

### Organization-level Access:
```json
"https://eu2.make.com/mcp/api/v1/u/YOUR_TOKEN/sse?organizationId=12345"
```

### Team-level Access:
```json
"https://eu2.make.com/mcp/api/v1/u/YOUR_TOKEN/sse?teamId=35"
```

### Specific Scenario Access:
```json
"https://eu2.make.com/mcp/api/v1/u/YOUR_TOKEN/sse?scenarioId=98765"
```

### Multiple Scenarios:
```json
"https://eu2.make.com/mcp/api/v1/u/YOUR_TOKEN/sse?scenarioId[]=123&scenarioId[]=456"
```

## Step 6: Restart Claude Desktop

1. Completely quit Claude Desktop (not just close the window)
2. Restart Claude Desktop
3. The MCP server should now be active

## Step 7: Verify the Connection

1. In Claude Desktop, you should see the Make MCP server listed when you:
   - Click the 🔌 icon in the text input area
   - Look for "make" in the list of available tools

2. Test the integration:
   - Ask Claude: "What Make.com scenarios are available?"
   - Claude should list your on-demand scenarios

## Step 8: Configure Scenario Inputs/Outputs

For optimal functionality, configure your Make scenarios with clear inputs and outputs:

### In Make.com:
1. Open your scenario
2. Add a Webhook module as the first module (if using inputs)
3. Configure Data Structure:
   - Define expected input parameters
   - Set data types and descriptions

4. Add a Webhook Response module at the end (for outputs)
5. Configure response structure:
   - Define what data to return to Claude
   - Format as JSON

### Example Scenario Configuration:

**Input Structure:**
```json
{
  "customer_email": "string",
  "order_id": "string",
  "action": "string"
}
```

**Output Structure:**
```json
{
  "success": true,
  "message": "Order processed successfully",
  "data": {
    "order_status": "completed",
    "tracking_number": "ABC123"
  }
}
```

## Step 9: Advanced Configuration

### Customize Tool Name Length:
Add `maxToolNameLength` parameter:
```json
"https://eu2.make.com/mcp/api/v1/u/YOUR_TOKEN/sse?maxToolNameLength=80"
```

### Combine Parameters:
```json
"https://eu2.make.com/mcp/api/v1/u/YOUR_TOKEN/sse?teamId=35&maxToolNameLength=100"
```

## Troubleshooting

### Common Issues:

1. **"No Make scenarios found"**
   - Ensure scenarios are set to "On Demand" scheduling
   - Check your MCP token is valid
   - Verify the zone URL is correct

2. **Connection errors**
   - Ensure Node.js is installed (`node --version`)
   - Check internet connectivity
   - Verify Claude Desktop config file syntax

3. **Scenarios not executing**
   - Check scenario is active (not paused)
   - Verify input parameters match expected structure
   - Check Make.com execution logs

### Debug Commands:
Test your MCP URL directly:
```bash
curl -H "Accept: text/event-stream" \
     "https://YOUR_ZONE/mcp/api/v1/u/YOUR_TOKEN/sse"
```

## Best Practices

1. **Scenario Naming**: Use clear, descriptive names (they become tool names in Claude)
2. **Descriptions**: Write detailed descriptions - this helps Claude understand when to use each scenario
3. **Error Handling**: Add error handlers in your Make scenarios
4. **Testing**: Test scenarios manually in Make before exposing via MCP
5. **Security**: Use team/scenario-level restrictions for sensitive workflows
6. **Documentation**: Document expected inputs/outputs for each scenario

## Example Use Cases

Once configured, you can ask Claude to:

- "Run the customer onboarding workflow for john@example.com"
- "Process the daily sales report using my Make automation"
- "Trigger the inventory check scenario for product SKU-123"
- "Execute my email campaign workflow with these recipients"

Claude will automatically identify the appropriate Make scenario and execute it with the provided parameters.

## Additional Resources

- [Make.com API Documentation](https://developers.make.com/api-documentation)
- [Make.com MCP Server Documentation](https://developers.make.com/mcp-server)
- [Claude Desktop Documentation](https://claude.ai/docs)

---

Need help? Check the [Troubleshooting Guide](./troubleshooting.md) or open an issue in the repository.