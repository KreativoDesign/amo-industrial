import { useState } from "react";
import { Link, useParams } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";
import { useQuote } from "@/contexts/QuoteContext";
import {
  Package, ShoppingCart, CheckCircle, ArrowRight, ChevronRight,
  Tag, Layers, Building2, Info, Plus, Minus
} from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem, hasItem, updateQuantity, items } = useQuote();

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({ slug });
  const { data: related } = trpc.products.list.useQuery(
    { categoryId: product?.categoryId ?? undefined, limit: 4, published: true },
    { enabled: !!product?.categoryId }
  );

  const added = product ? hasItem(product.id) : false;
  const quoteItem = product ? items.find(i => i.productId === product.id) : null;

  const handleAddToQuote = () => {
    if (!product) return;
    if (added) {
      updateQuantity(product.id, qty);
    } else {
      for (let i = 0; i < qty; i++) {
        addItem({
          productId: product.id,
          productName: product.name,
          productSku: product.sku ?? undefined,
          imageUrl: product.imageUrl ?? undefined,
          unit: product.unit ?? undefined,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-light-grey" />
            <div className="space-y-4">
              <div className="h-8 bg-light-grey w-3/4" />
              <div className="h-4 bg-light-grey w-1/2" />
              <div className="h-24 bg-light-grey" />
              <div className="h-12 bg-light-grey" />
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!product || !product.imageUrl || product.imageUrl.trim() === '') {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <Package size={48} className="text-mid-grey mx-auto mb-4" />
          <h1 className="font-display font-800 text-charcoal text-3xl uppercase">Product Not Available</h1>
          <p className="text-dark-grey mt-2 mb-6">This product is not currently available. Please check back later or browse our other products.</p>
          <Link href="/shop" className="btn-primary">Browse Products</Link>
        </div>
      </SiteLayout>
    );
  }

  const galleryRaw = product.galleryImages ? (typeof product.galleryImages === 'string' ? JSON.parse(product.galleryImages) : product.galleryImages) : [];
  const gallery = [product.imageUrl, ...galleryRaw].filter(Boolean) as string[];
  const attributes = product.attributes as Record<string, string> | null;
  const tags = product.tags as string[] | null;

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="container py-3 flex items-center gap-2 text-xs text-dark-grey">
          <Link href="/" className="hover:text-amo-red transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-amo-red transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-charcoal font-600 line-clamp-1">{product.name}</span>
        </div>
      </div>

      {/* Product Main */}
      <section className="bg-off-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="bg-white border border-border aspect-square overflow-hidden mb-3">
                {gallery.length > 0 ? (
                  <img
                    src={gallery[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-mid-grey">
                    <Package size={64} />
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="flex gap-2">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 border-2 overflow-hidden transition-colors ${
                        activeImage === i ? "border-amo-red" : "border-border hover:border-charcoal"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.inStock ? (
                  <span className="flex items-center gap-1 text-xs font-700 text-green-700 bg-green-50 px-2.5 py-1">
                    <CheckCircle size={12} /> In Stock
                  </span>
                ) : (
                  <span className="text-xs font-700 text-amo-red bg-amo-red/10 px-2.5 py-1">Out of Stock</span>
                )}
                {product.featured && (
                  <span className="text-xs font-700 text-amber-700 bg-amber-50 px-2.5 py-1">Featured</span>
                )}
              </div>

              <h1 className="font-display font-800 text-charcoal text-3xl md:text-4xl uppercase tracking-tight leading-tight mb-3">
                {product.name}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-dark-grey mb-5">
                {product.sku && (
                  <div className="flex items-center gap-1.5">
                    <Tag size={13} className="text-amo-red" />
                    <span>SKU: <span className="font-600 text-charcoal">{product.sku}</span></span>
                  </div>
                )}
                {product.unit && (
                  <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-amo-red" />
                    <span>Unit: <span className="font-600 text-charcoal">{product.unit}</span></span>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-dark-grey leading-relaxed mb-6 border-l-2 border-amo-red pl-4">
                  {product.shortDescription}
                </p>
              )}

              {/* Price */}
              {(product.price || product.priceMin) && (
                <div className="mb-6">
                  <div className="font-display font-800 text-charcoal text-2xl">
                    {product.priceMin && product.priceMax
                      ? `R${product.priceMin} – R${product.priceMax}`
                      : product.price
                      ? `R${product.price}`
                      : ""}
                  </div>
                  <div className="text-xs text-dark-grey mt-1">Price excludes VAT. Contact us for bulk pricing.</div>
                </div>
              )}

              {/* Quantity + Add to Quote */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-border bg-white">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-light-grey transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-600 text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-light-grey transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToQuote}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-display font-700 text-sm uppercase tracking-wide transition-colors ${
                    added
                      ? "bg-charcoal text-white hover:bg-charcoal-light"
                      : product.inStock
                      ? "bg-amo-red text-white hover:bg-amo-red-dark"
                      : "bg-light-grey text-mid-grey cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={16} />
                  {added ? `✓ In Quote (${quoteItem?.quantity})` : "Add to Quote"}
                </button>
              </div>

              {added && (
                <Link href="/request-quote" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-charcoal text-charcoal font-display font-700 text-sm uppercase tracking-wide hover:bg-charcoal hover:text-white transition-colors mb-6">
                  Submit Quote Request <ArrowRight size={16} />
                </Link>
              )}

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {tags.map(tag => (
                    <span key={tag} className="text-xs bg-light-grey text-dark-grey px-2.5 py-1 font-500">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Info */}
              <div className="bg-white border border-border p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-grey">
                  <CheckCircle size={13} className="text-amo-red" />
                  Professional-grade industrial quality
                </div>
                <div className="flex items-center gap-2 text-dark-grey">
                  <CheckCircle size={13} className="text-amo-red" />
                  Delivered from our Gqeberha depot
                </div>
                <div className="flex items-center gap-2 text-dark-grey">
                  <CheckCircle size={13} className="text-amo-red" />
                  Bulk pricing available — contact us
                </div>
              </div>
            </div>
          </div>

          {/* Description & Specs Tabs */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {product.description && (
                <div className="bg-white border border-border p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <Info size={16} className="text-amo-red" />
                    <h3 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight">Product Description</h3>
                  </div>
                  <div className="text-dark-grey leading-relaxed whitespace-pre-line text-sm">
                    {product.description}
                  </div>
                </div>
              )}

              {attributes && Object.keys(attributes).length > 0 && (
                <div className="bg-white border border-border p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <Layers size={16} className="text-amo-red" />
                    <h3 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight">Specifications</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(attributes).map(([key, val]) => (
                        <tr key={key} className="border-b border-border last:border-0">
                          <td className="py-2.5 pr-4 font-600 text-charcoal w-1/3">{key}</td>
                          <td className="py-2.5 text-dark-grey">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-charcoal p-6">
                <div className="font-display font-700 text-white text-base uppercase tracking-tight mb-3">
                  Need a Quote?
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Add this product to your quote list and submit a request. We'll respond within 24 hours.
                </p>
                <Link href="/request-quote" className="btn-primary w-full justify-center text-sm">
                  Request Quote <ArrowRight size={14} />
                </Link>
              </div>

              <div className="bg-white border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 size={16} className="text-amo-red" />
                  <div className="font-display font-700 text-charcoal text-sm uppercase tracking-tight">Contact Us</div>
                </div>
                <div className="space-y-2 text-sm text-dark-grey">
                  <div>+27 82 895 2245</div>
                  <div>info@amoindustrial.co.za</div>
                  <div>Mon–Fri: 08:00–17:00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related && related.filter(p => p.id !== product.id && p.imageUrl && p.imageUrl.trim() !== '').length > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-800 text-charcoal text-2xl uppercase tracking-tight">Related Products</h3>
                <Link href="/shop" className="text-amo-red text-sm font-600 uppercase tracking-wide hover:underline flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.filter(p => p.id !== product.id && p.imageUrl && p.imageUrl.trim() !== '').slice(0, 4).map(p => (
                  <RelatedCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function RelatedCard({ product }: { product: any }) {
  const { addItem, hasItem } = useQuote();
  const added = hasItem(product.id);
  return (
    <div className="product-card group bg-white">
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-square bg-light-grey overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-mid-grey"><Package size={28} /></div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/product/${product.slug}`} className="font-600 text-charcoal text-xs leading-snug line-clamp-2 hover:text-amo-red transition-colors block mb-2">
          {product.name}
        </Link>
        <button
          onClick={() => addItem({ productId: product.id, productName: product.name, productSku: product.sku, imageUrl: product.imageUrl, unit: product.unit })}
          className={`w-full py-1.5 text-xs font-700 uppercase tracking-wide transition-colors ${added ? "bg-charcoal text-white" : "bg-amo-red text-white hover:bg-amo-red-dark"}`}
        >
          {added ? "✓ Added" : "Add to Quote"}
        </button>
      </div>
    </div>
  );
}
