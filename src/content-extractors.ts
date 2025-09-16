import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";
import { ContentExtractor } from "./types";

export class HtmlExtractor implements ContentExtractor {
  canHandle(contentType: string): boolean {
    return contentType.includes("text/html");
  }

  async extract(content: Buffer): Promise<string> {
    const html = content.toString("utf-8");
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script, style, nav, header, footer, aside").remove();

    // Extract main content, prioritizing semantic elements
    const mainContent = $("main, article, .content, #content").first();
    if (mainContent.length > 0) {
      return mainContent.text().trim();
    }

    // Fallback to body content
    return $("body").text().trim();
  }
}

export class TextExtractor implements ContentExtractor {
  canHandle(contentType: string): boolean {
    return contentType.includes("text/plain");
  }

  async extract(content: Buffer): Promise<string> {
    return content.toString("utf-8").trim();
  }
}

export class PdfExtractor implements ContentExtractor {
  canHandle(contentType: string): boolean {
    return contentType.includes("application/pdf");
  }

  async extract(content: Buffer): Promise<string> {
    const data = await pdfParse(content);
    return data.text.trim();
  }
}
