import { EdgeAddonsAPIClient } from './src/api-client.js';

/**
 * Example: Upload and publish an Edge extension
 * 
 * This example demonstrates how to use the EdgeAddonsAPIClient
 * programmatically (without the CLI).
 */

async function main() {
  // Initialize the client
  const client = new EdgeAddonsAPIClient({
    clientId: 'your-client-id',
    apiKey: 'your-api-key',
    productId: 'your-product-id',
    apiEndpoint: 'https://api.addons.microsoftedge.microsoft.com' // optional
  });

  try {
    // 1. Upload the package
    console.log('Uploading package...');
    const uploadResult = await client.uploadPackage('./path/to/your-extension.zip');
    console.log('Upload initiated:', uploadResult.operationId);

    // 2. Wait for upload to complete
    console.log('Waiting for upload to complete...');
    const uploadStatus = await client.waitForOperation(
      uploadResult.operationId,
      'upload',
      10, // retry limit
      5   // retry delay in seconds
    );
    
    if (uploadStatus.status !== 'Succeeded') {
      throw new Error(`Upload failed: ${uploadStatus.message}`);
    }
    console.log('Upload completed successfully!');

    // 3. Publish the submission
    console.log('Publishing submission...');
    const publishResult = await client.publishSubmission('Bug fixes and improvements');
    console.log('Publish initiated:', publishResult.operationId);

    // 4. Wait for publish to complete
    console.log('Waiting for publish to complete...');
    const publishStatus = await client.waitForOperation(
      publishResult.operationId,
      'publish',
      20, // retry limit (publishing may take longer)
      10  // retry delay in seconds
    );

    if (publishStatus.status !== 'Succeeded') {
      throw new Error(`Publish failed: ${publishStatus.message}`);
    }
    console.log('Extension published successfully!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Uncomment to run:
// main();

export { main };
