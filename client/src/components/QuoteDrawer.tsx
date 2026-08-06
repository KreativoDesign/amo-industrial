import { X, Minus, Plus, Trash2, ArrowRight, ShoppingCart, Download, FileText } from "lucide-react";
import { useQuote } from "@/contexts/QuoteContext";
import { Link } from "wouter";
import { exportQuoteAsCSV, exportQuoteAsPDF } from "@/lib/quoteExport";

export default function QuoteDrawer() {
  const { items, count, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useQuote();

  const handleDownloadCSV = () => {
    const exportDate = new Date().toLocaleString();
    exportQuoteAsCSV({
      items,
      exportDate,
    });
  };

  const handleDownloadPDF = () => {
    const exportDate = new Date().toLocaleString();
    exportQuoteAsPDF({
      items,
      exportDate,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[70] flex flex-col shadow-overlay transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-charcoal text-white">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-amo-red" />
            <div>
              <div className="font-display font-700 text-lg uppercase tracking-wide">Your Quote</div>
              <div className="text-white/60 text-xs">{count} item{count !== 1 ? "s" : ""} added</div>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="w-16 h-16 bg-light-grey flex items-center justify-center">
                <ShoppingCart size={28} className="text-mid-grey" />
              </div>
              <div>
                <div className="font-display font-700 text-charcoal text-lg uppercase">Quote List Empty</div>
                <div className="text-dark-grey text-sm mt-1">Browse our catalogue and add products to your quote.</div>
              </div>
              <Link href="/shop" onClick={closeDrawer} className="btn-primary text-sm">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map(item => (
                <div key={item.id} className="px-6 py-4 flex gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-light-grey flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-mid-grey text-xs font-600 uppercase">
                        {item.productName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-600 text-charcoal text-sm leading-snug line-clamp-2">{item.productName}</div>
                    {item.productSku && (
                      <div className="text-xs text-dark-grey mt-0.5">SKU: {item.productSku}</div>
                    )}
                    {item.unit && (
                      <div className="text-xs text-dark-grey">Unit: {item.unit}</div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center hover:bg-light-grey transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-600 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center hover:bg-light-grey transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto w-7 h-7 flex items-center justify-center text-dark-grey hover:text-amo-red transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 bg-off-white space-y-3">
            <div className="text-xs text-dark-grey">
              Submit your quote request and our team will respond within 24 hours.
            </div>

            {/* Download Options */}
            <div className="bg-white border border-border rounded p-3 space-y-2">
              <div className="text-xs font-600 text-charcoal uppercase tracking-wide mb-2">Download Quote</div>
              <button
                onClick={handleDownloadCSV}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-border text-charcoal text-sm font-500 hover:bg-light-grey transition-colors rounded"
              >
                <Download size={14} />
                Download as CSV
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-border text-charcoal text-sm font-500 hover:bg-light-grey transition-colors rounded"
              >
                <FileText size={14} />
                Download as PDF
              </button>
            </div>

            <Link
              href="/request-quote"
              onClick={closeDrawer}
              className="btn-primary w-full justify-center"
            >
              Submit Quote Request <ArrowRight size={16} />
            </Link>
            <button
              onClick={closeDrawer}
              className="w-full py-2.5 text-sm text-dark-grey hover:text-charcoal transition-colors font-500 text-center"
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </>
  );
}
