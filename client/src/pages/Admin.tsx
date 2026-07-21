import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Package, FileText, BarChart3, Upload, Plus, Edit2, Trash2,
  Eye, CheckCircle, Clock, Search, X, AlertCircle, LogOut, Menu,
  ChevronDown, ChevronUp, Download, RefreshCw, Settings
} from "lucide-react";

type AdminTab = "overview" | "products" | "quotes" | "import" | "categories";

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-off-white flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-charcoal border-b border-white/10 flex items-center justify-between p-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amo-red flex items-center justify-center">
            <span className="font-display font-900 text-white text-xs">AMO</span>
          </div>
          <div className="font-display font-700 text-white text-sm uppercase tracking-tight">Admin</div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/60 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 w-full lg:w-64 bg-charcoal flex-shrink-0 flex flex-col fixed lg:static top-16 left-0 right-0 bottom-0 z-40 lg:z-auto overflow-y-auto lg:overflow-y-visible transition-transform duration-300 ease-out`}>
        <div className="hidden lg:block p-5 border-b border-white/10">
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

        <nav className="flex-1 p-4 space-y-1.5">
          {([
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "products", label: "Products", icon: Package },
            { id: "quotes", label: "Quote Requests", icon: FileText },
            { id: "import", label: "CSV Import", icon: Upload },
            { id: "categories", label: "Categories", icon: Settings },
          ] as { id: AdminTab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setSidebarOpen(false);
              }}
              aria-current={tab === id ? "page" : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-600 transition-all duration-200 ease-out rounded-lg ${
                tab === id
                  ? "bg-amo-red text-white shadow-lg shadow-amo-red/20"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon size={18} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto space-y-2">
          <div className="px-4 py-2 text-xs text-white/40 truncate">
            Logged in as <span className="text-white/70 font-600 truncate">{user?.name || user?.email}</span>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 ease-out rounded-lg">
            <Eye size={16} /> View Site
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-in fade-in duration-200 ease-out"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 lg:p-8">
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
      <h1 className="font-display font-800 text-charcoal text-2xl lg:text-3xl uppercase tracking-tight mb-6 lg:mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-6 lg:mb-8">
        {[
          { label: "Total Products", value: stats?.totalProducts ?? "—", icon: Package, color: "bg-blue-50 text-blue-600" },
          { label: "Quote Requests", value: stats?.totalQuotes ?? "—", icon: FileText, color: "bg-amber-50 text-amber-600" },
          { label: "Pending Quotes", value: stats?.pendingQuotes ?? "—", icon: Clock, color: "bg-amo-red/10 text-amo-red" },
          { label: "Categories", value: stats?.totalCategories ?? "—", icon: BarChart3, color: "bg-green-50 text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-border p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="font-display font-800 text-charcoal text-2xl lg:text-3xl">{value}</div>
            <div className="text-dark-grey text-xs lg:text-sm mt-1">{label}</div>
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
    <div className="bg-white border border-border overflow-hidden">
      <div className="px-4 lg:px-5 py-4 border-b border-border flex items-center justify-between gap-2">
        <h2 className="font-display font-700 text-charcoal text-base lg:text-lg uppercase tracking-tight truncate">Recent Quote Requests</h2>
        <button onClick={() => {}} className="text-amo-red text-xs font-600 uppercase tracking-wide flex-shrink-0">View All</button>
      </div>
      <div className="divide-y divide-border">
        {!quotes || quotes.length === 0 ? (
          <div className="p-6 lg:p-8 text-center text-dark-grey text-sm">No quote requests yet.</div>
        ) : (
          quotes.map(q => (
            <div key={q.id} className="px-4 lg:px-5 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-600 text-charcoal text-sm truncate">{q.companyName}</div>
                <div className="text-xs text-dark-grey truncate">{q.contactPerson} · {q.email}</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h1 className="font-display font-800 text-charcoal text-2xl lg:text-3xl uppercase tracking-tight">Products</h1>
        <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm w-full lg:w-auto">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 w-full lg:max-w-sm">
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

      {/* Products Table - Mobile Card View on small screens */}
      <div className="bg-white border border-border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
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
                        <div className="min-w-0">
                          <div className="font-600 text-charcoal line-clamp-1 text-sm">{p.name}</div>
                          {p.sku && <div className="text-xs text-dark-grey">{p.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-grey text-sm">{p.sku || "—"}</td>
                    <td className="px-4 py-3 text-dark-grey text-sm">
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

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="h-4 bg-light-grey animate-pulse w-3/4" />
                <div className="h-4 bg-light-grey animate-pulse w-1/2" />
              </div>
            ))
          ) : !products || products.length === 0 ? (
            <div className="p-8 text-center text-dark-grey text-sm">
              No products found. Add products or import via CSV.
            </div>
          ) : (
            products.map(p => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-light-grey flex-shrink-0 overflow-hidden rounded">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-mid-grey text-sm font-600">{p.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-600 text-charcoal text-sm truncate">{p.name}</div>
                    <div className="text-xs text-dark-grey mt-1">{p.sku || "No SKU"}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 font-700 ${p.published ? "bg-green-50 text-green-700" : "bg-light-grey text-dark-grey"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                    {!p.inStock && <span className="text-xs px-2 py-0.5 font-700 bg-amo-red/10 text-amo-red">Out of Stock</span>}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => togglePublished.mutate({ id: p.id, published: !p.published })}
                    className="p-2 text-dark-grey hover:text-charcoal transition-colors"
                    title={p.published ? "Unpublish" : "Publish"}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="p-2 text-dark-grey hover:text-charcoal transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate({ id: p.id });
                    }}
                    className="p-2 text-dark-grey hover:text-amo-red transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
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

// ── Placeholder Tabs ──────────────────────────────────────────────────────────
function QuotesTab() {
  const { data: quotes } = trpc.quotes.list.useQuery({});
  return (
    <div>
      <h1 className="font-display font-800 text-charcoal text-2xl lg:text-3xl uppercase tracking-tight mb-6">Quote Requests</h1>
      <div className="bg-white border border-border overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-off-white border-b border-border">
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Company</th>
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Contact</th>
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-700 text-charcoal text-xs uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!quotes || quotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-dark-grey">
                    No quote requests yet.
                  </td>
                </tr>
              ) : (
                quotes.map(q => (
                  <tr key={q.id} className="hover:bg-off-white/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-600">{q.companyName}</td>
                    <td className="px-4 py-3 text-sm">{q.contactPerson}</td>
                    <td className="px-4 py-3 text-sm text-dark-grey">{q.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 font-700 badge-status-${q.status}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-grey">{new Date(q.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-border">
          {!quotes || quotes.length === 0 ? (
            <div className="p-8 text-center text-dark-grey text-sm">No quote requests yet.</div>
          ) : (
            quotes.map(q => (
              <div key={q.id} className="p-4 space-y-2">
                <div className="font-600 text-charcoal">{q.companyName}</div>
                <div className="text-sm text-dark-grey">{q.contactPerson}</div>
                <div className="text-sm text-dark-grey">{q.email}</div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className={`text-xs px-2 py-0.5 font-700 badge-status-${q.status}`}>{q.status}</span>
                  <span className="text-xs text-dark-grey">{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ImportTab() {
  const [importUrl, setImportUrl] = useState("");
  const [importResults, setImportResults] = useState<any>(null);
  const [replicateResults, setReplicateResults] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isReplicating, setIsReplicating] = useState(false);

  const importBulkUrls = trpc.admin.importBulkUrls.useMutation({
    onSuccess: (data) => {
      setImportResults(data);
      setIsImporting(false);
    },
    onError: (error) => {
      alert("Import failed: " + error.message);
      setIsImporting(false);
    },
  });

  const replicateImages = trpc.admin.replicateProductImages.useMutation({
    onSuccess: (data) => {
      setReplicateResults(data);
      setIsReplicating(false);
      alert(`Successfully replicated images to ${data.replicated} products!`);
    },
    onError: (error) => {
      alert("Replication failed: " + error.message);
      setIsReplicating(false);
    },
  });

  const handleImport = async () => {
    setIsImporting(true);
    importBulkUrls.mutate({ products: [] });
  };

  const handleReplicate = async () => {
    setIsReplicating(true);
    replicateImages.mutate({});
  };

  return (
    <div>
      <h1 className="font-display font-800 text-charcoal text-2xl lg:text-3xl uppercase tracking-tight mb-6">Import Products</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import from URL */}
        <div className="bg-white border border-border p-6">
          <h2 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight mb-4">Import from URL</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-600 text-charcoal mb-2">Product URL</label>
            <div className="p-4 bg-off-white rounded text-sm text-dark-grey">
              Click the button below to import products from your WordPress shop.
            </div>
            </div>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="btn-primary w-full"
            >
              {isImporting ? "Importing..." : "Import WordPress Images"}
            </button>
          </div>
        </div>

        {/* Replicate Images */}
        <div className="bg-white border border-border p-6">
          <h2 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight mb-4">Replicate Images</h2>
          <div className="space-y-4">
            <div className="p-4 bg-off-white rounded text-sm text-dark-grey">
              Automatically copy images from one product variant to all matching variants (e.g., Drillbits 3mm → Drillbits 5mm)
            </div>
            <button
              onClick={handleReplicate}
              disabled={isReplicating}
              className="btn-primary w-full"
            >
              {isReplicating ? "Replicating..." : "Replicate Images Across Variants"}
            </button>
          </div>
        </div>

        {/* Import Results */}
        {importResults && (
          <div className="bg-white border border-border p-6">
            <h2 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight mb-4">Import Results</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-600">Matched:</span> {importResults.matched}</div>
              <div><span className="font-600">Updated:</span> {importResults.updated}</div>
              <div><span className="font-600">Unmatched:</span> {importResults.unmatched}</div>
            </div>
          </div>
        )}

        {/* Replicate Results */}
        {replicateResults && (
          <div className="bg-white border border-border p-6">
            <h2 className="font-display font-700 text-charcoal text-lg uppercase tracking-tight mb-4">Replication Results</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-600">Replicated:</span> {replicateResults.replicated} products</div>
              <div><span className="font-600">Total Processed:</span> {replicateResults.total} products</div>
              {replicateResults.results && replicateResults.results.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="font-600 mb-2">Variant Groups Updated:</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {replicateResults.results.map((result: any, idx: number) => (
                      <div key={idx} className="text-xs text-dark-grey">
                        {result.name} ({result.variants} variants)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { data: categories } = trpc.categories.list.useQuery({});
  return (
    <div>
      <h1 className="font-display font-800 text-charcoal text-2xl lg:text-3xl uppercase tracking-tight mb-6">Categories</h1>
      <div className="bg-white border border-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 lg:p-6">
          {!categories || categories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-dark-grey">No categories found.</div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="border border-border p-4 rounded hover:bg-off-white/50 transition-colors">
                <div className="font-600 text-charcoal">{cat.name}</div>
                <div className="text-xs text-dark-grey mt-1">{cat.slug}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Product Form Modal ────────────────────────────────────────────────────────
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
    price: product?.price || 0,
  });

  const createProduct = trpc.admin.createProduct.useMutation({ onSuccess });
  const updateProduct = trpc.admin.updateProduct.useMutation({ onSuccess });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (product?.id) {
      updateProduct.mutate({ id: product.id, ...form });
    } else {
      createProduct.mutate(form);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border p-4 lg:p-6 flex items-center justify-between">
          <h2 className="font-display font-700 text-charcoal text-lg lg:text-xl uppercase tracking-tight">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="text-dark-grey hover:text-charcoal">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 lg:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-600 text-charcoal mb-2">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-border bg-white text-sm focus:outline-none focus:border-charcoal"
              />
            </div>
            <div>
              <label className="block text-sm font-600 text-charcoal mb-2">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-4 py-2.5 border border-border bg-white text-sm focus:outline-none focus:border-charcoal"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-600 text-charcoal mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-border bg-white text-sm focus:outline-none focus:border-charcoal"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-600 text-charcoal mb-2">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-border bg-white text-sm focus:outline-none focus:border-charcoal"
              >
                <option value="">Select category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-600 text-charcoal mb-2">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 border border-border bg-white text-sm focus:outline-none focus:border-charcoal"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border text-charcoal hover:bg-off-white transition-colors text-sm font-600">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createProduct.isPending || updateProduct.isPending}
              className="flex-1 btn-primary text-sm"
            >
              {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
