import chalk from 'chalk';
import ora from 'ora';
import { EdgeAddonsAPIClient } from '../api-client.js';
import { getConfig, validateConfig } from '../config.js';

/**
 * Complete workflow command handler
 * Uploads, waits for completion, publishes, and waits for publish completion
 */
export async function workflowCommand(zipFilePath, options) {
  let spinner = ora('Starting workflow...').start();

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
    const retryLimit = options.retryLimit || 10;
    const retryDelay = options.retryDelay || 5;

    // Step 1: Upload package
    spinner.text = 'Uploading package...';
    const uploadResult = await client.uploadPackage(zipFilePath);
    spinner.succeed(chalk.green('Package uploaded successfully!'));
    console.log(chalk.cyan('Upload Operation ID:'), uploadResult.operationId);

    // Step 2: Wait for upload to complete
    spinner = ora('Waiting for upload to complete...').start();
    const uploadStatus = await client.waitForOperation(
      uploadResult.operationId,
      'upload',
      retryLimit,
      retryDelay
    );

    if (uploadStatus.status !== 'Succeeded') {
      spinner.fail(chalk.red('Upload failed!'));
      console.log(chalk.red('Error:'), uploadStatus.message);
      console.log(chalk.gray('Details:'), JSON.stringify(uploadStatus.data, null, 2));
      process.exit(1);
    }

    spinner.succeed(chalk.green('Upload completed successfully!'));

    // Step 3: Publish submission
    spinner = ora('Publishing submission...').start();
    const publishResult = await client.publishSubmission(options.notes || '');
    spinner.succeed(chalk.green('Publish initiated successfully!'));
    console.log(chalk.cyan('Publish Operation ID:'), publishResult.operationId);

    // Step 4: Wait for publish to complete
    spinner = ora('Waiting for publish to complete...').start();
    const publishStatus = await client.waitForOperation(
      publishResult.operationId,
      'publish',
      retryLimit,
      retryDelay
    );

    if (publishStatus.status === 'Succeeded') {
      spinner.succeed(chalk.green('Extension published successfully!'));
      console.log(chalk.cyan('\n🎉 Workflow completed!'));
      console.log(chalk.cyan('Your extension is now live on the Microsoft Edge Add-ons store.'));
    } else if (publishStatus.status === 'Failed') {
      spinner.fail(chalk.red('Publishing failed!'));
      console.log(chalk.red('Error:'), publishStatus.message);
      console.log(chalk.gray('Details:'), JSON.stringify(publishStatus.data, null, 2));
      process.exit(1);
    } else {
      spinner.warn(chalk.yellow(`Publishing status: ${publishStatus.status}`));
      console.log(chalk.yellow('\n⚠️  Workflow completed with warnings'));
      console.log(chalk.gray('Details:'), JSON.stringify(publishStatus.data, null, 2));
    }
  } catch (error) {
    spinner.fail(chalk.red('Workflow failed!'));
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
