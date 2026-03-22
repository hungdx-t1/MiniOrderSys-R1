"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { Product, OrderResponse, OrderCreatePayload, ApiError } from "@/types";
import { toMoneyValue, extractErrorMessage } from "@/lib/utils";
import ProductList from "./product-list";
import OrderInfo from "./order-info";
import CartSummary from "./cart-summary";
import AuthForm from "../auth/auth-form";
import LatestOrderCard from "./latest-order-card";
import { useProducts } from "@/hooks/use-products";
import { useDrawVoucher } from "@/hooks/use-draw-voucher";
import { toast } from "sonner";

export default function OrderApp() {
  const auth = useAuth() as any;
  const cartContext = useCart();
  
  const { user, isLoggedIn, token } = auth;
  const { 
    cart, 
    cartCount, 
    subTotal: calculateSubTotal, 
    updateQuantity, 
    clearCart,
    tableNumber,
    setTableNumber,
    voucherCode,
    setVoucherCode,
    latestOrder,
    setLatestOrder
  } = cartContext;

  const hasHydrated = auth.hasHydrated && cartContext.hasHydrated;

  const { products, isLoadingProducts, loadProducts } = useProducts();
  const {
    isDrawingVoucher,
    voucherFeedback,
    drawVoucher: handleDrawVoucher
  } = useDrawVoucher((code: string) => {
    setVoucherCode(code);
  });

  useEffect(() => {
    const abortController = new AbortController();
    loadProducts(abortController.signal);
    return () => abortController.abort();
  }, [loadProducts]);

  const subTotal = calculateSubTotal(products);

  const handleQuantityChange = (productId: number, delta: number) => {
    updateQuantity(productId, delta);
  };


  if (!hasHydrated) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left Column: List Product & Menu */}
        <div className="lg:w-[65%] xl:w-[70%] space-y-8">
           <ProductList
              products={products}
              isLoading={isLoadingProducts}
              cart={cart}
              onQuantityChange={handleQuantityChange}
              onReload={() => loadProducts()}
           />
        </div>

        {/* Right Column: Order Info & Checkout (Sticky) */}
        <div className="lg:sticky lg:top-24 lg:w-[35%] xl:w-[30%] space-y-6 pb-20 lg:pb-0">
           {!isLoggedIn && <AuthForm />}
           <OrderInfo
              tableNumber={tableNumber}
              onTableSelect={setTableNumber}
              voucherCode={voucherCode}
              onVoucherChange={setVoucherCode}
              onDrawVoucher={handleDrawVoucher}
              isDrawingVoucher={isDrawingVoucher}
              voucherFeedback={voucherFeedback}
           />
        </div>
      </div>
      
      <LatestOrderCard 
        order={latestOrder} 
        onClose={() => setLatestOrder(null)} 
      />
    </div>
  );
}
