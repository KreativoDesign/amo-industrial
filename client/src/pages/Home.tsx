import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import {
  ArrowRight, Shield, Truck, Award, Users, Phone, Mail, MapPin,
  CheckCircle, Package, Wrench, Zap, HardHat, ChevronRight
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useQuote } from "@/contexts/QuoteContext";

const CATEGORY_HIGHLIGHTS = [
  { name: "Hand Tools", slug: "hand-tools", icon: Wrench, desc: "Professional-grade hand tools for every trade" },
  { name: "Safety Gear", slug: "safety-gear", icon: HardHat, desc: "PPE and safety equipment for all industries" },
  { name: "Power Tools", slug: "power-tools", icon: Zap, desc: "Heavy-duty power tools and accessories" },
  { name: "Building Supplies", slug: "building-supplies", icon: Package, desc: "Construction materials and building essentials" },
  { name: "Automotive", slug: "automotive", icon: Shield, desc: "Automotive parts, fluids, and accessories" },
  { name: "Adhesives", slug: "adhesives", icon: CheckCircle, desc: "Industrial adhesives, sealants, and bonding agents" },
];

const VALUE_PROPS = [
  {
    icon: Truck,
    title: "Fast Local Delivery",
    desc: "Delivered from our Gqeberha depot straight to your site. Fast, reliable, and trackable.",
  },
  {
    icon: Award,
    title: "National Buying Power",
    desc: "We combine local service with national group buying power — meaning better prices for you.",
  },
  {
    icon: Shield,
    title: "Professional Grade",
    desc: "Every product meets industrial standards. We supply only professional-grade equipment.",
  },
  {
    icon: Users,
    title: "Expert Support",
    desc: "Technical advice and consultation from our experienced industrial supply team.",
  },
];

const QUOTE_STEPS = [
  { step: "01", title: "Browse the Catalogue", desc: "Explore our full range of industrial and commercial products across all categories." },
  { step: "02", title: "Add to Quote List", desc: "Click 'Add to Quote' on any product. Adjust quantities in your quote drawer." },
  { step: "03", title: "Submit Your Request", desc: "Fill in your company details and submit. No payment required at this stage." },
  { step: "04", title: "We Respond Fast", desc: "Our team reviews your quote and responds within 24 business hours with pricing." },
];

const SECTORS = [
  "Construction & Building", "Manufacturing", "Mining & Resources",
  "Automotive Workshops", "Maintenance Teams", "Government & Municipal",
  "Retail & Commercial", "Agriculture", "Marine & Offshore",
];

