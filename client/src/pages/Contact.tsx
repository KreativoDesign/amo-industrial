import SiteLayout from "@/components/SiteLayout";
import { MapPin, Phone, Mail, Clock, ArrowRight, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function Contact() {
  return (
    <SiteLayout>
      {/* Page Header */}
      <section className="bg-charcoal py-14 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amo-red" />
        <div className="industrial-overlay absolute inset-0 opacity-20" />
        <div className="container relative z-10">
          <div className="text-white/50 text-xs font-600 uppercase tracking-widest mb-3">
            <Link href="/" className="hover:text-amo-red transition-colors">Home</Link>
            {" / "}Contact
          </div>
          <h1 className="font-display font-900 text-white text-5xl md:text-6xl uppercase tracking-tight">
            Contact Us
          </h1>
          <p className="text-white/60 mt-3 max-w-lg">
            Get in touch with the AMO Industrial team. We're here to help with product enquiries, quotes, and technical support.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-off-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <div className="accent-line" />
                <h2 className="font-display font-800 text-charcoal text-2xl uppercase tracking-tight">Get in Touch</h2>
                <p className="text-dark-grey text-sm mt-2 leading-relaxed">
                  Our team is available Monday to Friday during office hours. We aim to respond to all enquiries within 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amo-red/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-amo-red" />
                    </div>
                    <div>
                      <div className="font-display font-700 text-charcoal text-sm uppercase tracking-wide mb-1">Address</div>
                      <div className="text-dark-grey text-sm leading-relaxed">
                        115D Mount Road<br />
                        Mount Croix<br />
                        Gqeberha, 6001
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amo-red/10 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-amo-red" />
                    </div>
                    <div>
                      <div className="font-display font-700 text-charcoal text-sm uppercase tracking-wide mb-1">Phone</div>
                      <a href="tel:+27828952245" className="text-charcoal text-sm font-600 hover:text-amo-red transition-colors">
                        +27 82 895 2245
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amo-red/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-amo-red" />
                    </div>
                    <div>
                      <div className="font-display font-700 text-charcoal text-sm uppercase tracking-wide mb-1">Email</div>
                      <a href="mailto:info@amoindustrial.co.za" className="text-charcoal text-sm font-600 hover:text-amo-red transition-colors">
                        info@amoindustrial.co.za
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amo-red/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={18} className="text-amo-red" />
                    </div>
                    <div>
                      <div className="font-display font-700 text-charcoal text-sm uppercase tracking-wide mb-1">Office Hours</div>
                      <div className="text-dark-grey text-sm">
                        <div>Monday – Friday</div>
                        <div className="font-600 text-charcoal">08:00 – 17:00</div>
                        <div className="text-xs mt-1 text-mid-grey">Closed on weekends and public holidays</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote CTA */}
              <div className="bg-charcoal p-6">
                <div className="flex items-start gap-3 mb-4">
                  <MessageSquare size={20} className="text-amo-red flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-display font-700 text-white text-base uppercase tracking-tight">Need a Quote?</div>
                    <div className="text-white/60 text-sm mt-1">Submit a quote request and we'll respond within 24 hours.</div>
                  </div>
                </div>
                <Link href="/request-quote" className="btn-primary w-full justify-center">
                  Request a Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Map + Additional Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map Embed */}
              <div className="bg-white border border-border overflow-hidden">
                <div className="bg-charcoal px-5 py-3 flex items-center gap-2">
                  <MapPin size={14} className="text-amo-red" />
                  <span className="font-display font-700 text-white text-sm uppercase tracking-wide">Our Location</span>
                </div>
                <div className="h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.5!2d25.5707!3d-33.9608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e7ab4f5d8b3e5b7%3A0x1234567890abcdef!2s115D+Mount+Rd%2C+Mount+Croix%2C+Gqeberha%2C+6001!5e0!3m2!1sen!2sza!4v1716300000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="AMO Industrial — 115D Mount Road, Mount Croix, Gqeberha"
                  />
                </div>
              </div>

              {/* What We Supply */}
              <div className="bg-white border border-border p-8">
                <h3 className="font-display font-800 text-charcoal text-xl uppercase tracking-tight mb-5">
                  What We Supply
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    "Hand Tools", "Power Tools", "Safety Gear", "Adhesives & Sealants",
                    "Building Supplies", "Automotive", "Electrical", "Fasteners",
                    "Cleaning & Hygiene", "Plumbing", "Welding & Cutting", "Accessories",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-charcoal">
                      <div className="w-1.5 h-1.5 bg-amo-red flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sectors */}
              <div className="bg-amo-red p-8">
                <h3 className="font-display font-800 text-white text-xl uppercase tracking-tight mb-4">
                  Industries We Serve
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Construction & Building", "Manufacturing", "Mining & Resources",
                    "Automotive Workshops", "Maintenance Teams", "Government & Municipal",
                    "Retail & Commercial", "Agriculture",
                  ].map(sector => (
                    <div key={sector} className="flex items-center gap-2 text-sm text-white/90">
                      <div className="w-1.5 h-1.5 bg-white/60 flex-shrink-0" />
                      {sector}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
