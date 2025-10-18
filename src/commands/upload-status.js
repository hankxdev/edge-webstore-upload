import chalk from 'chalk';
import ora from 'ora';
import { EdgeAddonsAPIClient } from '../api-client.js';
import { getConfig, validateConfig } from '../config.js';

/**
 * Upload status command handler
 */
export async function uploadStatusCommand(operationId, options) {
  const spinner = ora('Checking upload status...').start();

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
    const result = await client.checkUploadStatus(operationId);

    spinner.stop();

    // Display status
    console.log(chalk.cyan('\n📊 Upload Status:'), chalk.bold(result.status));
    console.log(chalk.cyan('Message:'), result.message);
    
    if (result.data) {
      console.log(chalk.cyan('\nDetails:'));
      console.log(JSON.stringify(result.data, null, 2));
    }

    // Status-specific messages
    if (result.status === 'InProgress') {
      console.log(chalk.yellow('\n⏳ Upload is still in progress. Check again in a few moments.'));
    } else if (result.status === 'Succeeded') {
      console.log(chalk.green('\n✅ Upload completed successfully!'));
      console.log(chalk.yellow('\nℹ To publish this submission, run:'));
      console.log(chalk.cyan('  npm start publish'));
    } else if (result.status === 'Failed') {
      console.log(chalk.red('\n❌ Upload failed!'));
      process.exit(1);
    }
  } catch (error) {
    spinner.fail(chalk.red('Status check failed!'));
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
