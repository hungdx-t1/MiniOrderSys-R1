"use client";

import { useState } from "react";
import { OrderResponse } from "@/types";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatVnd, toMoneyValue, extractErrorMessage } from "@/lib/utils";
import { CheckCircle2, Clock, User, Coffee, ReceiptText, MapPin, X, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePayment } from "@/hooks/use-payment";
import { Dialog } from '@base-ui/react/dialog';
import { PaymentDialog } from "@/app/history/_components/payment-dialog";

interface LatestOrderCardProps {
  order: OrderResponse | null;
  onClose: () => void;
}

export default function LatestOrderCard({ order, onClose }: LatestOrderCardProps) {
  const router = useRouter();

  const {
    isPaymentOpen,
    setIsPaymentOpen,
    paymentMethod,
    setPaymentMethod,
    isPaying,
    openPayment,
    handlePayment,
  } = usePayment(() => {
    onClose();
    router.push('/history');
  });

  if (!order) return null;

  const createdAt = new Date(order.createdAt).toLocaleString("vi-VN", {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const steps = [
    { label: "Tiếp nhận", icon: Clock, active: true },
    { label: "Đang pha chế", icon: Coffee, active: order.status !== "PENDING" },
    { label: "Hoàn thành", icon: CheckCircle2, active: order.status === "COMPLETED" },
  ];

  return (
    <>
      <Dialog.Root open={!!order} onOpenChange={(open) => { if (!open) onClose(); }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full h-[100dvh] sm:h-auto sm:w-[calc(100%-2rem)] max-w-[420px] bg-white shadow-2xl rounded-none sm:rounded-[2rem] border-none flex flex-col overflow-y-auto sm:overflow-visible animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 ease-out focus:outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            <div className="absolute top-4 right-4 z-10">
              <Dialog.Close className="p-2 bg-slate-100/80 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer outline-none backdrop-blur-md">
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </Dialog.Close>
            </div>

            <div className="bg-slate-50/50 flex flex-col justify-center items-center relative pt-12 sm:pt-8 pb-14 border-b border-slate-100 shrink-0 sm:rounded-t-[2rem]">
               <div className="h-16 w-16 sm:h-14 sm:w-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce mb-3 sm:mb-2 z-10">
                 <CheckCircle2 className="h-8 w-8 sm:h-7 sm:w-7" />
               </div>
               <h2 className="text-2xl sm:text-xl font-black tracking-tight z-10 text-slate-800">Đặt món thành công!</h2>
               <p className="text-muted-foreground text-sm sm:text-xs font-medium italic mt-1 z-10 relative px-6 text-center">
                 Mã đơn <span className="text-primary font-bold">#{order.orderId}</span> đã được chuyển.
               </p>
               
               {/* Tracker ngang */}
               <div className="absolute bottom-0 left-0 w-full px-8 sm:px-10 translate-y-1/2 flex justify-between items-center z-20">
                 <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 px-8 sm:px-10" />
                 {steps.map((step, idx) => (
                   <div key={idx} className="relative z-10 flex flex-col items-center">
                     <div className={`h-12 w-12 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shadow-lg transition-transform ${step.active ? 'bg-primary text-white scale-110' : 'bg-white border-4 border-slate-100 text-slate-300'}`}>
                       <step.icon className="h-5 w-5 sm:h-4 sm:w-4" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <CardContent className="p-6 sm:p-6 pt-14 sm:pt-10 space-y-6 sm:space-y-4 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-3 justify-between items-center rounded-2xl border border-slate-100 shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-[10px] sm:text-[9px] font-bold uppercase tracking-wider">Bàn</span>
                  </div>
                  <p className="font-black text-lg sm:text-base text-slate-700">{order.tableNumber}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="text-[10px] sm:text-[9px] font-bold uppercase tracking-wider">Lúc</span>
                  </div>
                  <p className="font-bold text-sm sm:text-xs text-slate-700">{createdAt.split(' ')[0]}</p>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 sm:space-y-1.5 mt-auto sm:mt-0 shrink-0">
                <div className="flex justify-between text-sm sm:text-xs text-muted-foreground font-medium">
                  <span>Tạm tính</span>
                  <span>{formatVnd(toMoneyValue(order.totalAmount) + toMoneyValue(order.discountAmount))}</span>
                </div>

                {toMoneyValue(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm sm:text-xs items-center">
                    <span className="text-emerald-600 font-bold flex items-center gap-2">
                       <div className="h-1.5 w-1.5 sm:h-1 sm:w-1 rounded-full bg-emerald-500 animate-pulse" />
                       Voucher
                    </span>
                    <span className="text-emerald-600 font-black">- {formatVnd(order.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 sm:pt-2 border-t">
                  <span className="font-black text-lg sm:text-base">Tổng thanh toán</span>
                  <span className="font-black text-2xl sm:text-xl text-primary">{formatVnd(order.totalAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 pt-4 pb-2 sm:pt-2 sm:pb-0 shrink-0">
                <Button 
                  className="h-14 sm:h-12 rounded-2xl sm:rounded-xl gap-3 font-black text-base sm:text-sm shadow-xl shadow-primary/20 text-white" 
                  onClick={() => openPayment(order.orderId)}
                >
                  <CreditCard className="h-5 w-5 sm:h-4 sm:w-4" />
                  Thanh toán ngay
                </Button>
              </div>
            </CardContent>
            
            <div className="bg-slate-50 p-4 sm:p-2 sm:pb-3 text-center border-t border-slate-100 shrink-0 mt-auto sm:mt-0 sm:rounded-b-[2rem]">
                <p className="text-[10px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em]">Bạn có thể thanh toán sau tại mục Lịch sử</p>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <PaymentDialog
        isOpen={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        selectedOrderId={order?.orderId}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        isPaying={isPaying}
        onPaymentSubmit={handlePayment}
      />
    </>
  );
}
