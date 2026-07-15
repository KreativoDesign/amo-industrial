import { useState, useMemo } from "react";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";
import { useQuote } from "@/contexts/QuoteContext";
import {
  Search, SlidersHorizontal, X, Package, ChevronRight, Filter, ArrowRight
} from "lucide-react";

const CATEGORY_META: Record<string, { icon: string; desc: string }> = {
  "accessories": { icon: "🔧", desc: "Tools accessories, fittings, and add-ons" },
  "adhesives": { icon: "🧴", desc: "Industrial adhesives, sealants, and bonding agents" },
  "automotive": { icon: "🚗", desc: "Automotive parts, fluids, and accessories" },
  "building-supplies": { icon: "🏗️", desc: "Construction materials and building essentials" },
  "hand-tools": { icon: "🔨", desc: "Professional-grade hand tools for every trade" },
  "safety-gear": { icon: "🦺", desc: "PPE and safety equipment for all industries" },
  "power-tools": { icon: "⚡", desc: "Heavy-duty power tools and accessories" },
  "electrical": { icon: "💡", desc: "Electrical components, cables, and fittings" },
  "fasteners": { icon: "🔩", desc: "Bolts, nuts, screws, and fixing solutions" },
  "cleaning": { icon: "🧹", desc: "Industrial cleaning and hygiene supplies" },
  "plumbing": { icon: "🚿", desc: "Pipes, fittings, and plumbing accessories" },
  "welding": { icon: "🔥", desc: "Welding equipment and cutting tools" },
};

