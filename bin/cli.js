#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { uploadCommand } from '../src/commands/upload.js';
import { uploadStatusCommand } from '../src/commands/upload-status.js';
import { publishCommand } from '../src/commands/publish.js';
import { publishStatusCommand } from '../src/commands/publish-status.js';
import { workflowCommand } from '../src/commands/workflow.js';

const program = new Command();

program
  .name('edge-upload')
  .description('CLI tool to upload and publish Microsoft Edge extensions')
  .version('1.0.0');

// Global options
program
  .option('--client-id <id>', 'Edge Add-ons API Client ID')
  .option('--api-key <key>', 'Edge Add-ons API Key')
  .option('--product-id <id>', 'Extension Product ID')
  .option('--endpoint <url>', 'API endpoint URL');

// Upload command
program
  .command('upload')
  .description('Upload a package to update an existing submission')
  .argument('<zipFile>', 'Path to the .zip package file')
  .option('-w, --wait', 'Wait for upload to complete')
  .option('--retry-limit <number>', 'Maximum retries for status checks (default: 10)', parseInt)
  .option('--retry-delay <seconds>', 'Delay between retries in seconds (default: 5)', parseInt)
  .action(async (zipFile, options) => {
    await uploadCommand(zipFile, { ...program.opts(), ...options });
  });

// Upload status command
program
  .command('upload-status')
  .description('Check the status of a package upload')
  .argument('<operationId>', 'Operation ID from upload response')
  .action(async (operationId, options) => {
    await uploadStatusCommand(operationId, { ...program.opts(), ...options });
  });

// Publish command
program
  .command('publish')
  .description('Publish the current draft submission')
  .option('-n, --notes <text>', 'Notes for certification team')
  .action(async (options) => {
    await publishCommand({ ...program.opts(), ...options });
  });

// Publish status command
program
  .command('publish-status')
  .description('Check the publishing status')
  .argument('<operationId>', 'Operation ID from publish response')
  .action(async (operationId, options) => {
    await publishStatusCommand(operationId, { ...program.opts(), ...options });
  });

// Workflow command (complete automation)
program
  .command('workflow')
  .description('Complete workflow: upload, wait, publish, and wait for completion')
  .argument('<zipFile>', 'Path to the .zip package file')
  .option('-n, --notes <text>', 'Notes for certification team')
  .option('--retry-limit <number>', 'Maximum retries for status checks (default: 10)', parseInt)
  .option('--retry-delay <seconds>', 'Delay between retries in seconds (default: 5)', parseInt)
  .action(async (zipFile, options) => {
    await workflowCommand(zipFile, { ...program.opts(), ...options });
  });

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

// Parse arguments
program.parse(process.argv);
