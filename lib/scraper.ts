import axios from "axios";
import { load } from "cheerio"; // Updated import for cheerio

interface ScraperResult {
  title?: string;
  image?: string;
  error?: string;
}

async function scrapeProductPage(url: string): Promise<ScraperResult> {
  try {
    // Fetch the HTML content of the URL
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
    });

    // Load the HTML into Cheerio
    const $ = load(html); // Updated to use named import `load`

    // Extract the title from the <title> tag or meta tags
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="title"]').attr("content") ||
      $("title").text();

    // Extract the image from Open Graph or prominent <img> tags
    const image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $("img").first().attr("src");

    // Return the result
    return { title, image };
  } catch (error) {
    console.error("Error scraping the page:", error);
    return {
      error: "Failed to scrape the page. Please check the URL and try again.",
    };
  }
}

export default scrapeProductPage;
