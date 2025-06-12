/**
 * Scenario Monitor
 * Monitors and manages scenario health and performance
 */

const EventEmitter = require('events');

class ScenarioMonitor extends EventEmitter {
  constructor(makeClient, options = {}) {
    super();
    this.makeClient = makeClient;
    this.options = {
      checkInterval: options.checkInterval || 300000, // 5 minutes
      retryAttempts: options.retryAttempts || 3,
      alertThreshold: options.alertThreshold || 0.8, // 80% failure rate
      ...options
    };
    
    this.monitoredScenarios = new Map();
    this.healthData = new Map();
    this.isRunning = false;
  }

  /**
   * Start monitoring scenarios
   */
  start() {
    if (this.isRunning) {
      console.log('Monitor already running');
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.checkAllScenarios();
    }, this.options.checkInterval);

    // Initial check
    this.checkAllScenarios();
    
    this.emit('started');
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    clearInterval(this.intervalId);
    this.isRunning = false;
    this.emit('stopped');
  }

  /**
   * Add scenario to monitoring
   * @param {string} scenarioId - Scenario ID
   * @param {object} config - Monitoring configuration
   */
  addScenario(scenarioId, config = {}) {
    this.monitoredScenarios.set(scenarioId, {
      ...config,
      addedAt: new Date(),
      lastCheck: null
    });
    
    this.emit('scenarioAdded', scenarioId);
  }

  /**
   * Remove scenario from monitoring
   * @param {string} scenarioId - Scenario ID
   */
  removeScenario(scenarioId) {
    this.monitoredScenarios.delete(scenarioId);
    this.healthData.delete(scenarioId);
    
    this.emit('scenarioRemoved', scenarioId);
  }

  /**
   * Check all monitored scenarios
   * @private
   */
  async checkAllScenarios() {
    const checks = [];
    
    for (const [scenarioId, config] of this.monitoredScenarios) {
      checks.push(this.checkScenario(scenarioId, config));
    }
    
    await Promise.allSettled(checks);
  }

  /**
   * Check individual scenario health
   * @param {string} scenarioId - Scenario ID
   * @param {object} config - Scenario configuration
   * @private
   */
  async checkScenario(scenarioId, config) {
    try {
      // Get scenario details
      const scenario = await this.makeClient.getScenario(scenarioId);
      
      // Get execution history
      const history = await this.makeClient.getExecutionHistory(scenarioId, 50);
      
      // Calculate health metrics
      const health = this.calculateHealth(history, scenario);
      
      // Store health data
      this.healthData.set(scenarioId, {
        ...health,
        lastCheck: new Date(),
        scenario: {
          name: scenario.name,
          status: scenario.status
        }
      });
      
      // Update monitoring config
      this.monitoredScenarios.set(scenarioId, {
        ...config,
        lastCheck: new Date()
      });
      
      // Check for issues
      if (health.failureRate > this.options.alertThreshold) {
        this.handleHighFailureRate(scenarioId, health);
      }
      
      if (scenario.status !== 'active' && config.autoRestart) {
        this.handleInactiveScenario(scenarioId, scenario);
      }
      
      this.emit('healthCheck', scenarioId, health);
      
    } catch (error) {
      this.emit('checkError', scenarioId, error);
    }
  }

  /**
   * Calculate health metrics from execution history
   * @private
   */
  calculateHealth(history, scenario) {
    const executions = history.executions || [];
    const total = executions.length;
    
    if (total === 0) {
      return {
        failureRate: 0,
        successRate: 1,
        averageDuration: 0,
        lastExecution: null,
        totalExecutions: 0
      };
    }
    
    const failures = executions.filter(e => e.status === 'failed').length;
    const totalDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0);
    
    return {
      failureRate: failures / total,
      successRate: (total - failures) / total,
      averageDuration: totalDuration / total,
      lastExecution: executions[0]?.createdAt,
      totalExecutions: total,
      recentFailures: executions.slice(0, 10).filter(e => e.status === 'failed').length
    };
  }

  /**
   * Handle scenarios with high failure rates
   * @private
   */
  async handleHighFailureRate(scenarioId, health) {
    this.emit('alert', {
      type: 'highFailureRate',
      scenarioId,
      health,
      message: `Scenario has ${(health.failureRate * 100).toFixed(1)}% failure rate`
    });
    
    const config = this.monitoredScenarios.get(scenarioId);
    
    if (config.autoHeal) {
      // Attempt to heal the scenario
      await this.attemptHeal(scenarioId, health);
    }
  }

  /**
   * Handle inactive scenarios
   * @private
   */
  async handleInactiveScenario(scenarioId, scenario) {
    this.emit('alert', {
      type: 'inactiveScenario',
      scenarioId,
      scenario,
      message: `Scenario is ${scenario.status}`
    });
    
    const config = this.monitoredScenarios.get(scenarioId);
    
    if (config.autoRestart && scenario.status === 'stopped') {
      try {
        await this.makeClient.updateScenario(scenarioId, { status: 'active' });
        this.emit('scenarioRestarted', scenarioId);
      } catch (error) {
        this.emit('restartFailed', scenarioId, error);
      }
    }
  }

  /**
   * Attempt to heal a failing scenario
   * @private
   */
  async attemptHeal(scenarioId, health) {
    try {
      // Get recent failures
      const history = await this.makeClient.getExecutionHistory(scenarioId, 10);
      const failures = history.executions.filter(e => e.status === 'failed');
      
      // Analyze failure patterns
      const errorPatterns = this.analyzeErrors(failures);
      
      // Apply healing strategies based on patterns
      if (errorPatterns.connectionErrors > 0.5) {
        // Connection issues - try to refresh connections
        this.emit('healing', scenarioId, 'Refreshing connections');
        // Implementation would refresh OAuth tokens, API keys, etc.
      }
      
      if (errorPatterns.rateLimit > 0.5) {
        // Rate limiting issues - adjust scheduling
        this.emit('healing', scenarioId, 'Adjusting schedule for rate limits');
        await this.makeClient.updateScenario(scenarioId, {
          scheduling: { interval: 60 } // Slow down to 1 hour
        });
      }
      
      this.emit('healingComplete', scenarioId);
      
    } catch (error) {
      this.emit('healingFailed', scenarioId, error);
    }
  }

  /**
   * Analyze error patterns
   * @private
   */
  analyzeErrors(failures) {
    const patterns = {
      connectionErrors: 0,
      rateLimit: 0,
      timeout: 0,
      other: 0
    };
    
    failures.forEach(failure => {
      const error = failure.error?.message || '';
      
      if (error.includes('connection') || error.includes('auth')) {
        patterns.connectionErrors++;
      } else if (error.includes('rate') || error.includes('limit')) {
        patterns.rateLimit++;
      } else if (error.includes('timeout')) {
        patterns.timeout++;
      } else {
        patterns.other++;
      }
    });
    
    const total = failures.length || 1;
    
    return {
      connectionErrors: patterns.connectionErrors / total,
      rateLimit: patterns.rateLimit / total,
      timeout: patterns.timeout / total,
      other: patterns.other / total
    };
  }

  /**
   * Get health report for all scenarios
   */
  getHealthReport() {
    const report = {
      timestamp: new Date(),
      totalScenarios: this.monitoredScenarios.size,
      scenarios: []
    };
    
    for (const [scenarioId, health] of this.healthData) {
      report.scenarios.push({
        scenarioId,
        ...health
      });
    }
    
    // Calculate aggregate metrics
    if (report.scenarios.length > 0) {
      report.aggregate = {
        averageFailureRate: report.scenarios.reduce((sum, s) => sum + s.failureRate, 0) / report.scenarios.length,
        totalExecutions: report.scenarios.reduce((sum, s) => sum + s.totalExecutions, 0),
        unhealthyScenarios: report.scenarios.filter(s => s.failureRate > this.options.alertThreshold).length
      };
    }
    
    return report;
  }
}

module.exports = ScenarioMonitor;