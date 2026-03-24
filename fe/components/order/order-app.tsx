"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import ProductList from "./product-list";
import OrderInfo from "./order-info";
import AuthForm from "../auth/auth-form";
import LatestOrderCard from "./latest-order-card";
import { useProducts } from "@/hooks/use-products";
import { useDrawVoucher } from "@/hooks/use-draw-voucher";
import { useUserVouchers } from "@/hooks/use-user-vouchers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";

export default function OrderApp() {
  const auth = useAuth();
  const cartContext = useCart();

  const { isLoggedIn } = auth;
  const {
    cart,
    updateQuantity,
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
    vouchers,
    loadMyVouchers,
  } = useUserVouchers();
  const {
    isDrawingVoucher,
    voucherFeedback,
    drawVoucher: handleDrawVoucher
  } = useDrawVoucher((code: string) => {
    setVoucherCode(code);
    loadMyVouchers();
  });

  useEffect(() => {
    const abortController = new AbortController();
    loadProducts(abortController.signal);
    return () => abortController.abort();
  }, [loadProducts]);

  useEffect(() => {
    if (!isLoggedIn) {
      setVoucherCode("");
      return;
    }
    loadMyVouchers();
  }, [isLoggedIn, loadMyVouchers, setVoucherCode]);

  const handleQuantityChange = (productId: number, delta: number) => {
    updateQuantity(productId, delta);
  };

  const hasDrawnVoucher = vouchers.length > 0;
  const canShowDrawBanner = !isLoggedIn || !hasDrawnVoucher;


  if (!hasHydrated) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      {canShowDrawBanner && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-emerald-700" />
            <p className="text-sm font-extrabold text-emerald-900">Rút mã ưu đãi chào mừng</p>
          </div>
          <p className="text-[11px] text-emerald-800/80">Mỗi tài khoản chỉ rút 1 lần. Rút xong, ưu đãi sẽ được gắn vào tài khoản của bạn.</p>
          <div className="mt-3 flex items-center gap-3">
            <Button
              onClick={handleDrawVoucher}
              disabled={isDrawingVoucher || !isLoggedIn}
              className="h-10 rounded-xl bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700"
            >
              {isDrawingVoucher ? "Đang rút..." : "Rút mã ngay"}
            </Button>
            {!isLoggedIn && (
              <span className="text-[11px] italic text-emerald-900/70">Đăng nhập để rút mã.</span>
            )}
          </div>
          {voucherFeedback && (
            <Badge variant="secondary" className="mt-3 px-3 py-1.5 h-auto rounded-lg text-[11px] bg-white text-emerald-700 border-emerald-100 italic">
              {voucherFeedback}
            </Badge>
          )}
        </div>
      )}

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
