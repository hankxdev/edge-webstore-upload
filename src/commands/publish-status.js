import chalk from 'chalk';
import ora from 'ora';
import { EdgeAddonsAPIClient } from '../api-client.js';
import { getConfig, validateConfig } from '../config.js';

/**
 * Publish status command handler
 */
export async function publishStatusCommand(operationId, options) {
  const spinner = ora('Checking publish status...').start();

  try {
    // Get configuration
    const config = getConfig({
      clientId: options.clientId,
      apiKey: options.apiKey,
      productId: options.productId,
      apiEndpoint: options.endpoint,
    });

    validateConfig(config);

    // Create API client
    const client = new EdgeAddonsAPIClient(config);

    // Check status
    const result = await client.checkPublishStatus(operationId);

    spinner.stop();

    // Display status
    console.log(chalk.cyan('\n📊 Publish Status:'), chalk.bold(result.status));
    console.log(chalk.cyan('Message:'), result.message);
    
    if (result.data) {
      console.log(chalk.cyan('\nDetails:'));
      console.log(JSON.stringify(result.data, null, 2));
    }

    // Status-specific messages
    if (result.status === 'InProgress') {
      console.log(chalk.yellow('\n⏳ Publishing is in progress. This may take some time.'));
    } else if (result.status === 'Succeeded') {
      console.log(chalk.green('\n✅ Submission accepted, waiting for review.'));
      console.log(chalk.cyan('Your extension submission is waiting for review by the Microsoft Edge Add-ons team.'));
    } else if (result.status === 'Failed') {
      console.log(chalk.red('\n❌ Publishing failed!'));
      process.exit(1);
    }
  } catch (error) {
    spinner.fail(chalk.red('Status check failed!'));
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
