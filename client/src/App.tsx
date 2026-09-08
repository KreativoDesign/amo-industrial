import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useParams } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { QuoteProvider } from "./contexts/QuoteContext";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Categories from "./pages/Categories";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import RequestQuote from "./pages/RequestQuote";
import Admin from "./pages/Admin";

function ShopRoute() {
  return <Shop />;
}

function CategoryRoute() {
  const params = useParams<{ slug: string }>();
  return <Shop categorySlug={params.slug} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/contact" component={Contact} />
      <Route path="/categories" component={Categories} />
      <Route path="/shop" component={ShopRoute} />
      <Route path="/category/:slug" component={CategoryRoute} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/request-quote" component={RequestQuote} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <QuoteProvider>
          <TooltipProvider>
            <Toaster position="top-right" />
            <Router />
          </TooltipProvider>
        </QuoteProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
