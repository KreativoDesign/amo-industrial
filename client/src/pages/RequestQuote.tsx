import { useState } from "react";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { useQuote } from "@/contexts/QuoteContext";
import { trpc } from "@/lib/trpc";
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, CheckCircle,
  Building2, User, Mail, Phone, FileText, Package, AlertCircle
} from "lucide-react";

export default function RequestQuote() {
  const { items, removeItem, updateQuantity, clearQuote } = useQuote();
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitQuote = trpc.quotes.submit.useMutation({
    onSuccess: (data) => {
      setRefNumber(data.referenceNumber);
      setSubmitted(true);
      clearQuote();
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.companyName.trim()) errs.companyName = "Company name is required";
    if (!form.contactPerson.trim()) errs.contactPerson = "Contact person is required";
    if (!form.email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (items.length === 0) errs.items = "Add at least one product to your quote";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitQuote.mutate({
      ...form,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        productSku: i.productSku,
        quantity: i.quantity,
        unit: i.unit,
      })),
    });
  };

  if (submitted) {
    return (
      <SiteLayout>
        <section className="bg-off-white min-h-[70vh] flex items-center py-20">
          <div className="container max-w-xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="font-display font-900 text-charcoal text-4xl uppercase tracking-tight mb-3">
              Quote Submitted!
            </h1>
            <p className="text-dark-grey leading-relaxed mb-3">
              Thank you for your quote request. Our team will review your requirements and respond within 24 business hours.
            </p>
            <div className="bg-charcoal text-white px-6 py-4 inline-block mb-8">
              <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Reference Number</div>
              <div className="font-display font-800 text-amo-red text-2xl tracking-wide">{refNumber}</div>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-dark-grey">
                A confirmation has been sent to <span className="font-600 text-charcoal">{form.email}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Link href="/shop" className="btn-primary">
                  Continue Browsing <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="btn-outline">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Page Header */}
      <section className="bg-charcoal py-14 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amo-red" />
        <div className="industrial-overlay absolute inset-0 opacity-20" />
        <div className="container relative z-10">
          <div className="text-white/50 text-xs font-600 uppercase tracking-widest mb-3">
            <Link href="/" className="hover:text-amo-red transition-colors">Home</Link>
            {" / "}Request a Quote
          </div>
          <h1 className="font-display font-900 text-white text-5xl md:text-6xl uppercase tracking-tight">
            Request a Quote
          </h1>
          <p className="text-white/60 mt-3 max-w-lg">
            Submit your product requirements and our team will respond with pricing within 24 business hours.
          </p>
        </div>
      </section>

      <section className="bg-off-white py-12">
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Quote Form */}
              <div className="lg:col-span-3 space-y-6">
                {/* Contact Details */}
                <div className="bg-white border border-border p-6">
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
                    <Building2 size={18} className="text-amo-red" />
                    <h2 className="font-display font-700 text-charcoal text-xl uppercase tracking-tight">
                      Your Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1.5">
                        Company Name <span className="text-amo-red">*</span>
                      </label>
                      <div className="relative">
                        <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" />
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                          placeholder="Your company name"
                          className={`w-full pl-9 pr-4 py-3 border text-sm focus:outline-none transition-colors ${
                            errors.companyName ? "border-amo-red" : "border-border focus:border-charcoal"
                          }`}
                        />
                      </div>
                      {errors.companyName && (
                        <div className="flex items-center gap-1 mt-1 text-amo-red text-xs">
                          <AlertCircle size={11} /> {errors.companyName}
                        </div>
                      )}
                    </div>

                    {/* Contact Person */}
                    <div>
                      <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1.5">
                        Contact Person <span className="text-amo-red">*</span>
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" />
                        <input
                          type="text"
                          value={form.contactPerson}
                          onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                          placeholder="Full name"
                          className={`w-full pl-9 pr-4 py-3 border text-sm focus:outline-none transition-colors ${
                            errors.contactPerson ? "border-amo-red" : "border-border focus:border-charcoal"
                          }`}
                        />
                      </div>
                      {errors.contactPerson && (
                        <div className="flex items-center gap-1 mt-1 text-amo-red text-xs">
                          <AlertCircle size={11} /> {errors.contactPerson}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1.5">
                        Email Address <span className="text-amo-red">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="email@company.com"
                          className={`w-full pl-9 pr-4 py-3 border text-sm focus:outline-none transition-colors ${
                            errors.email ? "border-amo-red" : "border-border focus:border-charcoal"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <div className="flex items-center gap-1 mt-1 text-amo-red text-xs">
                          <AlertCircle size={11} /> {errors.email}
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1.5">
                        Phone Number <span className="text-amo-red">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-grey" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+27 82 000 0000"
                          className={`w-full pl-9 pr-4 py-3 border text-sm focus:outline-none transition-colors ${
                            errors.phone ? "border-amo-red" : "border-border focus:border-charcoal"
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <div className="flex items-center gap-1 mt-1 text-amo-red text-xs">
                          <AlertCircle size={11} /> {errors.phone}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-700 text-charcoal uppercase tracking-wide mb-1.5">
                        Additional Notes
                      </label>
                      <div className="relative">
                        <FileText size={14} className="absolute left-3 top-3.5 text-mid-grey" />
                        <textarea
                          value={form.notes}
                          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                          placeholder="Delivery requirements, special instructions, quantities, or any other details..."
                          rows={4}
                          className="w-full pl-9 pr-4 py-3 border border-border text-sm focus:outline-none focus:border-charcoal transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div>
                  {errors.items && (
                    <div className="flex items-center gap-2 bg-amo-red/10 border border-amo-red/30 text-amo-red text-sm px-4 py-3 mb-4">
                      <AlertCircle size={14} />
                      {errors.items}
                    </div>
                  )}
                  {submitQuote.error && (
                    <div className="flex items-center gap-2 bg-amo-red/10 border border-amo-red/30 text-amo-red text-sm px-4 py-3 mb-4">
                      <AlertCircle size={14} />
                      Failed to submit quote. Please try again.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitQuote.isPending}
                    className="btn-primary w-full justify-center text-base py-4"
                  >
                    {submitQuote.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <>Submit Quote Request <ArrowRight size={18} /></>
                    )}
                  </button>
                  <p className="text-xs text-dark-grey text-center mt-3">
                    No payment required. Our team will contact you with pricing within 24 hours.
                  </p>
                </div>
              </div>

              {/* Quote Summary */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-border sticky top-24">
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-charcoal text-white">
                    <ShoppingCart size={16} className="text-amo-red" />
                    <h2 className="font-display font-700 text-base uppercase tracking-wide">
                      Quote Summary
                    </h2>
                    <span className="ml-auto text-white/60 text-sm">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-8 text-center">
                      <Package size={36} className="text-mid-grey mx-auto mb-3" />
                      <div className="font-600 text-charcoal text-sm mb-1">No products added</div>
                      <div className="text-dark-grey text-xs mb-4">Browse our catalogue and add products to your quote.</div>
                      <Link href="/shop" className="btn-primary text-xs py-2 px-4">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-border max-h-80 overflow-y-auto">
                        {items.map(item => (
                          <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                            <div className="w-10 h-10 bg-light-grey flex-shrink-0 overflow-hidden">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-mid-grey text-xs font-700">
                                  {item.productName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-600 text-charcoal text-xs leading-snug line-clamp-2">{item.productName}</div>
                              {item.productSku && <div className="text-xs text-dark-grey mt-0.5">SKU: {item.productSku}</div>}
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-5 h-5 border border-border flex items-center justify-center hover:bg-light-grey">
                                  <Minus size={9} />
                                </button>
                                <span className="text-xs font-600 w-5 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-5 h-5 border border-border flex items-center justify-center hover:bg-light-grey">
                                  <Plus size={9} />
                                </button>
                              </div>
                            </div>
                            <button onClick={() => removeItem(item.productId)} className="text-mid-grey hover:text-amo-red transition-colors mt-0.5">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="p-5 bg-off-white border-t border-border">
                        <div className="flex justify-between text-sm font-600 text-charcoal mb-1">
                          <span>Total Items</span>
                          <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
                        </div>
                        <div className="text-xs text-dark-grey">Pricing will be provided in our response.</div>
                        <Link href="/shop" className="mt-3 block text-center text-xs text-amo-red font-600 uppercase tracking-wide hover:underline">
                          + Add More Products
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
