// Local development entry point
import { UrlSummarizer } from "./url-summarizer";

async function main() {
  const summarizer = new UrlSummarizer();

  // Example usage
  const testUrl = "https://example.com";

  try {
    console.log(`Summarizing content from: ${testUrl}`);
    const result = await summarizer.summarize({
      url: testUrl,
      maxLength: 300,
    });

    console.log("Summary Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

if (require.main === module) {
  main();
}
