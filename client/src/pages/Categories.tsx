import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";
import { Package, ChevronRight, ArrowRight } from "lucide-react";

const CATEGORY_META: Record<string, { icon: string; desc: string }> = {
  "accessories": { icon: "🔧", desc: "Tools accessories, fittings, and add-ons for all applications" },
  "adhesives": { icon: "🧴", desc: "Industrial adhesives, sealants, and bonding agents" },
  "automotive": { icon: "🚗", desc: "Automotive parts, fluids, lubricants, and accessories" },
  "building-supplies": { icon: "🏗️", desc: "Construction materials, hardware, and building essentials" },
  "hand-tools": { icon: "🔨", desc: "Professional-grade hand tools for every trade and application" },
  "safety-gear": { icon: "🦺", desc: "PPE, protective clothing, and safety equipment" },
  "power-tools": { icon: "⚡", desc: "Heavy-duty power tools, drills, grinders, and accessories" },
  "electrical": { icon: "💡", desc: "Electrical components, cables, switches, and fittings" },
  "fasteners": { icon: "🔩", desc: "Bolts, nuts, screws, anchors, and fixing solutions" },
  "cleaning": { icon: "🧹", desc: "Industrial cleaning products, chemicals, and hygiene supplies" },
  "plumbing": { icon: "🚿", desc: "Pipes, fittings, valves, and plumbing accessories" },
  "welding": { icon: "🔥", desc: "Welding equipment, consumables, and cutting tools" },
};

export default function Categories() {
  const { data: categories, isLoading } = trpc.categories.list.useQuery({});

  const allCategories = categories && categories.length > 0
    ? categories
    : Object.entries(CATEGORY_META).map(([slug, meta], i) => ({
        id: i + 1,
        slug,
        name: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        description: meta.desc,
        imageUrl: null,
        parentId: null,
        sortOrder: i,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

  return (
    <SiteLayout>
      {/* Page Header */}
      <section className="bg-charcoal py-14 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amo-red" />
        <div className="industrial-overlay absolute inset-0 opacity-20" />
        <div className="container relative z-10">
          <div className="text-white/50 text-xs font-600 uppercase tracking-widest mb-3">
            <Link href="/" className="hover:text-amo-red transition-colors">Home</Link>
            {" / "}Categories
          </div>
          <h1 className="font-display font-900 text-white text-5xl md:text-6xl uppercase tracking-tight">
            All Categories
          </h1>
          <p className="text-white/60 mt-3 max-w-lg">
            Browse our comprehensive range of industrial and commercial supplies across all product categories.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-off-white">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white border border-border p-6 animate-pulse">
                  <div className="w-14 h-14 bg-light-grey mb-4" />
                  <div className="h-5 bg-light-grey w-3/4 mb-2" />
                  <div className="h-3 bg-light-grey w-full mb-1" />
                  <div className="h-3 bg-light-grey w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allCategories.map(cat => {
                const meta = CATEGORY_META[cat.slug] || { icon: "📦", desc: cat.description || "" };
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="product-card group bg-white flex gap-5 p-6"
                  >
                    <div className="w-14 h-14 bg-charcoal group-hover:bg-amo-red flex items-center justify-center flex-shrink-0 transition-colors duration-200 text-2xl">
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-700 text-charcoal text-lg uppercase tracking-tight group-hover:text-amo-red transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-dark-grey text-sm mt-1 leading-relaxed line-clamp-2">
                        {meta.desc || cat.description}
                      </div>
                      <div className="flex items-center gap-1 text-amo-red text-xs font-700 uppercase tracking-wide mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        Browse Products <ArrowRight size={12} />
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-mid-grey group-hover:text-amo-red transition-colors flex-shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
