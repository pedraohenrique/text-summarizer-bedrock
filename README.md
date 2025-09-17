# URL Content Summarizer

A serverless service that fetches content from URLs and generates summaries using AWS Bedrock. Supports HTML and plain text content.

## Features

- **Multi-format support**: HTML and plain text content extraction
- **AI-powered summarization**: Uses Claude 3 Haiku via AWS Bedrock for cost-effective summarization
- **Serverless architecture**: Built with AWS Lambda and API Gateway
- **Infrastructure as Code**: Deployed using AWS CDK
- **TypeScript**: Fully typed for better development experience

## Architecture

- **AWS Lambda**: Handles URL fetching and content processing
- **AWS Bedrock**: Provides AI summarization using Claude 3 Haiku
- **API Gateway**: REST API endpoint for the service
- **AWS CDK**: Infrastructure deployment and management

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Build the project**:

   ```bash
   npm run build
   ```

3. **Configure AWS credentials** (if not already done):

   ```bash
   aws configure
   ```

4. **Bootstrap CDK** (first time only):

   ```bash
   npx cdk bootstrap
   ```

5. **Deploy the infrastructure**:
   ```bash
   npm run deploy
   ```

## Usage

### API Endpoint

Send a POST request to the `/summarize` endpoint:

```bash
curl -X POST https://5ybw46rra1.execute-api.us-east-1.amazonaws.com/prod/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://stream.mux.com/leDBzf8G57ZVfFiybfyAv901A02GdrZiE49IR58sDbeVY/text/01rgk01uWtYy102Hs1erUnyf01uWkbV01iXAlUYSwsLerPhGuV8aCZ1QSrQ.txt",
    "maxLength": 500
  }'
```

### Request Format

```json
{
  "url": "https://example.com/article",
  "maxLength": 500
}
```

### Response Format

```json
{
  "url": "https://example.com/article",
  "contentType": "html",
  "summary": "This is the generated summary...",
  "originalLength": 5000,
  "summaryLength": 450
}
```

## Local Development

Run locally for testing:

```bash
npm run dev
```

## Supported Content Types

- **HTML** (`text/html`): Extracts main content, removes navigation and styling
- **Plain Text** (`text/plain`): Processes text content directly

## Cost Optimization

- Uses Claude 3 Haiku model for cost-effective summarization
- Lambda function with appropriate memory allocation
- Efficient content extraction to minimize processing time

## Security

- CORS enabled for web applications
- IAM roles with minimal required permissions
- Input validation and error handling

## Development Commands

- `npm run build` - Compile TypeScript
- `npm run dev` - Run locally
- `npm run deploy` - Deploy to AWS
- `npm run synth` - Generate CloudFormation template
- `npm test` - Run tests (when implemented)
