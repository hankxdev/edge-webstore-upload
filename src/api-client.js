import axios from 'axios';
import fs from 'fs';

/**
 * Client for Microsoft Edge Add-ons API v1.1
 */
export class EdgeAddonsAPIClient {
  constructor({ clientId, apiKey, productId, apiEndpoint = 'https://api.addons.microsoftedge.microsoft.com' }) {
    if (!clientId || !apiKey || !productId) {
      throw new Error('clientId, apiKey, and productId are required');
    }

    this.clientId = clientId;
    this.apiKey = apiKey;
    this.productId = productId;
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Get common headers for API requests
   */
  getHeaders(contentType = 'application/json') {
    return {
      'Authorization': `ApiKey ${this.apiKey}`,
      'X-ClientID': this.clientId,
      'Content-Type': contentType,
    };
  }

  /**
   * Extract operation ID from Location header
   */
  extractOperationId(locationHeader) {
    if (!locationHeader) {
      throw new Error('Location header not found in response');
    }
    // Location header format: /v1/products/{productId}/submissions/draft/package/operations/{operationId}
    const parts = locationHeader.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Upload a package to update an existing submission
   * @param {string} zipFilePath - Path to the .zip file
   * @returns {Promise<{operationId: string, message: string}>}
   */
  async uploadPackage(zipFilePath) {
    if (!fs.existsSync(zipFilePath)) {
      throw new Error(`File not found: ${zipFilePath}`);
    }

    const fileStream = fs.createReadStream(zipFilePath);
    const url = `${this.apiEndpoint}/v1/products/${this.productId}/submissions/draft/package`;

    try {
      const response = await axios.post(url, fileStream, {
        headers: this.getHeaders('application/zip'),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      if (response.status === 202) {
        const locationHeader = response.headers['location'] || response.headers['Location'];
        const operationId = this.extractOperationId(locationHeader);
        
        return {
          operationId,
          message: 'Package upload initiated successfully',
          statusCode: response.status,
        };
      }

      throw new Error(`Unexpected response status: ${response.status}`);
    } catch (error) {
      if (error.response) {
        throw new Error(`Upload failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Check the status of a package upload
   * @param {string} operationId - Operation ID from upload response
   * @returns {Promise<{status: string, message: string, data: object}>}
   */
  async checkUploadStatus(operationId) {
    const url = `${this.apiEndpoint}/v1/products/${this.productId}/submissions/draft/package/operations/${operationId}`;

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });

      return {
        status: response.data.status,
        message: response.data.message || 'Status retrieved successfully',
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Status check failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Publish the submission
   * @param {string} notes - Optional notes for certification
   * @returns {Promise<{operationId: string, message: string}>}
   */
  async publishSubmission(notes = '') {
    const url = `${this.apiEndpoint}/v1/products/${this.productId}/submissions`;

    try {
      const response = await axios.post(
        url,
        { notes },
        {
          headers: this.getHeaders(),
        }
      );

      if (response.status === 202) {
        const locationHeader = response.headers['location'] || response.headers['Location'];
        const operationId = this.extractOperationId(locationHeader);
        
        return {
          operationId,
          message: 'Publish initiated successfully',
          statusCode: response.status,
        };
      }

      throw new Error(`Unexpected response status: ${response.status}`);
    } catch (error) {
      if (error.response) {
        throw new Error(`Publish failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Check the publishing status
   * @param {string} operationId - Operation ID from publish response
   * @returns {Promise<{status: string, message: string, data: object}>}
   */
  async checkPublishStatus(operationId) {
    const url = `${this.apiEndpoint}/v1/products/${this.productId}/submissions/operations/${operationId}`;

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });

      return {
        status: response.data.status,
        message: response.data.message || 'Status retrieved successfully',
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Status check failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Wait for an operation to complete by polling status
   * @param {string} operationId - Operation ID to check
   * @param {string} operationType - 'upload' or 'publish'
   * @param {number} retryLimit - Maximum number of retries
   * @param {number} retryDelay - Delay between retries in seconds
   * @returns {Promise<object>}
   */
  async waitForOperation(operationId, operationType = 'upload', retryLimit = 10, retryDelay = 5) {
    const checkStatus = operationType === 'upload' 
      ? this.checkUploadStatus.bind(this)
      : this.checkPublishStatus.bind(this);

    for (let i = 0; i < retryLimit; i++) {
      const result = await checkStatus(operationId);
      
      if (result.status !== 'InProgress') {
        return result;
      }

      if (i < retryLimit - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
      }
    }

    throw new Error(`Operation timed out after ${retryLimit} retries`);
  }
}
