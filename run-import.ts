import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";
import { products } from "./drizzle/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load WordPress products
const wpProductsPath = path.join(__dirname, "client/public/wordpress_products.json");
const wpProductsRaw = fs.readFileSync(wpProductsPath, "utf-8");
const wpProducts = JSON.parse(wpProductsRaw);

console.log(`Loaded ${wpProducts.length} WordPress products`);

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  process.exit(1);
}

console.log("Connecting to database...");

// Create connection pool
const pool = mysql.createPool(DATABASE_URL);
const db = drizzle(pool);

async function runImport() {
  try {
    console.log("Fetching products from database...");

    // Get all products from database
    const dbProducts = await db.select().from(products);
    console.log(`Found ${dbProducts.length} products in database`);

    // Normalize function
    function normalizeForMatch(name: string): string {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Calculate similarity score
    function calculateSimilarity(wpName: string, dbName: string): number {
      const wpNorm = normalizeForMatch(wpName);
      const dbNorm = normalizeForMatch(dbName);

      const wpWords = wpNorm.split(" ");
      let matches = 0;

      for (const word of wpWords) {
        if (word.length > 2 && dbNorm.includes(word)) {
          matches++;
        }
      }

      return matches / Math.max(wpWords.length, 1);
    }

    // Match and update
    let matched = 0;
    let updated = 0;
    let unmatched: Array<{ name: string; score: number; bestMatch?: string }> = [];

    console.log("\nMatching and updating products...");

    for (const wpProduct of wpProducts) {
      const wpName = wpProduct.name || "";
      const wpImage = wpProduct.image_url || wpProduct.image || "";

      if (!wpImage) {
        unmatched.push({
          name: wpName,
          score: 0,
          bestMatch: "No image URL",
        });
        continue;
      }

      let bestMatch: (typeof dbProducts)[0] | null = null;
      let bestScore = 0;

      for (const dbProduct of dbProducts) {
        const score = calculateSimilarity(wpName, dbProduct.name);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = dbProduct;
        }
      }

      if (bestScore >= 0.6 && bestMatch) {
        matched++;
        if (!bestMatch.imageUrl || bestMatch.imageUrl.includes("placeholder")) {
          await db
            .update(products)
            .set({ imageUrl: wpImage })
            .where(eq(products.id, bestMatch.id));
          updated++;
          console.log(
            `✓ Updated: ${bestMatch.name} (score: ${(bestScore * 100).toFixed(0)}%)`
          );
        }
      } else {
        unmatched.push({
          name: wpName,
          score: bestScore,
          bestMatch: bestMatch?.name,
        });
      }
    }

    console.log("\n=== IMPORT RESULTS ===");
    console.log(`Total WordPress products: ${wpProducts.length}`);
    console.log(`Matched: ${matched}`);
    console.log(`Updated with images: ${updated}`);
    console.log(`Unmatched: ${unmatched.length}`);

    if (unmatched.length > 0 && unmatched.length <= 20) {
      console.log("\nUnmatched products:");
      unmatched.forEach((item) => {
        console.log(
          `  - ${item.name} (best match: ${item.bestMatch}, score: ${(item.score * 100).toFixed(0)}%)`
        );
      });
    }

    await pool.end();
    console.log("\n✅ Import complete!");
  } catch (error) {
    console.error("Error during import:", error);
    await pool.end();
    process.exit(1);
  }
}

runImport();
