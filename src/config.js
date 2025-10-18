import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Get configuration from environment variables
 * @param {object} overrides - Optional overrides for config values
 * @returns {object} Configuration object
 */
export function getConfig(overrides = {}) {
  const config = {
    clientId: overrides.clientId || process.env.CLIENT_ID,
    apiKey: overrides.apiKey || process.env.API_KEY,
    productId: overrides.productId || process.env.PRODUCT_ID,
    apiEndpoint: overrides.apiEndpoint || process.env.API_ENDPOINT || 'https://api.addons.microsoftedge.microsoft.com',
  };

  return config;
}

/**
 * Validate that required configuration is present
 * @param {object} config - Configuration object
 * @throws {Error} If required configuration is missing
 */
export function validateConfig(config) {
  const required = ['clientId', 'apiKey', 'productId'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration: ${missing.join(', ')}.\n` +
      'Please set these in your .env file or provide them via command-line options.'
    );
  }
}
