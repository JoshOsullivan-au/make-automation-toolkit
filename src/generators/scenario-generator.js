/**
 * Scenario Generator
 * Creates Make.com scenarios from templates
 */

const fs = require('fs').promises;
const path = require('path');
const { validateTemplate } = require('../utils/validators');
const { interpolateVariables } = require('../utils/template-engine');

class ScenarioGenerator {
  constructor(makeClient) {
    this.makeClient = makeClient;
    this.templatesPath = path.join(__dirname, '../../templates');
  }

  /**
   * Generate scenario from template
   * @param {string} templateName - Name of the template
   * @param {object} variables - Variables to replace in template
   * @param {object} options - Additional options
   */
  async fromTemplate(templateName, variables = {}, options = {}) {
    try {
      // Load template
      const templatePath = path.join(this.templatesPath, `${templateName}.json`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = JSON.parse(templateContent);

      // Validate template structure
      validateTemplate(template);

      // Interpolate variables
      const blueprint = interpolateVariables(template, variables);

      // Apply options
      if (options.scheduling) {
        blueprint.scheduling = options.scheduling;
      }

      if (options.teamId) {
        blueprint.teamId = options.teamId;
      }

      // Generate unique IDs for modules
      blueprint.modules = this._regenerateModuleIds(blueprint.modules);

      // Create scenario if makeClient is available
      if (this.makeClient && options.deploy) {
        const scenario = await this.makeClient.createScenario(
          blueprint,
          options.teamId
        );
        return scenario;
      }

      return blueprint;
    } catch (error) {
      throw new Error(`Failed to generate scenario from template: ${error.message}`);
    }
  }

  /**
   * Generate multiple scenarios from a batch configuration
   * @param {array} batchConfig - Array of scenario configurations
   */
  async batchGenerate(batchConfig) {
    const results = [];
    
    for (const config of batchConfig) {
      try {
        const scenario = await this.fromTemplate(
          config.template,
          config.variables,
          config.options
        );
        results.push({
          success: true,
          name: config.name,
          scenario
        });
      } catch (error) {
        results.push({
          success: false,
          name: config.name,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Clone existing scenario with modifications
   * @param {string} scenarioId - ID of scenario to clone
   * @param {object} modifications - Changes to apply
   */
  async cloneScenario(scenarioId, modifications = {}) {
    try {
      // Export blueprint from existing scenario
      const blueprint = await this.makeClient.exportBlueprint(scenarioId);

      // Apply modifications
      const modifiedBlueprint = {
        ...blueprint,
        ...modifications,
        name: modifications.name || `${blueprint.name} (Clone)`,
      };

      // Regenerate module IDs to avoid conflicts
      modifiedBlueprint.modules = this._regenerateModuleIds(modifiedBlueprint.modules);

      return modifiedBlueprint;
    } catch (error) {
      throw new Error(`Failed to clone scenario: ${error.message}`);
    }
  }

  /**
   * List available templates
   */
  async listTemplates() {
    try {
      const files = await fs.readdir(this.templatesPath);
      const templates = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(
            path.join(this.templatesPath, file),
            'utf8'
          );
          const template = JSON.parse(content);
          
          templates.push({
            name: file.replace('.json', ''),
            description: template.description || 'No description',
            modules: template.modules?.length || 0,
            variables: this._extractVariables(template)
          });
        }
      }

      return templates;
    } catch (error) {
      throw new Error(`Failed to list templates: ${error.message}`);
    }
  }

  /**
   * Save blueprint as template
   * @param {string} name - Template name
   * @param {object} blueprint - Scenario blueprint
   */
  async saveAsTemplate(name, blueprint) {
    try {
      const templatePath = path.join(this.templatesPath, `${name}.json`);
      await fs.writeFile(
        templatePath,
        JSON.stringify(blueprint, null, 2),
        'utf8'
      );
      return templatePath;
    } catch (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }
  }

  /**
   * Regenerate module IDs to avoid conflicts
   * @private
   */
  _regenerateModuleIds(modules) {
    const idMap = new Map();
    
    return modules.map((module, index) => {
      const newId = index + 1;
      idMap.set(module.id, newId);
      
      return {
        ...module,
        id: newId,
        connections: module.connections?.map(conn => ({
          ...conn,
          module: idMap.get(conn.module) || conn.module
        }))
      };
    });
  }

  /**
   * Extract variables from template
   * @private
   */
  _extractVariables(template) {
    const variables = new Set();
    const regex = /{{(\w+)}}/g;
    
    const extractFromObject = (obj) => {
      if (typeof obj === 'string') {
        let match;
        while ((match = regex.exec(obj)) !== null) {
          variables.add(match[1]);
        }
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(extractFromObject);
      }
    };

    extractFromObject(template);
    return Array.from(variables);
  }
}

module.exports = ScenarioGenerator;