import chalk from 'chalk';
import ora from 'ora';
import { EdgeAddonsAPIClient } from '../api-client.js';
import { getConfig, validateConfig } from '../config.js';

/**
 * Upload command handler
 */
export async function uploadCommand(zipFilePath, options) {
  const spinner = ora('Initializing upload...').start();

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

    // Upload package
    spinner.text = 'Uploading package...';
    const uploadResult = await client.uploadPackage(zipFilePath);

    spinner.succeed(chalk.green('Package uploaded successfully!'));
    console.log(chalk.cyan('Operation ID:'), uploadResult.operationId);

    // Wait for upload completion if requested
    if (options.wait) {
      spinner.start('Waiting for upload to complete...');
      
      const statusResult = await client.waitForOperation(
        uploadResult.operationId,
        'upload',
        options.retryLimit || 10,
        options.retryDelay || 5
      );

      if (statusResult.status === 'Succeeded') {
        spinner.succeed(chalk.green('Upload completed successfully!'));
      } else if (statusResult.status === 'Failed') {
        spinner.fail(chalk.red('Upload failed!'));
        console.log(chalk.red('Error:'), statusResult.message);
        console.log(chalk.gray('Details:'), JSON.stringify(statusResult.data, null, 2));
        process.exit(1);
      } else {
        spinner.warn(chalk.yellow(`Upload status: ${statusResult.status}`));
        console.log(chalk.gray('Details:'), JSON.stringify(statusResult.data, null, 2));
      }
    } else {
      console.log(chalk.yellow('\nℹ To check upload status, run:'));
      console.log(chalk.cyan(`  npm start upload-status ${uploadResult.operationId}`));
    }
  } catch (error) {
    spinner.fail(chalk.red('Upload failed!'));
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
