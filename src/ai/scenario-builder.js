/**
 * AI-Powered Scenario Builder
 * Generates Make.com scenarios from natural language descriptions
 */

const { OpenAI } = require('openai');
const { validateBlueprint } = require('../utils/validators');

class AIScenarioBuilder {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: config.openaiKey || process.env.OPENAI_API_KEY,
    });
    
    this.systemPrompt = this._buildSystemPrompt();
  }

  /**
   * Generate scenario from natural language description
   * @param {string} description - Natural language workflow description
   * @param {object} context - Additional context (available modules, connections, etc.)
   */
  async generate(description, context = {}) {
    try {
      const prompt = this._buildPrompt(description, context);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      });

      const responseText = completion.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const blueprint = JSON.parse(jsonMatch[0]);
      
      // Validate the generated blueprint
      validateBlueprint(blueprint);

      return {
        blueprint,
        description: this._extractDescription(responseText),
        confidence: this._calculateConfidence(blueprint, description)
      };
    } catch (error) {
      throw new Error(`AI scenario generation failed: ${error.message}`);
    }
  }

  /**
   * Refine existing scenario based on feedback
   * @param {object} blueprint - Current scenario blueprint
   * @param {string} feedback - User feedback for refinement
   */
  async refine(blueprint, feedback) {
    try {
      const prompt = `
        Current scenario blueprint:
        ${JSON.stringify(blueprint, null, 2)}
        
        User feedback: ${feedback}
        
        Please modify the blueprint based on the feedback while maintaining valid Make.com structure.
      `;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      });

      const responseText = completion.choices[0].message.content;
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in refinement response');
      }

      const refinedBlueprint = JSON.parse(jsonMatch[0]);
      validateBlueprint(refinedBlueprint);

      return refinedBlueprint;
    } catch (error) {
      throw new Error(`Scenario refinement failed: ${error.message}`);
    }
  }

  /**
   * Analyze scenario and suggest optimizations
   * @param {object} blueprint - Scenario blueprint to analyze
   */
  async optimize(blueprint) {
    const analysis = {
      performance: this._analyzePerformance(blueprint),
      cost: this._analyzeCost(blueprint),
      reliability: this._analyzeReliability(blueprint),
      suggestions: []
    };

    // Generate AI-powered suggestions
    const prompt = `
      Analyze this Make.com scenario and suggest optimizations:
      ${JSON.stringify(blueprint, null, 2)}
      
      Consider: performance, cost efficiency, error handling, and maintainability.
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Make.com optimization expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    analysis.suggestions = this._parseSuggestions(completion.choices[0].message.content);
    
    return analysis;
  }

  /**
   * Build system prompt for AI
   * @private
   */
  _buildSystemPrompt() {
    return `You are a Make.com scenario generation expert. Your task is to convert natural language workflow descriptions into valid Make.com JSON blueprints.

Rules:
1. Generate ONLY valid JSON that follows Make.com scenario structure version 2
2. Use correct module names (e.g., "google-sheets.searchRows", "http.makeRequest")
3. Include proper metadata block with version: 2
4. Create logical connections between modules
5. Use template variables in format {{variableName}}
6. Include error handling where appropriate
7. Ensure all required parameters are included

Your response must include a valid JSON blueprint that can be imported directly into Make.com.`;
  }

  /**
   * Build user prompt with context
   * @private
   */
  _buildPrompt(description, context) {
    let prompt = `Create a Make.com scenario for: ${description}\n\n`;
    
    if (context.availableConnections) {
      prompt += `Available connections: ${context.availableConnections.join(', ')}\n`;
    }
    
    if (context.constraints) {
      prompt += `Constraints: ${JSON.stringify(context.constraints)}\n`;
    }
    
    if (context.examples) {
      prompt += `Similar examples: ${JSON.stringify(context.examples)}\n`;
    }
    
    return prompt;
  }

  /**
   * Extract description from AI response
   * @private
   */
  _extractDescription(responseText) {
    const lines = responseText.split('\n');
    for (const line of lines) {
      if (line.includes('description') || line.includes('This scenario')) {
        return line.trim();
      }
    }
    return 'AI-generated scenario';
  }

  /**
   * Calculate confidence score
   * @private
   */
  _calculateConfidence(blueprint, description) {
    let score = 0.5; // Base score
    
    // Check if all mentioned services are included
    const services = this._extractServices(description);
    const blueprintServices = blueprint.modules?.map(m => m.module.split('.')[0]) || [];
    
    const coverage = services.filter(s => 
      blueprintServices.some(bs => bs.includes(s))
    ).length / services.length;
    
    score += coverage * 0.3;
    
    // Check for error handling
    if (blueprint.modules?.some(m => m.module.includes('error'))) {
      score += 0.1;
    }
    
    // Check for proper connections
    if (blueprint.modules?.every(m => m.connections?.length > 0 || m.id === 1)) {
      score += 0.1;
    }
    
    return Math.min(score, 1);
  }

  /**
   * Extract service names from description
   * @private
   */
  _extractServices(description) {
    const services = [];
    const servicePatterns = [
      /google\s?sheets?/gi,
      /slack/gi,
      /salesforce/gi,
      /hubspot/gi,
      /gmail/gi,
      /outlook/gi,
      /trello/gi,
      /asana/gi,
      /notion/gi,
      /airtable/gi,
    ];
    
    servicePatterns.forEach(pattern => {
      if (pattern.test(description)) {
        services.push(pattern.source.replace(/[\\^$.*+?()\[\]{}|]/g, ''));
      }
    });
    
    return services;
  }

  /**
   * Analyze performance characteristics
   * @private
   */
  _analyzePerformance(blueprint) {
    const analysis = {
      estimatedDuration: 0,
      bottlenecks: [],
      parallelizable: []
    };
    
    // Simple heuristics for performance analysis
    blueprint.modules?.forEach(module => {
      if (module.module.includes('search') || module.module.includes('list')) {
        analysis.estimatedDuration += 2;
        analysis.bottlenecks.push(module.id);
      } else if (module.module.includes('http')) {
        analysis.estimatedDuration += 1;
      } else {
        analysis.estimatedDuration += 0.5;
      }
    });
    
    return analysis;
  }

  /**
   * Analyze cost implications
   * @private
   */
  _analyzeCost(blueprint) {
    const operationsPerRun = blueprint.modules?.length || 0;
    const estimatedMonthlyRuns = 1000; // Default estimate
    
    return {
      operationsPerRun,
      estimatedMonthlyOperations: operationsPerRun * estimatedMonthlyRuns,
      tier: operationsPerRun * estimatedMonthlyRuns > 10000 ? 'Pro' : 'Basic'
    };
  }

  /**
   * Analyze reliability aspects
   * @private
   */
  _analyzeReliability(blueprint) {
    return {
      hasErrorHandling: blueprint.modules?.some(m => 
        m.module.includes('error') || m.module.includes('router')
      ),
      hasRetryLogic: blueprint.modules?.some(m => 
        m.parameters?.retry === true
      ),
      criticalPoints: blueprint.modules?.filter(m => 
        m.module.includes('http') || m.module.includes('api')
      ).map(m => m.id)
    };
  }

  /**
   * Parse suggestions from AI response
   * @private
   */
  _parseSuggestions(response) {
    const suggestions = [];
    const lines = response.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^\d+\.|^-|^\*/)) {
        suggestions.push(line.replace(/^[\d.\-*\s]+/, '').trim());
      }
    });
    
    return suggestions;
  }
}

module.exports = AIScenarioBuilder;