export default function Home() {
  const { data: featuredProducts } = trpc.products.list.useQuery({
    featured: true,
    limit: 8,
    published: true,
  });

  return (
    <SiteLayout>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative bg-charcoal overflow-hidden min-h-[580px] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 industrial-overlay opacity-30" />
        {/* Red accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amo-red" />
        {/* Red chevron decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center">
          <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-charcoal-light/40 to-transparent" />
            {/* Decorative diagonal lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 600" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="400" y2="600" stroke="white" strokeWidth="1" />
              <line x1="80" y1="0" x2="480" y2="600" stroke="white" strokeWidth="1" />
              <line x1="160" y1="0" x2="560" y2="600" stroke="white" strokeWidth="1" />
            </svg>
            {/* Large AMO text watermark */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-900 text-[180px] text-white/5 leading-none select-none">AMO</span>
            </div>
          </div>
        </div>

        <div className="container relative z-10 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amo-red/20 border border-amo-red/30 text-amo-red px-3 py-1.5 text-xs font-700 uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-amo-red rounded-full" />
              Gqeberha's Industrial Supply Partner
            </div>
            <h1 className="font-display font-900 text-white text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.95] tracking-tight mb-6">
              Your Direct Source for{" "}
              <span className="text-amo-red">Industrial</span>{" "}
              &amp;{" "}
              <span className="text-amo-red">Commercial</span>{" "}
              Supplies
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
              Shop premium-grade consumables, safety gear, and professional equipment. Delivered from our Gqeberha depot, straight to your site.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary text-base px-8 py-4">
                Browse Products <ArrowRight size={18} />
              </Link>
              <Link href="/request-quote" className="btn-outline-white text-base px-8 py-4">
                Request a Quote
              </Link>
            </div>
            {/* Trust signals */}
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-amo-red" />
                <span>Local Gqeberha Depot</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-amo-red" />
                <span>Fast & Reliable Supply</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-amo-red" />
                <span>Competitive Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Propositions ────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-12 h-12 bg-amo-red/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-amo-red" />
                </div>
                <div>
                  <div className="font-display font-700 text-charcoal text-base uppercase tracking-tight mb-1">{title}</div>
                  <div className="text-dark-grey text-sm leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Highlights ───────────────────────────────────────────── */}
      <section className="bg-off-white py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="accent-line" />
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle mt-3">
                Browse our comprehensive range of industrial and commercial supplies across all major product categories.
              </p>
            </div>
            <Link href="/categories" className="btn-outline flex-shrink-0">
              All Categories <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORY_HIGHLIGHTS.map(({ name, slug, icon: Icon, desc }) => (
              <Link
                key={slug}
                href={`/category/${slug}`}
                className="product-card group flex gap-5 p-6"
              >
                <div className="w-14 h-14 bg-charcoal group-hover:bg-amo-red flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-display font-700 text-charcoal text-lg uppercase tracking-tight group-hover:text-amo-red transition-colors">{name}</div>
                  <div className="text-dark-grey text-sm mt-1 leading-relaxed">{desc}</div>
                  <div className="flex items-center gap-1 text-amo-red text-xs font-700 uppercase tracking-wide mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse Products <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      {featuredProducts && featuredProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '').length > 0 && (
        <section className="bg-white py-20">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="accent-line" />
                <h2 className="section-title">Featured Products</h2>
              </div>
              <Link href="/shop" className="btn-outline flex-shrink-0">
                View All Products <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '').map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How Quotes Work ───────────────────────────────────────────────── */}
      <section className="bg-charcoal py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-block w-12 h-0.5 bg-amo-red mb-4" />
            <h2 className="font-display font-900 text-white text-4xl md:text-5xl uppercase tracking-tight">
              How Quotes Work
            </h2>
            <p className="text-white/60 mt-3 max-w-lg mx-auto">
              No checkout. No payment. Just a simple quote request process designed for B2B procurement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUOTE_STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < QUOTE_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-white/10 z-0" style={{ width: "calc(100% - 4rem)", left: "4rem" }} />
                )}
                <div className="relative z-10">
                  <div className="font-display font-900 text-amo-red text-5xl leading-none mb-4">{step}</div>
                  <div className="font-display font-700 text-white text-xl uppercase tracking-tight mb-2">{title}</div>
                  <div className="text-white/60 text-sm leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/request-quote" className="btn-primary text-base px-10 py-4">
              Start Your Quote <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sectors We Supply ─────────────────────────────────────────────── */}
      <section className="bg-off-white py-16">
        <div className="container">
          <div className="text-center mb-8">
            <div className="accent-line mx-auto" />
            <h2 className="section-title">We Supply All Sectors</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {SECTORS.map(sector => (
              <div key={sector} className="bg-white border border-border px-4 py-2 text-sm font-600 text-charcoal">
                {sector}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Section ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="accent-line" />
              <h2 className="section-title mb-5">The AMO Industrial Advantage</h2>
              <p className="text-dark-grey leading-relaxed mb-5">
                AMO Industrial is your trusted, local Gqeberha partner for specialist industrial and commercial supplies. We combine the swift service of a dedicated local depot with the unmatched buying power of a national group.
              </p>
              <p className="text-dark-grey leading-relaxed mb-8">
                Whether you're a contractor, workshop, procurement team, or maintenance crew — we ensure you get professional-grade equipment and consumables at competitive prices, every time.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "Local Gqeberha Depot",
                  "Fast & Reliable Supply",
                  "National Buying Power",
                  "Competitive Pricing",
                  "Professional Equipment",
                  "Expert Support",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm font-600 text-charcoal">
                    <CheckCircle size={14} className="text-amo-red flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/contact" className="btn-primary">
                Get in Touch <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-charcoal p-10 relative overflow-hidden">
              <div className="industrial-overlay absolute inset-0 opacity-20" />
              <div className="relative z-10">
                <div className="font-display font-900 text-amo-red text-7xl leading-none mb-2">AMO</div>
                <div className="font-display font-800 text-white text-3xl uppercase tracking-tight mb-6">Industrial</div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-amo-red flex-shrink-0 mt-1" />
                    <span className="text-white/70 text-sm">115D Mount Road, Mount Croix, Gqeberha, 6001</span>
                  </div>
                  <a href="tel:+27828952245" className="flex items-center gap-3 text-white/70 hover:text-amo-red transition-colors text-sm">
                    <Phone size={16} className="text-amo-red flex-shrink-0" />
                    +27 82 895 2245
                  </a>
                  <a href="mailto:info@amoindustrial.co.za" className="flex items-center gap-3 text-white/70 hover:text-amo-red transition-colors text-sm">
                    <Mail size={16} className="text-amo-red flex-shrink-0" />
                    info@amoindustrial.co.za
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

// ── Inline Product Card ────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const { addItem, hasItem } = useQuote();
  const added = hasItem(product.id);

  return (
    <Link href={`/product/${product.slug}`} className="product-card group block">
      <div className="aspect-square bg-light-grey overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mid-grey">
            <Package size={32} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="font-600 text-charcoal text-sm leading-snug line-clamp-2 mb-2">{product.name}</div>
        {product.sku && <div className="text-xs text-dark-grey mb-3">SKU: {product.sku}</div>}
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem({ productId: product.id, productName: product.name, productSku: product.sku, imageUrl: product.imageUrl, unit: product.unit });
          }}
          className={`w-full py-2 text-xs font-700 uppercase tracking-wide transition-colors ${
            added
              ? "bg-charcoal text-white"
              : "bg-amo-red text-white hover:bg-amo-red-dark"
          }`}
        >
          {added ? "✓ Added to Quote" : "Add to Quote"}
        </button>
      </div>
    </Link>
  );
}
