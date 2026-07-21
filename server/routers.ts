import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import {
  getCategories, getCategoryBySlug, createCategory, deleteCategory,
  getBrands, upsertBrand,
  getProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct, toggleProductPublished,
  createQuoteRequest, getQuoteRequests, getQuoteItems, updateQuoteStatus,
  getAdminStats,
} from "./db";

// ── Admin guard ───────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += line[i]; }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
}

function normalizeHeader(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  return "";
}

// ── Routers ───────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Categories ──────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure
      .input(z.object({ parentId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getCategories(input ?? {});
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getCategoryBySlug(input.slug);
      }),
  }),

  // ── Brands ─────────────────────────────────────────────────────────────────
  brands: router({
    list: publicProcedure.query(async () => getBrands()),
  }),

  // ── Products ────────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(z.object({
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
        categoryId: z.number().optional(),
        categorySlug: z.string().optional(),
        brandSlug: z.string().optional(),
        search: z.string().optional(),
        inStock: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getProducts(input ?? {});
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getProductBySlug(input.slug);
      }),
    getVariants: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.productId);
        if (!product) return [];
        const variantPatterns = [
          /\s*[-–]\s*\d+(?:\.\d+)?(?:\s*(?:mm|cm|m|inch|"|'|x))?$/i,
          /\s*\(.*(?:mm|cm|m|inch|"|'|x).*\)$/i,
        ];
        let baseName = product.name;
        for (const pattern of variantPatterns) {
          baseName = baseName.replace(pattern, "").trim();
        }
        const allProducts = await getProducts({ published: true });
        const variants = allProducts.filter(p => {
          let pBaseName = p.name;
          for (const pattern of variantPatterns) {
            pBaseName = pBaseName.replace(pattern, "").trim();
          }
          return pBaseName === baseName && p.imageUrl && p.imageUrl.trim() !== '';
        }).sort((a, b) => a.name.localeCompare(b.name));
        return variants;
      }),
  }),

  // ── Quotes ──────────────────────────────────────────────────────────────────
  quotes: router({
    submit: publicProcedure
      .input(z.object({
        companyName: z.string().min(1),
        contactPerson: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        notes: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          productSku: z.string().optional(),
          quantity: z.number().min(1),
          unit: z.string().optional(),
        })).min(1),
      }))
      .mutation(async ({ input }) => {
        const quoteRequest = await createQuoteRequest(input);
        // Notify owner
        try {
          const itemsList = input.items.map(i => `- ${i.productName} (x${i.quantity})`).join("\n");
          await notifyOwner({
            title: `New Quote Request: ${quoteRequest.referenceNumber}`,
            content: `Company: ${input.companyName}\nContact: ${input.contactPerson}\nEmail: ${input.email}\nPhone: ${input.phone}\n\nItems:\n${itemsList}${input.notes ? `\n\nNotes: ${input.notes}` : ""}`,
          });
        } catch (e) {
          console.warn("Failed to notify owner:", e);
        }
        return { referenceNumber: quoteRequest.referenceNumber, id: quoteRequest.id };
      }),

    list: publicProcedure
      .input(z.object({
        status: z.enum(["pending", "reviewing", "quoted", "accepted", "declined"]).optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getQuoteRequests(input ?? {});
      }),

    getItems: publicProcedure
      .input(z.object({ quoteRequestId: z.number() }))
      .query(async ({ input }) => {
        return getQuoteItems(input.quoteRequestId);
      }),
  }),

  // ── Admin ───────────────────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => getAdminStats()),

    createProduct: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        sku: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        categoryId: z.number().optional(),
        brandId: z.number().optional(),
        imageUrl: z.string().optional(),
        unit: z.string().optional(),
        price: z.string().optional(),
        inStock: z.boolean().optional(),
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => createProduct(input)),

    updateProduct: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        sku: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        categoryId: z.number().optional(),
        brandId: z.number().optional(),
        imageUrl: z.string().optional(),
        unit: z.string().optional(),
        price: z.string().optional(),
        inStock: z.boolean().optional(),
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProduct(id, data);
        return { success: true };
      }),

    deleteProduct: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),

    toggleProductPublished: adminProcedure
      .input(z.object({ id: z.number(), published: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleProductPublished(input.id, input.published);
        return { success: true };
      }),

    updateQuoteStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "reviewing", "quoted", "accepted", "declined"]),
      }))
      .mutation(async ({ input }) => {
        await updateQuoteStatus(input.id, input.status);
        return { success: true };
      }),

    createCategory: adminProcedure
      .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
      .mutation(async ({ input }) => createCategory(input)),

    deleteCategory: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCategory(input.id);
        return { success: true };
      }),

    uploadProductImage: adminProcedure
      .input(z.object({
        productId: z.number(),
        imageBase64: z.string(),
        filename: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(input.imageBase64, 'base64');
          
          // Upload to storage
          const storageKey = `products/${input.productId}/${Date.now()}-${input.filename}`;
          const { url } = await storagePut(storageKey, buffer, 'image/jpeg');
          
          // Update product with new image URL
          await updateProduct(input.productId, { imageUrl: url });
          
          return { success: true, imageUrl: url };
        } catch (error) {
          console.error('Image upload error:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload image' });
        }
      }),

    scrapeProductUrl: adminProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const response = await fetch(input.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          const html = await response.text();
          
          // Extract title/name
          const titleMatch = html.match(/<title>([^<]+)<\/title>/) || html.match(/<h1[^>]*>([^<]+)<\/h1>/);
          const name = titleMatch?.[1]?.trim() || '';
          
          // Extract description
          const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/) ||
                           html.match(/<p[^>]*>([^<]{50,})<\/p>/);
          const description = descMatch?.[1]?.trim() || '';
          
          // Extract image URL
          let imageUrl = '';
          const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
          for (const match of imgMatches) {
            const src = match.match(/src=["']([^"']+)["']/)?.[1];
            if (src && !src.includes('logo') && !src.includes('icon')) {
              imageUrl = src.startsWith('http') ? src : new URL(src, input.url).href;
              break;
            }
          }
          
          return { name, description, imageUrl };
        } catch (error) {
          console.error('Scrape error:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to scrape URL' });
        }
      }),

    importBulkUrls: adminProcedure
      .input(z.object({
        products: z.array(z.object({
          name: z.string(),
          imageUrl: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        let matched = 0, updated = 0, skipped = 0;
        const errors: string[] = [];
        const unmatched: string[] = [];

        // Get all existing products
        const existingProducts = await getProducts({ limit: 10000 });

        for (const wpProduct of input.products) {
          try {
            // Normalize names for matching
            const normalizeForMatch = (name: string) => {
              return name.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            };

            const wpNorm = normalizeForMatch(wpProduct.name);
            let bestMatch = null;
            let bestScore = 0;

            // Find best matching product
            for (const dbProduct of existingProducts) {
              const dbNorm = normalizeForMatch(dbProduct.name);
              
              // Simple similarity check
              let matches = 0;
              const wpWords = wpNorm.split(' ');
              const dbWords = dbNorm.split(' ');
              
              for (const word of wpWords) {
                if (word.length > 2 && dbNorm.includes(word)) matches++;
              }
              
              const score = matches / Math.max(wpWords.length, 1);
              
              if (score > bestScore) {
                bestScore = score;
                bestMatch = dbProduct;
              }
            }

            // Update if match found with high confidence (>60%)
            if (bestMatch && bestScore >= 0.6) {
              await updateProduct(bestMatch.id, { imageUrl: wpProduct.imageUrl });
              updated++;
              matched++;
            } else {
              unmatched.push(wpProduct.name);
              skipped++;
            }
          } catch (e: any) {
            errors.push(`${wpProduct.name}: ${e.message}`);
            skipped++;
          }
        }

        return { matched, updated, skipped, errors, unmatched: unmatched.slice(0, 10), total: input.products.length };
      }),

    replicateProductImages: adminProcedure
      .input(z.object({ products: z.array(z.object({ id: z.number(), name: z.string() })).optional() }))
      .mutation(async ({ input }) => {
        // Get all products
        const allProducts = await getProducts({ limit: 10000 });
        
        // Group products by normalized name (to find variants)
        const productsByName = new Map<string, typeof allProducts>();
        
        for (const product of allProducts) {
          // Normalize: remove size indicators like "3mm", "5mm", "100mm", etc.
          const baseName = product.name
            .replace(/\s*\d+\s*(mm|cm|m|inch|\")?\s*$/i, '')
            .trim()
            .toLowerCase();
          
          if (!productsByName.has(baseName)) {
            productsByName.set(baseName, []);
          }
          productsByName.get(baseName)!.push(product);
        }
        
        let replicated = 0;
        const results: { name: string; imageUrl: string; variants: number }[] = [];
        
        // For each group of variants
        for (const [baseName, variants] of Array.from(productsByName.entries())) {
          if (variants.length <= 1) continue; // Skip if only one product with this name
          
          // Find the first product with an image
          const sourceProduct = variants.find((p: any) => p.imageUrl && p.imageUrl.trim() !== '');
          if (!sourceProduct) continue; // Skip if no product has an image
          
          // Replicate image to all variants without images
          for (const variant of variants) {
            if (!variant.imageUrl || variant.imageUrl.trim() === '') {
              await updateProduct(variant.id, { imageUrl: sourceProduct.imageUrl || '' });
              replicated++;
            }
          }
          
          results.push({
            name: baseName,
            imageUrl: sourceProduct.imageUrl || '',
            variants: variants.length,
          });
        }
        
        return { replicated, results, total: allProducts.length };
      }),

    importCsv: adminProcedure
      .input(z.object({ csvContent: z.string() }))
      .mutation(async ({ input }) => {
        const rows = parseCsv(input.csvContent);
        let created = 0, updated = 0, skipped = 0;
        const errors: string[] = [];

        for (const row of rows) {
          try {
            const name = normalizeHeader(row, "name", "post title", "title");
            if (!name) { skipped++; continue; }

            const sku = normalizeHeader(row, "sku", "id");
            const description = normalizeHeader(row, "description", "post content");
            const shortDescription = normalizeHeader(row, "short description", "short_description", "excerpt");
            const categoryName = normalizeHeader(row, "categories", "category name", "category");
            const brandName = normalizeHeader(row, "brands", "brand");
            const imageUrl = normalizeHeader(row, "images", "image", "image url", "featured image");
            const price = normalizeHeader(row, "regular price", "price", "sale price");
            const stockStatus = normalizeHeader(row, "stock status", "stock");
            const inStock = !stockStatus || stockStatus.toLowerCase().includes("instock") || stockStatus.toLowerCase() === "in stock";

            let categoryId: number | undefined;
            if (categoryName) {
              const cats = categoryName.split(">").map(s => s.trim()).filter(Boolean);
              const catName = cats[cats.length - 1] || cats[0];
              if (catName) {
                const existing = await getCategories();
                const found = existing.find(c => c.name.toLowerCase() === catName.toLowerCase());
                if (found) categoryId = found.id;
                else {
                  const newCat = await createCategory({ name: catName });
                  categoryId = newCat?.id;
                }
              }
            }

            let brandId: number | undefined;
            if (brandName) {
              const brand = await upsertBrand(brandName);
              brandId = brand?.id;
            }

            // Check if product with this SKU exists
            if (sku) {
              const existing = await getProducts({ search: sku });
              const match = existing.find(p => p.sku === sku);
              if (match) {
                await updateProduct(match.id, {
                  name, description: description || undefined, shortDescription: shortDescription || undefined,
                  categoryId, brandId, imageUrl: imageUrl || undefined, price: price || undefined, inStock,
                });
                updated++;
                continue;
              }
            }

            await createProduct({
              name, sku: sku || undefined, description: description || undefined,
              shortDescription: shortDescription || undefined, categoryId, brandId,
              imageUrl: imageUrl || undefined, price: price || undefined, inStock, published: true,
            });
            created++;
          } catch (e: any) {
            errors.push(`Row error: ${e.message}`);
            skipped++;
          }
        }

        return { created, updated, skipped, errors, total: rows.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
