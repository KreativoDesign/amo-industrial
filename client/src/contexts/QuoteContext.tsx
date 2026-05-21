import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface QuoteItem {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  imageUrl?: string;
  unit?: string;
  quantity: number;
}

interface QuoteContextValue {
  items: QuoteItem[];
  count: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<QuoteItem, "id" | "quantity">) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearQuote: () => void;
  hasItem: (productId: number) => boolean;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

const STORAGE_KEY = "amo_quote_items";

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addItem = (newItem: Omit<QuoteItem, "id" | "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === newItem.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      const id = nextId;
      setNextId(n => n + 1);
      return [...prev, { ...newItem, id, quantity: 1 }];
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const clearQuote = () => setItems([]);

  const hasItem = (productId: number) => items.some(i => i.productId === productId);

  return (
    <QuoteContext.Provider
      value={{ items, count, isDrawerOpen, openDrawer, closeDrawer, addItem, removeItem, updateQuantity, clearQuote, hasItem }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used within QuoteProvider");
  return ctx;
}
