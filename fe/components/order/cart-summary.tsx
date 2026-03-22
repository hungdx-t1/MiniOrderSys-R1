"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/utils";
import { ShoppingCart, ChevronRight } from "lucide-react";

interface CartItem {
  productName: string;
  quantity: number;
  lineTotal: number;
}

interface CartSummaryProps {
  cartCount: number;
  subTotal: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  tableNumber: string;
  feedback?: string;
}

export default function CartSummary({
  cartCount,
  subTotal,
  onSubmit,
  isSubmitting,
  tableNumber,
  feedback
}: CartSummaryProps) {
  
  const isAvailableToOrder = subTotal > 0 && tableNumber !== "";

  return (
    <>
      <Card className="sticky bottom-6 z-30 mx-auto w-full max-w-[95%] overflow-hidden rounded-[2.5rem] bg-indigo-950/90 text-white shadow-2xl shadow-indigo-500/30 backdrop-blur lg:max-w-none lg:rounded-3xl lg:bottom-0">
        <CardContent className="p-4 sm:p-5">
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <ShoppingCart className="h-4 w-4 text-white/50" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-none">Giỏ hàng ({cartCount})</span>
                    </div>
                    <p className="font-display text-3xl font-black text-white">{formatVnd(subTotal)}</p>
                 </div>
                 
                 <Button
                    onClick={onSubmit}
                    disabled={!isAvailableToOrder || isSubmitting}
                    size="lg"
                    className="h-14 min-w-[180px] rounded-2xl bg-white px-8 font-black text-indigo-950 shadow-lg shadow-white/5 transition-all hover:bg-white/90 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 disabled:bg-white/10"
                 >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-950 border-t-transparent" />
                            Đang gửi...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-lg">
                           Đặt món ngay
                           <ChevronRight className="h-5 w-5" />
                        </span>
                    )}
                 </Button>
              </div>

              {feedback && (
                <div className="rounded-2xl bg-white/5 px-4 py-2 border border-white/10">
                   <p className="text-[11px] font-medium text-white/80 leading-snug">{feedback}</p>
                </div>
              )}
              
              {!isAvailableToOrder && cartCount > 0 && (
                <div className="flex items-center justify-center gap-2 px-2 py-1 bg-rose-500/20 rounded-full border border-rose-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <p className="text-[10px] items-center text-rose-300 font-bold uppercase tracking-wider">{tableNumber === "" ? "Chưa chọn bàn" : "Vui lòng thêm món"}</p>
                </div>
              )}
           </div>
        </CardContent>
      </Card>
    </>
  );
}