export default function Shop({ categorySlug }: { categorySlug?: string }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  const { data: products, isLoading } = trpc.products.list.useQuery({
    published: true,
    categorySlug: selectedCategory || undefined,
    search: search || undefined,
    brandSlug: selectedBrand || undefined,
    inStock: inStockOnly ? true : undefined,
  });

  const { data: categories } = trpc.categories.list.useQuery({});
  const { data: brands } = trpc.brands.list.useQuery();

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    // Filter out products without images
    const arr = products.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
    if (sortBy === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "name-desc") arr.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === "newest") arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return arr;
  }, [products, sortBy]);

  const currentCategory = categories?.find(c => c.slug === selectedCategory);
  const catMeta = selectedCategory ? CATEGORY_META[selectedCategory] : null;

  const clearFilters = () => {
    setSearch("");
    setSelectedBrand("");
    setInStockOnly(false);
    if (!categorySlug) setSelectedCategory("");
  };

  const hasFilters = search || selectedBrand || inStockOnly || (selectedCategory && !categorySlug);

  return (
    <SiteLayout>
      {/* Page Header */}
      <section className="bg-charcoal py-14 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amo-red" />
        <div className="industrial-overlay absolute inset-0 opacity-20" />
        <div className="container relative z-10">
          <div className="text-white/50 text-xs font-600 uppercase tracking-widest mb-3">
            <Link href="/" className="hover:text-amo-red transition-colors">Home</Link>
            {" / "}
            {categorySlug ? (
              <>
                <Link href="/categories" className="hover:text-amo-red transition-colors">Categories</Link>
                {" / "}{currentCategory?.name || categorySlug}
              </>
            ) : "Shop Industrial"}
          </div>
          <div className="flex items-start gap-4">
            {catMeta && (
              <div className="text-4xl flex-shrink-0 mt-1">{catMeta.icon}</div>
            )}
            <div>
              <h1 className="font-display font-900 text-white text-5xl md:text-6xl uppercase tracking-tight">
                {currentCategory?.name || (categorySlug ? categorySlug.replace(/-/g, " ") : "Shop Industrial")}
              </h1>
              <p className="text-white/60 mt-2 max-w-lg text-sm">
                {currentCategory?.description || catMeta?.desc || "Browse our full range of industrial and commercial supplies."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-off-white min-h-screen">
        <div className="container py-8">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-border bg-white text-sm focus:outline-none focus:border-amo-red transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-grey hover:text-charcoal">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border bg-white text-sm font-600"
              >
                <Filter size={14} />
                Filters
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2.5 border border-border bg-white text-sm focus:outline-none focus:border-amo-red"
              >
                <option value="name">Name: A–Z</option>
                <option value="name-desc">Name: Z–A</option>
                <option value="newest">Newest First</option>
              </select>

              {/* Results count */}
              <div className="text-sm text-dark-grey hidden sm:block">
                {isLoading ? "Loading..." : `${sortedProducts.length} product${sortedProducts.length !== 1 ? "s" : ""}`}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-xs text-dark-grey font-600 uppercase tracking-wide">Active filters:</span>
              {search && (
                <span className="flex items-center gap-1 bg-amo-red/10 text-amo-red text-xs px-2.5 py-1 font-600">
                  Search: "{search}"
                  <button onClick={() => setSearch("")}><X size={10} /></button>
                </span>
              )}
              {selectedBrand && (
                <span className="flex items-center gap-1 bg-amo-red/10 text-amo-red text-xs px-2.5 py-1 font-600">
                  Brand: {brands?.find(b => b.slug === selectedBrand)?.name}
                  <button onClick={() => setSelectedBrand("")}><X size={10} /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="flex items-center gap-1 bg-amo-red/10 text-amo-red text-xs px-2.5 py-1 font-600">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}><X size={10} /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-dark-grey hover:text-amo-red underline ml-1">
                Clear all
              </button>
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className={`w-64 flex-shrink-0 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
              <div className="bg-white border border-border divide-y divide-border">
                {/* Categories Filter */}
                {!categorySlug && (
                  <div className="p-4">
                    <div className="font-display font-700 text-charcoal text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                      <SlidersHorizontal size={14} className="text-amo-red" />
                      Categories
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedCategory("")}
                        className={`w-full text-left px-2 py-1.5 text-sm transition-colors ${
                          !selectedCategory ? "text-amo-red font-600" : "text-dark-grey hover:text-charcoal"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories?.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`w-full text-left px-2 py-1.5 text-sm transition-colors flex items-center justify-between group ${
                            selectedCategory === cat.slug ? "text-amo-red font-600" : "text-dark-grey hover:text-charcoal"
                          }`}
                        >
                          {cat.name}
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands Filter */}
                {brands && brands.length > 0 && (
                  <div className="p-4">
                    <div className="font-display font-700 text-charcoal text-sm uppercase tracking-wide mb-3">
                      Brand
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedBrand("")}
                        className={`w-full text-left px-2 py-1.5 text-sm transition-colors ${
                          !selectedBrand ? "text-amo-red font-600" : "text-dark-grey hover:text-charcoal"
                        }`}
                      >
                        All Brands
                      </button>
                      {brands.map(brand => (
                        <button
                          key={brand.id}
                          onClick={() => setSelectedBrand(brand.slug)}
                          className={`w-full text-left px-2 py-1.5 text-sm transition-colors ${
                            selectedBrand === brand.slug ? "text-amo-red font-600" : "text-dark-grey hover:text-charcoal"
                          }`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Filter */}
                <div className="p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={e => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 accent-amo-red"
                    />
                    <span className="text-sm text-charcoal font-500">In Stock Only</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-white border border-border animate-pulse">
                      <div className="aspect-square bg-light-grey" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-light-grey w-3/4" />
                        <div className="h-3 bg-light-grey w-1/2" />
                        <div className="h-8 bg-light-grey mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Package size={48} className="text-mid-grey mb-4" />
                  <div className="font-display font-700 text-charcoal text-xl uppercase">No Products Found</div>
                  <div className="text-dark-grey text-sm mt-2 max-w-sm">
                    {hasFilters
                      ? "Try adjusting your filters or search term."
                      : "No products have been added to this category yet."}
                  </div>
                  {hasFilters && (
                    <button onClick={clearFilters} className="btn-primary mt-6 text-sm">
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function ProductCard({ product }: { product: any }) {
  const { addItem, hasItem } = useQuote();
  const added = hasItem(product.id);

  return (
    <div className="product-card group bg-white flex flex-col">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square bg-light-grey overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-mid-grey">
              <Package size={36} />
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <div className="font-600 text-charcoal text-sm leading-snug line-clamp-2 hover:text-amo-red transition-colors mb-1">
            {product.name}
          </div>
          {product.sku && (
            <div className="text-xs text-dark-grey mb-1">SKU: {product.sku}</div>
          )}
          {product.unit && (
            <div className="text-xs text-mid-grey">Per {product.unit}</div>
          )}
        </Link>
        <div className="mt-3 space-y-2">
          {!product.inStock && (
            <div className="text-xs text-dark-grey font-600">Out of Stock</div>
          )}
          <button
            onClick={() => addItem({
              productId: product.id,
              productName: product.name,
              productSku: product.sku,
              imageUrl: product.imageUrl,
              unit: product.unit,
            })}
            disabled={!product.inStock}
            className={`w-full py-2 text-xs font-700 uppercase tracking-wide transition-colors ${
              added
                ? "bg-charcoal text-white"
                : product.inStock
                ? "bg-amo-red text-white hover:bg-amo-red-dark"
                : "bg-light-grey text-mid-grey cursor-not-allowed"
            }`}
          >
            {added ? "✓ Added to Quote" : product.inStock ? "Add to Quote" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
