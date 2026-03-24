"use client";

import React, { useEffect, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Trash2, Plus, Minus, Loader2, ShoppingBag, Ticket } from 'lucide-react';
import { formatVnd, toMoneyValue, extractErrorMessage } from '@/lib/utils';
import { OrderCreatePayload } from '@/types';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/use-products';
import { useUserVouchers } from '@/hooks/use-user-vouchers';

/**
 * CartSidebar - Thanh bên hiển thị giỏ hàng và thanh toán
 */
export default function CartSidebar() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartCount,
    updateQuantity,
    clearCart,
    tableNumber,
    voucherCode,
    setVoucherCode,
    setLatestOrder
  } = useCart();

  const { user } = useAuth();
  const isLoggedIn = !!user;

  const { products, isLoadingProducts: isLoading, loadProducts } = useProducts();
  const { vouchers, isLoadingVouchers, loadMyVouchers } = useUserVouchers();
  const [paymentMethod] = useState<'CASH' | 'VNPAY'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tải danh sách sản phẩm để hiển thị tên và giá trong giỏ hàng
  useEffect(() => {
    if (isCartOpen && products.length === 0) {
      loadProducts();
    }
  }, [isCartOpen, products.length, loadProducts]);

  useEffect(() => {
    if (isCartOpen && isLoggedIn) {
      loadMyVouchers();
    }
  }, [isCartOpen, isLoggedIn, loadMyVouchers]);

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p.id === Number(id));
    return {
      id: Number(id),
      quantity: qty,
      product
    };
  }).filter(item => item.product);

  const subTotal = cartItems.reduce((sum, item) => {
    return sum + (toMoneyValue(item.product?.price) * item.quantity);
  }, 0);
  const availableVouchers = vouchers.filter((voucher) => voucher.active && !voucher.used);

  /**
   * Xử lý đặt hàng từ Sidebar
   */
  const handleCheckout = async () => {
    if (!tableNumber) {
      toast.error('Vui lòng chọn bàn ở trang chủ trước khi thanh toán.');
      setIsCartOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: OrderCreatePayload = {
        tableNumber: tableNumber,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        voucherCode: voucherCode || undefined,
        paymentMethod: paymentMethod,
      };

      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const orderData = await resp.json();
      if (!resp.ok) {
        toast.error(extractErrorMessage(orderData, 'Đặt món thất bại.'));
        return;
      }

      try {
        toast.success('Đặt món thành công! Vui lòng vào trang Lịch sử để theo dõi và thanh toán.');

        setLatestOrder(orderData);
        clearCart();
        setVoucherCode("");
        setIsCartOpen(false);
      } catch (invoiceErr: unknown) {
        console.error('Notification error:', invoiceErr);
        setLatestOrder(orderData);
        clearCart();
        setVoucherCode("");
        setIsCartOpen(false);
      }
    } catch {
      toast.error('Lỗi hệ thống. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isCartOpen} onOpenChange={setIsCartOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col focus:outline-none border-l">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold">Đơn tạm của bạn</Dialog.Title>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{cartCount} món đã chọn</p>
              </div>
            </div>
            <Dialog.Close className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                <p className="text-sm">Đang tải đơn tạm...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 bg-muted flex items-center justify-center rounded-full">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Đơn tạm đang trống</h3>
                  <p className="text-sm text-muted-foreground px-10">Bạn chưa chọn món nào. Quay lại menu để tiếp tục gọi đồ uống.</p>
                </div>
                <Button variant="outline" className="rounded-xl" onClick={() => setIsCartOpen(false)}>
                  Xem thực đơn
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <div className="h-16 w-16 bg-muted rounded-2xl shrink-0 overflow-hidden border border-border/50">
                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground/40 uppercase">
                          {item.product?.name.substring(0, 2)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{item.product?.name}</h4>
                        <p className="text-primary font-black text-sm">{formatVnd(toMoneyValue(item.product?.price))}</p>

                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, -item.quantity)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                  <p className="text-xs text-primary font-bold italic text-center">
                    Quán sẽ nhận đơn ngay sau khi bạn xác nhận. Bạn có thể theo dõi tại trang Lịch sử.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t bg-muted/30 space-y-4">
              {isLoggedIn && (
                <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-emerald-700" />
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Ưu đãi tài khoản</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadMyVouchers}
                      disabled={isLoadingVouchers}
                      className="h-7 px-2 text-[10px] font-bold uppercase"
                    >
                      {isLoadingVouchers ? 'Đang tải...' : 'Tải lại'}
                    </Button>
                  </div>

                  <select
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="h-10 w-full rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold"
                  >
                    <option value="">Không áp dụng ưu đãi</option>
                    {availableVouchers.map((voucher) => (
                      <option key={voucher.id} value={voucher.code}>
                        {voucher.code} - giảm {voucher.discountPercent}%
                      </option>
                    ))}
                  </select>

                  {availableVouchers.length === 0 && !isLoadingVouchers && (
                    <p className="text-[11px] italic text-emerald-800/80">Tài khoản hiện không có mã ưu đãi khả dụng.</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{formatVnd(subTotal)}</span>
                </div>
                {tableNumber && (
                  <div className="flex justify-between text-sm font-bold">
                    <span>Vị trí bàn</span>
                    <span className="text-primary">Bàn {tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black pt-2 border-t">
                  <span>Tổng tiền</span>
                  <span className="text-primary">{formatVnd(subTotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  disabled={isSubmitting || !tableNumber}
                  onClick={handleCheckout}
                  className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5" />
                      Đặt món ngay
                    </>
                  )}
                </Button>
                {!tableNumber && (
                  <p className="text-[10px] text-destructive text-center mt-2 font-bold uppercase tracking-wider">
                    Vui lòng chọn bàn ở màn hình chính để đặt món
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-destructive gap-2 text-xs font-bold uppercase tracking-widest"
                onClick={clearCart}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa toàn bộ đơn tạm
              </Button>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
