import { getDb } from "./server/db";
import { products } from "./drizzle/schema";
import { eq, like, and, isNotNull } from "drizzle-orm";

async function replicateVariantImages() {
  const db = await getDb();
  
  // Find products that appear to be variants (contain size/mm indicators)
  const variantPatterns = [
    /\s*[-–]\s*\d+(?:\.\d+)?(?:\s*(?:mm|cm|m|inch|"|'|x))?$/i,  // Size suffixes
    /\s*\(.*(?:mm|cm|m|inch|"|'|x).*\)$/i,  // Parenthetical sizes
  ];

  // Get all published products with images
  const allProducts = await db
    .select()
    .from(products)
    .where(and(
      eq(products.published, true),
      isNotNull(products.imageUrl)
    ));

  console.log(`Found ${allProducts.length} published products with images`);

  let totalUpdated = 0;
  const variantGroups = new Map<string, typeof allProducts>();

  // Group products by base name (removing variant suffixes)
  for (const product of allProducts) {
    let baseName = product.name;
    
    // Remove variant patterns to get base name
    for (const pattern of variantPatterns) {
      baseName = baseName.replace(pattern, "").trim();
    }

    if (!variantGroups.has(baseName)) {
      variantGroups.set(baseName, []);
    }
    variantGroups.get(baseName)!.push(product);
  }

  // For each group with multiple products, replicate the image
  for (const [baseName, group] of variantGroups) {
    if (group.length > 1) {
      // Find the product with the best image (longest URL or first with image)
      const mainProduct = group.reduce((best, current) => {
        if (!best.imageUrl) return current;
        if (!current.imageUrl) return best;
        return (current.imageUrl.length > best.imageUrl.length) ? current : best;
      });

      if (mainProduct.imageUrl) {
        console.log(`\nGroup: "${baseName}" (${group.length} variants)`);
        console.log(`  Main product: ${mainProduct.name} (SKU: ${mainProduct.sku})`);
        console.log(`  Image: ${mainProduct.imageUrl}`);

        // Update all variants without images to use the main product's image
        for (const variant of group) {
          if (!variant.imageUrl && variant.id !== mainProduct.id) {
            console.log(`  → Updating: ${variant.name} (SKU: ${variant.sku})`);
            await db
              .update(products)
              .set({ imageUrl: mainProduct.imageUrl })
              .where(eq(products.id, variant.id));
            totalUpdated++;
          }
        }
      }
    }
  }

  console.log(`\n✅ Replication complete! Updated ${totalUpdated} variant products with main product images.`);
  process.exit(0);
}

replicateVariantImages().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
