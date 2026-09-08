import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, Facebook, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { name: "Accessories", slug: "accessories" },
  { name: "Adhesives & Sealants", slug: "adhesives" },
  { name: "Automotive", slug: "automotive" },
  { name: "Building Supplies", slug: "building-supplies" },
  { name: "Hand Tools", slug: "hand-tools" },
  { name: "Safety Gear", slug: "safety-gear" },
  { name: "Power Tools", slug: "power-tools" },
  { name: "Electrical", slug: "electrical" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* CTA Strip */}
      <div className="bg-amo-red py-8">
        <div className="container flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-center md:text-left">
          <div>
            <div className="font-display font-800 text-xl md:text-2xl uppercase tracking-tight">Ready to Request a Quote?</div>
            <div className="text-white/80 text-sm mt-1">Our team responds within 24 hours on business days.</div>
          </div>
          <Link href="/request-quote" className="btn-outline-white flex-shrink-0 w-full md:w-auto">
            Request a Quote <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="mb-5 inline-block group">
            <span className="font-display font-900 text-2xl tracking-tight whitespace-nowrap transition-transform duration-300 ease-out group-hover:scale-105">
              <span className="text-white">AMO</span><span className="text-amo-red"> INDUSTRIAL</span>
            </span>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            Your trusted local Gqeberha partner for specialist industrial and commercial supplies. Quality products, competitive pricing, fast delivery.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-amo-red flex items-center justify-center transition-colors">
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="font-display font-700 text-sm uppercase tracking-widest text-white/50 mb-4">Categories</div>
          <ul className="space-y-2">
            {CATEGORIES.map(cat => (
              <li key={cat.slug}>
                <Link href={`/category/${cat.slug}`} className="text-white/70 hover:text-amo-red text-sm transition-colors flex items-center gap-1.5 group">
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="font-display font-700 text-sm uppercase tracking-widest text-white/50 mb-4">Quick Links</div>
          <ul className="space-y-2">
            {[
              { label: "Home", href: "/" },
              { label: "Shop Industrial", href: "/shop" },
              { label: "All Categories", href: "/categories" },
              { label: "Request a Quote", href: "/request-quote" },
              { label: "Contact Us", href: "/contact" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms & Conditions", href: "/terms" },
            ].map(link => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 hover:text-amo-red text-sm transition-colors flex items-center gap-1.5 group">
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="font-display font-700 text-sm uppercase tracking-widest text-white/50 mb-4">Contact Us</div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-white/70">
              <MapPin size={16} className="text-amo-red flex-shrink-0 mt-0.5" />
              <span>115D Mount Road, Mount Croix, Gqeberha, 6001</span>
            </li>
            <li>
              <a href="tel:+27828952245" className="flex items-center gap-3 text-sm text-white/70 hover:text-amo-red transition-colors">
                <Phone size={16} className="text-amo-red flex-shrink-0" />
                +27 82 895 2245
              </a>
            </li>
            <li>
              <a href="mailto:info@amoindustrial.co.za" className="flex items-center gap-3 text-sm text-white/70 hover:text-amo-red transition-colors">
                <Mail size={16} className="text-amo-red flex-shrink-0" />
                info@amoindustrial.co.za
              </a>
            </li>
            <li className="flex items-start gap-3 text-sm text-white/70">
              <Clock size={16} className="text-amo-red flex-shrink-0 mt-0.5" />
              <span>Mon – Fri: 08:00 – 17:00</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-xs text-white/40 text-center">
          <span>© {new Date().getFullYear()} AMO Industrial. All rights reserved.</span>
          <span>115D Mount Road, Mount Croix, Gqeberha</span>
        </div>
      </div>
    </footer>
  );
}
