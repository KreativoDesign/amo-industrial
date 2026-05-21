import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import QuoteDrawer from "./QuoteDrawer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuoteDrawer />
    </div>
  );
}
