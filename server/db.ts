import { eq, like, and, or, isNull, desc, asc, sql, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, categories, brands, quoteRequests, quoteItems } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function getCategories(opts: { parentId?: number | null } = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts.parentId !== undefined) {
    if (opts.parentId === null) conditions.push(isNull(categories.parentId));
    else conditions.push(eq(categories.parentId, opts.parentId));
  }
  return db.select().from(categories)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function createCategory(data: { name: string; description?: string; slug?: string; parentId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await db.insert(categories).values({ name: data.name, slug, description: data.description ?? null, parentId: data.parentId ?? null });
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ── Brands ────────────────────────────────────────────────────────────────────
export async function getBrands() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brands).orderBy(asc(brands.name));
}

export async function upsertBrand(name: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await db.insert(brands).values({ name, slug }).onDuplicateKeyUpdate({ set: { name } });
  const result = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  return result[0];
}

// ── Products ──────────────────────────────────────────────────────────────────
export async function getProducts(opts: {
  published?: boolean;
  featured?: boolean;
  categoryId?: number;
  categorySlug?: string;
  brandId?: number;
  brandSlug?: string;
  search?: string;
  inStock?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];
  if (opts.published !== undefined) conditions.push(eq(products.published, opts.published));
  if (opts.featured !== undefined) conditions.push(eq(products.featured, opts.featured));
  if (opts.inStock !== undefined) conditions.push(eq(products.inStock, opts.inStock));
  // Always filter out products without images
  conditions.push(isNotNull(products.imageUrl));
  conditions.push(sql`${products.imageUrl} != ''`);

  if (opts.categoryId) {
    conditions.push(eq(products.categoryId, opts.categoryId));
  } else if (opts.categorySlug) {
    const cat = await getCategoryBySlug(opts.categorySlug);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
    else return [];
  }

  if (opts.brandSlug) {
    const brand = await db.select().from(brands).where(eq(brands.slug, opts.brandSlug)).limit(1);
    if (brand[0]) conditions.push(eq(products.brandId, brand[0].id));
    else return [];
  } else if (opts.brandId) {
    conditions.push(eq(products.brandId, opts.brandId));
  }

  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(or(like(products.name, term), like(products.sku, term), like(products.description, term)));
  }

  const query = db.select().from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(products.name))
    .limit(opts.limit ?? 200);

  if (opts.offset) (query as any).offset(opts.offset);
  return query;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(and(eq(products.slug, slug), sql`imageUrl IS NOT NULL AND imageUrl != ''`)).limit(1);
  return result[0] ?? null;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? null;
}

function makeSlug(name: string, sku?: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return sku ? `${base}-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : base;
}

export async function createProduct(data: {
  name: string; sku?: string; description?: string; shortDescription?: string;
  categoryId?: number; brandId?: number; imageUrl?: string; unit?: string;
  price?: string; inStock?: boolean; published?: boolean; featured?: boolean;
  tags?: string[]; attributes?: Record<string, string>;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const slug = makeSlug(data.name, data.sku);
  await db.insert(products).values({
    name: data.name,
    slug,
    sku: data.sku ?? null,
    description: data.description ?? null,
    shortDescription: data.shortDescription ?? null,
    categoryId: data.categoryId ?? null,
    brandId: data.brandId ?? null,
    imageUrl: data.imageUrl ?? null,
    unit: data.unit ?? null,
    price: data.price ?? null,
    inStock: data.inStock ?? true,
    published: data.published ?? true,
    featured: data.featured ?? false,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    attributes: data.attributes ? JSON.stringify(data.attributes) : null,
    galleryImages: null,
  });
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function updateProduct(id: number, data: Partial<{
  name: string; sku: string; description: string; shortDescription: string;
  categoryId: number; brandId: number; imageUrl: string; unit: string;
  price: string; inStock: boolean; published: boolean; featured: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const updateData: any = { ...data, updatedAt: new Date() };
  if (data.name) updateData.slug = makeSlug(data.name, data.sku);
  await db.update(products).set(updateData).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function toggleProductPublished(id: number, published: boolean) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set({ published, updatedAt: new Date() }).where(eq(products.id, id));
}

// ── Quote Requests ────────────────────────────────────────────────────────────
function generateRefNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AMO-${date}-${rand}`;
}

export async function createQuoteRequest(data: {
  companyName: string; contactPerson: string; email: string; phone: string; notes?: string;
  items: { productId: number; productName: string; productSku?: string; quantity: number; unit?: string }[];
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const referenceNumber = generateRefNumber();
  await db.insert(quoteRequests).values({
    referenceNumber,
    companyName: data.companyName,
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone,
    notes: data.notes ?? null,
    status: "pending",
  });
  const qr = await db.select().from(quoteRequests).where(eq(quoteRequests.referenceNumber, referenceNumber)).limit(1);
  const quoteRequest = qr[0];
  if (!quoteRequest) throw new Error("Failed to create quote request");

  for (const item of data.items) {
    await db.insert(quoteItems).values({
      quoteRequestId: quoteRequest.id,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku ?? null,
      quantity: item.quantity,
      unit: item.unit ?? null,
    });
  }
  return quoteRequest;
}

export async function getQuoteRequests(opts: { status?: string; limit?: number } = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (opts.status) conditions.push(eq(quoteRequests.status, opts.status as any));
  return db.select().from(quoteRequests)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(quoteRequests.createdAt))
    .limit(opts.limit ?? 100);
}

export async function getQuoteItems(quoteRequestId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quoteItems).where(eq(quoteItems.quoteRequestId, quoteRequestId));
}

export async function updateQuoteStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(quoteRequests).set({ status: status as any, updatedAt: new Date() }).where(eq(quoteRequests.id, id));
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalProducts: 0, totalQuotes: 0, pendingQuotes: 0, totalCategories: 0 };
  const [prodCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const [quoteCount] = await db.select({ count: sql<number>`count(*)` }).from(quoteRequests);
  const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(quoteRequests).where(eq(quoteRequests.status, "pending"));
  const [catCount] = await db.select({ count: sql<number>`count(*)` }).from(categories);
  return {
    totalProducts: Number(prodCount?.count ?? 0),
    totalQuotes: Number(quoteCount?.count ?? 0),
    pendingQuotes: Number(pendingCount?.count ?? 0),
    totalCategories: Number(catCount?.count ?? 0),
  };
}
