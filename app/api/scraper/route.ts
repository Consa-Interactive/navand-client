import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Helper function to extract product information
async function scrapeProduct(url: string) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Initialize product data
    const productData = {
      title: "",
      images: [] as string[],
    };

    // Common selectors for product titles
    const titleSelectors = [
      "h1",
      '[data-testid="product-title"]',
      ".product-title",
      ".product-name",
      '[itemprop="name"]',
      "#product-name",
      ".title",
    ];

    // Try to find title using common selectors
    for (const selector of titleSelectors) {
      const title = $(selector).first().text().trim();
      if (title) {
        productData.title = title;
        break;
      }
    }

    // Common selectors for product images
    const imageSelectors = [
      'img[src*="product"]',
      'img[src*="products"]',
      '[data-testid="product-image"]',
      ".product-image img",
      '[itemprop="image"]',
      "#product-image",
      ".gallery img",
      ".product-gallery img",
    ];

    // Try to find images using common selectors
    for (const selector of imageSelectors) {
      const images = $(selector)
        .map((_, el) => {
          const src =
            $(el).attr("src") ||
            $(el).attr("data-src") ||
            $(el).attr("data-lazy-src");
          return src ? new URL(src, url).href : null;
        })
        .get()
        .filter(Boolean);

      if (images.length > 0) {
        productData.images = images;
        break;
      }
    }

    return productData;
  } catch (error) {
    console.error("Error scraping product:", error);
    throw new Error("Failed to scrape product information");
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    const productData = await scrapeProduct(url);

    return NextResponse.json(productData);
  } catch (error) {
    console.error("Error in scraper API:", error);
    return NextResponse.json(
      { error: "Failed to scrape product information" },
      { status: 500 }
    );
  }
}
