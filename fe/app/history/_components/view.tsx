"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { OrderResponse } from "@/types";
import { extractErrorMessage } from "@/lib/utils";
import { History } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HistoryLoading } from "./history-loading";
import { EmptyHistory } from "./empty-history";
import { OrderCard } from "./order-card";
import { PaymentDialog } from "./payment-dialog";
import { usePayment } from "@/hooks/use-payment";

export function View() {
  const { user, isLoggedIn, hasHydrated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user?.token) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const resp = await fetch("/api/orders/my", {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(extractErrorMessage(data, "Lỗi tải lịch sử đơn hàng"));
      setOrders(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      setIsLoading(false);
      router.replace("/");
      toast.error("Vui lòng đăng nhập để xem lịch sử");
    } else if (hasHydrated && isLoggedIn) {
      fetchOrders();
    }
  }, [hasHydrated, isLoggedIn, router, fetchOrders]);

  const {
    isPaymentOpen: isPaymentDialogOpen,
    setIsPaymentOpen: setIsPaymentDialogOpen,
    paymentMethod,
    setPaymentMethod,
    isPaying,
    selectedOrderId,
    openPayment: handlePaymentClick,
    handlePayment,
  } = usePayment(fetchOrders);

  if (!hasHydrated || isLoading) {
    return <HistoryLoading />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-2 mb-2">
             <div className="h-1 w-12 bg-primary rounded-full" />
             <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Your Journey</span>
           </div>
           <h1 className="text-4xl font-black tracking-tight text-slate-800 flex items-center gap-4">
             <History className="h-10 w-10 text-primary" />
             Lịch sử đặt đơn
           </h1>
           <p className="text-slate-500 font-medium italic">
             Xem lại tất cả các món ngon bạn đã từng thưởng thức tại MiniOrder.
           </p>
        </div>

        {orders.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {orders.map((order) => (
              <OrderCard 
                key={order.orderId} 
                order={order} 
                onPaymentClick={handlePaymentClick} 
              />
            ))}
          </div>
        )}
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        selectedOrderId={selectedOrderId}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        isPaying={isPaying}
        onPaymentSubmit={handlePayment}
      />
    </div>
  );
}
