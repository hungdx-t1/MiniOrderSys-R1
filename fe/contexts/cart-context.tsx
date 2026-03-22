"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, OrderResponse } from '@/types';
import { toMoneyValue } from '@/lib/utils';

interface CartContextType {
  cart: Record<number, number>;
  cartCount: number;
  subTotal: (products: Product[]) => number;
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  hasHydrated: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  latestOrder: OrderResponse | null;
  setLatestOrder: (order: OrderResponse | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mini-order-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [latestOrder, setLatestOrder] = useState<OrderResponse | null>(null);

  // Khôi phục giỏ hàng từ localStorage khi hydrate
  useEffect(() => {
    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setHasHydrated(true);
  }, []);

  // Lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (hasHydrated) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, hasHydrated]);

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((total, qty) => total + qty, 0);
  }, [cart]);

  /**
   * Tính tổng tiền dựa trên danh sách sản phẩm hiện có
   * @param products - Danh sách sản phẩm từ API
   */
  const subTotal = useCallback((products: Product[]) => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find(prod => prod.id === Number(id));
      return sum + (toMoneyValue(p?.price) * qty);
    }, 0);
  }, [cart]);

  const updateQuantity = useCallback((productId: number, delta: number) => {
    setCart(prev => {
      const next = { ...prev };
      const current = next[productId] ?? 0;
      const newValue = current + delta;
      
      if (newValue <= 0) {
        delete next[productId];
      } else {
        next[productId] = newValue;
      }
      return next;
    });
  }, []);

  const addToCart = useCallback((productId: number) => updateQuantity(productId, 1), [updateQuantity]);
  const removeFromCart = useCallback((productId: number) => updateQuantity(productId, -1), [updateQuantity]);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        hasHydrated,
        isCartOpen,
        setIsCartOpen,
        tableNumber,
        setTableNumber,
        voucherCode,
        setVoucherCode,
        latestOrder,
        setLatestOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
