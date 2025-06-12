/**
 * Make.com API Client
 * Handles all interactions with the Make.com API
 */

const axios = require('axios');
const { validateConfig } = require('../utils/validators');

class MakeClient {
  constructor(config) {
    this.config = validateConfig(config);
    this.baseURL = `https://${this.config.zone}/api/v2`;
    this.headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: this.headers,
      timeout: 30000,
    });
  }

  // Scenario Management
  async listScenarios(teamId) {
    const response = await this.client.get('/scenarios', {
      params: { teamId }
    });
    return response.data;
  }

  async getScenario(scenarioId) {
    const response = await this.client.get(`/scenarios/${scenarioId}`);
    return response.data;
  }

  async createScenario(blueprint, teamId) {
    const response = await this.client.post('/scenarios', {
      blueprint,
      teamId,
    });
    return response.data;
  }

  async updateScenario(scenarioId, updates) {
    const response = await this.client.patch(`/scenarios/${scenarioId}`, updates);
    return response.data;
  }

  async deleteScenario(scenarioId) {
    const response = await this.client.delete(`/scenarios/${scenarioId}`);
    return response.data;
  }

  // Execution Management
  async runScenario(scenarioId, data = {}) {
    const response = await this.client.post(`/scenarios/${scenarioId}/run`, { data });
    return response.data;
  }

  async getExecutionHistory(scenarioId, limit = 50) {
    const response = await this.client.get(`/scenarios/${scenarioId}/executions`, {
      params: { limit }
    });
    return response.data;
  }

  // Connection Management
  async listConnections(teamId) {
    const response = await this.client.get('/connections', {
      params: { teamId }
    });
    return response.data;
  }

  async createConnection(connectionData) {
    const response = await this.client.post('/connections', connectionData);
    return response.data;
  }

  // Blueprint Management
  async exportBlueprint(scenarioId) {
    const scenario = await this.getScenario(scenarioId);
    return scenario.blueprint;
  }

  async importBlueprint(blueprint, teamId, name) {
    return this.createScenario({
      ...blueprint,
      name,
    }, teamId);
  }

  // Error handling wrapper
  async _makeRequest(method, endpoint, data = null) {
    try {
      const response = await this.client[method](endpoint, data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Make API Error: ${error.response.status} - ${error.response.data.message}`);
      }
      throw error;
    }
  }
}

module.exports = MakeClient;