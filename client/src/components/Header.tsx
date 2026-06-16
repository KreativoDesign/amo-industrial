import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingCart, Phone, Mail, ChevronDown, Package, Settings } from "lucide-react";
import { useQuote } from "@/contexts/QuoteContext";
import { useAuth } from "@/_core/hooks/useAuth";

const CATEGORIES = [
  { name: "Accessories", slug: "accessories", icon: "🔧" },
  { name: "Adhesives & Sealants", slug: "adhesives", icon: "🧴" },
  { name: "Automotive", slug: "automotive", icon: "🚗" },
  { name: "Building Supplies", slug: "building-supplies", icon: "🏗️" },
  { name: "Hand Tools", slug: "hand-tools", icon: "🔨" },
  { name: "Safety Gear", slug: "safety-gear", icon: "🦺" },
  { name: "Power Tools", slug: "power-tools", icon: "⚡" },
  { name: "Electrical", slug: "electrical", icon: "💡" },
  { name: "Fasteners", slug: "fasteners", icon: "🔩" },
  { name: "Cleaning & Hygiene", slug: "cleaning", icon: "🧹" },
  { name: "Plumbing", slug: "plumbing", icon: "🚿" },
  { name: "Welding & Cutting", slug: "welding", icon: "🔥" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, openDrawer } = useQuote();
  const [location] = useLocation();
  const { user } = useAuth();
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-charcoal text-white text-xs py-2 hidden md:block">
        <div className="container flex justify-between items-center">
          <span className="text-mid-grey">Your Direct Source for Industrial & Commercial Supplies</span>
          <div className="flex items-center gap-5">
            <a href="tel:+27828952245" className="flex items-center gap-1.5 hover:text-amo-red transition-colors">
              <Phone size={12} />
              +27 82 895 2245
            </a>
            <a href="mailto:info@amoindustrial.co.za" className="flex items-center gap-1.5 hover:text-amo-red transition-colors">
              <Mail size={12} />
              info@amoindustrial.co.za
            </a>
            <span className="text-mid-grey">Mon – Fri: 08:00 – 17:00</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? "shadow-[0_2px_16px_oklch(0_0_0/0.12)]" : "border-b border-border"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-charcoal flex items-center justify-center">
                <span className="text-amo-red font-display font-900 text-lg leading-none">AMO</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-800 text-charcoal text-xl leading-none tracking-tight uppercase">AMO Industrial</div>
                <div className="text-[10px] text-dark-grey tracking-widest uppercase">Industrial Supply</div>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" ref={megaRef}>
            {/* Categories Mega Menu */}
            <div className="relative">
              <button
                className={`flex items-center gap-1 px-4 py-2 font-display font-700 text-sm uppercase tracking-wide transition-colors ${
                  megaOpen ? "text-amo-red" : "text-charcoal hover:text-amo-red"
                }`}
                onClick={() => setMegaOpen(!megaOpen)}
              >
                Categories
                <ChevronDown size={14} className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
              </button>

              {megaOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[640px] bg-white border border-border shadow-overlay z-50">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                      <span className="font-display font-700 text-charcoal uppercase text-sm tracking-wide">Browse All Categories</span>
                      <Link href="/categories" className="text-amo-red text-xs font-600 uppercase tracking-wide hover:underline">
                        View All →
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          className="flex items-center gap-2.5 p-2.5 hover:bg-light-grey transition-colors group"
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="font-500 text-sm text-charcoal group-hover:text-amo-red transition-colors">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/shop" className="px-4 py-2 font-display font-700 text-sm uppercase tracking-wide text-charcoal hover:text-amo-red transition-colors">
              Shop Industrial
            </Link>
            <Link href="/contact" className="px-4 py-2 font-display font-700 text-sm uppercase tracking-wide text-charcoal hover:text-amo-red transition-colors">
              Contact
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="px-4 py-2 font-display font-700 text-sm uppercase tracking-wide text-amo-red hover:text-amo-red-dark transition-colors flex items-center gap-1.5">
                <Settings size={14} />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quote Button */}
            <button
              onClick={openDrawer}
              className="flex items-center gap-2 bg-amo-red text-white px-4 py-2.5 font-display font-700 text-sm uppercase tracking-wide hover:bg-amo-red-dark transition-colors relative"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Your Quote</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-charcoal text-white text-[10px] font-700 rounded-full flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-charcoal hover:text-amo-red transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-border">
            <div className="container py-4 flex flex-col gap-1">
              <div className="pb-3 mb-3 border-b border-border">
                <div className="font-display font-700 text-xs text-dark-grey uppercase tracking-widest mb-2">Categories</div>
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.slice(0, 8).map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2 p-2 text-sm text-charcoal hover:text-amo-red hover:bg-light-grey transition-colors"
                    >
                      <span>{cat.icon}</span>
                      <span className="font-500">{cat.name}</span>
                    </Link>
                  ))}
                </div>
                <Link href="/categories" className="mt-2 block text-amo-red text-sm font-600 uppercase tracking-wide">
                  View All Categories →
                </Link>
              </div>
              <Link href="/shop" className="py-2.5 font-display font-700 text-sm uppercase tracking-wide text-charcoal hover:text-amo-red transition-colors">
                Shop Industrial
              </Link>
              <Link href="/contact" className="py-2.5 font-display font-700 text-sm uppercase tracking-wide text-charcoal hover:text-amo-red transition-colors">
                Contact
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" className="py-2.5 font-display font-700 text-sm uppercase tracking-wide text-amo-red hover:text-amo-red-dark transition-colors flex items-center gap-1.5">
                  <Settings size={14} />
                  Admin Panel
                </Link>
              )}
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2 text-sm text-dark-grey">
                <a href="tel:+27828952245" className="flex items-center gap-2 hover:text-amo-red transition-colors">
                  <Phone size={14} /> +27 82 895 2245
                </a>
                <a href="mailto:info@amoindustrial.co.za" className="flex items-center gap-2 hover:text-amo-red transition-colors">
                  <Mail size={14} /> info@amoindustrial.co.za
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
