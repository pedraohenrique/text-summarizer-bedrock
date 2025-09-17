import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class UrlSummarizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM role for Lambda with Bedrock permissions
    const lambdaRole = new iam.Role(this, 'UrlSummarizerLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
      inlinePolicies: {
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
              ],
              resources: [
                `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
              ],
            }),
          ],
        }),
      },
    });

    // Lambda function
    const summarizerFunction = new lambdaNodejs.NodejsFunction(
      this,
      'UrlSummarizerFunction',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: 'src/lambda-handler.ts',
        handler: 'handler',
        role: lambdaRole,
        timeout: cdk.Duration.minutes(5),
        memorySize: 1024,
        environment: {
          NODE_ENV: 'production',
          LAMBDA_VERSION: '1.1',
        },
        bundling: {
          externalModules: ['@aws-sdk/*', 'canvas'],
          minify: true,
          sourceMap: false,
          commandHooks: {
            beforeBundling(inputDir: string, outputDir: string): string[] {
              return [];
            },
            beforeInstall(inputDir: string, outputDir: string): string[] {
              return [];
            },
            afterBundling(inputDir: string, outputDir: string): string[] {
              return [
                'find /asset-output -name "test" -type d -exec rm -rf {} + || true',
                'find /asset-output -name "*.test.*" -delete || true',
                'find /asset-output -name "*.spec.*" -delete || true',
              ];
            },
          },
        },
      }
    );

    // API Gateway
    const api = new apigateway.RestApi(this, 'UrlSummarizerApi', {
      restApiName: 'URL Summarizer Service',
      description: 'API for summarizing content from URLs using AWS Bedrock',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Gateway integration
    const summarizerIntegration = new apigateway.LambdaIntegration(
      summarizerFunction
    );

    // API routes
    const summarizerResource = api.root.addResource('summarize');
    summarizerResource.addMethod('POST', summarizerIntegration);

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the API Gateway',
    });

    new cdk.CfnOutput(this, 'SummarizeEndpoint', {
      value: `${api.url}summarize`,
      description: 'Endpoint for summarizing URLs',
    });
  }
}
