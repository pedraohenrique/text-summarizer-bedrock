import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export class BedrockService {
  private client: BedrockRuntimeClient;

  constructor(region: string = "us-east-1") {
    this.client = new BedrockRuntimeClient({ region });
  }

  async summarizeContent(
    content: string,
    maxLength: number = 500,
  ): Promise<string> {
    // Using Claude 3 Haiku for cost-effective summarization
    const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

    const prompt = `Please provide a concise summary of the following content in approximately ${maxLength} characters or less. Focus on the main points and key information:

${content}

Summary:`;

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: Math.ceil(maxLength / 3), // Rough estimate for tokens
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    try {
      const command = new InvokeModelCommand({
        modelId,
        body,
        contentType: "application/json",
        accept: "application/json",
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return responseBody.content[0].text.trim();
    } catch (error) {
      console.error("Error calling Bedrock:", error);
      throw new Error("Failed to generate summary using Bedrock");
    }
  }
}
