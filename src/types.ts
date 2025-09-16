export interface SummarizeRequest {
  url: string;
  maxLength?: number;
}

export interface SummarizeResponse {
  url: string;
  contentType: "html" | "text" | "pdf";
  summary: string;
  originalLength: number;
  summaryLength: number;
}

export interface ContentExtractor {
  canHandle(contentType: string): boolean;
  extract(content: Buffer): Promise<string>;
}
