import { getDb } from "./server/db";
import { products } from "./drizzle/schema";
import { eq, and, isNotNull } from "drizzle-orm";

async function replicateAllVariantImages() {
  const db = await getDb();
  
  // Find products that appear to be variants (contain size/mm indicators)
  const variantPatterns = [
    /\s*[-–]\s*\d+(?:\.\d+)?(?:\s*(?:mm|cm|m|inch|"|'|x))?$/i,  // Size suffixes
    /\s*\(.*(?:mm|cm|m|inch|"|'|x).*\)$/i,  // Parenthetical sizes
  ];

  // Get all published products
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.published, true));

  console.log(`Found ${allProducts.length} published products`);

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
      // Find the product with a valid image (not placeholder, not null/empty)
      const mainProduct = group.find(p => 
        p.imageUrl && 
        p.imageUrl.length > 0 && 
        !p.imageUrl.includes('placeholder')
      );

      if (mainProduct && mainProduct.imageUrl) {
        console.log(`\nGroup: "${baseName}" (${group.length} variants)`);
        console.log(`  Main product: ${mainProduct.name} (SKU: ${mainProduct.sku})`);
        console.log(`  Image: ${mainProduct.imageUrl}`);

        // Update all variants to use the main product's image
        for (const variant of group) {
          if (variant.id !== mainProduct.id) {
            const hasPlaceholder = variant.imageUrl?.includes('placeholder') || !variant.imageUrl;
            if (hasPlaceholder || variant.imageUrl !== mainProduct.imageUrl) {
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
  }

  console.log(`\n✅ Replication complete! Updated ${totalUpdated} variant products with main product images.`);
  process.exit(0);
}

replicateAllVariantImages().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
