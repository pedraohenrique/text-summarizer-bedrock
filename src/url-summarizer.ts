import axios from "axios";
import { BedrockService } from "./bedrock-service";
import {
  HtmlExtractor,
  TextExtractor,
  PdfExtractor,
} from "./content-extractors";
import { SummarizeRequest, SummarizeResponse, ContentExtractor } from "./types";

export class UrlSummarizer {
  private bedrockService: BedrockService;
  private extractors: ContentExtractor[];

  constructor() {
    this.bedrockService = new BedrockService();
    this.extractors = [
      new HtmlExtractor(),
      new TextExtractor(),
      new PdfExtractor(),
    ];
  }

  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    try {
      // Fetch content from URL
      const response = await axios.get(request.url, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; URL-Summarizer/1.0)",
        },
      });

      const contentType = response.headers["content-type"] || "";
      const content = Buffer.from(response.data);

      // Find appropriate extractor
      const extractor = this.extractors.find((e) => e.canHandle(contentType));
      if (!extractor) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      // Extract text content
      const textContent = await extractor.extract(content);
      if (!textContent || textContent.length === 0) {
        throw new Error("No text content could be extracted from the URL");
      }

      // Generate summary using Bedrock
      const summary = await this.bedrockService.summarizeContent(
        textContent,
        request.maxLength || 500,
      );

      // Determine content type for response
      let responseContentType: "html" | "text" | "pdf";
      if (contentType.includes("text/html")) {
        responseContentType = "html";
      } else if (contentType.includes("application/pdf")) {
        responseContentType = "pdf";
      } else {
        responseContentType = "text";
      }

      return {
        url: request.url,
        contentType: responseContentType,
        summary,
        originalLength: textContent.length,
        summaryLength: summary.length,
      };
    } catch (error) {
      console.error("Error summarizing URL:", error);
      throw error;
    }
  }
}
