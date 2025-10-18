import chalk from 'chalk';
import ora from 'ora';
import { EdgeAddonsAPIClient } from '../api-client.js';
import { getConfig, validateConfig } from '../config.js';

/**
 * Publish command handler
 */
export async function publishCommand(options) {
  const spinner = ora('Initiating publish...').start();

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

    // Publish submission
    const publishResult = await client.publishSubmission(options.notes || '');

    spinner.succeed(chalk.green('Publish initiated successfully!'));
    console.log(chalk.cyan('Operation ID:'), publishResult.operationId);

    if (options.notes) {
      console.log(chalk.cyan('Notes:'), options.notes);
    }

    console.log(chalk.yellow('\nℹ To check publish status, run:'));
    console.log(chalk.cyan(`  npm start publish-status ${publishResult.operationId}`));
  } catch (error) {
    spinner.fail(chalk.red('Publish failed!'));
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
