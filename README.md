# Edge Webstore Upload CLI

A Node.js CLI tool to upload and publish Microsoft Edge extensions using the Edge Add-ons API v1.1.

## Features

- 🚀 Upload extension packages (.zip) to Edge Add-ons
- 📊 Check upload status with progress tracking
- 📢 Publish submissions to the store
- ✅ Check publishing status
- 🔄 Automated workflow (upload → wait → publish)
- 💻 Simple CLI interface
- 🔐 Secure credential management via environment variables

## Prerequisites

Before using this tool, you need:

1. **Partner Center Account**: Sign in to [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login?ref=dd)
2. **API Credentials**: 
   - Go to Microsoft Edge > Publish API
   - Click "Enable" for the new experience (v1.1)
   - Click "Create API credentials"
   - Note down your **Client ID** and **API Key**
3. **Product ID**: 
   - Go to Microsoft Edge > Overview
   - Select your extension
   - Copy the **Product ID** from the Extension Identity section

## Installation

```bash
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```env
CLIENT_ID=your-client-id-here
API_KEY=your-api-key-here
PRODUCT_ID=your-product-id-here
```

## Usage

### Upload a Package

Upload a .zip package to update your extension:

```bash
npm start upload path/to/your-extension.zip
```

Or with options:
```bash
npm start upload path/to/your-extension.zip --product-id <id> --client-id <id> --api-key <key>
```

### Check Upload Status

Check the status of an upload operation:

```bash
npm start upload-status <operation-id>
```

### Publish Submission

Publish the current draft submission:

```bash
npm start publish
```

With optional notes for certification:
```bash
npm start publish --notes "Fixed bugs and improved performance"
```

### Check Publishing Status

Check the status of a publish operation:

```bash
npm start publish-status <operation-id>
```

### Complete Workflow

Upload and automatically publish when ready:

```bash
npm start workflow path/to/your-extension.zip --notes "Version 1.2.0 release"
```

This command will:
1. Upload the package
2. Wait for upload to complete
3. Publish the submission
4. Wait for publishing to complete

## CLI Options

### Global Options
- `--client-id <id>`: Override CLIENT_ID from .env
- `--api-key <key>`: Override API_KEY from .env
- `--product-id <id>`: Override PRODUCT_ID from .env
- `--endpoint <url>`: Override API_ENDPOINT from .env

### Command-Specific Options

**upload**
- `--wait`: Wait for upload to complete (polls status)

**publish**
- `--notes <text>`: Notes for certification team

**workflow**
- `--notes <text>`: Notes for certification team
- `--retry-limit <number>`: Max retries for status checks (default: 10)
- `--retry-delay <seconds>`: Delay between retries (default: 5)

## Examples

### Basic upload:
```bash
npm start upload ./my-extension.zip
```

### Upload with specific credentials:
```bash
npm start upload ./my-extension.zip \
  --client-id "your-client-id" \
  --api-key "your-api-key" \
  --product-id "your-product-id"
```

### Upload and wait for completion:
```bash
npm start upload ./my-extension.zip --wait
```

### Complete workflow with custom options:
```bash
npm start workflow ./my-extension.zip \
  --notes "Bug fixes and UI improvements" \
  --retry-limit 20 \
  --retry-delay 10
```

## API Response Codes

- `202 Accepted`: Operation started successfully
- `200 OK`: Operation completed successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid API credentials
- `404 Not Found`: Product or operation not found
- `500 Internal Server Error`: Server error

## Status Values

### Upload Status
- `InProgress`: Upload is being processed
- `Succeeded`: Upload completed successfully
- `Failed`: Upload failed

### Publishing Status
- `InProgress`: Publishing is in progress
- `Succeeded`: Successfully published
- `Failed`: Publishing failed

## Troubleshooting

### "Invalid API credentials"
- Verify your CLIENT_ID and API_KEY in .env
- Ensure you've enabled the v1.1 API in Partner Center

### "Product not found"
- Verify your PRODUCT_ID is correct
- Check that the extension exists in your Partner Center account

### "Upload failed"
- Ensure the .zip file is valid
- Check that manifest.json is present
- Verify the package meets Edge extension requirements

## Links

- [Edge Add-ons API Documentation](https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/api/using-addons-api?tabs=v1-1)
- [Partner Center Dashboard](https://partner.microsoft.com/dashboard/microsoftedge/public/login?ref=dd)
- [Edge Extension Developer Guide](https://learn.microsoft.com/en-us/microsoft-edge/extensions/)

## License

MIT
