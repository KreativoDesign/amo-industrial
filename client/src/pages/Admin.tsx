import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Package, FileText, BarChart3, Upload, Plus, Edit2, Trash2,
  Eye, CheckCircle, Clock, Search, X, AlertCircle, LogOut,
  ChevronDown, ChevronUp, Download, RefreshCw, Settings
} from "lucide-react";

type AdminTab = "overview" | "products" | "quotes" | "import" | "categories";

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amo-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="font-display font-900 text-amo-red text-6xl mb-4">403</div>
          <div className="font-display font-700 text-white text-2xl uppercase mb-3">Access Denied</div>
          <p className="text-white/60 mb-6">You need admin privileges to access this area.</p>
          <Link href="/" className="btn-primary">Return to Site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amo-red flex items-center justify-center">
              <span className="font-display font-900 text-white text-xs">AMO</span>
            </div>
            <div>
              <div className="font-display font-700 text-white text-sm uppercase tracking-tight">Admin Panel</div>
              <div className="text-white/40 text-xs">AMO Industrial</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {([
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "products", label: "Products", icon: Package },
            { id: "quotes", label: "Quote Requests", icon: FileText },
            { id: "import", label: "CSV Import", icon: Upload },
            { id: "categories", label: "Categories", icon: Settings },
          ] as { id: AdminTab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-600 transition-colors ${
                tab === id
                  ? "bg-amo-red text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/40">
            Logged in as <span className="text-white/70">{user?.name || user?.email}</span>
          </div>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
            <Eye size={14} /> View Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {tab === "overview" && <OverviewTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "quotes" && <QuotesTab />}
          {tab === "import" && <ImportTab />}
          {tab === "categories" && <CategoriesTab />}
        </div>
      </main>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: stats } = trpc.admin.stats.useQuery();

  return (
    <div>
      <h1 className="font-display font-800 text-charcoal text-3xl uppercase tracking-tight mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Products", value: stats?.totalProducts ?? "—", icon: Package, color: "bg-blue-50 text-blue-600" },
          { label: "Quote Requests", value: stats?.totalQuotes ?? "—", icon: FileText, color: "bg-amber-50 text-amber-600" },
          { label: "Pending Quotes", value: stats?.pendingQuotes ?? "—", icon: Clock, color: "bg-amo-red/10 text-amo-red" },
          { label: "Categories", value: stats?.totalCategories ?? "—", icon: BarChart3, color: "bg-green-50 text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="font-display font-800 text-charcoal text-3xl">{value}</div>
            <div className="text-dark-grey text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Quotes */}
      <RecentQuotes />
    </div>
  );
}

function RecentQuotes() {
  const { data: quotes } = trpc.quotes.list.useQuery({ limit: 5 });
  return (
    <div className="bg-white border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight">Recent Quote Requests</h2>
        <button onClick={() => {}} className="text-amo-red text-xs font-600 uppercase tracking-wide">View All</button>
      </div>
      <div className="divide-y divide-border">
        {!quotes || quotes.length === 0 ? (
          <div className="p-8 text-center text-dark-grey text-sm">No quote requests yet.</div>
        ) : (
          quotes.map(q => (
            <div key={q.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-600 text-charcoal text-sm">{q.companyName}</div>
                <div className="text-xs text-dark-grey">{q.contactPerson} · {q.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 font-700 badge-status-${q.status}`}>{q.status}</span>
                <span className="text-xs text-dark-grey">{q.referenceNumber}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery({ search: search || undefined });
  const { data: categories } = trpc.categories.list.useQuery({});
  const { data: brands } = trpc.brands.list.useQuery();
  const deleteProduct = trpc.admin.deleteProduct.useMutation({ onSuccess: () => refetch() });
  const togglePublished = trpc.admin.toggleProductPublished.useMutation({ onSuccess: () => refetch() });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-800 text-charcoal text-3xl uppercase tracking-tight">Products</h1>
        <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-border bg-white text-sm focus:outline-none focus:border-charcoal"
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-grey"><X size={14} /></button>}
      </div>

      {/* Products Table */}
      <div className="bg-white border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-off-white border-b border-border">
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-4 bg-light-grey animate-pulse w-48" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-light-grey animate-pulse w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-light-grey animate-pulse w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-light-grey animate-pulse w-16" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-light-grey animate-pulse w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : !products || products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-dark-grey">
                    No products found. Add products or import via CSV.
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-off-white/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-light-grey flex-shrink-0 overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-mid-grey text-xs">{p.name.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <div className="font-600 text-charcoal line-clamp-1">{p.name}</div>
                          {p.sku && <div className="text-xs text-dark-grey">{p.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-grey">{p.sku || "—"}</td>
                    <td className="px-4 py-3 text-dark-grey">
                      {categories?.find(c => c.id === p.categoryId)?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 font-700 ${p.published ? "bg-green-50 text-green-700" : "bg-light-grey text-dark-grey"}`}>
                          {p.published ? "Published" : "Draft"}
                        </span>
                        {!p.inStock && <span className="text-xs px-2 py-0.5 font-700 bg-amo-red/10 text-amo-red">Out of Stock</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublished.mutate({ id: p.id, published: !p.published })}
                          className="p-1.5 text-dark-grey hover:text-charcoal transition-colors"
                          title={p.published ? "Unpublish" : "Publish"}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 text-dark-grey hover:text-charcoal transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate({ id: p.id });
                          }}
                          className="p-1.5 text-dark-grey hover:text-amo-red transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddForm || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          categories={categories || []}
          brands={brands || []}
          onClose={() => { setShowAddForm(false); setEditingProduct(null); }}
          onSuccess={() => { setShowAddForm(false); setEditingProduct(null); refetch(); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, categories, brands, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    categoryId: product?.categoryId?.toString() || "",
    brandId: product?.brandId?.toString() || "",
    imageUrl: product?.imageUrl || "",
    unit: product?.unit || "",
    price: product?.price || "",
    inStock: product?.inStock ?? true,
    published: product?.published ?? true,
    featured: product?.featured ?? false,
  });
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || "");
  const [uploading, setUploading] = useState(false);

  const createProduct = trpc.admin.createProduct.useMutation({ onSuccess });
  const updateProduct = trpc.admin.updateProduct.useMutation({ onSuccess });
  const uploadImage = trpc.admin.uploadProductImage.useMutation();

  const handleImageUpload = async (file: File) => {
    if (!product?.id) {
      alert("Save the product first before uploading an image");
      return;
    }
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const result = await uploadImage.mutateAsync({
          productId: product.id,
          imageBase64: base64,
          filename: file.name,
        });
        setImagePreview(result.imageUrl);
        setForm(f => ({ ...f, imageUrl: result.imageUrl }));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      brandId: form.brandId ? parseInt(form.brandId) : undefined,
      price: form.price || undefined,
    };
    if (product) {
      updateProduct.mutate({ id: product.id, ...data });
    } else {
      createProduct.mutate(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-charcoal text-white">
          <h2 className="font-display font-700 text-lg uppercase">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Product Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal" />
            </div>
            <div>
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">SKU</label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal" />
            </div>
            <div>
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Unit</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="e.g. Each, Box, Meter"
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal" />
            </div>
            <div>
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal">
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Brand</label>
              <select value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal">
                <option value="">Select brand</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Price (ZAR)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Product Image</label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-border rounded p-4 text-center cursor-pointer hover:border-charcoal transition-colors"
              >
                {imagePreview ? (
                  <div className="flex items-center gap-4">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-600 text-charcoal mb-2">Image uploaded</p>
                      <label className="text-xs text-amo-red cursor-pointer hover:underline">
                        Change image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-sm font-600 text-charcoal mb-1">Drag and drop image here</p>
                      <p className="text-xs text-dark-grey mb-3">or click to select</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        className="hidden"
                        disabled={uploading}
                      />
                    </div>
                  </label>
                )}
                {uploading && <p className="text-xs text-dark-grey mt-2">Uploading...</p>}
              </div>
              <p className="text-xs text-dark-grey mt-2">Or paste image URL directly:</p>
              <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal mt-1" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Short Description</label>
              <input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal resize-none" />
            </div>
            <div className="col-span-2 flex gap-6">
              {[
                { key: "inStock", label: "In Stock" },
                { key: "published", label: "Published" },
                { key: "featured", label: "Featured" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-amo-red" />
                  <span className="text-sm font-600 text-charcoal">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createProduct.isPending || updateProduct.isPending}
              className="btn-primary flex-1 justify-center">
              {createProduct.isPending || updateProduct.isPending ? "Saving..." : product ? "Update Product" : "Add Product"}
            </button>
            <button type="button" onClick={onClose} className="btn-outline px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Quotes Tab ────────────────────────────────────────────────────────────────
function QuotesTab() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: quotes, isLoading, refetch } = trpc.quotes.list.useQuery({
    status: statusFilter as any || undefined,
  });
  const updateStatus = trpc.admin.updateQuoteStatus.useMutation({ onSuccess: () => refetch() });

  const STATUS_OPTIONS = ["pending", "reviewing", "quoted", "accepted", "declined"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-800 text-charcoal text-3xl uppercase tracking-tight">Quote Requests</h1>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border bg-white text-sm focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white border border-border divide-y divide-border">
        {isLoading ? (
          <div className="p-8 text-center text-dark-grey">Loading...</div>
        ) : !quotes || quotes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={36} className="text-mid-grey mx-auto mb-3" />
            <div className="font-600 text-charcoal">No quote requests yet</div>
            <div className="text-dark-grey text-sm mt-1">Quote requests will appear here when customers submit them.</div>
          </div>
        ) : (
          quotes.map(q => (
            <div key={q.id}>
              <div
                className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-off-white/50 transition-colors"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-600 text-charcoal">{q.companyName}</div>
                    <div className="text-xs text-dark-grey">{q.contactPerson} · {q.email} · {q.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 font-700 badge-status-${q.status}`}>
                    {q.status}
                  </span>
                  <span className="text-xs text-dark-grey hidden sm:block">{q.referenceNumber}</span>
                  <span className="text-xs text-dark-grey hidden md:block">
                    {new Date(q.createdAt).toLocaleDateString("en-ZA")}
                  </span>
                  {expandedId === q.id ? <ChevronUp size={16} className="text-mid-grey" /> : <ChevronDown size={16} className="text-mid-grey" />}
                </div>
              </div>

              {expandedId === q.id && (
                <div className="px-5 pb-5 bg-off-white/50 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <div className="font-700 text-charcoal text-sm uppercase tracking-wide mb-2">Quote Items</div>
                      <QuoteItemsList quoteId={q.id} />
                      {q.notes && (
                        <div className="mt-3">
                          <div className="font-700 text-charcoal text-xs uppercase tracking-wide mb-1">Customer Notes</div>
                          <div className="text-dark-grey text-sm bg-white border border-border p-3">{q.notes}</div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-700 text-charcoal text-sm uppercase tracking-wide mb-2">Update Status</div>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus.mutate({ id: q.id, status: s as any })}
                            className={`px-3 py-1.5 text-xs font-700 uppercase tracking-wide transition-colors ${
                              q.status === s
                                ? "bg-charcoal text-white"
                                : "bg-white border border-border text-dark-grey hover:border-charcoal hover:text-charcoal"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QuoteItemsList({ quoteId }: { quoteId: number }) {
  const { data: items } = trpc.quotes.getItems.useQuery({ quoteRequestId: quoteId });
  if (!items || items.length === 0) return <div className="text-dark-grey text-sm">No items</div>;
  return (
    <div className="space-y-1">
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between text-sm bg-white border border-border px-3 py-2">
          <div>
            <span className="font-600 text-charcoal">{item.productName}</span>
            {item.productSku && <span className="text-dark-grey ml-2 text-xs">({item.productSku})</span>}
          </div>
          <span className="text-dark-grey">Qty: <span className="font-600 text-charcoal">{item.quantity}</span></span>
        </div>
      ))}
    </div>
  );
}

// ── CSV Import Tab ────────────────────────────────────────────────────────────
function ImportTab() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const importCsv = trpc.admin.importCsv.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setImporting(false);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (err) => {
      setError(err.message);
      setImporting(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "text/csv") {
      setFile(f);
      setError("");
      setResult(null);
    } else {
      setError("Please select a valid CSV file.");
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError("");
    const text = await file.text();
    importCsv.mutate({ csvContent: text });
  };

  return (
    <div>
      <h1 className="font-display font-800 text-charcoal text-3xl uppercase tracking-tight mb-2">CSV Product Import</h1>
      <p className="text-dark-grey text-sm mb-8">
        Import products in bulk from a CSV file. The system will create or update products based on SKU.
      </p>

      {/* Format Guide */}
      <div className="bg-white border border-border p-6 mb-6">
        <h2 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight mb-4">CSV Format</h2>
        <p className="text-dark-grey text-sm mb-3">Your CSV file should include the following columns (WooCommerce export format is supported):</p>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr className="bg-off-white">
                {["name", "sku", "description", "short_description", "categories", "brands", "images", "price", "stock_status"].map(col => (
                  <th key={col} className="px-3 py-2 text-left font-700 text-charcoal border border-border">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {["Product Name", "SKU-001", "Full description...", "Short desc", "Hand Tools", "Brand Name", "https://...", "299.99", "instock"].map((val, i) => (
                  <td key={i} className="px-3 py-2 text-dark-grey border border-border">{val}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-dark-grey mt-3">
          Supported column aliases: <code className="bg-light-grey px-1">Name</code>, <code className="bg-light-grey px-1">SKU</code>, <code className="bg-light-grey px-1">Description</code>, <code className="bg-light-grey px-1">Categories</code>, <code className="bg-light-grey px-1">Images</code>, <code className="bg-light-grey px-1">Regular price</code>
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white border border-border p-6 mb-6">
        <h2 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight mb-4">Upload CSV File</h2>

        <div
          className={`border-2 border-dashed p-10 text-center transition-colors ${
            file ? "border-amo-red bg-amo-red/5" : "border-border hover:border-charcoal"
          }`}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) { setFile(f); setError(""); setResult(null); }
          }}
        >
          <Upload size={32} className={`mx-auto mb-3 ${file ? "text-amo-red" : "text-mid-grey"}`} />
          {file ? (
            <div>
              <div className="font-600 text-charcoal mb-1">{file.name}</div>
              <div className="text-dark-grey text-sm">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          ) : (
            <div>
              <div className="font-600 text-charcoal mb-1">Drag & drop your CSV file here</div>
              <div className="text-dark-grey text-sm">or click to browse</div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-amo-red text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="btn-primary"
          >
            {importing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Importing...
              </span>
            ) : (
              <><Upload size={16} /> Import Products</>
            )}
          </button>
          {file && (
            <button onClick={() => { setFile(null); setResult(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="btn-outline px-4">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-green-600" />
            <h2 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight">Import Complete</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-4 text-center">
              <div className="font-display font-800 text-green-700 text-3xl">{result.created}</div>
              <div className="text-green-600 text-sm font-600">Created</div>
            </div>
            <div className="bg-blue-50 p-4 text-center">
              <div className="font-display font-800 text-blue-700 text-3xl">{result.updated}</div>
              <div className="text-blue-600 text-sm font-600">Updated</div>
            </div>
            <div className="bg-amber-50 p-4 text-center">
              <div className="font-display font-800 text-amber-700 text-3xl">{result.skipped}</div>
              <div className="text-amber-600 text-sm font-600">Skipped</div>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div>
              <div className="font-700 text-charcoal text-sm mb-2">Errors ({result.errors.length}):</div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((err: string, i: number) => (
                  <div key={i} className="text-xs text-amo-red bg-amo-red/5 px-3 py-1.5">{err}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Categories Tab ────────────────────────────────────────────────────────────
function CategoriesTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const { data: categories, refetch } = trpc.categories.list.useQuery({});
  const createCategory = trpc.admin.createCategory.useMutation({
    onSuccess: () => { refetch(); setShowAdd(false); setForm({ name: "", description: "" }); }
  });
  const deleteCategory = trpc.admin.deleteCategory.useMutation({ onSuccess: () => refetch() });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-800 text-charcoal text-3xl uppercase tracking-tight">Categories</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-border p-5 mb-5">
          <h3 className="font-display font-700 text-charcoal text-base uppercase tracking-tight mb-4">New Category</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal" />
            </div>
            <div>
              <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border text-sm focus:outline-none focus:border-charcoal" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createCategory.mutate(form)} className="btn-primary text-sm">
              {createCategory.isPending ? "Creating..." : "Create Category"}
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-outline text-sm px-4">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-border divide-y divide-border">
        {!categories || categories.length === 0 ? (
          <div className="p-8 text-center text-dark-grey text-sm">No categories yet.</div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="font-600 text-charcoal">{cat.name}</div>
                <div className="text-xs text-dark-grey">/category/{cat.slug}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/category/${cat.slug}`} className="p-1.5 text-dark-grey hover:text-charcoal transition-colors">
                  <Eye size={14} />
                </Link>
                <button
                  onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCategory.mutate({ id: cat.id }); }}
                  className="p-1.5 text-dark-grey hover:text-amo-red transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
